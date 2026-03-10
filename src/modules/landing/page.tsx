import Link from 'next/link';
import {
  Gamepad2,
  Sparkles,
  TrendingUp,
  Target,
  Brain,
  BookOpen,
  ShoppingCart,
  Compass,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Build Your Taste Profile',
    description:
      'Tell us about your favorite genres, mechanics, and play style',
    Icon: Gamepad2,
  },
  {
    number: '02',
    title: 'Get AI Recommendations',
    description:
      'Our engine analyzes 1000+ games to find your perfect matches',
    Icon: Sparkles,
  },
  {
    number: '03',
    title: 'Play & Refine',
    description:
      'Rate games, track your library, and get smarter recommendations over time',
    Icon: TrendingUp,
  },
];

const features = [
  {
    Icon: Target,
    title: 'Taste Profile Builder',
    description:
      'Map your gaming DNA across genres, mechanics, art styles, and more',
  },
  {
    Icon: Sparkles,
    title: 'Smart Recommendations',
    description:
      'AI-powered suggestions with confidence scores and personalized reasons',
  },
  {
    Icon: Brain,
    title: 'Game DNA Matching',
    description:
      'Deep analysis of game mechanics, themes, pacing, and aesthetics',
  },
  {
    Icon: BookOpen,
    title: 'Play Journal',
    description:
      'Track your gaming history with ratings, notes, and hours',
  },
  {
    Icon: ShoppingCart,
    title: 'Price Comparison',
    description:
      'Find the best deals across Steam, Humble, GOG, and more',
  },
  {
    Icon: Compass,
    title: 'Mood Discovery',
    description:
      'Get recommendations based on how you feel right now',
  },
];

const stats = [
  { value: '1,000+', label: 'Games Analyzed' },
  { value: '8', label: 'Taste Dimensions' },
  { value: '6', label: 'Mood Modes' },
  { value: '10+', label: 'Storefronts' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        {/* Gradient mesh overlay */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-32 text-center sm:px-6 lg:px-8">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Find Your Next Favorite Game
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
            AI-powered recommendations based on your unique gaming taste. Stop
            scrolling, start playing.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-600 px-8 text-base font-medium text-white shadow-lg shadow-emerald-900/30 transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-700 bg-transparent px-8 text-base font-medium text-slate-100 transition-colors hover:bg-slate-800 hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
            Three simple steps to smarter game discovery
          </p>

          <div className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Connecting line (desktop) */}
            <div className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-12 hidden h-px bg-gradient-to-r from-emerald-500/50 via-cyan-500/50 to-violet-500/50 md:block" />

            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
                  <step.Icon className="h-10 w-10 text-emerald-400" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
            A complete toolkit for discovering games you&apos;ll love
          </p>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 transition-colors group-hover:bg-emerald-600/20">
                  <feature.Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="border-y border-slate-800 bg-slate-900/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                  {stat.value}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to find your next obsession?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Join GameMatch AI and never waste time on a bad game again.
          </p>
          <div className="mt-10">
            <Link
              href="/register"
              className="inline-flex h-14 items-center justify-center rounded-lg bg-emerald-600 px-10 text-lg font-semibold text-white shadow-lg shadow-emerald-900/30 transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Create Free Account
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 text-lg font-bold text-slate-50">
              <span role="img" aria-label="controller">
                🎮
              </span>
              <span>GameMatch AI</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/about"
                className="text-sm text-slate-400 transition-colors hover:text-slate-200"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-slate-400 transition-colors hover:text-slate-200"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-slate-400 transition-colors hover:text-slate-200"
              >
                Terms
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 transition-colors hover:text-slate-200"
              >
                GitHub
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                Built with AI
              </span>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-600">
            &copy; {new Date().getFullYear()} GameMatch AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
