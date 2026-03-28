import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { join } from 'path';
import { emitNotification } from '../services/notificationService';

const router = Router();

// Get work orders (filtered by role)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    let result;

    if (req.user!.role === 'admin') {
      // Admin can see all work orders
      result = await query(
        `SELECT wo.*, t.order_number, t.consumer_name, t.status as transaction_status
         FROM work_orders wo
         JOIN transactions t ON wo.transaction_id = t.id
         ORDER BY wo.created_at DESC`
      );
    } else if (req.user!.role === 'worker') {
      // Workers can only see their own work orders
      result = await query(
        `SELECT wo.*, t.order_number, t.consumer_name, t.status as transaction_status
         FROM work_orders wo
         JOIN transactions t ON wo.transaction_id = t.id
         WHERE wo.worker_id = $1
         ORDER BY wo.created_at DESC`,
        [req.user!.id]
      );
    } else {
      // Consumers can see work orders for their transactions
      result = await query(
        `SELECT wo.*, t.order_number, t.consumer_name, t.status as transaction_status
         FROM work_orders wo
         JOIN transactions t ON wo.transaction_id = t.id
         WHERE t.consumer_id = $1
         ORDER BY wo.created_at DESC`,
        [req.user!.id]
      );
    }

    // Get documentation for each work order
    const workOrders = await Promise.all(
      result.rows.map(async (wo) => {
        const docsResult = await query(
          'SELECT id, file_path, file_name, file_size, mime_type, created_at FROM work_order_docs WHERE work_order_id = $1 ORDER BY created_at',
          [wo.id]
        );
        return {
          ...wo,
          documentation: docsResult.rows.map((doc) => ({
            id: doc.id,
            fileName: doc.file_name,
            filePath: doc.file_path,
            fileSize: doc.file_size,
            mimeType: doc.mime_type,
            createdAt: doc.created_at,
          })),
        };
      })
    );

    res.json({ workOrders });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get work order by ID
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    let result;

    if (req.user!.role === 'admin') {
      result = await query(
        `SELECT wo.*, t.*
         FROM work_orders wo
         JOIN transactions t ON wo.transaction_id = t.id
         WHERE wo.id = $1`,
        [id]
      );
    } else if (req.user!.role === 'worker') {
      result = await query(
        `SELECT wo.*, t.*
         FROM work_orders wo
         JOIN transactions t ON wo.transaction_id = t.id
         WHERE wo.id = $1 AND wo.worker_id = $2`,
        [id, req.user!.id]
      );
    } else {
      result = await query(
        `SELECT wo.*, t.*
         FROM work_orders wo
         JOIN transactions t ON wo.transaction_id = t.id
         WHERE wo.id = $1 AND t.consumer_id = $2`,
        [id, req.user!.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    const workOrder = result.rows[0];

    // Get documentation
    const docsResult = await query(
      'SELECT id, file_path, file_name, file_size, mime_type, created_at FROM work_order_docs WHERE work_order_id = $1 ORDER BY created_at',
      [id]
    );

    res.json({
      workOrder: {
        ...workOrder,
        documentation: docsResult.rows.map((doc) => ({
          id: doc.id,
          fileName: doc.file_name,
          filePath: doc.file_path,
          fileSize: doc.file_size,
          mimeType: doc.mime_type,
          createdAt: doc.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('Get work order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create work order (admin only)
router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const { transactionId, workerId } = req.body;

    if (!transactionId || !workerId) {
      return res.status(400).json({ error: 'Transaction ID and worker ID are required' });
    }

    // Check if transaction exists and is in 'received' status
    const transactionResult = await query(
      'SELECT * FROM transactions WHERE id = $1',
      [transactionId]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transactionResult.rows[0].status !== 'received') {
      return res.status(400).json({ error: 'Transaction is not in received status' });
    }

    // Check if worker exists
    const workerResult = await query(
      'SELECT id, name FROM users WHERE id = $1 AND role = $2',
      [workerId, 'worker']
    );

    if (workerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Check if work order already exists for this transaction
    const existingWorkOrder = await query(
      'SELECT id FROM work_orders WHERE transaction_id = $1',
      [transactionId]
    );

    if (existingWorkOrder.rows.length > 0) {
      return res.status(400).json({ error: 'Work order already exists for this transaction' });
    }

    const workOrderNumber = `WO-${Date.now()}`;
    const id = uuidv4();

    // Create work order
    const workOrderResult = await query(
      `INSERT INTO work_orders (id, work_order_number, transaction_id, worker_id, worker_name, status)
       VALUES ($1, $2, $3, $4, $5, 'assigned')
       RETURNING *`,
      [id, workOrderNumber, transactionId, workerId, workerResult.rows[0].name]
    );

    // Update transaction status to 'ordered'
    await query(
      "UPDATE transactions SET status = 'ordered', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [transactionId]
    );

    // Notifikasi ke operator/worker: work order baru di-assign
    const transaction = transactionResult.rows[0];
    emitNotification({
      type: 'work_order_assigned',
      title: 'Perintah Kerja Baru',
      message: `Work order ${workOrderNumber} untuk ${transaction.consumer_name} telah ditugaskan kepada Anda`,
      targetRole: 'worker',
      targetWorkerId: workerId,
      data: {
        workOrderNumber,
        transactionId,
        workOrderId: id,
      },
    });

    res.status(201).json({ workOrder: workOrderResult.rows[0], workOrderNumber });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload documentation (worker only)
router.post(
  '/:id/documents',
  requireAuth,
  requireRole('worker'),
  upload.array('files', 10),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Verify work order exists and belongs to worker
      const workOrderResult = await query(
        'SELECT * FROM work_orders WHERE id = $1 AND worker_id = $2',
        [id, req.user!.id]
      );

      if (workOrderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Work order not found' });
      }

      const files = req.files as Express.Multer.File[];
      const uploadDir = process.env.UPLOAD_DIR || './uploads';

      // Save file information to database
      const filePromises = files.map(async (file) => {
        const filePath = join(uploadDir, 'work-orders', file.filename);
        const docId = uuidv4();

        await query(
          `INSERT INTO work_order_docs (id, work_order_id, file_path, file_name, file_size, mime_type)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [docId, id, filePath, file.originalname, file.size, file.mimetype]
        );

        return {
          id: docId,
          fileName: file.originalname,
          filePath: filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
        };
      });

      const savedFiles = await Promise.all(filePromises);

      res.status(201).json({ files: savedFiles });
    } catch (error) {
      console.error('Upload documents error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Finish work order (worker only)
router.put('/:id/finish', requireAuth, requireRole('worker'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify work order exists and belongs to worker
    const workOrderResult = await query(
      'SELECT * FROM work_orders WHERE id = $1 AND worker_id = $2',
      [id, req.user!.id]
    );

    if (workOrderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    // Check if work order has documentation
    const docsResult = await query(
      'SELECT COUNT(*) as count FROM work_order_docs WHERE work_order_id = $1',
      [id]
    );

    if (parseInt(docsResult.rows[0].count) === 0) {
      return res.status(400).json({ error: 'Work order must have at least one documentation file' });
    }

    // Update work order status
    const result = await query(
      `UPDATE work_orders SET status = 'finished', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    // Update transaction status to 'finished'
    await query(
      `UPDATE transactions SET status = 'finished', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [workOrderResult.rows[0].transaction_id]
    );

    // Notifikasi ke admin: work order selesai
    const workOrder = result.rows[0];
    const transactionResult = await query(
      'SELECT order_number FROM transactions WHERE id = $1',
      [workOrder.transaction_id]
    );
    const orderNumber = transactionResult.rows[0]?.order_number || 'N/A';
    emitNotification({
      type: 'work_order_finished',
      title: 'Work Order Selesai',
      message: `Work order ${workOrder.work_order_number} untuk pesanan ${orderNumber} telah diselesaikan oleh ${req.user!.name}`,
      targetRole: 'admin',
      data: {
        workOrderNumber: workOrder.work_order_number,
        orderNumber,
        transactionId: workOrder.transaction_id,
        workOrderId: id,
      },
    });

    res.json({ workOrder: result.rows[0] });
  } catch (error) {
    console.error('Finish work order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
