'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteDepartmentButton from './delete-department-button';
import type { Department } from '@/lib/types';

interface Props {
  data: Department[];
  onEdit: (dept: Department) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function DepartmentsTable({ data, onEdit, onDelete }: Props) {
  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No departments yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((dept) => (
          <TableRow key={dept.id}>
            <TableCell className="text-muted-foreground">{dept.id}</TableCell>
            <TableCell className="font-medium">{dept.name}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(dept)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <DeleteDepartmentButton
                departmentName={dept.name}
                onConfirm={() => onDelete(dept.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
