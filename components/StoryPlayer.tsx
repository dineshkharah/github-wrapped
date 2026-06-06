"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { WrappedData } from "@/lib/types";

const GRADIENTS = [
  "from-fuchsia-600 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-rose-600",
  "from-sky-500 to-blue-700",
  "from-violet-600 to-purple-800",
  "from-amber-500 to-orange-700",
  "from-pink-600 to-rose-800",
  "from-cyan-500 to-emerald-700",
];

export default function StoryPlayer({ data }: { data: WrappedData }) {
  const slides = buildSlides(data);
  const [index, setIndex] = useState(0);

  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, slides.length - 1)),
    [slides.length],
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = slides[index];
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <main
      className={`relative flex min-h-screen flex-col bg-gradient-to-br ${gradient} text-white`}
    >
      <div className="flex gap-1 p-3">
        {slides.map((s, i) => (
          <div
            key={s.key}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
          >
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: i <= index ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      <div
        key={slide.key}
        className="animate-fade-in flex flex-1 items-center justify-center px-8"
      >
        <div className="w-full max-w-lg text-center">{slide.node}</div>
      </div>

      <div className="flex items-center justify-between p-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="rounded-lg bg-white/15 px-4 py-2 font-medium transition hover:bg-white/25 disabled:opacity-30"
        >
          ← Back
        </button>
        <span className="text-sm opacity-70">
          {index + 1} / {slides.length}
        </span>
        <button
          onClick={next}
          disabled={index === slides.length - 1}
          className="rounded-lg bg-white/15 px-4 py-2 font-medium transition hover:bg-white/25 disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </main>
  );
}

function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/u/${encodeURIComponent(username)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; ignore
    }
  }

  return (
    <button
      onClick={copy}
      className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
    >
      {copied ? "Link copied! ✓" : "Copy share link"}
    </button>
  );
}

function buildSlides(data: WrappedData): { key: string; node: React.ReactNode }[] {
  const { stats, narrative } = data;
  const slides: { key: string; node: React.ReactNode }[] = [];

  slides.push({
    key: "intro",
    node: (
      <>
        <img
          src={stats.avatarUrl}
          alt={stats.username}
          width={96}
          height={96}
          className="mx-auto h-24 w-24 rounded-full ring-4 ring-white/30"
        />
        <h1 className="mt-6 text-4xl font-bold">{stats.name ?? stats.username}</h1>
        <p className="mt-2 text-lg opacity-80">@{stats.username}</p>
        <p className="mt-10 text-2xl font-semibold">Your year in code 🎁</p>
        <p className="mt-2 text-sm opacity-70">Use Next → or your arrow keys</p>
      </>
    ),
  });

  slides.push({
    key: "total",
    node: (
      <>
        <p className="text-sm uppercase tracking-widest opacity-80">
          Total contributions
        </p>
        <p className="mt-4 text-7xl font-black tabular-nums">
          {stats.totalContributions.toLocaleString()}
        </p>
        <p className="mt-6 text-xl opacity-90">{narrative.captions.total}</p>
      </>
    ),
  });

  slides.push({
    key: "languages",
    node: (
      <>
        <p className="text-sm uppercase tracking-widest opacity-80">
          Top languages
        </p>
        <ol className="mx-auto mt-6 max-w-xs space-y-2">
          {stats.topLanguages.map((lang, i) => (
            <li
              key={lang}
              className="flex items-center gap-3 rounded-lg bg-white/15 px-4 py-3 text-left text-lg font-semibold"
            >
              <span className="opacity-70">{i + 1}</span>
              <span>{lang}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xl opacity-90">{narrative.captions.languages}</p>
      </>
    ),
  });

  slides.push({
    key: "streak",
    node: (
      <>
        <p className="text-sm uppercase tracking-widest opacity-80">
          Longest streak
        </p>
        <p className="mt-4 text-7xl font-black tabular-nums">
          {stats.longestStreakDays}
          <span className="text-3xl font-bold"> days</span>
        </p>
        <p className="mt-6 text-xl opacity-90">{narrative.captions.streak}</p>
      </>
    ),
  });

  slides.push({
    key: "busiestDay",
    node: (
      <>
        <p className="text-sm uppercase tracking-widest opacity-80">
          Your power day
        </p>
        <p className="mt-4 text-6xl font-black">
          {stats.busiestWeekday?.label ?? "—"}
        </p>
        {stats.busiestDay && (
          <p className="mt-3 opacity-80">
            Peak: {stats.busiestDay.count} on {stats.busiestDay.date}
          </p>
        )}
        <p className="mt-6 text-xl opacity-90">{narrative.captions.busiestDay}</p>
      </>
    ),
  });

  const showStars = stats.starsEarned > 0;
  slides.push({
    key: "stars",
    node: showStars ? (
      <>
        <p className="text-sm uppercase tracking-widest opacity-80">
          Stars earned
        </p>
        <p className="mt-4 text-7xl font-black tabular-nums">
          ⭐ {stats.starsEarned.toLocaleString()}
        </p>
        {stats.topRepo && (
          <p className="mt-3 opacity-80">Top repo: {stats.topRepo.name}</p>
        )}
        <p className="mt-6 text-xl opacity-90">{narrative.captions.stars}</p>
      </>
    ) : (
      <>
        <p className="text-sm uppercase tracking-widest opacity-80">
          Most active repo
        </p>
        <p className="mt-4 break-words text-4xl font-black">
          {stats.mostActiveRepo?.name ?? "—"}
        </p>
        {stats.mostActiveRepo && (
          <p className="mt-3 opacity-80">
            {stats.mostActiveRepo.commits} commits
            {stats.mostActiveRepo.language
              ? ` · ${stats.mostActiveRepo.language}`
              : ""}
          </p>
        )}
        <p className="mt-6 text-xl opacity-90">{narrative.captions.stars}</p>
      </>
    ),
  });

  slides.push({
    key: "persona",
    node: (
      <>
        <p className="text-sm uppercase tracking-widest opacity-80">
          Your developer persona
        </p>
        <h2 className="mt-4 text-5xl font-black">{narrative.persona.title}</h2>
        <p className="mt-3 text-xl italic opacity-90">
          {narrative.persona.tagline}
        </p>
        <p className="mt-6 opacity-90">{narrative.persona.description}</p>
        <div className="mt-8 flex justify-center gap-10 text-sm">
          <div>
            <p className="opacity-70">Spirit animal</p>
            <p className="text-lg font-semibold">{narrative.persona.animal}</p>
          </div>
          <div>
            <p className="opacity-70">Year in a word</p>
            <p className="text-lg font-semibold">{narrative.yearInOneWord}</p>
          </div>
        </div>
      </>
    ),
  });

  const firstName = stats.name?.split(" ")[0] ?? stats.username;
  slides.push({
    key: "share",
    node: (
      <>
        <h2 className="text-3xl font-bold">That&apos;s your year, {firstName} 🎉</h2>
        <p className="mt-3 opacity-85">
          {narrative.persona.title} ·{" "}
          {stats.totalContributions.toLocaleString()} contributions ·{" "}
          {stats.longestStreakDays}-day streak
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <ShareButton username={stats.username} />
          <Link
            href="/"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            Try another username
          </Link>
        </div>
      </>
    ),
  });

  return slides;
}
