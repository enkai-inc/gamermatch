import { NextRequest, NextResponse } from 'next/server';

// Affiliate Storefront: Purchase links across Steam, PlayStation, Xbox, Nintendo, Epic Games with price comparison and sale alerts

export async function GET() {
  // TODO: Fetch Affiliate Storefront records
  return NextResponse.json({ data: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: Validate and create Affiliate Storefront
  return NextResponse.json({ data: body }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  // TODO: Validate and update Affiliate Storefront
  return NextResponse.json({ data: body });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  // TODO: Delete Affiliate Storefront by id
  return NextResponse.json({ deleted: id });
}
