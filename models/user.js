import mongoose from 'mongoose';

const User = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'user',
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', User);
