import { Request, Response } from "express";
import orderService from "../services/order.service";
import whatsappService from "../services/whatsapp.service";

class WebhookController {
  /**
   * GET /webhook
   * Verify Meta Webhook
   */
  verifyWebhook(req: Request, res: Response) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
      mode === "subscribe" &&
      token === process.env.VERIFY_TOKEN
    ) {
      console.log("Webhook verified.");

      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  /**
   * POST /webhook
   */
  receiveWebhook = async (
    req: Request,
    res: Response
  ) => {
    try {
      const body = req.body;

      if (!body.entry) {
        return res.sendStatus(200);
      }

      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;

          if (!value.messages) continue;

          for (const message of value.messages) {
            // Mark incoming message as read
            await whatsappService.markAsRead(message.id);

            console.log(
              "Incoming Message:",
              JSON.stringify(message, null, 2)
            );

            /**
             * ORDER MESSAGE
             */
            if (message.type === "order") {
              const items =
                message.order.product_items.map(
                  (item: any) => ({
                    catalogId: item.product_retailer_id,
                    name:
                      item.product_retailer_id,
                    quantity: Number(item.quantity),
                    price: Number(item.item_price || 0),
                  })
                );

              await orderService.createOrder({
                customerName:
                  value.contacts?.[0]?.profile?.name ||
                  "Customer",

                phone: message.from,

                whatsappMessageId: message.id,

                items,
              });

              console.log("Order saved.");
            }

            /**
             * TEXT MESSAGE
             */
            if (message.type === "text") {
              console.log(
                "Customer says:",
                message.text.body
              );
            }
          }
        }
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error(error);

      return res.sendStatus(500);
    }
  };
}

export default new WebhookController();