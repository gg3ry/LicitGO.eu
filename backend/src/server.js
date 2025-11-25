import express from 'express';
import cors from 'cors';
import HandleError from './middleware/ErrorHandle.js';
import RegisterRouter from './route/Register.js';
import RegisterMiddleware from './middleware/RegisterHandle.js';
import handleStatus from './lang/HandleStatus.js';

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

app.use('/register', RegisterMiddleware, RegisterRouter);

















app.use((req, res, next) => {
  let lang = req.headers['accept-language'] || 'EN';
  if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
    lang = 'EN';
  }
  res.status(404).json({ error: handleStatus('404', lang) });
});
app.use(HandleError);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});