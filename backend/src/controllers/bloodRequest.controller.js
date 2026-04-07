const BloodRequest = require('../models/BloodRequest');
const Hospital = require('../models/Hospital');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { USER_ROLES, REQUEST_STATUS, REQUEST_URGENCY, BLOOD_GROUPS } = require('../constants/enums');
const { createNotificationsForHospitalUsers } = require('../services/notification.service');

const resolveHospitalScopeForUser = async (user) => {
  if (user.hospital) {
    return user.hospital;
  }

  if (user.role === USER_ROLES.HOSPITAL && user.hospitalName) {
    const hospital = await Hospital.findOne({ name: user.hospitalName, isActive: true }).select('_id');
    if (hospital) {
      return hospital._id;
    }
  }

  throw new ApiError(400, 'Hospital account is not linked to a valid hospital profile');
};

const createBloodRequest = asyncHandler(async (req, res) => {
  const { bloodGroupNeeded, bloodGroup, units, hospitalId, urgency, date, patientNote, reason } = req.body;

  if (!hospitalId || !units || !date) {
    throw new ApiError(400, 'hospitalId, units, and date are required');
  }

  const normalizedBloodGroup = String(
    bloodGroupNeeded || bloodGroup || req.user.neededBloodGroup || ''
  )
    .trim()
    .toUpperCase();

  if (!BLOOD_GROUPS.includes(normalizedBloodGroup)) {
    throw new ApiError(400, 'Valid bloodGroupNeeded is required');
  }

  const parsedUnits = Number(units);
  if (!Number.isInteger(parsedUnits) || parsedUnits < 1 || parsedUnits > 20) {
    throw new ApiError(400, 'units must be an integer between 1 and 20');
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, 'Valid required date is needed');
  }

  const normalizedUrgency = String(urgency || REQUEST_URGENCY.MEDIUM)
    .trim()
    .toUpperCase();
  if (!Object.values(REQUEST_URGENCY).includes(normalizedUrgency)) {
    throw new ApiError(400, 'Invalid urgency value');
  }

  const selectedHospital = await Hospital.findOne({ _id: hospitalId, isActive: true }).select('_id name');
  if (!selectedHospital) {
    throw new ApiError(404, 'Selected hospital not found');
  }

  const normalizedReason = String(patientNote || reason || '').trim();
  if (!normalizedReason) {
    throw new ApiError(400, 'patientNote or reason is required');
  }

  const bloodRequest = await BloodRequest.create({
    requester: req.user._id,
    requesterName: req.user.fullName,
    hospital: selectedHospital._id,
    bloodGroup: normalizedBloodGroup,
    units: parsedUnits,
    urgency: normalizedUrgency,
    requiredOn: parsedDate,
    reason: normalizedReason,
    status: REQUEST_STATUS.PENDING,
    inventoryApplied: false,
    inventoryUpdated: false,
  });

  await createNotificationsForHospitalUsers({
    hospitalId: selectedHospital._id,
    hospitalName: selectedHospital.name,
    title: 'New Blood Request Submitted',
    message: `${req.user.fullName} requested ${normalizedBloodGroup} (${parsedUnits} unit(s), ${normalizedUrgency}).`,
    type: 'INFO',
    relatedModel: 'BloodRequest',
    relatedId: bloodRequest._id,
  });

  // Inventory is intentionally unchanged here and must only update after admin approval.
  res.status(201).json({
    success: true,
    message: 'Blood request submitted successfully',
    data: {
      request: bloodRequest,
    },
  });
});

const getMyBloodRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ requester: req.user._id })
    .populate('hospital', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Blood requests fetched',
    data: {
      requests,
    },
  });
});

const getAllBloodRequests = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === USER_ROLES.HOSPITAL) {
    const hospitalId = await resolveHospitalScopeForUser(req.user);
    query.hospital = hospitalId;
  }

  const requests = await BloodRequest.find(query)
    .populate('requester', 'fullName email phone neededBloodGroup')
    .populate('hospital', 'name code')
    .populate('adminAction.admin', 'fullName email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Blood requests fetched',
    data: {
      requests,
    },
  });
});

module.exports = {
  createBloodRequest,
  getMyBloodRequests,
  getAllBloodRequests,
};
