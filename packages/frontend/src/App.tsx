const sampleDeals = [
  {
    id: 'deal-1',
    title: 'Half-price Sushi Platters',
    description: 'Tonight only at Sakura Downtown — online orders get 50% off family packs.',
    expiresIn: '5 hours'
  },
  {
    id: 'deal-2',
    title: 'Free Delivery On Breakfast Orders',
    description: 'Skip the queue! Early bird delivery is free when you order before 9am.',
    expiresIn: '22 hours'
  }
];

export default function App() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <header className="bg-base-100 shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">FoodDealSniper</h1>
          <button className="btn btn-primary">Connect Account</button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Live Deals</h2>
          <p className="text-sm opacity-70">
            Coming soon: real-time surfacing of the local deals your team configures. For now,
            here&apos;s a peek at the interface.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {sampleDeals.map((deal) => (
            <article key={deal.id} className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <h3 className="card-title text-lg font-semibold">{deal.title}</h3>
                  <span className="badge badge-accent">{deal.expiresIn}</span>
                </div>
                <p className="text-sm opacity-80">{deal.description}</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-outline btn-sm">Track deal</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="rounded-xl border border-dashed border-base-300 bg-base-100/60 p-6 text-sm">
          <h2 className="text-lg font-semibold">What&apos;s next?</h2>
          <p className="mt-2">
            The frontend is powered by Vite, React 18, and Tailwind CSS with DaisyUI components.
            Wire it up to the backend API to start collecting and automating deal alerts.
          </p>
        </section>
      </main>
    </div>
  );
}
