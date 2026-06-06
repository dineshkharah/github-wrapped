import Link from "next/link";
import { getWrapped } from "@/lib/wrapped";
import { UserNotFoundError } from "@/lib/github";
import StoryPlayer from "@/components/StoryPlayer";

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
