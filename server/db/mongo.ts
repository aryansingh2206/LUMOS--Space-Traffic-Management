import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to your .env file.");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    // You can add options here if needed
  });

  isConnected = true;
  console.log("[mongo] Connected");
}

export function disconnectMongo() {
  return mongoose.disconnect();
}
