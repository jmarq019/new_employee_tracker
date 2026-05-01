'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme-context';
import { deptColor, avatarColor } from '@/lib/design';
import {
  getEmployees, getRoles, getDepartments,
  createEmployee, updateEmployee, deleteEmployee,
} from '@/lib/api';
import type { Employee, Role, Department } from '@/lib/types';
import EmployeeForm from '@/components/employees/employee-form';

type ViewMode = 'table' | 'cards';
type SortKey = 'name' | 'role' | 'dept' | 'mgr' | 'salary' | 'id';

type EnrichedEmp = Employee & {
  _role: Role | undefined;
  _dept: Department | undefined;
  _mgr: Employee | undefined;
  _name: string;
};

/* ── small helpers ── */
function Avatar({ emp }: { emp: EnrichedEmp }) {
  const [fg, bg] = avatarColor(emp.id);
  const initials = emp._name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="avatar" style={{ background: bg, color: fg, width: 32, height: 32, fontSize: 12 }}>
      {initials}
    </div>
  );
}

function DeptBadge({ dept, dark }: { dept: Department; dark: boolean }) {
  const c = deptColor(dept.id, dark);
  return (
    <span className="badge" style={{
      background: c.bg, color: c.fg,
      borderColor: `color-mix(in oklab, ${c.fg} 30%, var(--border))`,
      textTransform: 'capitalize',
    }}>
      <span className="badge-dot" />{dept.name}
    </span>
  );
}

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

