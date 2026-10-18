const BloodStock = require('../models/BloodStock');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Compatibility matrix for educational and system verification
const COMPATIBILITY_RULES = {
  'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
  'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O+', 'O-'] },
  'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }, // Universal recipient
  'A-': { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
  'O-': { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] }, // Universal donor
  'B-': { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
  'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'] },
};

// Ensure all 8 blood groups exist in DB
const ensureStockInitialized = async () => {
  for (const group of BLOOD_GROUPS) {
    const exists = await BloodStock.findOne({ bloodGroup: group });
    if (!exists) {
      await BloodStock.create({
        bloodGroup: group,
        units: 15, // initial default sample stock
        minimumThreshold: 10,
      });
    }
  }
};

// @desc    Get all blood inventory units & summary
// @route   GET /api/inventory
// @access  Public (or Protected)
exports.getInventory = async (req, res, next) => {
  try {
    await ensureStockInitialized();
    const stocks = await BloodStock.find().sort({ bloodGroup: 1 });

    const totalUnits = stocks.reduce((acc, curr) => acc + curr.units, 0);
    const lowStockAlerts = stocks.filter((s) => s.units <= s.minimumThreshold);

    res.status(200).json({
      success: true,
      totalUnits,
      lowStockCount: lowStockAlerts.length,
      stocks,
      lowStockAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update units for a specific blood group
// @route   PUT /api/inventory/:bloodGroup
// @access  Private (Admin only)
exports.updateStock = async (req, res, next) => {
  try {
    const { bloodGroup } = req.params;
    const { units, change, minimumThreshold } = req.body;

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: 'Invalid blood group specified' });
    }

    let stock = await BloodStock.findOne({ bloodGroup });
    if (!stock) {
      stock = new BloodStock({ bloodGroup, units: 0, minimumThreshold: 10 });
    }

    if (units !== undefined) {
      stock.units = Math.max(0, Number(units));
    } else if (change !== undefined) {
      stock.units = Math.max(0, stock.units + Number(change));
    }

    if (minimumThreshold !== undefined) {
      stock.minimumThreshold = Math.max(1, Number(minimumThreshold));
    }

    stock.lastUpdatedBy = req.user ? req.user.id : null;
    await stock.save();

    res.status(200).json({
      success: true,
      message: `Stock updated for ${bloodGroup}`,
      stock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get compatibility information
// @route   GET /api/inventory/compatibility
// @access  Public
exports.getCompatibility = (req, res) => {
  res.status(200).json({
    success: true,
    compatibility: COMPATIBILITY_RULES,
  });
};
