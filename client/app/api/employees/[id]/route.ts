import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { first_name, last_name, role_id, manager_id } = await request.json();
    const [result] = await pool.query(
      'UPDATE employees SET first_name=?, last_name=?, role_id=?, manager_id=? WHERE id=?',
      [first_name, last_name, role_id ?? null, manager_id ?? null, params.id]
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [result] = await pool.query('DELETE FROM employees WHERE id=?', [params.id]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
