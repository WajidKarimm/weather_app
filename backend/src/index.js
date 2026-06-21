import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import weatherRoutes from './routes/weather.js';
import exportRoutes from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);
app.use('/api/export', exportRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Weather API running on http://localhost:${PORT}`);
});
