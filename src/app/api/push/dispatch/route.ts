import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import {
  buildPushPayload,
  sendPushToSubscriptions,
  type NotificationRecord,
} from "@/lib/push-server";
import type { NotificationType } from "@/lib/types";
import { NextResponse } from "next/server";

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !isSupabaseConfigured()) return null;
  return createClient(getSupabaseUrl(), serviceKey);
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  const expected = process.env.PUSH_WEBHOOK_SECRET ?? "mipoetry-push-wh-2026";

  if (secret !== expected) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as { record?: NotificationRecord };
  const record = body.record;
  if (!record?.user_id || !record.actor_id || !record.type) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }

  const { data: actor } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", record.actor_id)
    .maybeSingle();

  let poemTitle: string | undefined;
  if (record.poem_id) {
    const { data: poem } = await supabase
      .from("poems")
      .select("title")
      .eq("id", record.poem_id)
      .maybeSingle();
    poemTitle = poem?.title ?? undefined;
  }

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", record.user_id);

  const payload = buildPushPayload(
    record.type as NotificationType,
    actor?.display_name ?? "Alguém",
    poemTitle,
    actor?.username,
    record.poem_id ?? undefined
  );

  const { sent, expired } = await sendPushToSubscriptions(subscriptions ?? [], payload);

  if (expired.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expired);
  }

  return NextResponse.json({ sent, expired: expired.length });
}
