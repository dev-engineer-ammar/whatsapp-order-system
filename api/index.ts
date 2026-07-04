import serverless from "serverless-http";
import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/database.js";

const app = createApp();
const serverlessHandler = serverless(app);

let dbReady: Promise<unknown> | null = null;

async function initialize() {
  if (!dbReady) {
    dbReady = connectDB().catch((error) => {
      dbReady = null;
      throw error;
    });
  }

  return dbReady;
}

export default async function handler(req: any, res: any) {
  await initialize();
  return serverlessHandler(req, res);
}