function EmployeeDialog({ initial, employees, roles, departments, onSave, onClose }: {
  initial: Employee | null;
  employees: Employee[];
  roles: Role[];
  departments: Department[];
  onSave: (data: Omit<Employee, 'id' | 'role_title' | 'manager_name'>) => Promise<void>;
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
          <h2 className="dialog-title">{initial ? 'Edit employee' : 'Add new employee'}</h2>
          <p className="dialog-desc">
            {initial
              ? `Update details for ${initial.first_name} ${initial.last_name}.`
              : 'Add a person to your team.'}
          </p>
        </div>
        <EmployeeForm
          initialData={initial}
          currentEmployeeId={initial?.id}
          employees={employees}
          roles={roles}
          departments={departments}
          onSubmit={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

/* ── EMP_GRID columns ── */
const EMP_GRID = 'minmax(36px,40px) minmax(60px,80px) 2fr 1.6fr 1.4fr 1.4fr 110px';

/* ── Main page content ── */
function EmployeesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [q, setQ] = useState('');
  const [deptFilter, setDeptFilter] = useState<number | null>(null);
  const [mgrOnly, setMgrOnly] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });
  const [confirmRow, setConfirmRow] = useState<EnrichedEmp | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('employees-view') as ViewMode | null;
    if (saved === 'table' || saved === 'cards') setViewMode(saved);
  }, []);

  const setView = (v: ViewMode) => { setViewMode(v); localStorage.setItem('employees-view', v); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, r, d] = await Promise.all([getEmployees(), getRoles(), getDepartments()]);
      setEmployees(e); setRoles(r); setDepartments(d);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditTarget(null); setDialogOpen(true);
      router.replace('/employees');
    }
  }, [searchParams, router]);

  const roleById = useMemo(() => Object.fromEntries(roles.map(r => [r.id, r])), [roles]);
  const empById  = useMemo(() => Object.fromEntries(employees.map(e => [e.id, e])), [employees]);

  const enriched = useMemo<EnrichedEmp[]>(() => employees.map(e => {
    const role = roleById[e.role_id ?? -1];
    const dept = role ? departments.find(d => d.id === role.department_id) : undefined;
    const mgr  = e.manager_id ? (empById[e.manager_id] as Employee | undefined) : undefined;
    return { ...e, _role: role, _dept: dept, _mgr: mgr, _name: `${e.first_name} ${e.last_name}` };
  }), [employees, roles, departments, roleById, empById]);

  const managerIds = useMemo(() => new Set(employees.map(e => e.manager_id).filter(Boolean)), [employees]);

  const filtered = useMemo(() => {
    let list = enriched.filter(e => {
      if (q) {
        const ql = q.toLowerCase();
        if (!e._name.toLowerCase().includes(ql)
          && !(e._role?.title ?? '').toLowerCase().includes(ql)
          && !(e._dept?.name  ?? '').toLowerCase().includes(ql)) return false;
      }
      if (deptFilter && e._dept?.id !== deptFilter) return false;
      if (mgrOnly && !managerIds.has(e.id)) return false;
      return true;
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      const get = (e: EnrichedEmp) =>
        sort.key === 'name'   ? e._name
        : sort.key === 'role'   ? (e._role?.title ?? '')
        : sort.key === 'dept'   ? (e._dept?.name  ?? '')
        : sort.key === 'mgr'    ? (e._mgr ? `${e._mgr.first_name} ${e._mgr.last_name}` : '')
        : sort.key === 'salary' ? (e._role?.salary ?? -1)
        : e.id;
      const av = get(a), bv = get(b);
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
    return list;
  }, [enriched, q, deptFilter, mgrOnly, sort, managerIds]);

  const allChecked = filtered.length > 0 && filtered.every(e => selected.has(e.id));
  const someChecked = filtered.some(e => selected.has(e.id));
  const toggleAll = () => setSelected(s => {
    const n = new Set(s);
    if (allChecked) filtered.forEach(e => n.delete(e.id));
    else filtered.forEach(e => n.add(e.id));
    return n;
  });
  const toggleOne = (id: number) => setSelected(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const onSort = (k: SortKey) => setSort(s => ({ key: k, dir: s.key === k && s.dir === 'asc' ? 'desc' : 'asc' }));

  const handleSave = async (data: Omit<Employee, 'id' | 'role_title' | 'manager_name'>) => {
    if (editTarget) {
      await updateEmployee(editTarget.id, data);
      toast.success('Employee updated');
    } else {
      await createEmployee(data);
      toast.success('Employee added');
    }
    setDialogOpen(false); setEditTarget(null);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteEmployee(id);
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
    toast.success('Employee deleted');
    load();
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    await Promise.all(ids.map(deleteEmployee));
    setSelected(new Set());
    toast.success(`Deleted ${ids.length} employee${ids.length === 1 ? '' : 's'}`);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Everyone on your team and who they report to.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add employee
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <svg className="search-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search by name, role, or department…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="chips">
          <button
            className={`chip ${!deptFilter && !mgrOnly ? 'active' : ''}`}
            onClick={() => { setDeptFilter(null); setMgrOnly(false); }}
          >
            All <span style={{ opacity: .7 }}>{enriched.length}</span>
          </button>
          {departments.map(d => {
            const count = enriched.filter(e => e._dept?.id === d.id).length;
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
          <button className={`chip ${mgrOnly ? 'active' : ''}`} onClick={() => setMgrOnly(!mgrOnly)}>
            Managers only
          </button>
        </div>
        <div className="toolbar-spacer" />
        <div className="toolbar-right">
          <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {(['table', 'cards'] as ViewMode[]).map(v => (
              <button
                key={v}
                className="icon-btn"
                style={{
                  borderRadius: 0, border: 'none',
                  background: viewMode === v ? 'var(--bg-sunken)' : 'transparent',
                  color: viewMode === v ? 'var(--text)' : 'var(--text-muted)',
                }}
                title={v === 'table' ? 'Table view' : 'Cards view'}
                onClick={() => setView(v)}
              >
                {v === 'table'
                  ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-illust">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3>No matches</h3>
          <p>Try clearing filters or adjusting your search.</p>
          <button className="btn" onClick={() => { setQ(''); setDeptFilter(null); setMgrOnly(false); }}>Clear filters</button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="card-grid">
          {filtered.map(e => (
            <div
              key={e.id}
              className={`emp-card ${selected.has(e.id) ? 'selected' : ''}`}
              onClick={() => toggleOne(e.id)}
            >
              <div className="emp-card-check">
                <Checkbox checked={selected.has(e.id)} onChange={() => toggleOne(e.id)} />
              </div>
              <div className="emp-card-actions">
                <button className="icon-btn" title="Edit" onClick={(ev) => { ev.stopPropagation(); setEditTarget(e); setDialogOpen(true); }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="icon-btn btn-danger" title="Delete" onClick={(ev) => { ev.stopPropagation(); setConfirmRow(e); }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
              <div className="emp-card-head">
                <Avatar emp={e} />
                <div style={{ minWidth: 0 }}>
                  <div className="emp-card-name">{e._name}</div>
                  <div className="emp-card-role">{e._role?.title ?? '—'}</div>
                </div>
              </div>
              <div className="emp-card-body">
                <div className="row-line">
                  <span className="k">Department</span>
                  {e._dept ? <DeptBadge dept={e._dept} dark={dark} /> : <span>—</span>}
                </div>
                <div className="row-line">
                  <span className="k">Manager</span>
                  <span>{e._mgr ? `${e._mgr.first_name} ${e._mgr.last_name}` : '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="table-head" style={{ gridTemplateColumns: EMP_GRID }}>
            <div className="no-sort" onClick={(e) => { e.stopPropagation(); toggleAll(); }}>
              <Checkbox checked={allChecked} indeterminate={!allChecked && someChecked} onChange={toggleAll} />
            </div>
            <div className="no-sort" style={{ cursor: 'default' }}>ID</div>
            <div onClick={() => onSort('name')}>Name <SortArrow active={sort.key === 'name'} dir={sort.dir} /></div>
            <div onClick={() => onSort('role')}>Role <SortArrow active={sort.key === 'role'} dir={sort.dir} /></div>
            <div onClick={() => onSort('dept')}>Department <SortArrow active={sort.key === 'dept'} dir={sort.dir} /></div>
            <div onClick={() => onSort('mgr')}>Manager <SortArrow active={sort.key === 'mgr'} dir={sort.dir} /></div>
            <div className="no-sort" style={{ justifyContent: 'flex-end' }}>Actions</div>
          </div>
          <div className="table-rows">
            {filtered.map(e => (
              <div
                key={e.id}
                className={`row ${selected.has(e.id) ? 'selected' : ''}`}
                style={{ gridTemplateColumns: EMP_GRID }}
                onClick={() => toggleOne(e.id)}
              >
                <div className="cell"><Checkbox checked={selected.has(e.id)} onChange={() => toggleOne(e.id)} /></div>
                <div className="cell cell-id">#{String(e.id).padStart(3, '0')}</div>
                <div className="cell cell-name">
                  <Avatar emp={e} />
                  <span>{e._name}</span>
                </div>
                <div className="cell" style={{ color: 'var(--text-muted)' }}>{e._role?.title ?? '—'}</div>
                <div className="cell">
                  {e._dept ? <DeptBadge dept={e._dept} dark={dark} /> : <span style={{ color: 'var(--text-soft)' }}>—</span>}
                </div>
                <div className="cell" style={{ color: 'var(--text-muted)' }}>
                  {e._mgr ? `${e._mgr.first_name} ${e._mgr.last_name}` : <span style={{ color: 'var(--text-soft)' }}>—</span>}
                </div>
                <div className="cell cell-actions">
                  <button className="icon-btn" title="Edit" onClick={(ev) => { ev.stopPropagation(); setEditTarget(e); setDialogOpen(true); }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="icon-btn btn-danger" title="Delete" onClick={(ev) => { ev.stopPropagation(); setConfirmRow(e); }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
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
          title={`Delete ${confirmRow._name}?`}
          desc="Their direct reports will become unassigned."
          onConfirm={() => handleDelete(confirmRow.id)}
          onClose={() => setConfirmRow(null)}
        />
      )}
      {confirmBulk && (
        <ConfirmDialog
          title={`Delete ${selected.size} employee${selected.size === 1 ? '' : 's'}?`}
          desc="They'll be removed from the team and from any reports they manage."
          onConfirm={handleBulkDelete}
          onClose={() => setConfirmBulk(false)}
        />
      )}

      {dialogOpen && (
        <EmployeeDialog
          initial={editTarget}
          employees={employees}
          roles={roles}
          departments={departments}
          onSave={handleSave}
          onClose={() => { setDialogOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense>
      <EmployeesContent />
    </Suspense>
  );
}
