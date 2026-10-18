const express = require('express');
const router = express.Router();
const {
  getInventory,
  updateStock,
  getCompatibility,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getInventory);
router.get('/compatibility', getCompatibility);
router.put('/:bloodGroup', protect, authorize('admin'), updateStock);

module.exports = router;
