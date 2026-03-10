import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, parseBody } from '@/lib/api-utils';
import { success, notFound, forbidden, serverError } from '@/lib/api-response';
import { wishlistItemUpdateSchema } from '@/lib/validations/wishlist';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { id } = await context.params;

    const item = await db.wishlistItem.findUnique({ where: { id } });
    if (!item) return notFound('Wishlist item');
    if (item.userId !== userId) return forbidden();

    const parsed = await parseBody(req, wishlistItemUpdateSchema);
    if ('error' in parsed) return parsed.error;
    const { data } = parsed;

    const updated = await db.wishlistItem.update({
      where: { id },
      data: {
        targetPrice: data.targetPrice,
        notifyOnSale: data.notifyOnSale,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            slug: true,
          },
        },
      },
    });

    return success(updated);
  } catch (err) {
    console.error('Wishlist update error:', err);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { id } = await context.params;

    const item = await db.wishlistItem.findUnique({ where: { id } });
    if (!item) return notFound('Wishlist item');
    if (item.userId !== userId) return forbidden();

    await db.wishlistItem.delete({ where: { id } });

    return success({ deleted: id });
  } catch (err) {
    console.error('Wishlist delete error:', err);
    return serverError();
  }
}
