import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, parseBody, parseSearchParams } from '@/lib/api-utils';
import { success, paginated, conflict, serverError } from '@/lib/api-response';
import { wishlistItemSchema } from '@/lib/validations/wishlist';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { page, limit, sort, order } = parseSearchParams(req);

    const sortField =
      sort && ['createdAt', 'targetPrice'].includes(sort) ? sort : 'createdAt';

    const orderByClause =
      sort === 'title'
        ? { game: { title: order } }
        : { [sortField]: order };

    const [items, total] = await Promise.all([
      db.wishlistItem.findMany({
        where: { userId },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              slug: true,
              genres: {
                include: { genre: true },
              },
              affiliateLinks: {
                select: {
                  storefront: true,
                  url: true,
                  currentPrice: true,
                  currency: true,
                  onSale: true,
                  salePrice: true,
                },
              },
            },
          },
        },
        orderBy: orderByClause,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.wishlistItem.count({ where: { userId } }),
    ]);

    return paginated(items, { page, limit, total });
  } catch (err) {
    console.error('Wishlist list error:', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const parsed = await parseBody(req, wishlistItemSchema);
    if ('error' in parsed) return parsed.error;
    const { data } = parsed;

    const existing = await db.wishlistItem.findUnique({
      where: { userId_gameId: { userId, gameId: data.gameId } },
    });

    if (existing) {
      return conflict('This game is already on your wishlist');
    }

    const item = await db.wishlistItem.create({
      data: {
        userId,
        gameId: data.gameId,
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

    return success(item, 201);
  } catch (err) {
    console.error('Wishlist create error:', err);
    return serverError();
  }
}
