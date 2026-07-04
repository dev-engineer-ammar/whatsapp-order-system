import dotenv from "dotenv";
dotenv.config();

import serverless from "serverless-http";
import app from "../src/app";
import { connectDB } from "../src/config/database";

// cache DB connection
let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// middleware
app.use(async (req, res, next) => {
  await ensureConnection();
  next();
});

// IMPORTANT: wrap express app
export const handler = serverless(app);

// default export for Vercel
export default handler;