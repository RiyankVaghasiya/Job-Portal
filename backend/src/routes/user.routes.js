import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateprofile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//declaration of route
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile/update").post(verifyJWT, updateprofile);

export default router;
