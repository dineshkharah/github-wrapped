// Shown instantly (via Next's automatic Suspense boundary) while the Wrapped
// page does its server-side work. Mirrors the StoryPlayer frame for a smooth
// hand-off, which improves perceived load time, FCP, and LCP.

export default function Loading() {
  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-br from-fuchsia-600 to-indigo-700 text-white">
      <div className="flex gap-1 p-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full bg-white/25" />
        ))}
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <div className="w-full max-w-lg animate-pulse text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-white/25" />
          <div className="mx-auto mt-6 h-8 w-48 rounded bg-white/25" />
          <div className="mx-auto mt-3 h-4 w-32 rounded bg-white/15" />
          <div className="mx-auto mt-10 h-6 w-56 rounded bg-white/20" />
          <p className="mt-8 text-sm opacity-70">Wrapping up your year…</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="h-9 w-20 rounded-lg bg-white/15" />
        <div className="h-4 w-12 rounded bg-white/15" />
        <div className="h-9 w-20 rounded-lg bg-white/15" />
      </div>
    </main>
  );
}
