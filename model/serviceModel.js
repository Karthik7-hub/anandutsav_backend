import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },

  images: [{
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  }],

  categories: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },

  providers: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider' },

  priceInfo: {
    amount: { type: Number, required: true },
    unit: { type: String, default: 'per event' },
  },
  avgRating:{
    type:Number,
    default:0
  },
  reviewCount: {
      type: Number,
      default: 0,
    },
  mindaysprior:{
    type:Number,
    default:0
  },

 currentBookingDates: {
  type: [Date],
  default: [],
},

  maxPeople:{
    type:Number,
    default:0
  },
  minPeople:{
    type:Number,
    default:0
  },
  exactLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  }

}, { timestamps: true });

serviceSchema.index({ exactLocation: '2dsphere' });

const Service = mongoose.model('Service', serviceSchema);
export default Service;