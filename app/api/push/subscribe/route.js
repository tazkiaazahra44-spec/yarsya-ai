import { NextResponse } from "next/server";

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
    const store = getStore();
    store.add(body);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.message }, { status: 500 });
  }
}