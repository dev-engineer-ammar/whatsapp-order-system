import mongoose from "mongoose";

let cachedConnection: typeof mongoose | null = null;
let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    if (cachedConnection) {
      return cachedConnection;
    }

    if (!cachedPromise) {
      cachedPromise = mongoose.connect(process.env.MONGODB_URI!);
    }

    cachedConnection = await cachedPromise;

    console.log("MongoDB Connected");

    return cachedConnection;
  } catch (error) {
    console.log(error);

    cachedPromise = null;
    throw error;
  }
};
