import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true }, 
  Otp: { type: String, default: '' },
  OtpExpireAt: { type: Number, default: 0 }, 
  fullName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  phone: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  locationCoordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  previousBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  
  // For Recommendations
  preferredCategories: [{ type: String }],
  preferredTags: [{ type: String }],
  preferredEventTypes: [{ type: String }]
}, { timestamps: true });

userSchema.index({ locationCoordinates: '2dsphere' });

const user = mongoose.model("User", userSchema);    
export default user;