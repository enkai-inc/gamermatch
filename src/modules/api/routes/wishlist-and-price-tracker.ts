import { NextRequest, NextResponse } from 'next/server';

// Wishlist and Price Tracker: Save games to wishlist with automatic price drop notifications across storefronts

export async function GET() {
  // TODO: Fetch Wishlist and Price Tracker records
  return NextResponse.json({ data: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: Validate and create Wishlist and Price Tracker
  return NextResponse.json({ data: body }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  // TODO: Validate and update Wishlist and Price Tracker
  return NextResponse.json({ data: body });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  // TODO: Delete Wishlist and Price Tracker by id
  return NextResponse.json({ deleted: id });
}
