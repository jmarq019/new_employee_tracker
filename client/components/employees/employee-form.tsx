'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRoles, getEmployees } from '@/lib/api';
import type { Employee, Role } from '@/lib/types';

interface Props {
  initialData?: Employee | null;
  currentEmployeeId?: number;
  onSubmit: (data: Omit<Employee, 'id' | 'role_title' | 'manager_name'>) => Promise<void>;
}

export default function EmployeeForm({ initialData, currentEmployeeId, onSubmit }: Props) {
  const [firstName, setFirstName] = useState(initialData?.first_name ?? '');
  const [lastName, setLastName] = useState(initialData?.last_name ?? '');
  const [roleId, setRoleId] = useState(initialData?.role_id ? String(initialData.role_id) : '');
  const [managerId, setManagerId] = useState(initialData?.manager_id ? String(initialData.manager_id) : 'none');
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getRoles(), getEmployees()])
      .then(([r, e]) => {
        setRoles(r);
        setEmployees(e.filter((emp) => emp.id !== currentEmployeeId));
      })
      .catch(() => {});
  }, [currentEmployeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        first_name: firstName,
        last_name: lastName,
        role_id: roleId ? Number(roleId) : null,
        manager_id: managerId === 'none' ? null : Number(managerId),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emp-first">First Name</Label>
          <Input
            id="emp-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-last">Last Name</Label>
          <Input
            id="emp-last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Manager</Label>
        <Select value={managerId} onValueChange={setManagerId}>
          <SelectTrigger>
            <SelectValue placeholder="No manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No manager</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={String(emp.id)}>
                {emp.first_name} {emp.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Employee'}
      </Button>
    </form>
  );
}
