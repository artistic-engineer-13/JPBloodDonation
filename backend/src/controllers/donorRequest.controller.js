const DonorRequest = require('../models/DonorRequest');
const Hospital = require('../models/Hospital');
const mongoose = require('mongoose');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { USER_ROLES, REQUEST_STATUS, BLOOD_GROUPS } = require('../constants/enums');
const { createNotificationsForHospitalUsers } = require('../services/notification.service');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildHospitalCodeBase = (name) => {
  const base = String(name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);

  return base || 'HOSP';
};

const generateUniqueHospitalCode = async (name) => {
  const base = buildHospitalCodeBase(name);
  let candidate = base;
  let suffix = 1;

  // Small bounded loop to avoid collisions on short codes.
  while (await Hospital.exists({ code: candidate })) {
    candidate = `${base}${String(suffix).padStart(2, '0')}`;
    suffix += 1;
    if (suffix > 99) {
      candidate = `${base}${Date.now().toString().slice(-4)}`;
      break;
    }
  }

  return candidate;
};

const createPlaceholderHospital = async (inputValue) => {
  const rawName = String(inputValue || '').trim();
  if (!rawName) {
    return null;
  }

  const existing = await Hospital.findOne({ name: new RegExp(`^${escapeRegex(rawName)}$`, 'i') }).select(
    '_id name code'
  );
  if (existing) {
    return existing;
  }

  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return Hospital.create({
    name: rawName,
    code: await generateUniqueHospitalCode(rawName),
    registrationNumber: `AUTO-${stamp}-${rand}`,
    email: `auto-${stamp}-${rand}@placeholder.local`,
    phone: '0000000000',
    address: {
      line1: 'Address pending update',
      line2: '',
      city: 'Unknown',
      state: 'Unknown',
      country: 'India',
      zipCode: '000000',
    },
    isActive: true,
  });
};

const ensureHospitalProfileFromUser = async (user) => {
  if (!user || user.role !== USER_ROLES.HOSPITAL) {
    return null;
  }

  if (user.hospital && mongoose.isValidObjectId(user.hospital)) {
    const linked = await Hospital.findById(user.hospital).select('_id name code isActive');
    if (linked) {
      return linked;
    }
  }

  const existing = await Hospital.findOne({
    $or: [{ registrationNumber: user.licenseNumber }, { email: user.email }],
  }).select('_id name code isActive');

  if (existing) {
    user.hospital = existing._id;
    await user.save({ validateBeforeSave: false });
    return existing;
  }

  const created = await Hospital.create({
    name: user.hospitalName,
    code: await generateUniqueHospitalCode(user.hospitalName),
    registrationNumber: user.licenseNumber,
    email: user.email,
    phone: user.phone,
    address: {
      line1: user.address || user.hospitalName || 'Address pending update',
      line2: '',
      city: 'Unknown',
      state: 'Unknown',
      country: 'India',
      zipCode: '000000',
    },
    isActive: true,
  });

  user.hospital = created._id;
  await user.save({ validateBeforeSave: false });

  return created;
};

const bootstrapHospitalsFromHospitalUsers = async () => {
  const hospitalUsers = await User.find({
    role: USER_ROLES.HOSPITAL,
    isActive: true,
    hospitalName: { $exists: true, $ne: null },
    licenseNumber: { $exists: true, $ne: null },
  });

  for (const user of hospitalUsers) {
    await ensureHospitalProfileFromUser(user);
  }
};

const resolveDonorHospital = async (hospitalInput) => {
  const value = String(hospitalInput || '').trim();
  if (!value) {
    return null;
  }

  if (mongoose.isValidObjectId(value)) {
    const byId = await Hospital.findOne({ _id: value, isActive: true }).select('_id name');
    if (byId) {
      return byId;
    }
  }

  const byCodeOrName = await Hospital.findOne({
    isActive: true,
    $or: [{ code: value.toUpperCase() }, { name: new RegExp(escapeRegex(value), 'i') }],
  }).select('_id name');

  if (byCodeOrName) {
    return byCodeOrName;
  }

  const matchingHospitalUser = await User.findOne({
    role: USER_ROLES.HOSPITAL,
    isActive: true,
    $or: [{ hospitalName: new RegExp(escapeRegex(value), 'i') }, { licenseNumber: value.toUpperCase() }],
  });

  if (matchingHospitalUser) {
    return ensureHospitalProfileFromUser(matchingHospitalUser);
  }

  return null;
};

const resolveHospitalScopeForUser = async (user) => {
  if (user.hospital) {
    return user.hospital;
  }

  // Fallback to hospital name when hospital profile reference is not linked yet.
  if (user.role === USER_ROLES.HOSPITAL && user.hospitalName) {
    const hospital = await Hospital.findOne({ name: user.hospitalName, isActive: true }).select('_id');
    if (hospital) {
      return hospital._id;
    }
  }

  throw new ApiError(400, 'Hospital account is not linked to a valid hospital profile');
};

