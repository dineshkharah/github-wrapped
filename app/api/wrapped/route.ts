import { NextResponse } from "next/server";
import { getWrapped } from "@/lib/wrapped";
import { UserNotFoundError } from "@/lib/github";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json(
      { error: "Missing 'username' query parameter." },
      { status: 400 },
    );
  }

  try {
    const data = await getWrapped(username);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
