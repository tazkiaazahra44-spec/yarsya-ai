import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const globalKey = "__yarsya_push_subscriptions__";
function getStore() {
  if (!globalThis[globalKey]) {
    globalThis[globalKey] = new Set();
  }
  return globalThis[globalKey];
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || !body.endpoint) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      // Upsert by endpoint
      const { error } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            endpoint: body.endpoint,
            subscription: body,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "endpoint" }
        );
      if (error) throw error;
      return NextResponse.json({ success: true, stored: "supabase" });
    }

    const store = getStore();
    store.add(body);
    return NextResponse.json({ success: true, stored: "memory" });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.message }, { status: 500 });
  }
}