import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding database...');

  // --- Genres ---
  const genreNames = [
    'RPG', 'FPS', 'Strategy', 'Puzzle', 'Platformer',
    'Horror', 'Racing', 'Simulation', 'Adventure', 'Fighting',
    'MOBA', 'Roguelike', 'Sandbox', 'Visual Novel', 'Battle Royale',
  ];
  const genres: Record<string, string> = {};
  for (const name of genreNames) {
    const genre = await prisma.genre.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    genres[name] = genre.id;
  }
  console.log(`Seeded ${genreNames.length} genres.`);

  // --- Platforms ---
  const platformNames = [
    'PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Mobile', 'VR',
  ];
  const platforms: Record<string, string> = {};
  for (const name of platformNames) {
    const platform = await prisma.platform.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    platforms[name] = platform.id;
  }
  console.log(`Seeded ${platformNames.length} platforms.`);

  // --- Mechanics ---
  const mechanicNames = [
    'Open World', 'Turn-Based Combat', 'Real-Time Combat', 'Crafting',
    'Base Building', 'Stealth', 'Puzzle Solving', 'Deck Building',
    'Resource Management', 'Exploration', 'Narrative Choice', 'Co-op',
    'Competitive Multiplayer',
  ];
  const mechanics: Record<string, string> = {};
  for (const name of mechanicNames) {
    const mechanic = await prisma.mechanic.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    mechanics[name] = mechanic.id;
  }
  console.log(`Seeded ${mechanicNames.length} mechanics.`);

  // --- Themes ---
  const themeNames = [
    'Fantasy', 'Sci-Fi', 'Horror', 'Post-Apocalyptic', 'Historical',
    'Cyberpunk', 'Mythology', 'Slice of Life', 'Military', 'Space',
    'Nature', 'Urban',
  ];
  const themes: Record<string, string> = {};
  for (const name of themeNames) {
    const theme = await prisma.theme.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    themes[name] = theme.id;
  }
  console.log(`Seeded ${themeNames.length} themes.`);

  // --- Games ---
  const gameData = [
    {
      title: 'Elden Ring',
      slug: 'elden-ring',
      description: 'An action RPG set in a vast open world created by Hidetaka Miyazaki and George R.R. Martin.',
      developer: 'FromSoftware',
      publisher: 'Bandai Namco',
      releaseDate: new Date('2022-02-25'),
      metacriticScore: 96,
      genres: ['RPG', 'Adventure'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
      mechanics: ['Open World', 'Real-Time Combat', 'Exploration', 'Co-op'],
      themes: ['Fantasy', 'Mythology'],
    },
    {
      title: "Baldur's Gate 3",
      slug: 'baldurs-gate-3',
      description: 'A story-rich, party-based RPG set in the universe of Dungeons & Dragons.',
      developer: 'Larian Studios',
      publisher: 'Larian Studios',
      releaseDate: new Date('2023-08-03'),
      metacriticScore: 96,
      genres: ['RPG', 'Strategy'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
      mechanics: ['Turn-Based Combat', 'Narrative Choice', 'Co-op', 'Exploration'],
      themes: ['Fantasy'],
    },
    {
      title: 'Hades',
      slug: 'hades',
      description: 'A rogue-like dungeon crawler where you defy the god of the dead as you hack your way out of the Underworld.',
      developer: 'Supergiant Games',
      publisher: 'Supergiant Games',
      releaseDate: new Date('2020-09-17'),
      metacriticScore: 93,
      genres: ['Roguelike', 'RPG'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
      mechanics: ['Real-Time Combat', 'Narrative Choice'],
      themes: ['Mythology'],
    },
    {
      title: 'Stardew Valley',
      slug: 'stardew-valley',
      description: 'An open-ended country-life RPG where you can grow crops, raise animals, and build a farm.',
      developer: 'ConcernedApe',
      publisher: 'ConcernedApe',
      releaseDate: new Date('2016-02-26'),
      metacriticScore: 89,
      genres: ['Simulation', 'RPG'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Mobile'],
      mechanics: ['Crafting', 'Resource Management', 'Exploration', 'Co-op'],
      themes: ['Slice of Life', 'Nature'],
    },
    {
      title: 'The Witcher 3',
      slug: 'the-witcher-3',
      description: 'An open world action RPG set in a visually stunning fantasy universe full of meaningful choices.',
      developer: 'CD Projekt Red',
      publisher: 'CD Projekt',
      releaseDate: new Date('2015-05-19'),
      metacriticScore: 93,
      genres: ['RPG', 'Adventure'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
      mechanics: ['Open World', 'Real-Time Combat', 'Narrative Choice', 'Exploration'],
      themes: ['Fantasy'],
    },
    {
      title: 'Hollow Knight',
      slug: 'hollow-knight',
      description: 'A challenging 2D action-adventure through a vast ruined kingdom of insects and heroes.',
      developer: 'Team Cherry',
      publisher: 'Team Cherry',
      releaseDate: new Date('2017-02-24'),
      metacriticScore: 90,
      genres: ['Platformer', 'Adventure'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
      mechanics: ['Real-Time Combat', 'Exploration'],
      themes: ['Fantasy'],
    },
    {
      title: 'Celeste',
      slug: 'celeste',
      description: 'A narrative-driven platformer about climbing a mountain, facing your inner demons.',
      developer: 'Maddy Makes Games',
      publisher: 'Maddy Makes Games',
      releaseDate: new Date('2018-01-25'),
      metacriticScore: 92,
      genres: ['Platformer'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
      mechanics: ['Puzzle Solving'],
      themes: ['Nature'],
    },
    {
      title: 'Disco Elysium',
      slug: 'disco-elysium',
      description: 'A groundbreaking open-world role playing game where you are a detective with a unique skill system.',
      developer: 'ZA/UM',
      publisher: 'ZA/UM',
      releaseDate: new Date('2019-10-15'),
      metacriticScore: 91,
      genres: ['RPG', 'Adventure'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
      mechanics: ['Narrative Choice', 'Exploration'],
      themes: ['Urban'],
    },
    {
      title: 'Slay the Spire',
      slug: 'slay-the-spire',
      description: 'A deck-building roguelike where you craft a unique deck, encounter bizarre creatures, and ascend the Spire.',
      developer: 'Mega Crit Games',
      publisher: 'Mega Crit Games',
      releaseDate: new Date('2019-01-23'),
      metacriticScore: 89,
      genres: ['Roguelike', 'Strategy'],
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Mobile'],
      mechanics: ['Deck Building', 'Resource Management'],
      themes: ['Fantasy'],
    },
    {
      title: 'Factorio',
      slug: 'factorio',
      description: 'A construction and management simulation game focused on building and maintaining factories.',
      developer: 'Wube Software',
      publisher: 'Wube Software',
      releaseDate: new Date('2020-08-14'),
      metacriticScore: 90,
      genres: ['Strategy', 'Simulation'],
      platforms: ['PC'],
      mechanics: ['Base Building', 'Resource Management', 'Crafting'],
      themes: ['Sci-Fi'],
    },
  ];

  for (const data of gameData) {
    const game = await prisma.game.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        developer: data.developer,
        publisher: data.publisher,
        releaseDate: data.releaseDate,
        metacriticScore: data.metacriticScore,
      },
    });

    // Connect genres
    for (const genreName of data.genres) {
      const genreId = genres[genreName];
      await prisma.gameGenre.upsert({
        where: { gameId_genreId: { gameId: game.id, genreId } },
        update: {},
        create: { gameId: game.id, genreId },
      });
    }

    // Connect platforms
    for (const platformName of data.platforms) {
      const platformId = platforms[platformName];
      await prisma.gamePlatform.upsert({
        where: { gameId_platformId: { gameId: game.id, platformId } },
        update: {},
        create: { gameId: game.id, platformId },
      });
    }

    // Connect mechanics
    for (const mechanicName of data.mechanics) {
      const mechanicId = mechanics[mechanicName];
      await prisma.gameMechanic.upsert({
        where: { gameId_mechanicId: { gameId: game.id, mechanicId } },
        update: {},
        create: { gameId: game.id, mechanicId },
      });
    }

    // Connect themes
    for (const themeName of data.themes) {
      const themeId = themes[themeName];
      await prisma.gameTheme.upsert({
        where: { gameId_themeId: { gameId: game.id, themeId } },
        update: {},
        create: { gameId: game.id, themeId },
      });
    }
  }
  console.log(`Seeded ${gameData.length} games with relations.`);

  // --- Admin User ---
  const passwordHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@gamermatch.ai' },
    update: {},
    create: {
      email: 'admin@gamermatch.ai',
      name: 'Admin',
      passwordHash,
    },
  });
  console.log('Seeded admin user.');

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
