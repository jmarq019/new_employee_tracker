'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteRoleButton from './delete-role-button';
import type { Role } from '@/lib/types';

interface Props {
  data: Role[];
  onDelete: (id: number) => Promise<void>;
}

export default function RolesTable({ data, onDelete }: Props) {
  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No roles yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead>Department</TableHead>
          <TableHead className="w-20 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="text-muted-foreground">{role.id}</TableCell>
            <TableCell className="font-medium">{role.title}</TableCell>
            <TableCell>
              {role.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </TableCell>
            <TableCell>{role.department_name ?? '—'}</TableCell>
            <TableCell className="text-right">
              <DeleteRoleButton roleTitle={role.title} onConfirm={() => onDelete(role.id)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
