const express = require('express');

const {
  approveDonor,
  rejectDonor,
  approveBloodRequest,
  rejectBloodRequest,
} = require('../controllers/admin.controller');
const {
  getAdminDashboard,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllHospitals,
  getHospitalActivity,
  getDonorRequestsForAdmin,
  getBloodRequestsForAdmin,
  getInventoryMonitoring,
  getAuditLogs,
  getDonorInventories,
} = require('../controllers/adminDashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../constants/enums');

const router = express.Router();

router.use(protect, authorizeRoles(USER_ROLES.ADMIN));

router.get('/dashboard', getAdminDashboard);

router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/hospitals', getAllHospitals);
router.get('/hospitals/:id/activity', getHospitalActivity);

router.get('/donor-requests', getDonorRequestsForAdmin);
router.get('/blood-requests', getBloodRequestsForAdmin);

router.get('/inventory', getInventoryMonitoring);
router.get('/donor-inventories', getDonorInventories);
router.get('/audit-logs', getAuditLogs);

router.patch('/donor/:id/approve', approveDonor);
router.patch('/donor/:id/reject', rejectDonor);
router.patch('/request/:id/approve', approveBloodRequest);
router.patch('/request/:id/reject', rejectBloodRequest);

module.exports = router;
