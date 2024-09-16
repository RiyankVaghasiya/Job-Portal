import { Router } from "express";
import {
  applyJob,
  getApplicant,
  getAppliedJobs,
  updateStatus,
} from "../controllers/application.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//declaration of route
router.route("/applyjob/:id").get(verifyJWT, applyJob);
router.route("/get").get(verifyJWT, getAppliedJobs);
router.route("/:id/applicants").get(verifyJWT, isAdmin, getApplicant);
router.route("/status/:id/update").post(verifyJWT, isAdmin, updateStatus);
export default router;
