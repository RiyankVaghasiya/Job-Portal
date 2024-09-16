import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//import routes
import UserRouter from "./routes/user.routes.js";
import CompanyRouter from "./routes/company.routes.js";
import jobRouter from "./routes/job.routes.js";
import ApplicationRouter from "./routes/application.routes.js";

//declaration of routes
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/company", CompanyRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", ApplicationRouter);

export { app };
