const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    donorName: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    units: {
      type: Number,
      default: 1,
      min: 1,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    },
    hemoglobinLevel: {
      type: Number, // g/dL
      default: 13.5,
    },
    bloodPressure: {
      type: String, // e.g. "120/80"
      default: '120/80',
    },
    status: {
      type: String,
      enum: ['Completed', 'Tested & Verified', 'Discarded'],
      default: 'Completed',
    },
    notes: {
      type: String,
      default: '',
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
