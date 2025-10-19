import { NextResponse } from 'next/server';
import { fetchPublishedEvents } from '@/lib/supabaseService';

export async function GET() {
  const res = await fetchPublishedEvents();
  if (!res.success) return NextResponse.json({ success: false, data: null, error: res.error }, { status: 500 });
  return NextResponse.json({ success: true, data: res.data });
}
