import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { success, serverError } from '@/lib/api-response';
import { parseBody } from '@/lib/api-utils';
import { trackClick } from '@/lib/affiliate';
import { Storefront } from '@prisma/client';

const clickSchema = z.object({
  affiliateLinkId: z.string().min(1),
  gameId: z.string().min(1),
  storefront: z.nativeEnum(Storefront),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, clickSchema);
    if ('error' in parsed) return parsed.error;

    const { affiliateLinkId, gameId, storefront } = parsed.data;

    // Optional auth - track userId if logged in
    let userId: string | null = null;
    try {
      const session = await auth();
      userId = session?.user?.id || null;
    } catch {
      // Anonymous click is fine
    }

    await trackClick(affiliateLinkId, userId, storefront, gameId);

    return success({ tracked: true });
  } catch (err) {
    console.error('Affiliate click error:', err);
    return serverError();
  }
}
