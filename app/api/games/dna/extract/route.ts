import { auth } from '@/lib/auth';
import { extractAllGameDna } from '@/lib/game-dna';
import { success, unauthorized, serverError } from '@/lib/api-response';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const result = await extractAllGameDna();
    return success(result);
  } catch (err) {
    console.error('Batch DNA extraction error:', err);
    return serverError();
  }
}
