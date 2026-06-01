import mongoose from 'mongoose'

const heroSlideSchema = new mongoose.Schema(
  {
    kind:        { type: String, enum: ['image', 'video'], default: 'image' },
    mediaUrl:    { type: String, required: true, trim: true },
    posterUrl:   { type: String, default: '', trim: true }, // poster for video, used as fallback bg before video loads
    label:       { type: String, default: '', trim: true },
    destination: { type: String, default: '', trim: true },
    subtitle:    { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    price:       { type: String, default: '', trim: true },
    duration:    { type: String, default: '', trim: true },
    slug:        { type: String, default: '', trim: true }, // for "Explore" CTA -> /packages/:slug
    ctaText:     { type: String, default: 'Explore', trim: true },
    cards:       { type: [String], default: [] }, // up to 3 side images
    // How to fit the background image/video inside the hero box.
    //   'cover'   = fill the area (may crop) — best for 1920x1080 (16:9) media
    //   'contain' = show the entire image (letterbox) — best for non-16:9 media
    fitMode:     { type: String, enum: ['cover', 'contain'], default: 'cover' },
    // CSS background-position value, e.g. 'center', 'top', '50% 30%'
    focusPoint:  { type: String, default: 'center', trim: true },
    // Dark teal gradient placed over the media for text contrast. Turn off
    // for slides where the image is already well-composed and shouldn't be
    // darkened (e.g. a hero already designed with text/branding baked in).
    showOverlay: { type: Boolean, default: true },
    order:       { type: Number, default: 0, index: true },
    active:      { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.model('HeroSlide', heroSlideSchema)
