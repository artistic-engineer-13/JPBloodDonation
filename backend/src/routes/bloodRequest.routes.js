const express = require('express');

const {
  createBloodRequest,
  getMyBloodRequests,
  getAllBloodRequests,
} = require('../controllers/bloodRequest.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../constants/enums');

const router = express.Router();

router.post('/create', protect, authorizeRoles(USER_ROLES.BLOOD_REQUESTER), createBloodRequest);
router.get(
  '/my-requests',
  protect,
  authorizeRoles(USER_ROLES.BLOOD_REQUESTER),
  getMyBloodRequests
);
router.get(
  '/all',
  protect,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.HOSPITAL),
  getAllBloodRequests
);

module.exports = router;
