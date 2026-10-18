const express = require('express');
const router = express.Router();
const {
  getDonors,
  getDonorById,
  createDonor,
  recordDonation,
  getAllDonations,
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getDonors);
router.post('/', createDonor);
router.get('/donations/all', getAllDonations);
router.get('/:id', getDonorById);
router.post('/:id/donate', authorize('admin'), recordDonation);

module.exports = router;
