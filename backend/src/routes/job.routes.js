import { Router } from "express";
import {
  postjob,
  getalljobs,
  getJobById,
  getAdminJob,
} from "../controllers/job.controller.js";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

//declaration of route
router.route("/post").post(verifyJWT, isAdmin, postjob);
router.route("/get").get(verifyJWT, getalljobs);
router.route("/getadminjobs").get(verifyJWT, isAdmin, getAdminJob);
router.route("/get/:id").get(verifyJWT, getJobById);

export default router;
