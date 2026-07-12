import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./configs/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import userRouter from "./routes/user.route";
import roleRouter from "./routes/role.route";
import vehicleRouter from "./routes/vehicle.route";

const app = express();

const origins = env.CORS_ORIGIN.split(",");
app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);

app.use(helmet());
app.use(cookieParser());

app.use(express.json());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(morgan("dev"));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/users", userRouter);
app.use("/api/v1/roles", roleRouter);
app.use("/api/v1/vehicles", vehicleRouter);

// error middleware
app.use(errorMiddleware);

export { app };
