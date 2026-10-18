const BloodStock = require('../models/BloodStock');
const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');

// @desc    Get dashboard analytics metrics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin / Hospital)
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const stocks = await BloodStock.find().sort({ bloodGroup: 1 });
    const totalUnits = stocks.reduce((acc, curr) => acc + curr.units, 0);

    const totalDonors = await Donor.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' });
    const criticalRequests = await BloodRequest.countDocuments({
      status: 'Pending',
      urgency: { $in: ['Urgent', 'Critical'] },
    });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'Fulfilled' });

    const recentDonations = await Donation.find().sort({ donationDate: -1 }).limit(5);
    const recentRequests = await BloodRequest.find().sort({ createdAt: -1 }).limit(5);

    // Blood stock breakdown for chart
    const inventoryData = stocks.map((item) => ({
      group: item.bloodGroup,
      units: item.units,
      threshold: item.minimumThreshold,
      isLow: item.units <= item.minimumThreshold,
    }));

    res.status(200).json({
      success: true,
      metrics: {
        totalUnits,
        totalDonors,
        pendingRequests,
        criticalRequests,
        fulfilledRequests,
      },
      inventoryData,
      recentDonations,
      recentRequests,
    });
  } catch (error) {
    next(error);
  }
};
