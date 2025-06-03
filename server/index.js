const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const pool    = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ---- route registrations ----
app.use('/api/students', require('./routes/students'));
app.use('/api/tutors',   require('./routes/tutors'));
app.use('/api/routines', require('./routes/routines'));
app.use('/api/progress', require('./routes/progress'));

app.get('/', (_req, res) => res.send('API running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
