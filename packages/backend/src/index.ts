import 'dotenv/config';
import cors from 'cors';
import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'FoodDealSniper API is online' });
});

app.listen(port, () => {
  console.log(`✅ FoodDealSniper API listening on http://localhost:${port}`);
});
