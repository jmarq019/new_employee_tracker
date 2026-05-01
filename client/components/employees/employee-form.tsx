'use client';

import { useState } from 'react';
import type { Employee, Role, Department } from '@/lib/types';

interface Props {
  initialData?: Employee | null;
  currentEmployeeId?: number;
  employees: Employee[];
  roles: Role[];
  departments: Department[];
  onSubmit: (data: Omit<Employee, 'id' | 'role_title' | 'manager_name'>) => Promise<void>;
  onClose: () => void;
}

export default function EmployeeForm({ initialData, currentEmployeeId, employees, roles, departments, onSubmit, onClose }: Props) {
  const [first, setFirst] = useState(initialData?.first_name ?? '');
  const [last, setLast] = useState(initialData?.last_name ?? '');
  const [roleId, setRoleId] = useState(initialData?.role_id ? String(initialData.role_id) : '');
  const [managerId, setManagerId] = useState(initialData?.manager_id ? String(initialData.manager_id) : '');
  const [loading, setLoading] = useState(false);

  const validManagers = employees.filter(e => e.id !== currentEmployeeId);
  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!first.trim() || !last.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        first_name: first.trim(),
        last_name:  last.trim(),
        role_id:    roleId    === '' ? null : Number(roleId),
        manager_id: managerId === '' ? null : Number(managerId),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form id="emp-form" onSubmit={handleSubmit} className="dialog-body">
        <div className="field-row">
          <div className="field">
            <label htmlFor="emp-first">First name</label>
            <input id="emp-first" autoFocus value={first} onChange={e => setFirst(e.target.value)} placeholder="Jane" required />
          </div>
          <div className="field">
            <label htmlFor="emp-last">Last name</label>
            <input id="emp-last" value={last} onChange={e => setLast(e.target.value)} placeholder="Doe" required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="emp-role">Role</label>
          <select id="emp-role" value={roleId} onChange={e => setRoleId(e.target.value)}>
            <option value="">— Select a role —</option>
            {roles.map(r => {
              const dept = departments.find(d => d.id === r.department_id);
              return <option key={r.id} value={r.id}>{r.title} · {dept?.name ?? ''}</option>;
            })}
          </select>
          <div className="field-hint">Determines title and department.</div>
        </div>
        <div className="field">
          <label htmlFor="emp-mgr">Manager</label>
          <select id="emp-mgr" value={managerId} onChange={e => setManagerId(e.target.value)}>
            <option value="">No manager</option>
            {validManagers.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
            ))}
          </select>
          <div className="field-hint">Leave blank if this person reports to nobody.</div>
        </div>
      </form>
      <div className="dialog-footer">
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        <button type="submit" form="emp-form" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create employee'}
        </button>
      </div>
    </>
  );
}
