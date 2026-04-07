const { USER_ROLES, REQUEST_STATUS } = require('../constants/enums');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const DonorRequest = require('../models/DonorRequest');
const BloodRequest = require('../models/BloodRequest');

const buildRegex = (value) => new RegExp(String(value).trim(), 'i');

const getDashboardAnalytics = async () => {
  const [
    totalUsers,
    totalDonors,
    totalRequesters,
    totalHospitals,
    totalDonationRequests,
    totalBloodRequests,
    donorApproved,
    donorPending,
    donorRejected,
    bloodApproved,
    bloodPending,
    bloodRejected,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: USER_ROLES.DONOR }),
    User.countDocuments({ role: USER_ROLES.BLOOD_REQUESTER }),
    Hospital.countDocuments(),
    DonorRequest.countDocuments(),
    BloodRequest.countDocuments(),
    DonorRequest.countDocuments({ status: REQUEST_STATUS.APPROVED }),
    DonorRequest.countDocuments({ status: REQUEST_STATUS.PENDING }),
    DonorRequest.countDocuments({ status: REQUEST_STATUS.REJECTED }),
    BloodRequest.countDocuments({ status: REQUEST_STATUS.APPROVED }),
    BloodRequest.countDocuments({ status: REQUEST_STATUS.PENDING }),
    BloodRequest.countDocuments({ status: REQUEST_STATUS.REJECTED }),
  ]);

  return {
    totalUsers,
    totalDonors,
    totalRequesters,
    totalHospitals,
    totalDonationRequests,
    totalBloodRequests,
    approvedCount: donorApproved + bloodApproved,
    pendingCount: donorPending + bloodPending,
    rejectedCount: donorRejected + bloodRejected,
    breakdown: {
      donorRequests: {
        approved: donorApproved,
        pending: donorPending,
        rejected: donorRejected,
      },
      bloodRequests: {
        approved: bloodApproved,
        pending: bloodPending,
        rejected: bloodRejected,
      },
    },
  };
};

const getUserQueryFilter = ({ role, search }) => {
  const filter = {};

  if (role) {
    filter.role = String(role).trim().toUpperCase();
  }

  if (search) {
    const regex = buildRegex(search);
    filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }, { hospitalName: regex }];
  }

  return filter;
};

const getHospitalIdsByName = async (search) => {
  if (!search) {
    return null;
  }

  const hospitals = await Hospital.find({ name: buildRegex(search) }).select('_id');
  return hospitals.map((item) => item._id);
};

const getDonorRequestFilter = async ({ status, search, bloodGroup }) => {
  const filter = {};

  if (status) {
    filter.status = String(status).trim().toUpperCase();
  }

  if (bloodGroup) {
    filter.bloodGroup = String(bloodGroup).trim().toUpperCase();
  }

  if (search) {
    const regex = buildRegex(search);
    const hospitalIds = await getHospitalIdsByName(search);

    filter.$or = [{ donorName: regex }, { bloodGroup: regex }];

    if (hospitalIds && hospitalIds.length) {
      filter.$or.push({ hospital: { $in: hospitalIds } });
    }
  }

  return filter;
};

const getBloodRequestFilter = async ({ status, search, bloodGroup }) => {
  const filter = {};

  if (status) {
    filter.status = String(status).trim().toUpperCase();
  }

  if (bloodGroup) {
    filter.bloodGroup = String(bloodGroup).trim().toUpperCase();
  }

  if (search) {
    const regex = buildRegex(search);
    const hospitalIds = await getHospitalIdsByName(search);

    filter.$or = [{ requesterName: regex }, { bloodGroup: regex }, { reason: regex }];

    if (hospitalIds && hospitalIds.length) {
      filter.$or.push({ hospital: { $in: hospitalIds } });
    }
  }

  return filter;
};

module.exports = {
  getDashboardAnalytics,
  getUserQueryFilter,
  getDonorRequestFilter,
  getBloodRequestFilter,
};
