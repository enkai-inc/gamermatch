import { NextRequest, NextResponse } from 'next/server';

// Play Journal: Log games with ratings and notes to refine recommendations and build gaming history

export async function GET() {
  // TODO: Fetch Play Journal records
  return NextResponse.json({ data: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: Validate and create Play Journal
  return NextResponse.json({ data: body }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  // TODO: Validate and update Play Journal
  return NextResponse.json({ data: body });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  // TODO: Delete Play Journal by id
  return NextResponse.json({ deleted: id });
}
