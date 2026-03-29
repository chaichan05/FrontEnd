const pool = require('../db');

// ── GET /addresses ────────────────────────────────────────────
const getAddresses = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.user_id, a.house_no, a.street, a.district, 
              a.province, a.postal_code, u.first_name, u.last_name
       FROM addresses a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.user_id ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[getAddresses]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── GET /addresses/:id ────────────────────────────────────────
const getAddressById = async (req, res) => {
  try {
    const [[address]] = await pool.query(
      `SELECT a.id, a.user_id, a.house_no, a.street, a.district, 
              a.province, a.postal_code, u.first_name, u.last_name
       FROM addresses a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!address)
      return res.status(404).json({ success: false, message: 'Address not found' });

    res.json({ success: true, data: address });
  } catch (err) {
    console.error('[getAddressById]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── GET /addresses/user/:userId ───────────────────────────────
const getAddressByUserId = async (req, res) => {
  try {
    const [addresses] = await pool.query(
      `SELECT a.id, a.user_id, a.house_no, a.street, a.district, 
              a.province, a.postal_code, u.first_name, u.last_name
       FROM addresses a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.user_id = ?`,
      [req.params.userId]
    );
    if (addresses.length === 0)
      return res.status(404).json({ success: false, message: 'No address found for this user' });

    res.json({ success: true, data: addresses });
  } catch (err) {
    console.error('[getAddressByUserId]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── POST /addresses ───────────────────────────────────────────
const createAddress = async (req, res) => {
  try {
    const { user_id, house_no, street, district, province, postal_code } = req.body;

    // Validation
    if (!user_id || !house_no || !district || !province || !postal_code) {
      return res.status(400).json({
        success: false,
        message: 'user_id, house_no, district, province, postal_code are required'
      });
    }

    // Check if user exists
    const [[user]] = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if address already exists for this user (UNIQUE constraint)
    const [[existingAddress]] = await pool.query(
      'SELECT id FROM addresses WHERE user_id = ?',
      [user_id]
    );
    if (existingAddress) {
      return res.status(409).json({
        success: false,
        message: 'Address already exists for this user'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO addresses (user_id, house_no, street, district, province, postal_code)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, house_no, street || null, district, province, postal_code]
    );

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: { id: result.insertId, user_id, house_no, street, district, province, postal_code }
    });
  } catch (err) {
    console.error('[createAddress]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── PUT /addresses/:id ────────────────────────────────────────
const updateAddress = async (req, res) => {
  try {
    const { house_no, street, district, province, postal_code } = req.body;

    // Check if address exists
    const [[address]] = await pool.query(
      'SELECT user_id FROM addresses WHERE id = ?',
      [req.params.id]
    );
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (house_no !== undefined) {
      updates.push('house_no = ?');
      values.push(house_no);
    }
    if (street !== undefined) {
      updates.push('street = ?');
      values.push(street);
    }
    if (district !== undefined) {
      updates.push('district = ?');
      values.push(district);
    }
    if (province !== undefined) {
      updates.push('province = ?');
      values.push(province);
    }
    if (postal_code !== undefined) {
      updates.push('postal_code = ?');
      values.push(postal_code);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(req.params.id);
    await pool.query(
      `UPDATE addresses SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Address updated successfully'
    });
  } catch (err) {
    console.error('[updateAddress]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── DELETE /addresses/:id ─────────────────────────────────────
const deleteAddress = async (req, res) => {
  try {
    const [[address]] = await pool.query(
      'SELECT id FROM addresses WHERE id = ?',
      [req.params.id]
    );
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await pool.query('DELETE FROM addresses WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (err) {
    console.error('[deleteAddress]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAddresses,
  getAddressById,
  getAddressByUserId,
  createAddress,
  updateAddress,
  deleteAddress
};
