import Link from "next/link";
import { getWrapped } from "@/lib/wrapped";
import { UserNotFoundError } from "@/lib/github";
import StoryPlayer from "@/components/StoryPlayer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const username = decodeURIComponent(params.username);
  try {
    const { stats, narrative } = await getWrapped(username);
    const title = `${stats.name ?? stats.username}'s GitHub Wrapped`;
    const description = `${narrative.persona.title} · ${stats.totalContributions.toLocaleString()} contributions · ${stats.longestStreakDays}-day streak`;

    const ogParams = new URLSearchParams({
      name: stats.name ?? stats.username,
      username: stats.username,
      persona: narrative.persona.title,
      total: String(stats.totalContributions),
      streak: String(stats.longestStreakDays),
      word: narrative.yearInOneWord,
      avatar: stats.avatarUrl,
    });
    const image = `/api/og?${ogParams.toString()}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: image, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: "GitHub Wrapped" };
  }
}

export default async function WrappedPage({
  params,
}: {
  params: { username: string };
}) {
  const username = decodeURIComponent(params.username);

  try {
    const data = await getWrapped(username);
    return <StoryPlayer data={data} />;
  } catch (err) {
    const notFound = err instanceof UserNotFoundError;
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold">
            {notFound ? "User not found 🤔" : "Something went wrong 😬"}
          </h1>
          <p className="mt-3 opacity-70">
            {notFound
              ? `We couldn't find a GitHub user called "${username}".`
              : "Couldn't load this Wrapped right now. Please try again in a moment."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-white/90"
          >
            ← Try another username
          </Link>
        </div>
      </main>
    );
  }
}
