const express = require('express');

const {
  createDonorRequest,
  getMyDonorRequests,
  getMyDonorInventory,
  addDonorInventory,
  getActiveHospitalsForDonor,
  getAllDonorRequests,
} = require('../controllers/donorRequest.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../constants/enums');

const router = express.Router();

router.post('/create', protect, authorizeRoles(USER_ROLES.DONOR), createDonorRequest);
router.get('/my-requests', protect, authorizeRoles(USER_ROLES.DONOR), getMyDonorRequests);
router.get('/inventory', protect, authorizeRoles(USER_ROLES.DONOR), getMyDonorInventory);
router.patch('/inventory/add', protect, authorizeRoles(USER_ROLES.DONOR), addDonorInventory);
router.get('/hospitals', protect, authorizeRoles(USER_ROLES.DONOR), getActiveHospitalsForDonor);
router.get(
  '/all',
  protect,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.HOSPITAL),
  getAllDonorRequests
);

module.exports = router;
