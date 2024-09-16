import { Router } from "express";
import {
  registerCompany,
  getCompany,
  getCompanyById,
  updateCompanyinfo,
} from "../controllers/company.controller.js";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

//declaration of route
router.route("/register").post(verifyJWT, isAdmin, registerCompany);
router.route("/get").get(verifyJWT, isAdmin, getCompany);
router.route("/get/:id").get(verifyJWT, isAdmin, getCompanyById);
router.route("/update/:id").post(verifyJWT, isAdmin, updateCompanyinfo);

export default router;
