const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const BloodStock = require('../models/BloodStock');

// @desc    Get all donors with optional search & filter
// @route   GET /api/donors
// @access  Private (Admin / Hospital)
exports.getDonors = async (req, res, next) => {
  try {
    const { bloodGroup, status, search } = req.query;
    let query = {};

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const donors = await Donor.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: donors.length,
      donors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donor details
// @route   GET /api/donors/:id
// @access  Private
exports.getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const donations = await Donation.find({ donor: donor._id }).sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      donor,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new donor
// @route   POST /api/donors
// @access  Private
exports.createDonor = async (req, res, next) => {
  try {
    const { name, email, phone, bloodGroup, age, gender, weight, address, city } = req.body;

    if (age < 18 || age > 65) {
      return res.status(400).json({ success: false, message: 'Donor must be between 18 and 65 years old.' });
    }

    if (weight && weight < 45) {
      return res.status(400).json({ success: false, message: 'Donor weight must be at least 45 kg to be eligible.' });
    }

    const donor = await Donor.create({
      name,
      email,
      phone,
      bloodGroup,
      age,
      gender: gender || 'Male',
      weight: weight || 55,
      address,
      city,
    });

    res.status(201).json({
      success: true,
      message: 'Donor registered successfully',
      donor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a blood donation & increment stock
// @route   POST /api/donors/:id/donate
// @access  Private (Admin)
exports.recordDonation = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Check if donor donated recently (within 56 days / 8 weeks standard rule)
    if (donor.lastDonationDate) {
      const daysSinceLast = (new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceLast < 56) {
        return res.status(400).json({
          success: false,
          message: `Donor is deferred. Only ${Math.round(daysSinceLast)} days have passed since last donation (minimum 56 days required).`,
        });
      }
    }

    const { units = 1, hemoglobinLevel = 13.5, bloodPressure = '120/80', notes = '' } = req.body;

    // Create donation record
    const donation = await Donation.create({
      donor: donor._id,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      units: Number(units),
      donationDate: new Date(),
      hemoglobinLevel,
      bloodPressure,
      status: 'Completed',
      notes,
      handledBy: req.user ? req.user.id : null,
    });

    // Update donor records
    donor.lastDonationDate = new Date();
    donor.totalDonations += Number(units);
    await donor.save();

    // Increment inventory stock
    let stock = await BloodStock.findOne({ bloodGroup: donor.bloodGroup });
    if (!stock) {
      stock = new BloodStock({ bloodGroup: donor.bloodGroup, units: 0, minimumThreshold: 10 });
    }
    stock.units += Number(units);
    stock.lastUpdatedBy = req.user ? req.user.id : null;
    await stock.save();

    res.status(201).json({
      success: true,
      message: `Successfully logged donation of ${units} unit(s) of ${donor.bloodGroup}. Inventory updated.`,
      donation,
      currentStock: stock.units,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donation history records
// @route   GET /api/donors/donations/all
// @access  Private
exports.getAllDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find().sort({ donationDate: -1 }).limit(100);
    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};
