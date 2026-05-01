'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme-context';
import { deptColor, formatSalary } from '@/lib/design';
import {
  getRoles, getEmployees, getDepartments,
  createRole, updateRole, deleteRole,
} from '@/lib/api';
import type { Role, Employee, Department } from '@/lib/types';
import RoleForm from '@/components/roles/role-form';

type SortKey = 'title' | 'dept' | 'salary' | 'count' | 'id';

type EnrichedRole = Role & { _dept: Department | undefined; _count: number };

function Checkbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      className={`ds-checkbox ${checked ? 'checked' : ''} ${indeterminate ? 'indeterminate' : ''}`}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    >
      {checked && !indeterminate && (
        <svg width={11} height={11} viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="2,6 4.5,8.5 9,3" />
        </svg>
      )}
      {indeterminate && <span style={{ display: 'inline-block', width: 8, height: 1.5, background: 'currentColor' }} />}
    </button>
  );
}

function SortArrow({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className={`sort-arrow ${active ? 'active' : ''}`}>
      {active && dir === 'asc'
        ? <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        : active && dir === 'desc'
        ? <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        : <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>
      }
    </span>
  );
}

function ConfirmDialog({ title, desc, onConfirm, onClose }: {
  title: string; desc: string; onConfirm: () => void; onClose: () => void;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog" style={{ maxWidth: 420 }}>
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          <p className="dialog-desc">{desc}</p>
        </div>
        <div className="dialog-body">
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>This action cannot be undone.</p>
        </div>
        <div className="dialog-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn"
            style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }}
            onClick={() => { onConfirm(); onClose(); }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}

