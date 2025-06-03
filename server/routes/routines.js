const express = require('express');
const router  = express.Router();
const pool    = require('../db');

/* ---------- GET routines for a student ---------- */
router.get('/student/:studentId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM routines WHERE student_id = $1 ORDER BY start_time',
      [req.params.studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('[routines] GET /student/:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- CREATE routine ---------- */
router.post('/', async (req, res) => {
  const { student_id, subject, start_time, end_time, day_of_week } = req.body;
  if (!student_id || !subject || !start_time || !end_time)
    return res.status(400).json({ msg: 'Missing required fields' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO routines (student_id, subject, start_time, end_time, day_of_week)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [student_id, subject, start_time, end_time, day_of_week || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[routines] POST / -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- UPDATE routine ---------- */
router.put('/:id', async (req, res) => {
  const { subject, start_time, end_time, day_of_week } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE routines
       SET subject      = COALESCE($1, subject),
           start_time   = COALESCE($2, start_time),
           end_time     = COALESCE($3, end_time),
           day_of_week  = COALESCE($4, day_of_week)
       WHERE id = $5
       RETURNING *`,
      [subject, start_time, end_time, day_of_week, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ msg: 'Routine not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[routines] PUT /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- DELETE routine ---------- */
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM routines WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ msg: 'Routine not found' });
    res.json({ msg: 'Routine deleted' });
  } catch (err) {
    console.error('[routines] DELETE /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
