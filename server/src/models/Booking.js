import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    packageSlug: { type: String, required: true, index: true },
    packageTitle: String,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    travelDate: Date,
    travellers: { type: Number, default: 1, min: 1 },
    message: String,
    status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
  },
  { timestamps: true }
)

export default mongoose.model('Booking', bookingSchema)
