const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Hospital = require('../models/Hospital');
const DonorRequest = require('../models/DonorRequest');
const BloodRequest = require('../models/BloodRequest');
const { USER_ROLES, REQUEST_STATUS } = require('../constants/enums');

const resolveHospitalScopeForUser = async (user) => {
  if (user.role !== USER_ROLES.HOSPITAL) {
    throw new ApiError(403, 'Only hospital users can access hospital dashboard');
  }

  if (user.hospital) {
    return user.hospital;
  }

  if (user.hospitalName) {
    const hospitalByName = await Hospital.findOne({
      name: user.hospitalName,
      isActive: true,
    }).select('_id');

    if (hospitalByName) {
      return hospitalByName._id;
    }
  }

  throw new ApiError(400, 'Hospital account is not linked to a valid hospital profile');
};

const getTotalInventoryUnits = (inventory = {}) => {
  return Object.values(inventory).reduce((sum, current) => {
    const units = Number(current) || 0;
    return sum + units;
  }, 0);
};

const getHospitalDashboard = asyncHandler(async (req, res) => {
  const hospitalId = await resolveHospitalScopeForUser(req.user);

  const hospital = await Hospital.findOne({ _id: hospitalId, isActive: true }).select('name code inventory');
  if (!hospital) {
    throw new ApiError(404, 'Hospital not found or inactive');
  }

  const [donorTotal, donorApproved, donorPending, donorRejected] = await Promise.all([
    DonorRequest.countDocuments({ hospital: hospitalId }),
    DonorRequest.countDocuments({ hospital: hospitalId, status: REQUEST_STATUS.APPROVED }),
    DonorRequest.countDocuments({ hospital: hospitalId, status: REQUEST_STATUS.PENDING }),
    DonorRequest.countDocuments({ hospital: hospitalId, status: REQUEST_STATUS.REJECTED }),
  ]);

  const [bloodTotal, bloodApproved, bloodPending, bloodRejected] = await Promise.all([
    BloodRequest.countDocuments({ hospital: hospitalId }),
    BloodRequest.countDocuments({ hospital: hospitalId, status: REQUEST_STATUS.APPROVED }),
    BloodRequest.countDocuments({ hospital: hospitalId, status: REQUEST_STATUS.PENDING }),
    BloodRequest.countDocuments({ hospital: hospitalId, status: REQUEST_STATUS.REJECTED }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Hospital dashboard data fetched',
    data: {
      hospital: {
        id: hospital._id,
        name: hospital.name,
        code: hospital.code,
      },
      overview: {
        totalBloodInventory: getTotalInventoryUnits(hospital.inventory),
        totalDonorRequests: donorTotal,
        totalBloodRequests: bloodTotal,
        approvedRequests: donorApproved + bloodApproved,
        pendingRequests: donorPending + bloodPending,
        rejectedRequests: donorRejected + bloodRejected,
      },
    },
  });
});

const getHospitalInventory = asyncHandler(async (req, res) => {
  const hospitalId = await resolveHospitalScopeForUser(req.user);

  const hospital = await Hospital.findOne({ _id: hospitalId, isActive: true }).select('name code inventory');
  if (!hospital) {
    throw new ApiError(404, 'Hospital not found or inactive');
  }

  res.status(200).json({
    success: true,
    message: 'Hospital inventory fetched',
    data: {
      hospital: {
        id: hospital._id,
        name: hospital.name,
        code: hospital.code,
      },
      totalUnits: getTotalInventoryUnits(hospital.inventory),
      inventory: hospital.inventory,
    },
  });
});

const getHospitalRequests = asyncHandler(async (req, res) => {
  const hospitalId = await resolveHospitalScopeForUser(req.user);

  const statusFilter = req.query.status ? String(req.query.status).trim().toUpperCase() : null;
  const requestFilter = { hospital: hospitalId };

  if (statusFilter) {
    if (!Object.values(REQUEST_STATUS).includes(statusFilter)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    requestFilter.status = statusFilter;
  }

  const [donorRequests, bloodRequests] = await Promise.all([
    DonorRequest.find(requestFilter)
      .select('donorName bloodGroup units preferredDonationDate status notes createdAt')
      .sort({ createdAt: -1 }),
    BloodRequest.find(requestFilter)
      .select('requesterName bloodGroup units urgency requiredOn status reason createdAt')
      .sort({ createdAt: -1 }),
  ]);

  const donorTable = donorRequests.map((item) => ({
    id: item._id,
    donorName: item.donorName,
    bloodGroup: item.bloodGroup,
    units: item.units,
    date: item.preferredDonationDate,
    status: item.status,
    note: item.notes,
  }));

  const bloodRequesterTable = bloodRequests.map((item) => ({
    id: item._id,
    requesterName: item.requesterName,
    bloodGroupNeeded: item.bloodGroup,
    units: item.units,
    urgency: item.urgency,
    date: item.requiredOn,
    status: item.status,
    note: item.reason,
  }));

  res.status(200).json({
    success: true,
    message: 'Hospital requests fetched',
    data: {
      donorRequests: donorTable,
      bloodRequests: bloodRequesterTable,
      counts: {
        donorRequests: donorTable.length,
        bloodRequests: bloodRequesterTable.length,
      },
    },
  });
});

module.exports = {
  getHospitalDashboard,
  getHospitalInventory,
  getHospitalRequests,
};
