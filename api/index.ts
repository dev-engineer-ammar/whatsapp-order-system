import serverless from "serverless-http";
import app from "../src/app";
import { connectDB } from "../src/config/database";

// Cache the DB connection across warm invocations
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

async function ensureDbConnection() {
  if (!isConnected) {
    if (!connectionPromise) {
      connectionPromise = connectDB().then(() => {
        isConnected = true;
        console.log("MongoDB connected (cached)");
      });
    }
    await connectionPromise;
  }
}

// Pre-warm the connection (fire-and-forget, will be ready by first request)
ensureDbConnection();

// Wrap Express app for serverless
const handler = serverless(app);

export { handler };
export default handler;
