import express from 'express';

import RegisterController from '../controllers/auth/Register.js';
import RegisterMiddleware from '../middlewares/auth/Register.js';

import LoginController from '../controllers/auth/Login.js';
import LoginMiddleware from '../middlewares/auth/Login.js';

import Logout from '../controllers/auth/Logout.js';

const router = express.Router();

router.post('/register', RegisterMiddleware, RegisterController);

router.post('/login', LoginMiddleware, LoginController);

router.post('/logout', Logout);


export default router;