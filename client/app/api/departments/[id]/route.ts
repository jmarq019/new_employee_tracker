import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();
    const [result] = await pool.query(
      'UPDATE departments SET name=? WHERE id=?',
      [name, params.id]
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [result] = await pool.query('DELETE FROM departments WHERE id=?', [params.id]);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json(
        { error: 'Cannot delete: this department has roles assigned to it.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
