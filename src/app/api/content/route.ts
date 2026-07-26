import { NextResponse } from 'next/server';
import content from '../../../../config/content.json';

export async function GET() {
  return NextResponse.json(content);
}
