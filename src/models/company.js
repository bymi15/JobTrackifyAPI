import mongoose from 'mongoose';

const Company = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter the company name'],
    },
    logoUrl: String,
    description: String,
    website: String,
    headquarters: String,
    industry: String,
    foundedYear: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Company', Company);
