const express = require('express');

const {
  getHospitalDashboard,
  getHospitalInventory,
  getHospitalRequests,
} = require('../controllers/hospitalDashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../constants/enums');

const router = express.Router();

// Hospital routes are strictly read-only dashboard endpoints.
router.use(protect, authorizeRoles(USER_ROLES.HOSPITAL));

router.get('/dashboard', getHospitalDashboard);
router.get('/inventory', getHospitalInventory);
router.get('/requests', getHospitalRequests);

module.exports = router;
