import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/database.js";

let app: ReturnType<typeof createApp>;

async function initialize() {
  if (!app) {
    await connectDB();
    app = createApp();
  }

  return app;
}

export default async function handler(req: any, res: any) {
  const app = await initialize();
  return app(req, res);
}