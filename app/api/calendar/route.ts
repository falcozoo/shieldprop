import { NextResponse } from "next/server";
import { getEvents } from "@/lib/calendar";

// Cache at the edge/server for 1h; macro calendar is stable intraday.
export const revalidate = 3600;

export async function GET() {
  try {
    const events = await getEvents({ includeNextWeek: true, minImpact: "Medium" });
    return NextResponse.json(
      { ok: true, count: events.length, events },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "calendar_unavailable" },
      { status: 503 },
    );
  }
}
