import webpush from "web-push";
import type { NotificationType } from "@/lib/types";
import { notificationLink, notificationMessage } from "@/lib/notification-text";

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface NotificationRecord {
  user_id: string;
  actor_id: string;
  type: NotificationType;
  poem_id?: string | null;
  comment_id?: string | null;
}

function getVapidKeys() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:ruimendes.verso.test@gmail.com";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function isPushConfigured() {
  return getVapidKeys() !== null;
}

export function configureWebPush() {
  const keys = getVapidKeys();
  if (!keys) return false;
  webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
  return true;
}

export async function sendPushToSubscriptions(
  subscriptions: PushSubscriptionRow[],
  payload: { title: string; body: string; url: string }
) {
  if (!configureWebPush()) return { sent: 0, expired: [] as string[] };

  const expired: string[] = [];
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          expired.push(sub.id);
        }
      }
    })
  );

  return { sent, expired };
}

export function buildPushPayload(
  type: NotificationType,
  actorName: string,
  poemTitle?: string,
  actorUsername?: string,
  poemId?: string
) {
  return {
    title: "MiPoetry",
    body: notificationMessage(type, actorName, poemTitle),
    url: notificationLink(type, poemId, actorUsername),
  };
}
