const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const pool = require('./db');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API running!'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
