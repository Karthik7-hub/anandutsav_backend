import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import http from 'http';
import cron from 'node-cron';
import cookieParser from 'cookie-parser';

// Database & Socket Config
import connectDB from './config/connect.js';
import { initSocket } from './config/socket.js';

// Controllers & Cron Jobs
import { autoMoveCompletedBookings } from './controller/booking.js';

// Route Modules
import router from './routes/authRoutes.js';
import pRouter from './routes/authProviderRoutes.js';
import aRouter from './routes/serviceProviderRoutes.js';
import cRouter from './routes/categoryRoutes.js';
import uRouter from './routes/userRoutes.js';
import mRouter from './routes/messageRoutes.js';
import coRouter from './routes/conversationRoutes.js';
import rRouter from './routes/reviewRoutes.js';
import bRouter from './routes/bookingRoutes.js';
import recommendationRouter from './routes/recommendationRoutes.js';
import contactRouter from './routes/contactRoutes.js';

// --- INITIALIZE EXPRESS APP ---
const app = express();
const PORT = process.env.PORT || 4000;

// --- CREATE HTTP SERVER FOR EXPRESS & SOCKET.IO ---
const server = http.createServer(app);

// --- CRON JOBS ---
cron.schedule("0 0 * * *", () => {
  autoMoveCompletedBookings();
});

// --- CORS & BODY PARSER MIDDLEWARE ---
const allowedOrigins = [
    'http://localhost:5173',           // local React dev
    'https://anand-utsav.vercel.app'     // production frontend
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- DATABASE CONNECTION MIDDLEWARE ---
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error.message);
    res.status(500).json({
      success: false,
      message: "Database connection error. Please try again later.",
      error: error.message
    });
  }
});

// --- API ROUTES ---
app.use('/auth', router);
app.use('/provider/auth', pRouter);
app.use('/provider', aRouter);
app.use('/category', cRouter);
app.use('/user', uRouter);
app.use('/message', mRouter);
app.use('/convo', coRouter);
app.use('/review', rRouter);
app.use('/booking', bRouter);
app.use('/recommendation', recommendationRouter);
app.use('/contact', contactRouter);

// --- INITIALIZE SOCKET.IO ---
initSocket(server, allowedOrigins);

// --- START SERVER ---
server.listen(PORT, () => {
    console.log("Server Started at PORT", PORT);
});
