'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme-context';
import { deptColor, formatSalary } from '@/lib/design';
import {
  getDepartments, getRoles, getEmployees,
  createDepartment, updateDepartment, deleteDepartment,
} from '@/lib/api';
import type { Department, Role, Employee } from '@/lib/types';
import DepartmentForm from '@/components/departments/department-form';

type EnrichedDept = Department & {
  _roleCount: number;
  _empCount: number;
  _totalSalary: number;
};

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

function DeptDialog({ initial, onSave, onClose }: {
  initial: Department | null;
  onSave: (data: Omit<Department, 'id'>) => Promise<void>;
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
          <h2 className="dialog-title">{initial ? 'Edit department' : 'Add new department'}</h2>
          <p className="dialog-desc">{initial ? 'Rename this department.' : 'Departments group roles and people.'}</p>
        </div>
        <DepartmentForm initialData={initial} onSubmit={onSave} onClose={onClose} />
      </div>
    </div>
  );
}

function DepartmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [confirmRow, setConfirmRow] = useState<EnrichedDept | null>(null);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, r, e] = await Promise.all([getDepartments(), getRoles(), getEmployees()]);
      setDepartments(d); setRoles(r); setEmployees(e);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditTarget(null); setDialogOpen(true);
      router.replace('/departments');
    }
  }, [searchParams, router]);

  const enriched = useMemo<EnrichedDept[]>(() => departments.map(d => {
    const deptRoles = roles.filter(r => r.department_id === d.id);
    const deptEmps  = employees.filter(e => deptRoles.some(r => r.id === e.role_id));
    const totalSalary = deptEmps.reduce((sum, e) => {
      const r = roles.find(r => r.id === e.role_id);
      return sum + (r?.salary ?? 0);
    }, 0);
    return { ...d, _roleCount: deptRoles.length, _empCount: deptEmps.length, _totalSalary: totalSalary };
  }), [departments, roles, employees]);

  const filtered = useMemo(
    () => enriched.filter(d => !q || d.name.toLowerCase().includes(q.toLowerCase())),
    [enriched, q]
  );

  const handleSave = async (data: Omit<Department, 'id'>) => {
    if (editTarget) {
      await updateDepartment(editTarget.id, data);
      toast.success('Department updated');
    } else {
      await createDepartment(data);
      toast.success('Department added');
    }
    setDialogOpen(false); setEditTarget(null);
    load();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(id);
      toast.success('Department deleted');
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete department';
      toast.error(msg);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">How your team is organized into functional groups.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add department
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <svg className="search-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search departments…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="dept-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 140, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-illust">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
            </svg>
          </div>
          <h3>No departments yet</h3>
          <p>Get started by creating your first department.</p>
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add department
          </button>
        </div>
      ) : (
        <div className="dept-grid">
          {filtered.map(d => {
            const c = deptColor(d.id, dark);
            return (
              <div key={d.id} className="dept-card">
                <div className="dept-color-bar" style={{ background: c.fg }} />
                <div className="dept-card-actions">
                  <button className="icon-btn" title="Edit" onClick={() => { setEditTarget(d); setDialogOpen(true); }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="icon-btn btn-danger" title="Delete" onClick={() => setConfirmRow(d)}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
                <div className="dept-card-name">{d.name}</div>
                <div className="dept-card-stats">
                  <div className="dept-card-stat">
                    <div className="v">{d._empCount}</div>
                    <div className="l">People</div>
                  </div>
                  <div className="dept-card-stat">
                    <div className="v">{d._roleCount}</div>
                    <div className="l">Roles</div>
                  </div>
                  <div className="dept-card-stat">
                    <div className="v salary">
                      {d._totalSalary >= 1000
                        ? `$${Math.round(d._totalSalary / 1000)}K`
                        : formatSalary(d._totalSalary)}
                    </div>
                    <div className="l">Payroll</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmRow && (
        <ConfirmDialog
          title={`Delete "${confirmRow.name}"?`}
          desc={confirmRow._roleCount > 0
            ? `This department has ${confirmRow._roleCount} role${confirmRow._roleCount === 1 ? '' : 's'} and ${confirmRow._empCount} ${confirmRow._empCount === 1 ? 'person' : 'people'}. They'll be unassigned.`
            : 'This department has no roles attached.'}
          onConfirm={() => handleDelete(confirmRow.id)}
          onClose={() => setConfirmRow(null)}
        />
      )}

      {dialogOpen && (
        <DeptDialog
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setDialogOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <Suspense>
      <DepartmentsContent />
    </Suspense>
  );
}
