import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { onNotification, NotificationPayload } from '../services/notificationService';

const router = Router();

// SSE endpoint - client connects and receives real-time notifications
router.get('/stream', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const userId = user.id;
  const userRole = user.role;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  res.flushHeaders();

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', userId, role: userRole })}\n\n`);

  const unsubscribe = onNotification((payload: NotificationPayload) => {
    // Filter: only send notifications relevant to this user
    let shouldSend = false;

    if (payload.targetRole === 'admin' && userRole === 'admin') {
      shouldSend = true;
    } else if (payload.targetRole === 'worker' && userRole === 'worker') {
      // Worker only gets work_order_assigned if it's for them
      if (payload.targetWorkerId && payload.targetWorkerId === userId) {
        shouldSend = true;
      }
    }

    if (shouldSend) {
      try {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
        const resWithFlush = res as unknown as { flush?: () => void };
        if (typeof resWithFlush.flush === 'function') {
          resWithFlush.flush();
        }
      } catch (err) {
        console.error('SSE write error:', err);
      }
    }
  });

  // Cleanup on client disconnect
  req.on('close', () => {
    unsubscribe();
    res.end();
  });
});

export default router;
