import { Router } from "express";
import {
  getSubscribers,
  getSubscriptions,
  toggleSubscription
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
.route("/channel/:channel_id")
.get(getSubscribers)
.post(toggleSubscription);

router
.route("/subscribe/:user_id")
.get(getSubscriptions);

export default router;