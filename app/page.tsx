"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    router.push(`/u/${encodeURIComponent(name)}`);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight">🎁 GitHub Wrapped</h1>
        <p className="mt-3 text-lg opacity-70">
          Your year in code, as a shareable story.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your-github-username"
            autoFocus
            className="flex-1 rounded-lg bg-white/10 px-4 py-3 outline-none ring-1 ring-white/15 focus:ring-white/40 placeholder:text-white/30"
          />
          <button
            type="submit"
            className="rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            Wrap it
          </button>
        </form>

        <p className="mt-4 text-xs opacity-40">
          Public contributions only. No login required.
        </p>
      </div>
    </main>
  );
}
