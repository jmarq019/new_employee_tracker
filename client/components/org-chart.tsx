'use client';

import { useTheme } from '@/lib/theme-context';
import { avatarColor, deptColor } from '@/lib/design';
import type { Employee, Role, Department } from '@/lib/types';

interface Props {
  employees: Employee[];
  roles: Role[];
  departments: Department[];
}

interface EmployeeNode extends Employee {
  children: EmployeeNode[];
}

function buildTree(employees: Employee[]): EmployeeNode[] {
  const map: Record<number, EmployeeNode> = {};
  employees.forEach(e => { map[e.id] = { ...e, children: [] }; });
  const roots: EmployeeNode[] = [];
  Object.values(map).forEach(node => {
    if (node.manager_id == null || !map[node.manager_id]) {
      roots.push(node);
    } else {
      map[node.manager_id].children.push(node);
    }
  });
  return roots;
}

function OrgNode({
  node,
  roles,
  departments,
  dark,
}: {
  node: EmployeeNode;
  roles: Role[];
  departments: Department[];
  dark: boolean;
}) {
  const role = roles.find(r => r.id === node.role_id);
  const dept = role ? departments.find(d => d.id === role.department_id) : null;
  const name = `${node.first_name} ${node.last_name}`;
  const [fg, bg] = avatarColor(node.id);
  const deptC = dept ? deptColor(dept.id, dark) : null;
  const hasChildren = node.children.length > 0;

  return (
    <div className={`org-node${hasChildren ? ' has-children' : ''}`}>
      <div className="org-card">
        <div
          className="avatar"
          style={{ background: bg, color: fg, width: 32, height: 32, fontSize: 11.5 }}
        >
          {name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="org-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
            {name}
          </div>
          <div className="org-role">{role?.title ?? '—'}</div>
          {dept && deptC && (
            <span
              className="dept-pill"
              style={{ background: deptC.bg, color: deptC.fg, textTransform: 'capitalize' }}
            >
              {dept.name}
            </span>
          )}
        </div>
      </div>
      {hasChildren && (
        <div className="org-children">
          {node.children.map(child => (
            <OrgNode key={child.id} node={child} roles={roles} departments={departments} dark={dark} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart({ employees, roles, departments }: Props) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const roots = buildTree(employees);

  if (roots.length === 0) {
    return (
      <div className="org-empty">
        No people to map yet. Add some employees to see your org chart.
      </div>
    );
  }

  return (
    <div className="org-wrap">
      <div className="org-tree">
        <div className="org-row" style={{ gap: 32 }}>
          {roots.map(node => (
            <OrgNode key={node.id} node={node} roles={roles} departments={departments} dark={dark} />
          ))}
        </div>
      </div>
    </div>
  );
}
