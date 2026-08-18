export const ROLES = {
  CUSTOMER: 'customer',
  COURIER: 'courier',
  ADMIN: 'admin',
}

export const STATUS = {
  PENDING: 'pending',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const STATUS_META = {
  [STATUS.PENDING]: {
    label: 'Pending',
    chip: 'bg-slate-100 text-slate-700 ring-slate-200',
    dot: 'bg-slate-400',
    blurb: 'Waiting for a courier to be assigned',
  },
  [STATUS.PICKED_UP]: {
    label: 'Picked up',
    chip: 'bg-blue-100 text-blue-700 ring-blue-300/60',
    dot: 'bg-blue-500',
    blurb: 'The courier has collected the parcel',
  },
  [STATUS.IN_TRANSIT]: {
    label: 'In transit',
    chip: 'bg-amber-100 text-amber-700 ring-amber-300/60',
    dot: 'bg-amber-500',
    blurb: 'On the road to the destination',
  },
  [STATUS.DELIVERED]: {
    label: 'Delivered',
    chip: 'bg-brand-100 text-brand-800 ring-brand-300/60',
    dot: 'bg-brand-500',
    blurb: 'Handed over to the recipient',
  },
  [STATUS.CANCELLED]: {
    label: 'Cancelled',
    chip: 'bg-red-100 text-red-700 ring-red-300/60',
    dot: 'bg-red-500',
    blurb: 'This delivery was called off',
  },
}

export const DELIVERY_STAGES = [
  STATUS.PENDING,
  STATUS.PICKED_UP,
  STATUS.IN_TRANSIT,
  STATUS.DELIVERED,
]

export const NEXT_STAGE = {
  [STATUS.PENDING]: STATUS.PICKED_UP,
  [STATUS.PICKED_UP]: STATUS.IN_TRANSIT,
  [STATUS.IN_TRANSIT]: STATUS.DELIVERED,
}

export const PAYMENT_META = {
  unpaid: { label: 'Unpaid', chip: 'bg-slate-100 text-slate-600 ring-slate-200' },
  pending: { label: 'Pending', chip: 'bg-slate-100 text-slate-600 ring-slate-200' },
  processing: { label: 'Awaiting PIN', chip: 'bg-amber-100 text-amber-700 ring-amber-300/60' },
  paid: { label: 'Paid', chip: 'bg-brand-100 text-brand-800 ring-brand-300/60' },
  failed: { label: 'Failed', chip: 'bg-red-100 text-red-700 ring-red-300/60' },
}

export const NAIROBI_CENTER = { lat: -1.2921, lng: 36.8219 }

export const MAP_LIBRARIES = ['places']

export const PUBLIC_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About us' },
  { to: '/services', label: 'Services' },
]

export const ROLE_LABEL = {
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.COURIER]: 'Rider',
  [ROLES.ADMIN]: 'Operations',
}

export const NAV_BY_ROLE = {
  [ROLES.CUSTOMER]: [
    { to: '/dashboard', label: 'My deliveries', end: true },
    { to: '/orders/new', label: 'Send a parcel' },
    { to: '/profile', label: 'Profile' },
  ],
  [ROLES.COURIER]: [
    { to: '/courier', label: 'My route', end: true },
    { to: '/profile', label: 'Profile' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/users', label: 'People' },
    { to: '/profile', label: 'Profile' },
  ],
}

export const HOME_BY_ROLE = {
  [ROLES.CUSTOMER]: '/dashboard',
  [ROLES.COURIER]: '/courier',
  [ROLES.ADMIN]: '/admin',
}

export const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export const CONTACT = {
  company: 'Deliveroo Logistics',
  addressLines: ['Sarit Centre, 3rd Floor', 'Karuna Road, Westlands', 'Nairobi, Kenya'],
  mapsQuery: 'Sarit Centre, Karuna Road, Westlands, Nairobi',
  phoneDisplay: '+254 712 345 678',
  phoneDial: '+254712345678',
  email: 'hello@deliveroo.co.ke',
  hours: 'Monday to Saturday, 7:00 AM to 8:00 PM EAT',
}

export const mapsLink = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
