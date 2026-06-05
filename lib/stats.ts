// Turns the raw GitHub GraphQL response into the deterministic Stats object.
// Pure functions only — same input always produces the same output.

import type { GitHubUser, ContributionDay } from "@/lib/github";
import type { Stats } from "@/lib/types";

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function computeStats(user: GitHubUser): Stats {
  const cc = user.contributionsCollection;

  // Flatten the calendar (weeks -> days) and sort chronologically.
  const days: ContributionDay[] = cc.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .sort((a, b) => a.date.localeCompare(b.date));

  const total = cc.contributionCalendar.totalContributions;

  // Longest streak: the longest run of consecutive days with > 0 contributions.
  let longestStreakDays = 0;
  let run = 0;
  for (const d of days) {
    if (d.contributionCount > 0) {
      run += 1;
      longestStreakDays = Math.max(longestStreakDays, run);
    } else {
      run = 0;
    }
  }

  // Current streak: the trailing run ending on the most recent day.
  let currentStreakDays = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) currentStreakDays += 1;
    else break;
  }

  // Busiest single day.
  let busiestDay: Stats["busiestDay"] = null;
  for (const d of days) {
    if (d.contributionCount > 0 && (!busiestDay || d.contributionCount > busiestDay.count)) {
      busiestDay = { date: d.date, count: d.contributionCount };
    }
  }

  // Per-weekday totals (index 0 = Sunday ... 6 = Saturday).
  const weekdayTotals = new Array<number>(7).fill(0);
  for (const d of days) weekdayTotals[d.weekday] += d.contributionCount;

  let busiestWeekday: Stats["busiestWeekday"] = null;
  weekdayTotals.forEach((count, weekday) => {
    if (count > 0 && (!busiestWeekday || count > busiestWeekday.count)) {
      busiestWeekday = { weekday, label: WEEKDAY_LABELS[weekday], count };
    }
  });

  // Weekend share (Sunday + Saturday).
  const weekend = weekdayTotals[0] + weekdayTotals[6];
  const weekendRatio = total > 0 ? weekend / total : 0;

  // Busiest month (group by "YYYY-MM").
  const monthTotals: Record<string, number> = {};
  for (const d of days) {
    const ym = d.date.slice(0, 7);
    monthTotals[ym] = (monthTotals[ym] ?? 0) + d.contributionCount;
  }
  let busiestMonth: Stats["busiestMonth"] = null;
  for (const [ym, count] of Object.entries(monthTotals)) {
    if (count > 0 && (!busiestMonth || count > busiestMonth.count)) {
      const monthIndex = Number(ym.slice(5, 7)) - 1;
      busiestMonth = { month: ym, label: MONTH_LABELS[monthIndex], count };
    }
  }

  // Repos, stars, languages (repos arrive pre-sorted by stars, desc).
  const repos = user.repositories.nodes;
  const starsEarned = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
  const topRepo = repos.length
    ? { name: repos[0].name, stars: repos[0].stargazerCount }
    : null;

  // Rank languages by how many repos use them as the primary language.
  const langCounts: Record<string, number> = {};
  for (const r of repos) {
    const lang = r.primaryLanguage?.name;
    if (lang) langCounts[lang] = (langCounts[lang] ?? 0) + 1;
  }
  const rankedLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  // Most active repo by commit count this period.
  const byCommits = [...cc.commitContributionsByRepository].sort(
    (a, b) => b.contributions.totalCount - a.contributions.totalCount,
  );
  const mostActiveRepo = byCommits.length
    ? {
        name: byCommits[0].repository.name,
        commits: byCommits[0].contributions.totalCount,
        language: byCommits[0].repository.primaryLanguage?.name ?? null,
      }
    : null;

  return {
    username: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,

    totalContributions: total,
    commits: cc.totalCommitContributions,
    pullRequests: cc.totalPullRequestContributions,
    issues: cc.totalIssueContributions,
    reviews: cc.totalPullRequestReviewContributions,

    longestStreakDays,
    currentStreakDays,
    busiestDay,
    busiestWeekday,
    weekendRatio,
    busiestMonth,

    followers: user.followers.totalCount,
    starsEarned,
    reposCreated: user.repositories.totalCount,
    topRepo,
    mostActiveRepo,

    topLanguages: rankedLangs.slice(0, 5),
    distinctLanguages: rankedLangs.length,
  };
}
