const BloodRequest = require('../models/BloodRequest');
const BloodStock = require('../models/BloodStock');

// @desc    Create a new blood request (Hospital / Patient)
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res, next) => {
  try {
    const {
      hospitalName,
      patientName,
      bloodGroup,
      unitsRequested,
      urgency = 'Normal',
      reason,
      contactPhone,
    } = req.body;

    if (!bloodGroup || !unitsRequested || !patientName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patientName, bloodGroup, unitsRequested, and contactPhone',
      });
    }

    const request = await BloodRequest.create({
      requester: req.user.id,
      requesterName: req.user.name,
      hospitalName: hospitalName || req.user.organizationName || 'General Hospital',
      patientName,
      bloodGroup,
      unitsRequested: Number(unitsRequested),
      urgency,
      reason,
      contactPhone,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully and is pending review',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests (Admin sees all; Hospital sees own)
// @route   GET /api/requests
// @access  Private
exports.getRequests = async (req, res, next) => {
  try {
    const { status, urgency, bloodGroup } = req.query;
    let query = {};

    // Role-based visibility
    if (req.user.role !== 'admin') {
      query.requester = req.user.id;
    }

    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(query).sort({
      urgency: -1, // prioritize critical
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (Approve, Reject, Fulfill)
// @route   PUT /api/requests/:id/status
// @access  Private (Admin only)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const { id } = req.params;

    const request = await BloodRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    const previousStatus = request.status;

    // Logic when approving a request
    if (status === 'Approved' && previousStatus !== 'Approved') {
      const stock = await BloodStock.findOne({ bloodGroup: request.bloodGroup });
      if (!stock || stock.units < request.unitsRequested) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Requested: ${request.unitsRequested} units of ${request.bloodGroup}, but only ${stock ? stock.units : 0} units are currently available.`,
        });
      }

      // Deduct stock
      stock.units -= request.unitsRequested;
      stock.lastUpdatedBy = req.user.id;
      await stock.save();
    }

    // Logic if an approved request is rejected/cancelled: restore stock
    if (previousStatus === 'Approved' && (status === 'Rejected' || status === 'Pending')) {
      const stock = await BloodStock.findOne({ bloodGroup: request.bloodGroup });
      if (stock) {
        stock.units += request.unitsRequested;
        await stock.save();
      }
    }

    request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    request.processedBy = req.user.id;
    request.processedAt = new Date();

    await request.save();

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      request,
    });
  } catch (error) {
    next(error);
  }
};
