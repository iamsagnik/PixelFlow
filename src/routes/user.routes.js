import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.get('/test', (req, res) => {
  res.send("GET working ✅");
});


export default router;