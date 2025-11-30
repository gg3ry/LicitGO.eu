import SuspendBanController from "../../controllers/admin/SuspendBanController";
import express from 'express';

const router = express.Router();

router.post('/', SuspendBanController);

export default router;