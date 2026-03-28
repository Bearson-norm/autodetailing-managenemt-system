import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT id, username, name, role, phone, language, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all workers (admin only)
router.get('/workers', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT id, username, name, role, phone, language, created_at FROM users WHERE role = $1 ORDER BY name',
      ['worker']
    );
    res.json({ workers: result.rows });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new worker (admin only)
router.post('/workers', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const { username, password, name, phone } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password, and name are required' });
    }

    // Check if username already exists
    const existingUser = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new worker
    const result = await query(
      `INSERT INTO users (username, password_hash, name, role, phone, language)
       VALUES ($1, $2, $3, 'worker', $4, 'id')
       RETURNING id, username, name, role, phone, language`,
      [username, passwordHash, name, phone || null]
    );

    res.status(201).json({ worker: result.rows[0] });
  } catch (error) {
    console.error('Create worker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.user!.role !== 'admin' && req.user!.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await query(
      'SELECT id, username, name, role, phone, language, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, phone, language } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user!.role !== 'admin' && req.user!.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (language !== undefined) {
      updates.push(`language = $${paramCount++}`);
      values.push(language);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, username, name, role, phone, language`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
