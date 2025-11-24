import express from 'express';
import cors from 'cors';
import HandleError from './src/middleware/HandleError.js';

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());





app.use(HandleError);
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});