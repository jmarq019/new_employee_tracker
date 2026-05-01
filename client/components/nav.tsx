'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Briefcase, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/employees',   label: 'Employees',   icon: Users },
  { href: '/roles',       label: 'Roles',        icon: Briefcase },
  { href: '/departments', label: 'Departments',  icon: Building2 },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-1">
          <span className="mr-4 font-semibold text-primary">Employee Tracker</span>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
