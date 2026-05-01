'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import OrgChart from '@/components/org-chart';
import { getEmployees, getRoles, getDepartments } from '@/lib/api';
import type { Employee, Role, Department } from '@/lib/types';

export default function OrgPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, r, d] = await Promise.all([getEmployees(), getRoles(), getDepartments()]);
      setEmployees(e); setRoles(r); setDepartments(d);
    } catch {
      toast.error('Failed to load org chart data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const topLevel = employees.filter(e => e.manager_id == null).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Org chart</h1>
          <p className="page-subtitle">Reporting lines across your entire team.</p>
        </div>
        {!loading && (
          <div className="page-counts">
            <span>{employees.length} people</span>
            <span className="dot" />
            <span>{topLevel} top-level</span>
            <span className="dot" />
            <span>{departments.length} departments</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="org-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                height: 60,
                background: 'var(--bg-sunken)',
                borderRadius: 'var(--radius-md)',
                marginLeft: `${(i % 3) * 48}px`,
                animation: 'shimmer 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        </div>
      ) : (
        <OrgChart employees={employees} roles={roles} departments={departments} />
      )}
    </div>
  );
}
