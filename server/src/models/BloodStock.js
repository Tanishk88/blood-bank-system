const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      unique: true,
    },
    units: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minimumThreshold: {
      type: Number,
      default: 10,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodStock', bloodStockSchema);
