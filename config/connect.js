import mongoose from "mongoose";

// Disable command buffering globally so queries fail immediately if not connected,
// rather than hanging indefinitely and causing Vercel function timeouts.
mongoose.set('bufferCommands', false);

let cachedPromise = null;

const connectDB = async () => {
  // If we already have a successful connection, reuse it
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // If a connection is already in progress, wait for it
  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    throw new Error("MONGODB_URL environment variable is not defined. Please configure it in your Vercel Project Settings.");
  }

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
  };

  // Cache the connection promise to prevent multiple concurrent connections
  cachedPromise = mongoose.connect(`${mongoUri}/anandutsav`, options)
    .then((mongooseInstance) => {
      console.log(" MongoDB connected successfully.");
      return mongooseInstance.connection;
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err.message);
      cachedPromise = null; // Clear cache on failure so next request can retry
      throw err;
    });

  return cachedPromise;
};

// Listen to connection events once
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log(" MongoDB disconnected.");
});

export default connectDB;
