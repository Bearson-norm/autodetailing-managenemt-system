import { Router } from 'express';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

/** Kunci publik VAPID untuk subscribe di browser (tidak rahasia) */
router.get('/vapid-public-key', (_req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(503).json({ error: 'Web Push not configured' });
  }
  res.json({ publicKey });
});

interface ClientSubscription {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
}

router.post('/subscribe', requireAuth, requireRole('admin', 'worker'), async (req: AuthRequest, res) => {
  try {
    const sub = req.body?.subscription as ClientSubscription | undefined;
    if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription payload' });
    }

    await query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         p256dh = EXCLUDED.p256dh,
         auth = EXCLUDED.auth,
         updated_at = CURRENT_TIMESTAMP`,
      [req.user!.id, sub.endpoint, sub.keys.p256dh, sub.keys.auth]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/unsubscribe', requireAuth, async (req: AuthRequest, res) => {
  try {
    const endpoint = req.body?.endpoint as string | undefined;
    if (!endpoint) {
      return res.status(400).json({ error: 'endpoint required' });
    }

    await query('DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2', [
      endpoint,
      req.user!.id,
    ]);

    res.json({ ok: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
