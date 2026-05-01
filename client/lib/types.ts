export interface Department {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  title: string;
  salary: number;
  department_id: number;
  department_name?: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  role_id: number | null;
  manager_id: number | null;
  role_title?: string;
  manager_name?: string;
}
