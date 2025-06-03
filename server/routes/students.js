const express = require('express');
const router  = express.Router();
const pool    = require('../db');

/* ---------- GET all students ---------- */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('[students] GET / -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- GET one student ---------- */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ msg: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[students] GET /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- CREATE student ---------- */
router.post('/', async (req, res) => {
  const { name, email, grade, tutor_id } = req.body;
  if (!name || !email) return res.status(400).json({ msg: 'Name & email required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO students (name, email, grade, tutor_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, grade, tutor_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[students] POST / -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- UPDATE student ---------- */
router.put('/:id', async (req, res) => {
  const { name, email, grade, tutor_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE students
       SET name = COALESCE($1,name),
           email = COALESCE($2,email),
           grade = COALESCE($3,grade),
           tutor_id = COALESCE($4,tutor_id)
       WHERE id = $5
       RETURNING *`,
      [name, email, grade, tutor_id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ msg: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[students] PUT /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- DELETE student ---------- */
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM students WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ msg: 'Student not found' });
    res.json({ msg: 'Student deleted' });
  } catch (err) {
    console.error('[students] DELETE /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
