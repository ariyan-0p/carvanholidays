import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema(
  {
    type: { type: String, default: 'Holidays', enum: ['Holidays', 'Flights', 'Hotels', 'Visa'], index: true },
    from: String,
    destination: String,
    travelDate: Date,
    travellers: String,
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: String,
    source: { type: String, default: 'homepage-search' },
    status: { type: String, default: 'new', enum: ['new', 'contacted', 'closed'], index: true },
  },
  { timestamps: true }
)

export default mongoose.model('Enquiry', enquirySchema)
