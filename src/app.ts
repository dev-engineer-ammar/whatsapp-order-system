import express from "express";
import cors from "cors";
import webhookRoutes from "./routes/webhook.routes";


export const createApp = () => {
  
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", webhookRoutes);


  return app;
};