'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import DepartmentsTable from '@/components/departments/departments-table';
import DepartmentForm from '@/components/departments/department-form';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/lib/api';
import type { Department } from '@/lib/types';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDepartments(await getDepartments());
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (dept: Department) => { setEditTarget(dept); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null); };

  const handleSubmit = async (data: Omit<Department, 'id'>) => {
    if (editTarget) {
      await updateDepartment(editTarget.id, data);
      toast.success('Department updated');
    } else {
      await createDepartment(data);
      toast.success('Department created');
    }
    closeDialog();
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteDepartment(id);
    toast.success('Department deleted');
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DepartmentsTable data={departments} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <DepartmentForm initialData={editTarget} onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
