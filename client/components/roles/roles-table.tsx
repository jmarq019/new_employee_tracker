'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteRoleButton from './delete-role-button';
import type { Role } from '@/lib/types';

interface Props {
  data: Role[];
  selected: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onDelete: (id: number) => Promise<void>;
}

export default function RolesTable({ data, selected, onToggleSelect, onToggleSelectAll, onDelete }: Props) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No roles yet.</p>;
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
          <TableHead>Title</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead>Department</TableHead>
          <TableHead className="w-20 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((role) => (
          <TableRow key={role.id} data-state={selected.has(role.id) ? 'selected' : undefined}>
            <TableCell>
              <Checkbox
                checked={selected.has(role.id)}
                onChange={() => onToggleSelect(role.id)}
              />
            </TableCell>
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
