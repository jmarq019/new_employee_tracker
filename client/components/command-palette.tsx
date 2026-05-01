'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { getEmployees, getRoles, getDepartments } from '@/lib/api';
import { formatSalary } from '@/lib/design';
import type { Employee, Role, Department } from '@/lib/types';

type ItemType = 'nav' | 'action' | 'record';

interface CmdItem {
  id: string;
  label: string;
  meta?: string;
  type: ItemType;
  to?: string;
  action?: string;
  icon: string;
}

const NAV_ITEMS: CmdItem[] = [
  { type: 'nav', id: 'nav-emp',  label: 'Go to Employees',   to: 'employees',   icon: 'users' },
  { type: 'nav', id: 'nav-role', label: 'Go to Roles',       to: 'roles',       icon: 'briefcase' },
  { type: 'nav', id: 'nav-dept', label: 'Go to Departments', to: 'departments', icon: 'building' },
  { type: 'nav', id: 'nav-org',  label: 'Go to Org Chart',   to: 'org',         icon: 'tree' },
];

const ACTION_ITEMS: CmdItem[] = [
  { type: 'action', id: 'add-emp',  label: 'Add new employee',   action: '/employees?new=1', icon: 'plus' },
  { type: 'action', id: 'add-role', label: 'Add new role',       action: '/roles?new=1',     icon: 'plus' },
  { type: 'action', id: 'add-dept', label: 'Add new department', action: '/departments?new=1', icon: 'plus' },
  { type: 'action', id: 'theme',    label: 'Toggle light/dark theme', action: 'theme', icon: 'moon' },
];

function Icon({ name, size = 15 }: { name: string; size?: number }) {
  const props = { width: size, height: size, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 };
  switch (name) {
    case 'users': return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'briefcase': return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    case 'building': return <svg {...props}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;
    case 'tree': return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2"/><path d="M19 11v4"/><path d="M21 13h-4"/></svg>;
    case 'plus': return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'moon': return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
    case 'search':
    default: return <svg {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [liveData, setLiveData] = useState<{ employees: Employee[]; roles: Role[]; departments: Department[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      if (!liveData) {
        Promise.all([getEmployees(), getRoles(), getDepartments()])
          .then(([employees, roles, departments]) => setLiveData({ employees, roles, departments }))
          .catch(() => {});
      }
    }
  }, [open]);

  const items = useMemo<CmdItem[]>(() => {
    const ql = q.trim().toLowerCase();
    const match = (s: string) => !ql || s.toLowerCase().includes(ql);
    const result: CmdItem[] = [];

    NAV_ITEMS.forEach(it => { if (match(it.label)) result.push(it); });
    ACTION_ITEMS.forEach(it => { if (match(it.label)) result.push(it); });

    if (liveData) {
      const { employees, roles, departments } = liveData;
      employees.forEach(e => {
        const role = roles.find(r => r.id === e.role_id);
        const fullName = `${e.first_name} ${e.last_name}`;
        if (match(fullName) || match(role?.title ?? '')) {
          result.push({ type: 'record', id: 'emp-' + e.id, label: fullName, meta: role?.title ?? '—', to: 'employees', icon: 'users' });
        }
      });
      roles.forEach(r => {
        if (match(r.title)) {
          const dept = departments.find(d => d.id === r.department_id);
          result.push({ type: 'record', id: 'role-' + r.id, label: r.title, meta: (dept?.name ?? '') + ' · ' + formatSalary(r.salary), to: 'roles', icon: 'briefcase' });
        }
      });
      departments.forEach(d => {
        if (match(d.name)) {
          result.push({ type: 'record', id: 'dept-' + d.id, label: d.name, meta: 'Department', to: 'departments', icon: 'building' });
        }
      });
    }
    return result.slice(0, 30);
  }, [q, liveData]);

  useEffect(() => { setActive(0); }, [q]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>('.cmdk-item.active');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (it: CmdItem) => {
    if (it.type === 'nav' || it.type === 'record') {
      router.push('/' + it.to);
    } else if (it.type === 'action') {
      if (it.action === 'theme') {
        toggleTheme();
      } else if (it.action) {
        router.push(it.action);
      }
    }
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter')     { e.preventDefault(); if (items[active]) choose(items[active]); }
  };

  if (!open) return null;

  const groups = [
    { key: 'nav',    label: 'Navigate', items: items.filter(i => i.type === 'nav') },
    { key: 'action', label: 'Actions',  items: items.filter(i => i.type === 'action') },
    { key: 'record', label: 'Records',  items: items.filter(i => i.type === 'record') },
  ].filter(g => g.items.length > 0);

  return (
    <div
      className="cmdk-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cmdk" onKeyDown={onKey}>
        <div className="cmdk-input-wrap">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder="Search people, roles, departments…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="kbd">esc</span>
        </div>
        <div className="cmdk-list" ref={listRef}>
          {items.length === 0 && (
            <div className="cmdk-empty">No results{q ? ` for "${q}"` : ''}</div>
          )}
          {groups.map(g => (
            <div key={g.key}>
              <div className="cmdk-group-label">{g.label}</div>
              {g.items.map(it => {
                const idx = items.indexOf(it);
                return (
                  <div
                    key={it.id}
                    className={`cmdk-item ${idx === active ? 'active' : ''}`}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => choose(it)}
                  >
                    <span className="ico"><Icon name={it.icon} size={15} /></span>
                    <span className="title">{it.label}</span>
                    {it.meta && <span className="meta">{it.meta}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-footer">
          <span>Type to search · ↑↓ navigate · ↵ open</span>
          <span className="keys"><span className="kbd">⌘K</span></span>
        </div>
      </div>
    </div>
  );
}
