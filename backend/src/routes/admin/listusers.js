import express from 'express';
import ListusersController from '../../controllers/admin/listusersController.js';

const router = express.Router();

router.get('/', ListusersController);
export default router;