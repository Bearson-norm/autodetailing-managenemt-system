import webpush from 'web-push';
import { query } from '../config/database';
import type { NotificationPayload } from './notificationService';

let configured = false;

function ensureVapid(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@localhost';
  if (!publicKey || !privateKey) {
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

interface DbSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function toWebPushSubscription(row: DbSubscriptionRow): webpush.PushSubscription {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  } as webpush.PushSubscription;
}

export async function sendPushForNotification(payload: NotificationPayload): Promise<void> {
  if (!ensureVapid()) {
    return;
  }

  let rows: DbSubscriptionRow[] = [];

  if (payload.targetRole === 'admin') {
    const r = await query(
      `SELECT ps.endpoint, ps.p256dh, ps.auth
       FROM push_subscriptions ps
       JOIN users u ON u.id = ps.user_id
       WHERE u.role = 'admin'`
    );
    rows = r.rows as DbSubscriptionRow[];
  } else if (payload.targetRole === 'worker' && payload.targetWorkerId) {
    const r = await query(
      `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1`,
      [payload.targetWorkerId]
    );
    rows = r.rows as DbSubscriptionRow[];
  }

  if (rows.length === 0) return;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.message,
    tag: payload.type,
    data: payload.data ?? {},
  });

  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(toWebPushSubscription(row), body, {
          TTL: 60 * 60 * 12,
        });
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint]);
        } else {
          console.error('Web Push send error:', err);
        }
      }
    })
  );
}
