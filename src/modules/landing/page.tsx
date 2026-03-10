export default function LandingPage() {
  return (
    <div>
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold">GameMatch AI - Personalized Game Discovery Platform</h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">An AI-powered game recommendation engine that analyzes players gaming preferences, play history, and behavioral patterns to deliver highly personalized game suggestions. The platform guides users through an interactive taste profile builder, then uses machine learning to match them with games they will love - complete with affiliate purchase links for seamless conversion.</p>
        <a href="/register" className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white">Get Started</a>
      </section>

      <section className="py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Features</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Taste Profile Builder</h3>
          <p className="mt-2 text-gray-600">Interactive onboarding flow mapping gaming preferences across genres, mechanics, art styles, difficulty, and session length</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">AI Recommendation Engine</h3>
          <p className="mt-2 text-gray-600">ML model trained on game metadata, user reviews, and behavioral signals for personalized suggestions with confidence scores</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Game DNA Matching</h3>
          <p className="mt-2 text-gray-600">Deep analysis of loved games to extract game DNA - mechanics, themes, pacing, and aesthetics that define taste</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Affiliate Storefront</h3>
          <p className="mt-2 text-gray-600">Purchase links across Steam, PlayStation, Xbox, Nintendo, Epic Games with price comparison and sale alerts</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Community Taste Clusters</h3>
          <p className="mt-2 text-gray-600">Connect with gamers sharing similar taste profiles and discover games through social proof</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Mood-Based Discovery</h3>
          <p className="mt-2 text-gray-600">Recommendations filtered by mood - relaxing evening, competitive session, quick mobile, couch co-op</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Wishlist and Price Tracker</h3>
          <p className="mt-2 text-gray-600">Save games to wishlist with automatic price drop notifications across storefronts</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Play Journal</h3>
          <p className="mt-2 text-gray-600">Log games with ratings and notes to refine recommendations and build gaming history</p>
        </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="mt-4 text-gray-600">Join today and transform the way you work.</p>
        <a href="/register" className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white">Sign Up Free</a>
      </section>
    </div>
  );
}
