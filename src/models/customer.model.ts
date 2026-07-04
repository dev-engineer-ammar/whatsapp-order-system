import { Schema, model, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  phone: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    //   index: true,
    },
    address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default model<ICustomer>("Customer", customerSchema);