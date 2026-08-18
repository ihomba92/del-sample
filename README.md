# Deliveroo

A full-stack parcel delivery management platform. Customers create and track parcel
delivery orders, couriers fulfil them on the road, and administrators run the whole
board — assigning couriers, correcting locations and watching network performance.

Prices are calculated server side from the routed distance and the parcel's weight
tier, every status change writes an immutable tracking event, and access is enforced
by role and by record ownership on every endpoint.

## Contents

- [Stack](#stack)
- [Versions](#versions)
- [Features](#features)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Third-party integrations](#third-party-integrations)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Pricing](#pricing)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18.3, Vite 5, Redux Toolkit 2, React Router 6, Tailwind CSS 3, Recharts 2 |
| Backend | Python 3.10+, Flask 3, Flask-JWT-Extended, Flask-Bcrypt, Marshmallow, Flask-Mail |
| Database | PostgreSQL via SQLAlchemy 2 and Alembic |
| Dependencies | pipenv (`Pipfile` / `Pipfile.lock`) on the backend, npm on the frontend |
| Integrations | Google Maps Platform, SMTP email, M-Pesa Daraja STK push |

## Versions

Pin these when setting up a new machine so the whole team runs the same stack.

### Runtimes

| Runtime | Version | Notes |
| --- | --- | --- |
| Python | 3.10 or newer | Verified on 3.11 and 3.14. `Pipfile` does not pin a version, so any 3.10+ works |
| Node.js | 18 or newer | Verified on 22 |
| PostgreSQL | 14 or newer | SQLite is used as a fallback when `DATABASE_URL` is blank |
| pipenv | 2023.7 or newer | Backend dependency manager, replaces `requirements.txt` |

### Frontend

| Package | Version |
| --- | --- |
| React | 18.3.1 |
| React DOM | 18.3.1 |
| React Router DOM | 6.26.2 |
| Redux Toolkit | 2.2.7 |
| React Redux | 9.1.2 |
| Tailwind CSS | 3.4.13 |
| Vite | 5.4.8 |
| Axios | 1.7.7 |
| Recharts | 2.12.7 |
| @react-google-maps/api | 2.20.3 |
| date-fns | 4.1.0 |

### Backend

| Package | Version |
| --- | --- |
| Flask | 3.0.3 |
| Flask-SQLAlchemy | 3.1.1 |
| Flask-Migrate | 4.0.7 |
| Flask-JWT-Extended | 4.6.0 |
| Flask-Bcrypt | 1.0.1 |
| Flask-Cors | 4.0.1 |
| Flask-Mail | 0.10.0 |
| Marshmallow | 3.22.0 |
| marshmallow-sqlalchemy | 1.1.0 |
| SQLAlchemy | 2.0.35 |
| Alembic | 1.13.3 |
| psycopg2-binary | 2.9.12 |
| gunicorn | 23.0.0 |
| pytest | 8.3.3 |

> `psycopg2-binary` must stay at 2.9.11 or newer. Earlier releases have no prebuilt
> wheel for Python 3.13/3.14 and fall back to compiling from source, which fails unless
> PostgreSQL development headers are installed.


## Features

### Authentication and authorisation

- Registration and login with bcrypt-hashed passwords
- JWT access and refresh tokens, with silent refresh on the client
- Server-side token revocation on sign out
- Three roles — customer, courier, admin — enforced by decorator on every route
- Record ownership checks: a customer can only reach their own orders, a courier only
  the deliveries assigned to them

### Public site

- Marketing home page with hero photography, how-it-works and pricing preview
- About us page covering the problem, the product principles and the three roles
- Services page with the live weight-tier table pulled from the API, coverage and FAQ
- Guest navigation: Home, About us, Services, Sign in, Sign up

### Notifications

Every delivery event fans out to everyone who needs to know, by email and by SMS.

| Event | Customer | Recipient | Rider | Operations |
| --- | --- | --- | --- | --- |
| Order placed | ✓ | | requested rider only | ✓ |
| Rider assigned | ✓ | | ✓ | ✓ |
| Picked up | ✓ | ✓ | | |
| In transit | ✓ | ✓ | | |
| Delivered | ✓ | ✓ | ✓ | ✓ |
| Cancelled | ✓ | | ✓ | ✓ |
| Payment received | ✓ | | | ✓ |

Customers, recipients and riders get both email and SMS. Operations get email only, since
one text per admin per event gets expensive fast. Recipients are notified by SMS always, and
by email too if the sender supplied a recipient email address.

### Rider selection

A customer may request a specific rider when placing an order. That is a *preference*, not an
assignment — the order still reaches the operations board, the requested rider is pre-selected
there, and an admin confirms. Both the customer and the requested rider are told at each step.

### Role-aware navigation

The navigation bar changes with who is signed in:

| Who | Sees |
| --- | --- |
| Guest | Home · About us · Services · Sign in · Sign up |
| Customer | My deliveries · Send a parcel · Profile |
| Rider (courier) | My route · Profile |
| Operations (admin) | Overview · Orders · People · Profile |

### Customer

- Create a delivery with pickup, destination, weight tier and recipient details
- Live price quote before committing, recalculated as the form changes
- Paginated, searchable and filterable list of their own orders
- Order detail with the route on a map, a status stepper and the full tracking timeline
- Change the destination while the order is still pending, which reprices automatically
- Cancel any order that has not been delivered
- Pay with M-Pesa via STK push

### Courier

- See only the deliveries assigned to them
- Advance a delivery through picked up → in transit → delivered, with the ordering
  enforced server side
- Push live location either from the browser's geolocation or by entering coordinates
- Personal performance counters

### Admin

- Dashboard with totals, a seven-day created-vs-delivered trend, a status mix chart and
  per-courier completion rates
- Full order board with status, courier and free-text search filters
- Assign or reassign couriers, with current workload shown per courier
- Override any order status and correct a parcel's location, both written to the timeline
- People directory with role changes and account deactivation

## Getting started

You need Python 3.10 or newer (tested on 3.11 and 3.14), [pipenv](https://pipenv.pypa.io/) and Node 18+.
PostgreSQL is optional for a first run — the app defaults to SQLite.

Install pipenv if you do not have it:

```bash
pip install --user pipenv
```

### 1. Backend

```bash
cd server
pipenv install --dev
cp .env.example .env
```

`pipenv install` reads `Pipfile` and installs the exact versions pinned in
`Pipfile.lock`, creating the virtualenv for you. `--dev` also brings in pytest.

Now create the tables and load demo data:

```bash
pipenv run upgrade
pipenv run seed
pipenv run start
```

Out of the box this uses a local SQLite file, so there is nothing else to install and
the app runs immediately. To switch to PostgreSQL, create the database and uncomment the
`DATABASE_URL` line in your `.env`:

```bash
createdb deliveroo_dev
```

Then re-run `pipenv run upgrade` and `pipenv run seed` against the new database.

Those are shortcuts defined in the `[scripts]` block of the `Pipfile`. The long form
works too if you prefer it — `pipenv run flask --app wsgi db upgrade`. To drop into a
shell with the virtualenv already active, run `pipenv shell` and then use the commands
without the `pipenv run` prefix.

The API listens on `http://localhost:5555`.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` to the backend.

### 3. Sign in

`pipenv run seed` creates a demo network — 3 couriers, 5 customers and roughly 28 orders
spread across every status and the last seven days.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@deliveroo.test` | `admin1234` |
| Courier | `peter@deliveroo.test` | `courier1234` |
| Customer | `amina@deliveroo.test` | `customer1234` |

The login screen lists these accounts with a button to fill them in.

## Environment variables

### `server/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `SECRET_KEY` | yes | Flask session signing |
| `JWT_SECRET_KEY` | yes | JWT signing; use 32+ bytes |
| `DATABASE_URL` | no | PostgreSQL connection string. Blank falls back to local SQLite |
| `CLIENT_ORIGIN` | yes | Comma-separated list of allowed CORS origins |
| `GOOGLE_MAPS_API_KEY` | no | Server-side geocoding and directions |
| `MAIL_*` | no | SMTP credentials for notification email |
| `AT_*` | no | Africa's Talking credentials for SMS notifications |
| `MPESA_*` | no | Daraja credentials for STK push |
| `BASE_RATE_KES` | no | Base fare, defaults to 180 |
| `PRICE_PER_KM_KES` | no | Distance rate, defaults to 42 |

Generate secrets with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### `client/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | yes | Backend API root, e.g. `http://localhost:5555/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | no | Maps rendering and Places autocomplete |

## Third-party integrations

All three integrations are wired to the real services and read their credentials from
the environment. Each one degrades gracefully when its credentials are absent, so the
app is fully usable before you have keys.

### Google Maps

Enable **Maps JavaScript API**, **Places API**, **Geocoding API** and **Directions API**
in Google Cloud, create an API key, and put it in both `.env` files.

- With a key: real address autocomplete, a styled map with pickup, destination and
  courier pins, the decoded route polyline, and distances from the Directions API.
- Without a key: address fields fall back to manual coordinate entry and the map panel
  shows the coordinates with a note explaining what to add. Distances are estimated with
  a haversine calculation scaled by a road-winding factor, so pricing still works.

Restrict the browser key by HTTP referrer and the server key by IP before deploying.

### SMS (Africa's Talking)

Register at africastalking.com, use the sandbox app for development, and set `AT_USERNAME`
and `AT_API_KEY`. `AT_SENDER_ID` is optional and only needed once you have an approved
alphanumeric sender. With no credentials every SMS is written to the server log instead of
being sent, so the notification flow is fully testable before you have an account.

Phone numbers are normalised to `+2547XXXXXXXX` before sending, so `0712345678`,
`254712345678` and `+254 712 345 678` all work.

### Email

Set `MAIL_USERNAME` and `MAIL_PASSWORD` to enable notifications on order creation,
courier assignment, every status change and successful payment. If `MAIL_USERNAME` is
empty, `MAIL_SUPPRESS_SEND` turns on automatically and messages are written to the
application log instead of being sent. Gmail requires an app password, not your normal
password.

### M-Pesa

Register a sandbox app on the Safaricom Daraja portal for the consumer key, secret and
passkey. `MPESA_CALLBACK_URL` must be a publicly reachable HTTPS URL — during local
development, tunnel it. Without credentials the checkout endpoint returns a clear 503
telling you which variables are missing.

## API reference

All routes are namespaced under `/api`. Authenticated routes expect
`Authorization: Bearer <access_token>`.

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Create an account, returns a token pair |
| POST | `/api/auth/login` | public | Exchange credentials for a token pair |
| POST | `/api/auth/refresh` | refresh token | Issue a new access token |
| GET | `/api/auth/me` | any | Current user profile |
| PATCH | `/api/auth/me` | any | Update own name, phone, vehicle |
| POST | `/api/auth/logout` | any | Revoke the presented token |

### Orders (customer)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/orders/categories` | public | Weight tiers and their pricing factors |
| GET | `/api/orders/couriers` | any | Riders a customer can request, no contact details |
| POST | `/api/orders/quote` | any | Price and route estimate without creating an order |
| GET | `/api/orders` | customer | Own orders — paginated, `status`, `search` |
| POST | `/api/orders` | customer | Create an order |
| GET | `/api/orders/:id` | owner/admin | One order with its timeline |
| GET | `/api/orders/:id/events` | owner/admin | Tracking timeline only |
| PATCH | `/api/orders/:id/destination` | owner | Change destination while pending, reprices |
| PATCH | `/api/orders/:id/cancel` | owner | Cancel before delivery |

### Courier

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/courier/orders` | courier | Assigned deliveries — paginated, `status`, `active` |
| GET | `/api/courier/orders/:id` | assignee | One assigned delivery |
| PATCH | `/api/courier/orders/:id/status` | assignee | Advance one stage |
| PATCH | `/api/courier/orders/:id/location` | assignee | Push live position |
| GET | `/api/courier/stats` | courier | Personal counters |

### Admin

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/admin/orders` | admin | All orders — `status`, `courier_id`, `search` |
| GET | `/api/admin/orders/:id` | admin | Any order |
| PATCH | `/api/admin/orders/:id/status` | admin | Set any status |
| PATCH | `/api/admin/orders/:id/location` | admin | Correct parcel location |
| PATCH | `/api/admin/orders/:id/assign` | admin | Assign a courier |
| GET | `/api/admin/couriers` | admin | Active couriers with workload |
| GET | `/api/admin/users` | admin | People directory — `role`, `search` |
| PATCH | `/api/admin/users/:id` | admin | Change role or activation |
| GET | `/api/admin/stats` | admin | Dashboard aggregates |

### Payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/payments/:orderId` | owner/admin | Payment record and amount due |
| POST | `/api/payments/:orderId/mpesa` | owner | Trigger an STK push |
| POST | `/api/payments/mpesa/callback` | public | Safaricom result callback |

### Pagination

Every list endpoint accepts `page` and `per_page` (default 10, max 50) and returns:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 28,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

### Errors

Failures return a consistent shape. Validation failures add a field map.

```json
{ "message": "From pending a courier can only move to picked_up" }
```

```json
{
  "message": "Validation failed",
  "errors": { "destination_lat": ["Missing data for required field."] }
}
```

Status codes: `401` not signed in, `403` wrong role or not your record, `404` missing,
`409` illegal state transition, `422` validation failure.

## Data model

```
User ──< Order >── User
 (customer)  (courier)
               │
               ├──< TrackingEvent
               └──1 Payment
```

- **User** — name, email, bcrypt hash, role, active flag, and courier fields for vehicle
  and last known position.
- **Order** — the two endpoints with coordinates, weight tier and actual weight, routed
  distance and duration, the encoded polyline, the price with its stored breakdown, the
  status, recipient contact details, an optional requested rider, and timestamps for each
  stage.
- **TrackingEvent** — an append-only history row for every status change, assignment and
  location push, recording who did it and where.
- **Payment** — one per order, carrying the M-Pesa checkout identifiers, receipt and the
  raw callback payload.

## Pricing

```
subtotal        = base_fare + (distance_km × per_km_rate)
weight_charge   = subtotal × (tier_multiplier − 1)
long_haul       = (subtotal + weight_charge) × 0.12   if distance > 25 km
total           = round_to_nearest_10(subtotal + weight_charge + handling + long_haul)
```

| Tier | Max weight | Multiplier | Handling |
| --- | --- | --- | --- |
| Light | 2 kg | 1.0 | KES 0 |
| Standard | 5 kg | 1.35 | KES 60 |
| Heavy | 20 kg | 1.9 | KES 180 |
| Bulk | 50 kg | 2.6 | KES 420 |

Pricing is calculated on the server only. The client never sends a price, and the stored
breakdown is what the customer sees on the order.

## Testing

```bash
cd server
pipenv run test
```

44 tests cover registration and login rules, password hashing, token revocation,
pagination, ownership isolation between customers, courier stage ordering, admin
assignment, the pricing quote, the full notification fan-out for every event, rider
request validation and SMS phone normalisation.

Frontend linting:

```bash
cd client
npm run lint
```

## Project structure

```
deliveroo/
├── client/
│   ├── src/
│   │   ├── api/          axios instance with token refresh, endpoint modules
│   │   ├── app/          redux store
│   │   ├── components/   layout, ui primitives, order and map components
│   │   ├── features/     redux slices by domain
│   │   ├── hooks/        useAuth, useDebounce, useToast
│   │   ├── pages/        route views grouped by role
│   │   ├── routes/       router, auth guard, role guard
│   │   └── utils/        constants, formatters, validators, token storage
│   └── tailwind.config.js
└── server/
    ├── app/
    │   ├── models/       SQLAlchemy models
    │   ├── schemas/      Marshmallow validation and serialisation
    │   ├── resources/    blueprints, one per domain
    │   ├── services/     pricing, maps, mailer, mpesa
    │   └── utils/        role decorators, error handlers, pagination
    ├── migrations/
    ├── tests/
    ├── Pipfile           dependency manifest
    ├── Pipfile.lock      pinned resolved versions, committed
    └── seed.py
```

## Deployment

1. Provision PostgreSQL and set `DATABASE_URL`. A `postgres://` scheme is rewritten to
   `postgresql://` automatically.
2. Set `FLASK_ENV=production` and strong secrets.
3. Add the deployed frontend URL to `CLIENT_ORIGIN`.
4. Run `pipenv run upgrade` on release to apply migrations.
5. Serve with `gunicorn wsgi:app` — a `Procfile` is included. Most hosts detect the
   `Pipfile` automatically and install from `Pipfile.lock`.
6. Build the frontend with `npm run build` and set `VITE_API_BASE_URL` to the deployed
   API before building, since Vite inlines it at build time.
7. Point `MPESA_CALLBACK_URL` at the deployed HTTPS callback route.

## Known limitations

- Location updates are pushed by the courier rather than streamed. Live tracking is
  polled on page load, not over websockets.
- Revoked tokens are held in process memory, so they are forgotten on restart and are not
  shared across multiple workers. A production deployment should move the blocklist to
  Redis or a database table.
- The M-Pesa callback is not signature-verified; it trusts the checkout identifier to
  match a payment row.
- Without a Google Maps key, distances are estimated geometrically rather than routed, so
  quotes are close but not exact.
- The destination can only change while an order is pending. This is stricter than
  "before delivery" and is a deliberate choice, since repricing a parcel already in a
  courier's hands would need a settlement flow.

## Branching

- `main` — production only, never pushed to directly
- `development` — integration branch, all pull requests target this
- `feature-*` — one branch per unit of work
