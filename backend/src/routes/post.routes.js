import { Router } from "express";

const router = Router();

router.route("/post").get((req, res) => {
  res.send("route is working");
});

export default router;
