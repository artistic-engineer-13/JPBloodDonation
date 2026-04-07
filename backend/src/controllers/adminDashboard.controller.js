const mongoose = require('mongoose');

const User = require('../models/User');
const Hospital = require('../models/Hospital');
const DonorRequest = require('../models/DonorRequest');
const BloodRequest = require('../models/BloodRequest');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { AUDIT_ACTIONS } = require('../constants/enums');
const { createAuditLog } = require('../services/audit.service');
const {
  getDashboardAnalytics,
  getUserQueryFilter,
  getDonorRequestFilter,
  getBloodRequestFilter,
} = require('../services/adminDashboard.service');

const parsePagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getAdminDashboard = asyncHandler(async (req, res) => {
  const analytics = await getDashboardAnalytics();

  res.status(200).json({
    success: true,
    message: 'Dashboard analytics fetched',
    data: analytics,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = getUserQueryFilter({
    role: req.query.role,
    search: req.query.search,
  });

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Users fetched',
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    throw new ApiError(400, 'isActive boolean is required');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive } },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  await createAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: 'User',
    entityId: updatedUser._id,
    description: `Admin updated user status to ${isActive ? 'active' : 'inactive'}`,
    metadata: {
      userEmail: updatedUser.email,
      isActive,
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      user: updatedUser,
    },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user id');
  }

  if (String(req.user._id) === String(userId)) {
    throw new ApiError(400, 'Admin cannot delete their own account');
  }

  const deletedUser = await User.findByIdAndDelete(userId).select('-password');
  if (!deletedUser) {
    throw new ApiError(404, 'User not found');
  }

  await createAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.DELETE,
    entityType: 'User',
    entityId: deletedUser._id,
    description: 'Admin deleted user account',
    metadata: {
      userEmail: deletedUser.email,
      userRole: deletedUser.role,
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: {
      user: deletedUser,
    },
  });
});

const getAllHospitals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search).trim() : null;

  const filter = {};
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { code: regex }, { registrationNumber: regex }, { email: regex }];
  }

  const [hospitals, total] = await Promise.all([
    Hospital.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Hospital.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Hospitals fetched',
    data: {
      hospitals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const getHospitalActivity = asyncHandler(async (req, res) => {
  const hospitalId = req.params.id;
  if (!mongoose.isValidObjectId(hospitalId)) {
    throw new ApiError(400, 'Invalid hospital id');
  }

  const hospital = await Hospital.findById(hospitalId).select('name code inventory isActive');
  if (!hospital) {
    throw new ApiError(404, 'Hospital not found');
  }

  const [donationTotal, donationApproved, donationPending, donationRejected] = await Promise.all([
    DonorRequest.countDocuments({ hospital: hospitalId }),
    DonorRequest.countDocuments({ hospital: hospitalId, status: 'APPROVED' }),
    DonorRequest.countDocuments({ hospital: hospitalId, status: 'PENDING' }),
    DonorRequest.countDocuments({ hospital: hospitalId, status: 'REJECTED' }),
  ]);

  const [bloodTotal, bloodApproved, bloodPending, bloodRejected] = await Promise.all([
    BloodRequest.countDocuments({ hospital: hospitalId }),
    BloodRequest.countDocuments({ hospital: hospitalId, status: 'APPROVED' }),
    BloodRequest.countDocuments({ hospital: hospitalId, status: 'PENDING' }),
    BloodRequest.countDocuments({ hospital: hospitalId, status: 'REJECTED' }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Hospital activity fetched',
    data: {
      hospital,
      activity: {
        donationRequests: {
          total: donationTotal,
          approved: donationApproved,
          pending: donationPending,
          rejected: donationRejected,
        },
        bloodRequests: {
          total: bloodTotal,
          approved: bloodApproved,
          pending: bloodPending,
          rejected: bloodRejected,
        },
      },
    },
  });
});

const getDonorRequestsForAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const filter = await getDonorRequestFilter({
    status: req.query.status,
    search: req.query.search,
    bloodGroup: req.query.bloodGroup,
  });

  const [requests, total] = await Promise.all([
    DonorRequest.find(filter)
      .populate('donor', 'fullName email phone bloodGroup')
      .populate('hospital', 'name code')
      .populate('adminAction.admin', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DonorRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Donor requests fetched',
    data: {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const getBloodRequestsForAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const filter = await getBloodRequestFilter({
    status: req.query.status,
    search: req.query.search,
    bloodGroup: req.query.bloodGroup,
  });

  const [requests, total] = await Promise.all([
    BloodRequest.find(filter)
      .populate('requester', 'fullName email phone neededBloodGroup')
      .populate('hospital', 'name code')
      .populate('adminAction.admin', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BloodRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Blood requests fetched',
    data: {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const getInventoryMonitoring = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const hospitalId = req.query.hospitalId;
  const search = req.query.search ? String(req.query.search).trim() : null;

  const filter = {};
  if (hospitalId) {
    if (!mongoose.isValidObjectId(hospitalId)) {
      throw new ApiError(400, 'Invalid hospitalId');
    }
    filter._id = hospitalId;
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { code: regex }];
  }

  const [hospitals, total] = await Promise.all([
    Hospital.find(filter)
      .select('name code isActive inventory updatedAt')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Hospital.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Inventory monitoring data fetched',
    data: {
      hospitals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search).trim() : null;
  const action = req.query.action ? String(req.query.action).trim().toUpperCase() : null;

  const filter = {};
  if (action && action !== 'ALL') {
    filter.action = action;
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ description: regex }, { entityType: regex }, { requestId: regex }];
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actor', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Audit logs fetched',
    data: {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const getDonorInventories = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search).trim() : null;
  const bloodGroup = req.query.bloodGroup ? String(req.query.bloodGroup).trim().toUpperCase() : null;

  const filter = {
    role: 'DONOR',
  };

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
  }

  if (bloodGroup) {
    filter.bloodGroup = bloodGroup;
  }

  const [donors, total] = await Promise.all([
    User.find(filter)
      .select('fullName email phone bloodGroup inventory isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const donorsWithTotals = donors.map((donor) => {
    const inventory = donor.inventory || {};
    const totalUnits = Object.values(inventory).reduce((sum, value) => sum + (Number(value) || 0), 0);

    return {
      ...donor.toObject(),
      totalUnits,
    };
  });

  res.status(200).json({
    success: true,
    message: 'Donor inventories fetched',
    data: {
      donors: donorsWithTotals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

module.exports = {
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
};
