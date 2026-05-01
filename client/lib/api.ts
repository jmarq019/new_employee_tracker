import type { Department, Role, Employee } from './types';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const json = (body: unknown) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// Departments
export const getDepartments = () => apiFetch<Department[]>('/api/departments');
export const createDepartment = (data: Omit<Department, 'id'>) =>
  apiFetch('/api/departments', { method: 'POST', ...json(data) });
export const updateDepartment = (id: number, data: Omit<Department, 'id'>) =>
  apiFetch(`/api/departments/${id}`, { method: 'PUT', ...json(data) });
export const deleteDepartment = (id: number) =>
  apiFetch(`/api/departments/${id}`, { method: 'DELETE' });

// Roles
export const getRoles = () => apiFetch<Role[]>('/api/roles');
export const createRole = (data: Omit<Role, 'id' | 'department_name'>) =>
  apiFetch('/api/roles', { method: 'POST', ...json(data) });
export const deleteRole = (id: number) =>
  apiFetch(`/api/roles/${id}`, { method: 'DELETE' });

// Employees
export const getEmployees = () => apiFetch<Employee[]>('/api/employees');
export const createEmployee = (data: Omit<Employee, 'id' | 'role_title' | 'manager_name'>) =>
  apiFetch('/api/employees', { method: 'POST', ...json(data) });
export const updateEmployee = (id: number, data: Partial<Omit<Employee, 'id' | 'role_title' | 'manager_name'>>) =>
  apiFetch(`/api/employees/${id}`, { method: 'PUT', ...json(data) });
export const deleteEmployee = (id: number) =>
  apiFetch(`/api/employees/${id}`, { method: 'DELETE' });
