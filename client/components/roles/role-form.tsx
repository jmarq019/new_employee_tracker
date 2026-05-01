'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDepartments } from '@/lib/api';
import type { Department, Role } from '@/lib/types';

interface Props {
  onSubmit: (data: Omit<Role, 'id' | 'department_name'>) => Promise<void>;
}

export default function RoleForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, salary: Number(salary), department_id: Number(departmentId) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role-title">Title</Label>
        <Input
          id="role-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Engineer"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role-salary">Salary</Label>
        <Input
          id="role-salary"
          type="number"
          min="0"
          step="1"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="e.g. 80000"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Department</Label>
        <Select value={departmentId} onValueChange={setDepartmentId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading || !departmentId}>
        {loading ? 'Saving…' : 'Create Role'}
      </Button>
    </form>
  );
}
