import { Link } from 'react-router-dom'

import { PUBLIC_NAV } from '@/utils/constants'
import { CREDIT } from '@/utils/media'

const COLUMNS = [
  {
    heading: 'Company',
    links: PUBLIC_NAV.filter((item) => item.to !== '/'),
  },
  {
    heading: 'Get started',
    links: [
      { to: '/register', label: 'Sign up' },
      { to: '/login', label: 'Sign in' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-3.5 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600">
                <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M8 21 14 9l4 7.5L20 13l4 8z" fill="white" />
                </svg>
              </span>
              <span className="font-display text-base font-bold tracking-tight text-slate-950">
                Deliveroo
              </span>
            </Link>
            <p className="mt-3.5 max-w-prose font-body text-sm text-slate-500">
              Parcel delivery management for Nairobi. Quote it, track it, pay for it — without the
              phone tag.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {column.heading}
              </p>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="font-body text-sm text-slate-600 underline-offset-4 transition hover:text-slate-950 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2.5 border-t border-slate-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-slate-400">
            Deliveroo — a student capstone project. {CREDIT}.
          </p>
          <p className="font-mono text-xs text-slate-400">
            React 18 · Redux Toolkit · Tailwind CSS · Flask 3 · PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  )
}
