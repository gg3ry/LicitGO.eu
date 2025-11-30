import express from "express";
import CreateAuctionController from "../../controllers/user/CreateAuctionController";

const router = express.Router();

router.post('/', CreateAuctionController);

export default router;