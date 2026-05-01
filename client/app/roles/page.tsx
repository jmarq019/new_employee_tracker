'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RolesTable from '@/components/roles/roles-table';
import RoleForm from '@/components/roles/role-form';
import { getRoles, createRole, deleteRole } from '@/lib/api';
import type { Role } from '@/lib/types';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRoles(await getRoles());
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (data: Omit<Role, 'id' | 'department_name'>) => {
    await createRole(data);
    toast.success('Role created');
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteRole(id);
    toast.success('Role deleted');
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <RolesTable data={roles} onDelete={handleDelete} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
          </DialogHeader>
          <RoleForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
