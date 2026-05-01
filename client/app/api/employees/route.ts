import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT
         e.id,
         e.first_name,
         e.last_name,
         e.role_id,
         e.manager_id,
         r.title        AS role_title,
         CASE
           WHEN m.id IS NOT NULL
           THEN CONCAT(m.first_name, ' ', m.last_name)
           ELSE NULL
         END            AS manager_name
       FROM employees e
       LEFT JOIN roles     r ON e.role_id    = r.id
       LEFT JOIN employees m ON e.manager_id = m.id
       ORDER BY e.id`
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, role_id, manager_id } = await request.json();
    const [result] = await pool.query(
      'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
      [first_name, last_name, role_id ?? null, manager_id ?? null]
    );
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
