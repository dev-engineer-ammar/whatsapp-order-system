import axios, { AxiosInstance } from "axios";

class WhatsAppService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || "v23.0"}/${process.env.WHATSAPP_PHONE_NUMBER_ID}`,
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Send Text Message
   */
  async sendTextMessage(
    to: string,
    message: string
  ) {
    try {
      const { data } = await this.client.post("/messages", {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      });

      return data;
    } catch (error: any) {
      console.error(
        "WhatsApp Error:",
        error.response?.data || error.message
      );

      throw error;
    }
  }

  /**
   * Mark Message As Read
   */
  async markAsRead(messageId: string) {
    try {
      await this.client.post("/messages", {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      });
    } catch (error: any) {
      console.error(
        "Mark Read Error:",
        error.response?.data || error.message
      );
    }
  }

  /**
   * Send Order Confirmation
   */
  async sendOrderConfirmation(
    phone: string,
    order: any
  ) {
    const items = order.items
      .map(
        (item: any) =>
          `• ${item.name} × ${item.quantity} = Rs ${item.subtotal}`
      )
      .join("\n");

    const message = `✅ Order Confirmed

Order Number: ${order.orderNumber}

${items}

-----------------------

Total: Rs ${order.total}

Status: ${order.status}

Thank you for your order ❤️`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Send Order Status Update
   */
  async sendOrderStatus(
    phone: string,
    orderNumber: string,
    status: string
  ) {
    return this.sendTextMessage(
      phone,
      `📦 Your order ${orderNumber} is now ${status}.`
    );
  }

  /**
   * Send Custom Message
   */
  async sendCustomMessage(
    phone: string,
    message: string
  ) {
    return this.sendTextMessage(phone, message);
  }
}

export default new WhatsAppService();