function RoleDialog({ initial, departments, onSave, onClose }: {
  initial: Role | null;
  departments: Department[];
  onSave: (data: Omit<Role, 'id' | 'department_name'>) => Promise<void>;
  onClose: () => void;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">{initial ? 'Edit role' : 'Add new role'}</h2>
          <p className="dialog-desc">{initial ? 'Update title, salary or department.' : 'Roles tie a title and salary to a department.'}</p>
        </div>
        <RoleForm
          initialData={initial}
          departments={departments}
          onSubmit={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

const ROLE_GRID = 'minmax(36px,40px) minmax(60px,80px) 2fr 1.5fr 1.2fr 1fr 110px';

function RolesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [q, setQ] = useState('');
  const [deptFilter, setDeptFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'title', dir: 'asc' });
  const [confirmRow, setConfirmRow] = useState<EnrichedRole | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, e, d] = await Promise.all([getRoles(), getEmployees(), getDepartments()]);
      setRoles(r); setEmployees(e); setDepartments(d);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditTarget(null); setDialogOpen(true);
      router.replace('/roles');
    }
  }, [searchParams, router]);

  const enriched = useMemo<EnrichedRole[]>(() => roles.map(r => ({
    ...r,
    _dept: departments.find(d => d.id === r.department_id),
    _count: employees.filter(e => e.role_id === r.id).length,
  })), [roles, employees, departments]);

  const maxSalary = Math.max(1, ...enriched.map(r => r.salary));

  const filtered = useMemo(() => {
    let list = enriched.filter(r => {
      if (q && !r.title.toLowerCase().includes(q.toLowerCase()) && !(r._dept?.name ?? '').toLowerCase().includes(q.toLowerCase())) return false;
      if (deptFilter && r.department_id !== deptFilter) return false;
      return true;
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const get = (r: EnrichedRole) =>
        sort.key === 'title'  ? r.title
        : sort.key === 'dept'   ? (r._dept?.name ?? '')
        : sort.key === 'salary' ? r.salary
        : sort.key === 'count'  ? r._count
        : r.id;
      const av = get(a), bv = get(b);
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [enriched, q, deptFilter, sort]);

  const allChecked = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  const someChecked = filtered.some(r => selected.has(r.id));
  const toggleAll = () => setSelected(s => {
    const n = new Set(s);
    if (allChecked) filtered.forEach(r => n.delete(r.id));
    else filtered.forEach(r => n.add(r.id));
    return n;
  });
  const toggleOne = (id: number) => setSelected(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const onSort = (k: SortKey) => setSort(s => ({ key: k, dir: s.key === k && s.dir === 'asc' ? 'desc' : 'asc' }));

  const handleSave = async (data: Omit<Role, 'id' | 'department_name'>) => {
    if (editTarget) {
      await updateRole(editTarget.id, data);
      toast.success('Role updated');
    } else {
      await createRole(data);
      toast.success('Role added');
    }
    setDialogOpen(false); setEditTarget(null);
    load();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      setSelected(s => { const n = new Set(s); n.delete(id); return n; });
      toast.success('Role deleted');
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete role';
      toast.error(msg);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    const results = await Promise.allSettled(ids.map(deleteRole));
    const failed = results.filter(r => r.status === 'rejected').length;
    setSelected(new Set());
    if (failed > 0) toast.error(`${failed} role(s) could not be deleted (still in use)`);
    else toast.success(`Deleted ${ids.length} role${ids.length === 1 ? '' : 's'}`);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles</h1>
          <p className="page-subtitle">Job titles, salaries, and the departments they belong to.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add role
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <svg className="search-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search roles or departments…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="chips">
          <button className={`chip ${!deptFilter ? 'active' : ''}`} onClick={() => setDeptFilter(null)}>
            All <span style={{ opacity: .7 }}>{enriched.length}</span>
          </button>
          {departments.map(d => {
            const count = enriched.filter(r => r.department_id === d.id).length;
            const c = deptColor(d.id, dark);
            const isActive = deptFilter === d.id;
            return (
              <button
                key={d.id}
                className={`chip ${isActive ? 'active' : ''}`}
                onClick={() => setDeptFilter(isActive ? null : d.id)}
                style={isActive ? { background: c.bg, color: c.fg, borderColor: `color-mix(in oklab, ${c.fg} 45%, var(--border))` } : {}}
              >
                <span style={{ width: 6, height: 6, borderRadius: 99, background: c.fg, display: 'inline-block' }} />
                <span style={{ textTransform: 'capitalize' }}>{d.name}</span>
                <span style={{ opacity: .7 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-illust">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h3>No roles match</h3>
          <p>Adjust your filters or add a new role.</p>
        </div>
      ) : (
        <>
          <div className="table-head" style={{ gridTemplateColumns: ROLE_GRID }}>
            <div className="no-sort"><Checkbox checked={allChecked} indeterminate={!allChecked && someChecked} onChange={toggleAll} /></div>
            <div className="no-sort" style={{ cursor: 'default' }}>ID</div>
            <div onClick={() => onSort('title')}>Title <SortArrow active={sort.key === 'title'} dir={sort.dir} /></div>
            <div onClick={() => onSort('dept')}>Department <SortArrow active={sort.key === 'dept'} dir={sort.dir} /></div>
            <div onClick={() => onSort('salary')}>Salary <SortArrow active={sort.key === 'salary'} dir={sort.dir} /></div>
            <div onClick={() => onSort('count')}>People <SortArrow active={sort.key === 'count'} dir={sort.dir} /></div>
            <div className="no-sort" style={{ justifyContent: 'flex-end' }}>Actions</div>
          </div>
          <div className="table-rows">
            {filtered.map(r => {
              const c = r._dept ? deptColor(r._dept.id, dark) : null;
              return (
                <div
                  key={r.id}
                  className={`row ${selected.has(r.id) ? 'selected' : ''}`}
                  style={{ gridTemplateColumns: ROLE_GRID }}
                  onClick={() => toggleOne(r.id)}
                >
                  <div className="cell"><Checkbox checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} /></div>
                  <div className="cell cell-id">#{String(r.id).padStart(3, '0')}</div>
                  <div className="cell" style={{ fontWeight: 500 }}>{r.title}</div>
                  <div className="cell">
                    {r._dept && c ? (
                      <span className="badge" style={{
                        background: c.bg, color: c.fg,
                        borderColor: `color-mix(in oklab, ${c.fg} 30%, var(--border))`,
                        textTransform: 'capitalize',
                      }}>
                        <span className="badge-dot" />{r._dept.name}
                      </span>
                    ) : <span style={{ color: 'var(--text-soft)' }}>—</span>}
                  </div>
                  <div className="cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="salary">{formatSalary(r.salary)}</span>
                      <div className="bar-mini"><span style={{ width: `${(r.salary / maxSalary) * 100}%` }} /></div>
                    </div>
                  </div>
                  <div className="cell" style={{ color: 'var(--text-muted)' }}>
                    {r._count} {r._count === 1 ? 'person' : 'people'}
                  </div>
                  <div className="cell cell-actions">
                    <button className="icon-btn" title="Edit" onClick={(ev) => { ev.stopPropagation(); setEditTarget(r); setDialogOpen(true); }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="icon-btn btn-danger" title="Delete" onClick={(ev) => { ev.stopPropagation(); setConfirmRow(r); }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selected.size > 0 && (
        <div className="selection-bar">
          <span className="count">{selected.size} selected</span>
          <button className="sb-btn" onClick={() => setSelected(new Set())}>Deselect all</button>
          <button className="sb-btn danger" onClick={() => setConfirmBulk(true)}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            Delete
          </button>
        </div>
      )}

      {confirmRow && (
        <ConfirmDialog
          title={`Delete role "${confirmRow.title}"?`}
          desc={confirmRow._count > 0
            ? `${confirmRow._count} ${confirmRow._count === 1 ? 'person currently holds' : 'people currently hold'} this role.`
            : 'No one holds this role today.'}
          onConfirm={() => handleDelete(confirmRow.id)}
          onClose={() => setConfirmRow(null)}
        />
      )}
      {confirmBulk && (
        <ConfirmDialog
          title={`Delete ${selected.size} role${selected.size === 1 ? '' : 's'}?`}
          desc="People in these roles will be left without a role until reassigned."
          onConfirm={handleBulkDelete}
          onClose={() => setConfirmBulk(false)}
        />
      )}

      {dialogOpen && (
        <RoleDialog
          initial={editTarget}
          departments={departments}
          onSave={handleSave}
          onClose={() => { setDialogOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

export default function RolesPage() {
  return (
    <Suspense>
      <RolesContent />
    </Suspense>
  );
}
