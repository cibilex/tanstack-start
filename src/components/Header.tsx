import { Link } from '@tanstack/react-router'

import type { LinkOptions } from '@tanstack/react-router'

type LinkItem = LinkOptions & { label: string }

const navLinks: Array<LinkItem> = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Users',
    to: '/users',
  },
]

export default function Header() {
  return (
    <>
      <header className="p-4 flex items-center bg-gray-800 text-white shadow-lg">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className: 'bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            {link.label}
          </Link>
        ))}
      </header>
    </>
  )
}
