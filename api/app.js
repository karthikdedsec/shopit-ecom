import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import productRoute from "./routes/product.route.js";
import orderRoute from "./routes/order.route.js";
import authRoute from "./routes/auth.route.js";
import paymentRoute from "./routes/payment.route.js";

import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/error.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down server due to uncaughtexception");
  process.exit(1);
});

if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "api/config/config.env" });
}

//connect to db
connectDatabase();

const app = express();

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(cookieParser());
app.use("/api/v1", productRoute);
app.use("/api/v1", authRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", paymentRoute);

if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });
}

//using middleware

app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
  console.log(
    `server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

//handle unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down server due to unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
