'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';

const NAV_LINKS = [
  { href: '/employees',   label: 'Employees' },
  { href: '/roles',       label: 'Roles' },
  { href: '/departments', label: 'Departments' },
  { href: '/org',         label: 'Org chart' },
];

interface Props {
  onCmdK: () => void;
}

export default function Nav({ onCmdK }: Props) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <span className="nav-brand-mark">E</span>
          <span>Employee Tracker</span>
        </Link>

        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname.startsWith(href) ? 'active' : ''}`}
          >
            {label}
          </Link>
        ))}

        <div className="nav-spacer" />

        <div className="nav-actions">
          <button className="nav-search-trigger" onClick={onCmdK}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span>Search…</span>
            <span className="kbd">{isMac ? '⌘' : 'Ctrl'}K</span>
          </button>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
