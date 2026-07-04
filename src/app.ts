import express from "express";
import cors from "cors";
import webhookRoutes from "./routes/webhook.routes";


export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).send("WhatsApp webhook is running");
  });

  app.use("/", webhookRoutes);

  return app;
};
