import { Schema, model, Document } from "mongoose";

export enum OrderStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Preparing = "Preparing",
  Ready = "Ready",
  OutForDelivery = "OutForDelivery",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export enum PaymentStatus {
  Unpaid = "Unpaid",
  Paid = "Paid",
  Refunded = "Refunded",
}

export interface IOrderItem {
  productId?: string;
  catalogId?: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ICustomerInfo {
  name: string;
  phone: string;
}

export interface IOrder extends Document {
  orderNumber: string;

  customer: ICustomerInfo;

  items: IOrderItem[];

  total: number;

  status: OrderStatus;

  paymentStatus: PaymentStatus;

  whatsappMessageId?: string;

  notes?: string;

  createdAt: Date;

  updatedAt: Date;
}

const itemSchema = new Schema<IOrderItem>(
  {
    productId: String,

    catalogId: String,

    name: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const customerSchema = new Schema<ICustomerInfo>(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    //   index: true,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: customerSchema,

    items: [itemSchema],

    total: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Unpaid,
    },

    whatsappMessageId: String,

    notes: String,
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "customer.phone": 1 });

export default model<IOrder>("Order", orderSchema);