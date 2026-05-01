'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DeleteEmployeeButton from './delete-employee-button';
import type { Employee } from '@/lib/types';

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-yellow-100 text-yellow-700',
  'bg-rose-100 text-rose-700',
];

function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

interface Props {
  data: Employee[];
  selected: Set<number>;
  onToggleSelect: (id: number) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function EmployeesCards({ data, selected, onToggleSelect, onEdit, onDelete }: Props) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No employees yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((emp) => {
        const initials = `${emp.first_name[0] ?? ''}${emp.last_name[0] ?? ''}`.toUpperCase();
        const color = avatarColor(emp.first_name + emp.last_name);
        const isSelected = selected.has(emp.id);

        return (
          <div
            key={emp.id}
            className={`relative rounded-lg border bg-card p-4 transition-colors ${
              isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40'
            }`}
          >
            {/* Checkbox */}
            <div className="absolute left-3 top-3">
              <Checkbox checked={isSelected} onChange={() => onToggleSelect(emp.id)} />
            </div>

            {/* Avatar */}
            <div className="mb-3 flex justify-center pt-2">
              <span className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ${color}`}>
                {initials}
              </span>
            </div>

            {/* Info */}
            <div className="text-center">
              <p className="font-semibold text-foreground">
                {emp.first_name} {emp.last_name}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{emp.role_title ?? 'No role'}</p>
              {emp.manager_name && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Reports to {emp.manager_name}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-3 flex justify-center gap-1 border-t border-border pt-3">
              <Button variant="ghost" size="sm" onClick={() => onEdit(emp)} className="h-8 px-3 text-xs">
                <Pencil className="mr-1.5 h-3 w-3" />
                Edit
              </Button>
              <DeleteEmployeeButton
                employeeName={`${emp.first_name} ${emp.last_name}`}
                onConfirm={() => onDelete(emp.id)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
