import express from "express";
import RegisterController from "../../controllers/auth/RegisterController.js";

const router = express.Router();

router.post('/', RegisterController);
export default router;