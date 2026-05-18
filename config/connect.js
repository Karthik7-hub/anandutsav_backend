import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(" MongoDB connected successfully.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log(" MongoDB disconnected.");
    });

    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is not defined. Please configure it in your environment or Vercel Project Settings.");
    }

    await mongoose.connect(`${process.env.MONGODB_URL}/anandutsav`);

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
