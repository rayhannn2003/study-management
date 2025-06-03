const express = require('express');
const router  = express.Router();
const pool    = require('../db');

/* ---------- GET progress for a student ---------- */
router.get('/student/:studentId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM progress WHERE student_id = $1 ORDER BY updated_at DESC',
      [req.params.studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('[progress] GET /student/:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- CREATE progress entry ---------- */
router.post('/', async (req, res) => {
  const { student_id, task, status } = req.body;
  if (!student_id || !task) return res.status(400).json({ msg: 'Missing required fields' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO progress (student_id, task, status)
       VALUES ($1, $2, $3) RETURNING *`,
      [student_id, task, status || 'pending']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[progress] POST / -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- UPDATE progress ---------- */
router.put('/:id', async (req, res) => {
  const { task, status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE progress
       SET task   = COALESCE($1, task),
           status = COALESCE($2, status),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [task, status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ msg: 'Progress entry not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[progress] PUT /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- DELETE progress ---------- */
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM progress WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ msg: 'Progress entry not found' });
    res.json({ msg: 'Progress entry deleted' });
  } catch (err) {
    console.error('[progress] DELETE /:id -', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
