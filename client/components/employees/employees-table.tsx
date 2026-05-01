'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteEmployeeButton from './delete-employee-button';
import type { Employee } from '@/lib/types';

interface Props {
  data: Employee[];
  selected: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onEdit: (emp: Employee) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function EmployeesTable({ data, selected, onToggleSelect, onToggleSelectAll, onEdit, onDelete }: Props) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No employees yet.</p>;
  }

  const allSelected = data.length > 0 && selected.size === data.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              onChange={onToggleSelectAll}
            />
          </TableHead>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Manager</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((emp) => (
          <TableRow key={emp.id} data-state={selected.has(emp.id) ? 'selected' : undefined}>
            <TableCell>
              <Checkbox
                checked={selected.has(emp.id)}
                onChange={() => onToggleSelect(emp.id)}
              />
            </TableCell>
            <TableCell className="text-muted-foreground">{emp.id}</TableCell>
            <TableCell className="font-medium">
              {emp.first_name} {emp.last_name}
            </TableCell>
            <TableCell>{emp.role_title ?? '—'}</TableCell>
            <TableCell>{emp.manager_name ?? '—'}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(emp)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <DeleteEmployeeButton
                employeeName={`${emp.first_name} ${emp.last_name}`}
                onConfirm={() => onDelete(emp.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
