import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [result] = await pool.query('DELETE FROM roles WHERE id=?', [params.id]);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json(
        { error: 'Cannot delete: this role is assigned to one or more employees.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
