import dotenv from "dotenv";
import { createApp } from "./app";

const app = createApp();
dotenv.config();


import { connectDB } from "./config/database";

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();