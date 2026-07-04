import dotenv from "dotenv";

dotenv.config();

import app from "../src/app";
import { connectDB } from "../src/config/database";

// Cache the database connection across serverless invocations
let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Connect to DB before handling requests
app.use(async (_req, _res, next) => {
  await ensureConnection();
  next();
});

export default app;
