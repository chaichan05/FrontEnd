const pool = require('../db');

// ── GET /users ────────────────────────────────────────────────
// Query params: page, limit, search, gender, sort, order, department_id
const getUsers = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const search        = req.query.search        || '';
    const gender        = req.query.gender        || '';
    const department_id = req.query.department_id || '';

    const allowedSort  = ['u.first_name','u.last_name','u.age','u.created_at','d.name'];
    const allowedOrder = ['asc','desc'];
    const sortRaw = req.query.sort || 'u.created_at';
    const sort  = allowedSort.includes(sortRaw) ? sortRaw : 'u.created_at';
    const order = allowedOrder.includes((req.query.order||'').toLowerCase())
      ? req.query.order.toUpperCase() : 'DESC';

    const conditions = [];
    const params     = [];

    if (search) {
      conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (gender && ['male','female','unspecified'].includes(gender)) {
      conditions.push('u.gender = ?');
      params.push(gender);
    }
    if (department_id) {
      conditions.push('u.department_id = ?');
      params.push(department_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // LEFT JOIN departments + addresses
    const baseQuery = `
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN addresses   a ON u.id = a.user_id
      ${where}`;

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total ${baseQuery}`, params
    );

    const [rows] = await pool.query(
      `SELECT
         u.id, u.first_name, u.last_name, u.age, u.gender, u.email, u.phone,
         u.created_at, u.updated_at,
         u.department_id,
         d.name AS department_name,
         a.house_no, a.street, a.district, a.province, a.postal_code
       ${baseQuery}
       ORDER BY ${sort} ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        users: rows.map(formatUser),
        pagination: {
          currentPage:  page,
          totalPages:   Math.ceil(total / limit),
          totalItems:   total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (err) {
    console.error('[getUsers]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── GET /users/:id ────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         u.id, u.first_name, u.last_name, u.age, u.gender, u.email, u.phone,
         u.created_at, u.updated_at,
         u.department_id,
         d.name AS department_name,
         a.house_no, a.street, a.district, a.province, a.postal_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN addresses   a ON u.id = a.user_id
       WHERE u.id = ?`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: formatUser(rows[0]) });
  } catch (err) {
    console.error('[getUserById]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── POST /users ───────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { first_name, last_name, age, gender, email, phone, department_id, address } = req.body;

    const errors = validateUser({ first_name, last_name, age, gender, email, phone, department_id });
    if (address) errors.push(...validateAddress(address));
    if (errors.length)
      return res.status(422).json({ success: false, message: 'Validation failed', errors });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        'INSERT INTO users (first_name, last_name, age, gender, email, phone, department_id) VALUES (?,?,?,?,?,?,?)',
        [first_name.trim(), last_name.trim(), age, gender,
         email.toLowerCase().trim(), phone || null, department_id || null]
      );
      const userId = result.insertId;

      if (address) {
        await conn.query(
          'INSERT INTO addresses (user_id, house_no, street, district, province, postal_code) VALUES (?,?,?,?,?,?)',
          [userId, address.house_no, address.street || null,
           address.district, address.province, address.postal_code]
        );
      }

      await conn.commit();

      const [rows] = await pool.query(
        `SELECT u.*, d.name AS department_name,
                a.house_no, a.street, a.district, a.province, a.postal_code
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN addresses   a ON u.id = a.user_id
         WHERE u.id = ?`, [userId]
      );
      res.status(201).json({ success: true, data: formatUser(rows[0]) });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Email already exists',
        errors: [{ field: 'email', message: 'Email already exists' }] });
    console.error('[createUser]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── PUT /users/:id ────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'User not found' });

    const { first_name, last_name, age, gender, email, phone, department_id, address } = req.body;

    const errors = validateUser({ first_name, last_name, age, gender, email, phone, department_id });
    if (address) errors.push(...validateAddress(address));
    if (errors.length)
      return res.status(422).json({ success: false, message: 'Validation failed', errors });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        'UPDATE users SET first_name=?,last_name=?,age=?,gender=?,email=?,phone=?,department_id=? WHERE id=?',
        [first_name.trim(), last_name.trim(), age, gender,
         email.toLowerCase().trim(), phone || null, department_id || null, req.params.id]
      );

      if (address) {
        // UPSERT address
        await conn.query(
          `INSERT INTO addresses (user_id, house_no, street, district, province, postal_code)
           VALUES (?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE
             house_no=VALUES(house_no), street=VALUES(street),
             district=VALUES(district), province=VALUES(province),
             postal_code=VALUES(postal_code)`,
          [req.params.id, address.house_no, address.street || null,
           address.district, address.province, address.postal_code]
        );
      } else {
        await conn.query('DELETE FROM addresses WHERE user_id = ?', [req.params.id]);
      }

      await conn.commit();

      const [rows] = await pool.query(
        `SELECT u.*, d.name AS department_name,
                a.house_no, a.street, a.district, a.province, a.postal_code
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN addresses   a ON u.id = a.user_id
         WHERE u.id = ?`, [req.params.id]
      );
      res.json({ success: true, data: formatUser(rows[0]) });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Email already exists',
        errors: [{ field: 'email', message: 'Email already exists' }] });
    console.error('[updateUser]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── DELETE /users/:id ─────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'User not found' });
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('[deleteUser]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Format helper ─────────────────────────────────────────────
function formatUser(row) {
  const address = row.house_no ? {
    house_no:    row.house_no,
    street:      row.street    || null,
    district:    row.district,
    province:    row.province,
    postal_code: row.postal_code,
  } : null;

  return {
    id:          row.id,
    first_name:  row.first_name,
    last_name:   row.last_name,
    age:         row.age,
    gender:      row.gender,
    email:       row.email,
    phone:       row.phone    || null,
    department:  row.department_id ? {
      id:   row.department_id,
      name: row.department_name,
    } : null,
    address,
    created_at:  row.created_at,
    updated_at:  row.updated_at,
  };
}

// ── Validation helpers ────────────────────────────────────────
function validateUser({ first_name, last_name, age, gender, email, phone, department_id }) {
  const errors = [];
  if (!first_name || first_name.trim().length < 2 || first_name.trim().length > 100)
    errors.push({ field: 'first_name', message: 'ชื่อต้องมี 2–100 ตัวอักษร' });
  if (!last_name || last_name.trim().length < 2 || last_name.trim().length > 100)
    errors.push({ field: 'last_name', message: 'นามสกุลต้องมี 2–100 ตัวอักษร' });
  const parsedAge = parseInt(age);
  if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120)
    errors.push({ field: 'age', message: 'อายุต้องเป็นตัวเลข 1–120' });
  if (!['male','female','unspecified'].includes(gender))
    errors.push({ field: 'gender', message: 'เพศต้องเป็น male, female หรือ unspecified' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push({ field: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' });
  if (phone && !/^[0-9\-+\s()]{8,20}$/.test(phone))
    errors.push({ field: 'phone', message: 'รูปแบบเบอร์โทรไม่ถูกต้อง' });
  if (department_id !== undefined && department_id !== null && department_id !== '') {
    if (isNaN(parseInt(department_id)))
      errors.push({ field: 'department_id', message: 'department_id ต้องเป็นตัวเลข' });
  }
  return errors;
}

function validateAddress({ house_no, district, province, postal_code }) {
  const errors = [];
  if (!house_no || !house_no.trim())
    errors.push({ field: 'address.house_no', message: 'บ้านเลขที่ต้องไม่ว่าง' });
  if (!district || !district.trim())
    errors.push({ field: 'address.district', message: 'เขต/อำเภอต้องไม่ว่าง' });
  if (!province || !province.trim())
    errors.push({ field: 'address.province', message: 'จังหวัดต้องไม่ว่าง' });
  if (!postal_code || !/^\d{5}$/.test(postal_code))
    errors.push({ field: 'address.postal_code', message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก' });
  return errors;
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
