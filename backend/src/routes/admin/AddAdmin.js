import express from 'express';
import AddAdminController from '../../controllers/admin/AddAdminController.js';

const router = express.Router();

router.post('/', AddAdminController);
export default router;