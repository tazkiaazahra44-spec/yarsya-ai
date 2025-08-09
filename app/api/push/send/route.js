import { NextResponse } from "next/server";
import webpush from "web-push";

const globalKey = "__yarsya_push_subscriptions__";
function getStore() {
  if (!globalThis[globalKey]) {
    globalThis[globalKey] = new Set();
  }
  return globalThis[globalKey];
}

function ensureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!publicKey || !privateKey) return null;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey, privateKey };
}

export async function POST(request) {
  try {
    const vapid = ensureVapid();
    if (!vapid) {
      return NextResponse.json({ success: false, error: "VAPID keys not set" }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const { title = "YARSYA-AI", body: bodyText = "Ada balasan AI baru.", url = "/chat" } = body || {};

    const store = getStore();
    const payload = JSON.stringify({ title, body: bodyText, url });

    const results = await Promise.allSettled(
      Array.from(store).map((sub) => webpush.sendNotification(sub, payload))
    );

    return NextResponse.json({ success: true, results });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.message }, { status: 500 });
  }
}