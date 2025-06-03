const express = require('express');
const router  = express.Router();
const pool    = require('../db');

/* ---------- GET all tutors ---------- */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tutors ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('[tutors] GET / -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- GET one tutor ---------- */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tutors WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ msg: 'Tutor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[tutors] GET /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- CREATE tutor ---------- */
router.post('/', async (req, res) => {
  const { name, subject, email } = req.body;
  if (!name || !email) return res.status(400).json({ msg: 'Name & email required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO tutors (name, subject, email)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, subject || null, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[tutors] POST / -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- UPDATE tutor ---------- */
router.put('/:id', async (req, res) => {
  const { name, subject, email } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE tutors
       SET name    = COALESCE($1,name),
           subject = COALESCE($2,subject),
           email   = COALESCE($3,email)
       WHERE id = $4
       RETURNING *`,
      [name, subject, email, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ msg: 'Tutor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[tutors] PUT /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- DELETE tutor ---------- */
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM tutors WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ msg: 'Tutor not found' });
    res.json({ msg: 'Tutor deleted' });
  } catch (err) {
    console.error('[tutors] DELETE /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
