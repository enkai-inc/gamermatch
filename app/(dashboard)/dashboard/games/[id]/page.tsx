import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameDnaCard } from '@/components/game/game-dna-card';
import { PriceComparison } from '@/components/game/price-comparison';

interface GameDna {
  mechanicsVector: number[];
  themesVector: number[];
  pacingScore: number;
  complexityScore: number;
  socialScore: number;
  aestheticTags: string[];
  emotionalTone?: string[];
  moodTags?: string[];
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const game = await db.game.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      platforms: { include: { platform: true } },
      themes: { include: { theme: true } },
      mechanics: { include: { mechanic: true } },
      gameDna: true,
    },
  });

  if (!game) {
    notFound();
  }

  const gameDna = game.gameDna
    ? {
        mechanicsVector: game.gameDna.mechanicsVector as number[],
        themesVector: game.gameDna.themesVector as number[],
        pacingScore: game.gameDna.pacingScore,
        complexityScore: game.gameDna.complexityScore,
        socialScore: game.gameDna.socialScore,
        aestheticTags: game.gameDna.aestheticTags as string[],
        emotionalTone: (game.gameDna.emotionalTone as string[] | null) ?? undefined,
        moodTags: (game.gameDna.moodTags as string[] | null) ?? undefined,
      }
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Back button */}
      <Link
        href="/dashboard/discover"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Link>

      {/* Hero section */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Cover image */}
        <div className="shrink-0">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.title}
              className="w-full rounded-xl md:w-64 aspect-[3/4] object-cover"
            />
          ) : (
            <div className="flex w-full md:w-64 aspect-[3/4] items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-700">
              <span className="text-6xl text-slate-600">{game.title.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-slate-50">{game.title}</h1>

          <div className="flex flex-wrap gap-2 text-sm text-slate-400">
            {game.developer && <span>By {game.developer}</span>}
            {game.developer && game.publisher && <span className="text-slate-600">|</span>}
            {game.publisher && <span>{game.publisher}</span>}
            {game.releaseDate && (
              <>
                <span className="text-slate-600">|</span>
                <span>{new Date(game.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </>
            )}
          </div>

          {/* Genre badges */}
          {game.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {game.genres.map((g) => (
                <Badge key={g.genre.name} variant="secondary">{g.genre.name}</Badge>
              ))}
            </div>
          )}

          {/* Platform badges */}
          {game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {game.platforms.map((p) => (
                <Badge key={p.platform.name} variant="outline">{p.platform.name}</Badge>
              ))}
            </div>
          )}

          {/* Theme badges */}
          {game.themes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {game.themes.map((t) => (
                <Badge key={t.theme.name} variant="outline" className="border-violet-700/50 text-violet-300">{t.theme.name}</Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {(game.description || game.summary) && (
            <p className="text-sm leading-relaxed text-slate-300">
              {game.description || game.summary}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <form action={`/api/journal`} method="POST">
              <input type="hidden" name="gameId" value={game.id} />
              <Button type="button" variant="default">Add to Journal</Button>
            </form>
            <form action={`/api/wishlist`} method="POST">
              <input type="hidden" name="gameId" value={game.id} />
              <Button type="button" variant="outline">Add to Wishlist</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Price comparison */}
      <PriceComparison gameId={game.id} />

      {/* Game DNA */}
      {gameDna && <GameDnaCard dna={gameDna} />}
    </div>
  );
}
