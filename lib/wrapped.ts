import { fetchGitHubData } from "@/lib/github";
import { computeStats } from "@/lib/stats";
import { buildNarrative } from "@/lib/persona";
import type { WrappedData } from "@/lib/types";

type CacheEntry = { data: WrappedData; expires: number };

const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getWrapped(username: string): Promise<WrappedData> {
  const key = username.toLowerCase();

  const cached = CACHE.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  // Trailing 365 days, so it works any time of year.
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  const user = await fetchGitHubData(
    username,
    from.toISOString(),
    to.toISOString(),
  );
  const stats = computeStats(user);
  const narrative = buildNarrative(stats);

  const data: WrappedData = {
    stats,
    narrative,
    rangeFrom: from.toISOString(),
    rangeTo: to.toISOString(),
    generatedAt: to.toISOString(),
  };

  CACHE.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
  return data;
}
