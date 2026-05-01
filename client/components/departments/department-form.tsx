'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Department } from '@/lib/types';

interface Props {
  initialData?: Department | null;
  onSubmit: (data: Omit<Department, 'id'>) => Promise<void>;
}

export default function DepartmentForm({ initialData, onSubmit }: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dept-name">Name</Label>
        <Input
          id="dept-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Engineering"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Department'}
      </Button>
    </form>
  );
}
