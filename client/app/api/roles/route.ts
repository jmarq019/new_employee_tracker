import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.title, r.salary, r.department_id, d.name AS department_name
       FROM roles r
       LEFT JOIN departments d ON r.department_id = d.id
       ORDER BY r.id`
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, salary, department_id } = await request.json();
    const [result] = await pool.query(
      'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
      [title, salary, department_id]
    );
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
