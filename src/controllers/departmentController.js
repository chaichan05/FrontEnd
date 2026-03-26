const pool = require('../db');

// ── GET /departments ──────────────────────────────────────────
const getDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.id, d.name, COUNT(u.id) AS user_count
       FROM departments d
       LEFT JOIN users u ON d.id = u.department_id
       GROUP BY d.id, d.name
       ORDER BY d.name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[getDepartments]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── GET /departments/:id ──────────────────────────────────────
const getDepartmentById = async (req, res) => {
  try {
    const [[dept]] = await pool.query(
      `SELECT d.id, d.name, COUNT(u.id) AS user_count
       FROM departments d
       LEFT JOIN users u ON d.id = u.department_id
       WHERE d.id = ?
       GROUP BY d.id, d.name`,
      [req.params.id]
    );
    if (!dept)
      return res.status(404).json({ success: false, message: 'Department not found' });

    // ดึง users ของ department นี้ (INNER JOIN — เฉพาะคนที่อยู่ใน dept)
    const [users] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.age, u.gender, u.email, u.phone
       FROM users u
       INNER JOIN departments d ON u.department_id = d.id
       WHERE d.id = ?
       ORDER BY u.first_name ASC`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...dept, users } });
  } catch (err) {
    console.error('[getDepartmentById]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getDepartments, getDepartmentById };
