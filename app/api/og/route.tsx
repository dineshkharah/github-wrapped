// Generates the shareable Open Graph card (1200x630 PNG) from query params.
// Self-contained: reads everything from the URL, makes no GitHub call.

import { ImageResponse } from "next/og";

export const runtime = "edge";

function stripEmoji(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name =
    searchParams.get("name") ?? searchParams.get("username") ?? "A developer";
  const username = searchParams.get("username") ?? "";
  const persona = stripEmoji(searchParams.get("persona") ?? "The Developer");
  const total = searchParams.get("total") ?? "0";
  const streak = searchParams.get("streak") ?? "0";
  const word = searchParams.get("word") ?? "";
  const avatar = searchParams.get("avatar");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px",
          background: "linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {avatar ? (
            <img
              src={avatar}
              width={104}
              height={104}
              style={{
                borderRadius: "9999px",
                border: "4px solid rgba(255,255,255,0.45)",
              }}
            />
          ) : null}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 700 }}>{name}</div>
            {username ? (
              <div style={{ fontSize: 26, opacity: 0.8 }}>{`@${username}`}</div>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 28,
              opacity: 0.85,
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            GitHub Wrapped
          </div>
          <div
            style={{
              fontSize: 90,
              fontWeight: 800,
              marginTop: 8,
              lineHeight: 1.05,
            }}
          >
            {persona}
          </div>
        </div>

        <div style={{ display: "flex", gap: "56px" }}>
          <Stat label="Contributions" value={Number(total).toLocaleString()} />
          <Stat label="Longest streak" value={`${streak} days`} />
          {word ? <Stat label="Year in a word" value={word} /> : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 24, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 52, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
