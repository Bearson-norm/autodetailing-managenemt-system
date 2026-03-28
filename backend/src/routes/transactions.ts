import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notificationService';

const router = Router();

// Get transactions (filtered by role, with optional pagination)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const usePagination = req.query.page !== undefined || req.query.limit !== undefined;
    const offset = usePagination ? (page - 1) * limit : 0;

    let result;
    let countResult;

    if (req.user!.role === 'admin') {
      // Admin can see all transactions
      const baseQuery = `FROM transactions t
         JOIN users u ON t.consumer_id = u.id`;
      const orderClause = 'ORDER BY t.created_at DESC';

      if (usePagination) {
        countResult = await query(`SELECT COUNT(*) as total FROM transactions t`);
        result = await query(
          `SELECT t.*, u.name as consumer_name
         ${baseQuery}
         ${orderClause}
         LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
      } else {
        result = await query(
          `SELECT t.*, u.name as consumer_name
         ${baseQuery}
         ${orderClause}`
        );
      }
    } else if (req.user!.role === 'consumer') {
      // Consumers can only see their own transactions
      const baseQuery = 'FROM transactions WHERE consumer_id = $1';

      if (usePagination) {
        countResult = await query(`SELECT COUNT(*) as total ${baseQuery}`, [req.user!.id]);
        result = await query(
          `SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
          [req.user!.id, limit, offset]
        );
      } else {
        result = await query(
          `SELECT * ${baseQuery} ORDER BY created_at DESC`,
          [req.user!.id]
        );
      }
    } else {
      // Workers can see transactions assigned to them via work orders
      const baseQuery = `FROM transactions t
         JOIN work_orders wo ON t.id = wo.transaction_id
         WHERE wo.worker_id = $1`;

      if (usePagination) {
        countResult = await query(`SELECT COUNT(DISTINCT t.id) as total ${baseQuery}`, [req.user!.id]);
        result = await query(
          `SELECT DISTINCT t.* ${baseQuery} ORDER BY t.created_at DESC LIMIT $2 OFFSET $3`,
          [req.user!.id, limit, offset]
        );
      } else {
        result = await query(
          `SELECT DISTINCT t.* ${baseQuery} ORDER BY t.created_at DESC`,
          [req.user!.id]
        );
      }
    }

    if (usePagination && countResult) {
      const total = parseInt(countResult.rows[0]?.total || '0', 10);
      res.json({
        transactions: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      res.json({ transactions: result.rows });
    }
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by ID
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    let result;

    if (req.user!.role === 'admin') {
      result = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    } else if (req.user!.role === 'consumer') {
      result = await query(
        'SELECT * FROM transactions WHERE id = $1 AND consumer_id = $2',
        [id, req.user!.id]
      );
    } else {
      // Worker can see if transaction is assigned to them
      result = await query(
        `SELECT t.* FROM transactions t
         JOIN work_orders wo ON t.id = wo.transaction_id
         WHERE t.id = $1 AND wo.worker_id = $2`,
        [id, req.user!.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new transaction (consumer only)
router.post('/', requireAuth, requireRole('consumer'), async (req: AuthRequest, res) => {
  try {
    // Accept both camelCase and snake_case for compatibility
    const body = req.body;
    const date = body.date;
    const name = body.name;
    const address = body.address;
    const location = body.location;
    const whatsapp = body.whatsapp;
    const carBrand = body.carBrand ?? body.car_brand;
    const carYear = body.carYear ?? body.car_year;
    const carColor = body.carColor ?? body.car_color;
    const selectedPackage = body.selectedPackage ?? body.selected_package;
    const currentSeat = body.currentSeat ?? body.current_seat;
    const hasStain = body.hasStain ?? body.has_stain ?? false;
    const workplaceAvailable = body.workplaceAvailable ?? body.workplace_available ?? false;
    const canopy = body.canopy ?? false;
    const parking = body.parking ?? false;
    const waterElectricity = body.waterElectricity ?? body.water_electricity ?? false;
    const audioSystem = body.audioSystem ?? body.audio_system ?? null;
    const specialComplaints = body.specialComplaints ?? body.special_complaints ?? null;

    // Validation
    if (!date || !name || !address || !whatsapp || !carBrand || !carYear || !carColor || !selectedPackage || !currentSeat) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderNumber = `ORD-${Date.now()}`;
    const id = uuidv4();

    const result = await query(
      `INSERT INTO transactions (
        id, order_number, consumer_id, consumer_name, status, date, name, address, location,
        whatsapp, car_brand, car_year, car_color, selected_package, current_seat,
        has_stain, workplace_available, canopy, parking, water_electricity,
        audio_system, special_complaints
      ) VALUES (
        $1, $2, $3, $4, 'received', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21
      ) RETURNING *`,
      [
        id, orderNumber, req.user!.id, req.user!.name, date, name, address, location || null,
        whatsapp, carBrand, carYear, carColor, selectedPackage, currentSeat,
        hasStain, workplaceAvailable, canopy, parking, waterElectricity,
        audioSystem, specialComplaints,
      ]
    );

    // Notifikasi ke admin: pesanan baru masuk
    emitNotification({
      type: 'new_order',
      title: 'Pesanan Baru',
      message: `Pesanan ${orderNumber} dari ${req.user!.name} telah masuk`,
      targetRole: 'admin',
      data: { orderNumber, transactionId: id },
    });

    res.status(201).json({ transaction: result.rows[0], orderNumber });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction status (admin only)
router.put('/:id/status', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['received', 'ordered', 'finished'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await query(
      `UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