const createDonorRequest = asyncHandler(async (req, res) => {
  const { bloodGroup, units, hospitalId, date, note } = req.body;

  if (!hospitalId || !units || !date) {
    throw new ApiError(400, 'hospitalId, units, and date are required');
  }

  const normalizedBloodGroup = (bloodGroup || req.user.bloodGroup || '').toUpperCase().trim();
  if (!BLOOD_GROUPS.includes(normalizedBloodGroup)) {
    throw new ApiError(400, 'Valid bloodGroup is required');
  }

  const parsedUnits = Number(units);
  if (!Number.isInteger(parsedUnits) || parsedUnits < 1 || parsedUnits > 4) {
    throw new ApiError(400, 'units must be an integer between 1 and 4');
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, 'Valid donation date is required');
  }

  const selectedHospital = await resolveDonorHospital(hospitalId);
  const fallbackHospital = selectedHospital || (await createPlaceholderHospital(hospitalId));
  if (!fallbackHospital) {
    throw new ApiError(404, 'Selected hospital not found. Use a valid hospital ID, code, or exact name');
  }

  const donorRequest = await DonorRequest.create({
    donor: req.user._id,
    donorName: req.user.fullName,
    hospital: fallbackHospital._id,
    bloodGroup: normalizedBloodGroup,
    units: parsedUnits,
    preferredDonationDate: parsedDate,
    notes: note || '',
    status: REQUEST_STATUS.PENDING,
    inventoryApplied: false,
    inventoryUpdated: false,
  });

  await createNotificationsForHospitalUsers({
    hospitalId: fallbackHospital._id,
    hospitalName: fallbackHospital.name,
    title: 'New Donor Request Submitted',
    message: `${req.user.fullName} submitted a donor request for ${normalizedBloodGroup} (${parsedUnits} unit(s)).`,
    type: 'INFO',
    relatedModel: 'DonorRequest',
    relatedId: donorRequest._id,
  });

  // Inventory is intentionally unchanged here and must only update after admin approval.
  res.status(201).json({
    success: true,
    message: 'Donor request submitted successfully',
    data: {
      request: donorRequest,
    },
  });
});

const getMyDonorRequests = asyncHandler(async (req, res) => {
  const requests = await DonorRequest.find({ donor: req.user._id })
    .populate('hospital', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Donor requests fetched',
    data: {
      requests,
    },
  });
});

const getMyDonorInventory = asyncHandler(async (req, res) => {
  const donor = await User.findOne({
    _id: req.user._id,
    role: USER_ROLES.DONOR,
    isActive: true,
  }).select('inventory bloodGroup fullName');

  if (!donor) {
    throw new ApiError(404, 'Donor not found or inactive');
  }

  res.status(200).json({
    success: true,
    message: 'Donor inventory fetched',
    data: {
      donor: {
        id: donor._id,
        name: donor.fullName,
        bloodGroup: donor.bloodGroup,
      },
      inventory: donor.inventory || {},
    },
  });
});

const addDonorInventory = asyncHandler(async (req, res) => {
  const bloodGroup = String(req.body.bloodGroup || '').trim().toUpperCase();
  const units = Number(req.body.units);

  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    throw new ApiError(400, 'Valid bloodGroup is required');
  }

  if (!Number.isInteger(units) || units <= 0) {
    throw new ApiError(400, 'units must be a positive integer');
  }

  const inventoryField = `inventory.${bloodGroup}`;
  const donor = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      role: USER_ROLES.DONOR,
      isActive: true,
    },
    {
      $inc: { [inventoryField]: units },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('fullName bloodGroup inventory');

  if (!donor) {
    throw new ApiError(404, 'Donor not found or inactive');
  }

  res.status(200).json({
    success: true,
    message: 'Donor inventory updated successfully',
    data: {
      donor: {
        id: donor._id,
        name: donor.fullName,
      },
      inventory: donor.inventory,
    },
  });
});

const getActiveHospitalsForDonor = asyncHandler(async (req, res) => {
  await bootstrapHospitalsFromHospitalUsers();

  const hospitals = await Hospital.find({ isActive: true })
    .select('_id name code')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Hospitals fetched',
    data: {
      hospitals,
    },
  });
});

const getAllDonorRequests = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === USER_ROLES.HOSPITAL) {
    const hospitalId = await resolveHospitalScopeForUser(req.user);
    query.hospital = hospitalId;
  }

  const requests = await DonorRequest.find(query)
    .populate('donor', 'fullName email phone bloodGroup')
    .populate('hospital', 'name code')
    .populate('adminAction.admin', 'fullName email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Donor requests fetched',
    data: {
      requests,
    },
  });
});

module.exports = {
  createDonorRequest,
  getMyDonorRequests,
  getMyDonorInventory,
  addDonorInventory,
  getActiveHospitalsForDonor,
  getAllDonorRequests,
};
