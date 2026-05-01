'use client';

import { useState } from 'react';
import type { Department } from '@/lib/types';

interface Props {
  initialData?: Department | null;
  onSubmit: (data: Omit<Department, 'id'>) => Promise<void>;
  onClose: () => void;
}

export default function DepartmentForm({ initialData, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form id="dept-form" onSubmit={handleSubmit} className="dialog-body">
        <div className="field">
          <label htmlFor="dept-name">Department name</label>
          <input
            id="dept-name"
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="People Operations"
            required
          />
        </div>
      </form>
      <div className="dialog-footer">
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        <button type="submit" form="dept-form" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create department'}
        </button>
      </div>
    </>
  );
}
