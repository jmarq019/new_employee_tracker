import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM departments ORDER BY id');
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const [result] = await pool.query('INSERT INTO departments (name) VALUES (?)', [name]);
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
