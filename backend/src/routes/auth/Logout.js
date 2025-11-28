import express from "express";
import LogoutController from "../../controllers/auth/LogoutController";
const router = express.Router();

router.post('/', LogoutController);

export default router;