import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema({
  name: { type: String, required: true},
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  phone: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password:{ type:String, required:true,},
  verifyOtp:{ type:String, default:'',},
  verifyOtpExpireAt:{ type:Number, default:0,},

  // Location Tracking & Service Area System
  exactLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  serviceAreas: [{
    city: String,
    workingRadiusKm: Number
  }],
  
  categories: [{ type: String }],
  tags: [{ type: String }],
  eventTypes: [{
    type: String,
    enum: ['wedding', 'birthday', 'engagement', 'corporate', 'festival']
  }],
  pricingRanges: {
    min: Number,
    max: Number
  },

  // Performance / Recommendation
  averageRating: { type: Number, default: 0 },
  popularityScore: { type: Number, default: 0 },

  // images for previousProjects
  previousProjects: [{
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String }
  }],

  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],

  newBookings:[{type:mongoose.Schema.Types.ObjectId,ref:"Booking"}], // which are to be accepted
  upComingBookings:[{type:mongoose.Schema.Types.ObjectId,ref:"Booking"}], // which are accepted but not completed
  completedBookings:[{type:mongoose.Schema.Types.ObjectId,ref:"Booking"}] // which are completed

}, { timestamps: true });

serviceProviderSchema.index({ exactLocation: '2dsphere' });
serviceProviderSchema.index({ categories: 1 });
serviceProviderSchema.index({ tags: 1 });
serviceProviderSchema.index({ averageRating: -1 });
serviceProviderSchema.index({ popularityScore: -1 });

const ServiceProvider = mongoose.model("ServiceProvider", serviceProviderSchema);
export default ServiceProvider;
