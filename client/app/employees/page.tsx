'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmployeesTable from '@/components/employees/employees-table';
import EmployeeForm from '@/components/employees/employee-form';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '@/lib/api';
import type { Employee } from '@/lib/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEmployees(await getEmployees());
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (emp: Employee) => { setEditTarget(emp); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null); };

  const handleSubmit = async (data: Omit<Employee, 'id' | 'role_title' | 'manager_name'>) => {
    if (editTarget) {
      await updateEmployee(editTarget.id, data);
      toast.success('Employee updated');
    } else {
      await createEmployee(data);
      toast.success('Employee created');
    }
    closeDialog();
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteEmployee(id);
    toast.success('Employee deleted');
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <EmployeesTable data={employees} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            initialData={editTarget}
            currentEmployeeId={editTarget?.id}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
