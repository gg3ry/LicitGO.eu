import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler, LogError } from './Middlewares/general/Error.js';
import logger from './Middlewares/Logger.js';
import settingsRoutes from './Routes/settings.js';
import authRoutes from './Routes/Auth.js';
import configs from './Configs/configs.js';
import setup from './Database/setupDB.js';

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(logger);
const PORT = configs.server.port


app.use('/', authRoutes);
app.use('/settings', settingsRoutes);

app.use(LogError);
app.use(errorHandler);
app.listen(PORT, async () => {
    await setup();
    console.log(`Server started on port ${PORT}`);
});