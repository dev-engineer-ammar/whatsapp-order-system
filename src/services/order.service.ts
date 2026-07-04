import { randomUUID } from "crypto";
import Order, {
  IOrder,
  OrderStatus,
  PaymentStatus,
} from "../models/order.model";
import whatsappService from "./whatsapp.service";

interface OrderItem {
  productId?: string;
  catalogId?: string;
  name: string;
  quantity: number;
  price: number;
}

interface CreateOrderDto {
  customerName: string;
  phone: string;
  items: OrderItem[];
  notes?: string;
  whatsappMessageId?: string;
}

class OrderService {
  /**
   * Generate Order Number
   * Example:
   * ORD-7B2C3F91
   */
  private generateOrderNumber(): string {
    return `ORD-${randomUUID().substring(0, 8).toUpperCase()}`;
  }

  /**
   * Calculate Order Total
   */
  private calculateTotal(items: OrderItem[]): number {
    return items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  /**
   * Create New Order
   */
  async createOrder(data: CreateOrderDto): Promise<IOrder> {
    const items = data.items.map((item) => ({
      ...item,
      subtotal: item.price * item.quantity,
    }));

    const total = this.calculateTotal(data.items);

    const order = await Order.create({
      orderNumber: this.generateOrderNumber(),

      customer: {
        name: data.customerName,
        phone: data.phone,
      },

      items,

      total,

      notes: data.notes,

      whatsappMessageId: data.whatsappMessageId,

      status: OrderStatus.Pending,

      paymentStatus: PaymentStatus.Unpaid,
    });

    // Send confirmation message to customer
    try {
      await whatsappService.sendOrderConfirmation(
        data.phone,
        order
      );
    } catch (error) {
      console.error(
        "Failed to send WhatsApp confirmation:",
        error
      );
    }

    return order;
  }

  /**
   * Get All Orders
   */
  async getOrders(): Promise<IOrder[]> {
    return Order.find().sort({
      createdAt: -1,
    });
  }

  /**
   * Get Order By Mongo ID
   */
  async getOrderById(id: string): Promise<IOrder | null> {
    return Order.findById(id);
  }

  /**
   * Get Order By Order Number
   */
  async getOrderByNumber(orderNumber: string) {
    return Order.findOne({
      orderNumber,
    });
  }

  /**
   * Get Orders By Phone Number
   */
  async getOrdersByPhone(phone: string) {
    return Order.find({
      "customer.phone": phone,
    }).sort({
      createdAt: -1,
    });
  }

  /**
   * Update Order Status
   */
  async updateStatus(id: string, status: OrderStatus) {
    return Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  /**
   * Update Payment Status
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus
  ) {
    return Order.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );
  }

  /**
   * Delete Order
   */
  async deleteOrder(id: string) {
    return Order.findByIdAndDelete(id);
  }

  /**
   * Dashboard Statistics
   */
  async dashboard() {
    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      status: OrderStatus.Pending,
    });

    const confirmedOrders = await Order.countDocuments({
      status: OrderStatus.Confirmed,
    });

    const deliveredOrders = await Order.countDocuments({
      status: OrderStatus.Delivered,
    });

    const revenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: PaymentStatus.Paid,
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$total",
          },
        },
      },
    ]);

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      totalRevenue: revenue[0]?.revenue || 0,
    };
  }

  /**
   * Recent Orders
   */
  async recentOrders(limit = 10) {
    return Order.find()
      .sort({
        createdAt: -1,
      })
      .limit(limit);
  }

  /**
   * Cancel Order
   */
  async cancelOrder(id: string) {
    return Order.findByIdAndUpdate(
      id,
      {
        status: OrderStatus.Cancelled,
      },
      {
        new: true,
      }
    );
  }
}

export default new OrderService();