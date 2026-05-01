'use client';

import { useState } from 'react';
import type { Role, Department } from '@/lib/types';

interface Props {
  initialData?: Role | null;
  departments: Department[];
  onSubmit: (data: Omit<Role, 'id' | 'department_name'>) => Promise<void>;
  onClose: () => void;
}

export default function RoleForm({ initialData, departments, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [salary, setSalary] = useState(initialData?.salary ? String(initialData.salary) : '');
  const [deptId, setDeptId] = useState(initialData?.department_id ? String(initialData.department_id) : '');
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || salary === '' || deptId === '') return;
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), salary: Number(salary), department_id: Number(deptId) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form id="role-form" onSubmit={handleSubmit} className="dialog-body">
        <div className="field">
          <label htmlFor="role-title">Title</label>
          <input id="role-title" autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Senior Engineer" required />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="role-salary">Annual salary</label>
            <input id="role-salary" type="number" min="0" step="1000" value={salary} onChange={e => setSalary(e.target.value)} placeholder="80000" required />
          </div>
          <div className="field">
            <label htmlFor="role-dept">Department</label>
            <select id="role-dept" value={deptId} onChange={e => setDeptId(e.target.value)} required>
              <option value="">— Select —</option>
              {departments.map(d => <option key={d.id} value={d.id} style={{ textTransform: 'capitalize' }}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </form>
      <div className="dialog-footer">
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        <button type="submit" form="role-form" className="btn btn-primary" disabled={loading || !deptId}>
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create role'}
        </button>
      </div>
    </>
  );
}
