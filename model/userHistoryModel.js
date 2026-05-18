import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const visitSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
  category: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const userHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  searches: [searchSchema],
  visits: [visitSchema],
  // Track booked providers for collaborative filtering
  bookings: [{
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Note: To keep arrays capped, use $push with $slice in the update queries

const UserHistory = mongoose.model('UserHistory', userHistorySchema);
export default UserHistory;
