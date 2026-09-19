require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const validationRoutes = require('./routes/validations');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/validations', validationRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Validata API listening on :${port}`));
