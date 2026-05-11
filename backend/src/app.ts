import express, { NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { Request, Response } from "express";
import path from "path";
import { limiter } from "./middlewares/rateLimiter";
import routes from "./routes/v1/web";
import cookieParser from "cookie-parser";
import i18next from "i18next";
import middleware from "i18next-http-middleware";

export const app = express();

var whiteList = ["http://localhost:5173", "ws://localhost:8080"];
var corsOptions = {
  origin: function (
    origin: any,
    callback: (err: Error | null, origin?: any) => void,
  ) {
    if (!origin) return callback(null, true);
    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(compression());
app.use(limiter);
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);
app.use(routes);
app.use(middleware.handle(i18next));

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  const errorCode = error.code || "Error_Code";
  res.status(status).json({
    message,
    error: errorCode,
  });
});
