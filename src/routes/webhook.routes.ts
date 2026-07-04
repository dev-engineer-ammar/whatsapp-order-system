import { Router } from "express";
import webhookController from "../controllers/webhook.controller";

const router = Router();

router.get(
  "/webhook",
  webhookController.verifyWebhook
);

router.post(
  "/webhook",
  webhookController.receiveWebhook
);

export default router;