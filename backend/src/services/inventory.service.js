const mongoose = require('mongoose');

const Hospital = require('../models/Hospital');
const User = require('../models/User');
const DonorRequest = require('../models/DonorRequest');
const BloodRequest = require('../models/BloodRequest');
const ApiError = require('../utils/ApiError');
const { BLOOD_GROUPS, REQUEST_STATUS } = require('../constants/enums');
const { createNotification } = require('./notification.service');

const validateInventoryInput = ({ bloodGroup, units }) => {
  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    throw new ApiError(400, 'Invalid blood group for inventory operation');
  }

  if (!Number.isInteger(units) || units <= 0) {
    throw new ApiError(400, 'Units must be a positive integer');
  }
};

const getInventoryFieldPath = (bloodGroup) => `inventory.${bloodGroup}`;

const addStockToHospital = async ({ hospitalId, bloodGroup, units, session }) => {
  validateInventoryInput({ bloodGroup, units });

  const inventoryField = getInventoryFieldPath(bloodGroup);

  const updateResult = await Hospital.updateOne(
    { _id: hospitalId, isActive: true },
    { $inc: { [inventoryField]: units } },
    { session }
  );

  if (updateResult.modifiedCount !== 1) {
    throw new ApiError(404, 'Hospital not found or inactive');
  }
};

const subtractStockFromHospital = async ({ hospitalId, bloodGroup, units, session }) => {
  validateInventoryInput({ bloodGroup, units });

  const inventoryField = getInventoryFieldPath(bloodGroup);

  const updateResult = await Hospital.updateOne(
    {
      _id: hospitalId,
      isActive: true,
      [inventoryField]: { $gte: units },
    },
    { $inc: { [inventoryField]: -units } },
    { session }
  );

  if (updateResult.modifiedCount === 1) {
    return;
  }

  const hospitalExists = await Hospital.exists({ _id: hospitalId, isActive: true }).session(session);
  if (!hospitalExists) {
    throw new ApiError(404, 'Hospital not found or inactive');
  }

  throw new ApiError(409, `Insufficient stock for ${bloodGroup}`);
};

const subtractStockFromDonor = async ({ donorId, bloodGroup, units, session }) => {
  validateInventoryInput({ bloodGroup, units });

  const inventoryField = getInventoryFieldPath(bloodGroup);

  const updateResult = await User.updateOne(
    {
      _id: donorId,
      role: 'DONOR',
      isActive: true,
      [inventoryField]: { $gte: units },
    },
    { $inc: { [inventoryField]: -units } },
    { session }
  );

  if (updateResult.modifiedCount === 1) {
    return;
  }

  const donorExists = await User.exists({ _id: donorId, role: 'DONOR', isActive: true }).session(session);
  if (!donorExists) {
    throw new ApiError(404, 'Donor not found or inactive');
  }

  throw new ApiError(409, 'Insufficient donor inventory');
};

const markRequestInventoryUpdated = async ({ model, requestId, session, markDualInventory = false }) => {
  const now = new Date();

  const updatePayload = {
    inventoryApplied: true,
    inventoryAppliedAt: now,
    inventoryUpdated: true,
    inventoryUpdatedAt: now,
  };

  if (markDualInventory) {
    updatePayload.donorInventoryUpdatedAt = now;
    updatePayload.hospitalInventoryUpdatedAt = now;
  }

  const updated = await model.findOneAndUpdate(
    {
      _id: requestId,
      status: REQUEST_STATUS.APPROVED,
      inventoryUpdated: false,
    },
    {
      $set: updatePayload,
    },
    { new: true, session }
  );

  if (!updated) {
    throw new ApiError(409, 'Inventory update already processed for this request');
  }

  return updated;
};

const getProcessedStateError = ({ label, existingRecord }) => {
  if (!existingRecord) {
    return new ApiError(404, `${label} not found`);
  }

  if (existingRecord.status !== REQUEST_STATUS.PENDING) {
    return new ApiError(
      409,
      `${label} already processed with status ${existingRecord.status}`
    );
  }

  return new ApiError(409, `${label} already processed`);
};

const approveDonorRequestAndUpdateInventory = async ({ requestId, adminId, reason = null }) => {
  const session = await mongoose.startSession();

  try {
    let responsePayload = null;

    await session.withTransaction(async () => {
      const processedAt = new Date();

      const donorRequest = await DonorRequest.findOneAndUpdate(
        {
          _id: requestId,
          status: REQUEST_STATUS.PENDING,
        },
        {
          $set: {
            status: REQUEST_STATUS.APPROVED,
            adminAction: {
              admin: adminId,
              reason,
              actedAt: processedAt,
            },
            approvedBy: adminId,
            processedAt,
          },
        },
        { new: true, session, runValidators: true }
      );

      if (!donorRequest) {
        const existing = await DonorRequest.findById(requestId).session(session);
        throw getProcessedStateError({ label: 'Donor request', existingRecord: existing });
      }

      await subtractStockFromDonor({
        donorId: donorRequest.donor,
        bloodGroup: donorRequest.bloodGroup,
        units: donorRequest.units,
        session,
      });

      await addStockToHospital({
        hospitalId: donorRequest.hospital,
        bloodGroup: donorRequest.bloodGroup,
        units: donorRequest.units,
        session,
      });

      const finalized = await markRequestInventoryUpdated({
        model: DonorRequest,
        requestId: donorRequest._id,
        session,
        markDualInventory: true,
      });

      await createNotification({
        userId: donorRequest.donor,
        title: 'Donor Request Approved',
        message: `Your donor request for ${donorRequest.bloodGroup} (${donorRequest.units} unit(s)) was approved.`,
        type: 'SUCCESS',
        relatedModel: 'DonorRequest',
        relatedId: donorRequest._id,
        session,
      });

      responsePayload = finalized;
    });

    return responsePayload;
  } finally {
    await session.endSession();
  }
};

const approveBloodRequestAndUpdateInventory = async ({ requestId, adminId, reason = null }) => {
  const session = await mongoose.startSession();

  try {
    let responsePayload = null;

    await session.withTransaction(async () => {
      const processedAt = new Date();

      const bloodRequest = await BloodRequest.findOneAndUpdate(
        {
          _id: requestId,
          status: REQUEST_STATUS.PENDING,
        },
        {
          $set: {
            status: REQUEST_STATUS.APPROVED,
            adminAction: {
              admin: adminId,
              reason,
              actedAt: processedAt,
            },
            approvedBy: adminId,
            processedAt,
          },
        },
        { new: true, session, runValidators: true }
      );

      if (!bloodRequest) {
        const existing = await BloodRequest.findById(requestId).session(session);
        throw getProcessedStateError({ label: 'Blood request', existingRecord: existing });
      }

      await subtractStockFromHospital({
        hospitalId: bloodRequest.hospital,
        bloodGroup: bloodRequest.bloodGroup,
        units: bloodRequest.units,
        session,
      });

      const finalized = await markRequestInventoryUpdated({
        model: BloodRequest,
        requestId: bloodRequest._id,
        session,
      });

      await createNotification({
        userId: bloodRequest.requester,
        title: 'Blood Request Approved',
        message: `Your blood request for ${bloodRequest.bloodGroup} (${bloodRequest.units} unit(s)) was approved.`,
        type: 'SUCCESS',
        relatedModel: 'BloodRequest',
        relatedId: bloodRequest._id,
        session,
      });

      responsePayload = finalized;
    });

    return responsePayload;
  } finally {
    await session.endSession();
  }
};

const rejectDonorRequest = async ({ requestId, adminId, reason }) => {
  if (!reason || !String(reason).trim()) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const processedAt = new Date();

  const updated = await DonorRequest.findOneAndUpdate(
    { _id: requestId, status: REQUEST_STATUS.PENDING },
    {
      $set: {
        status: REQUEST_STATUS.REJECTED,
        adminAction: {
          admin: adminId,
          reason: String(reason).trim(),
          actedAt: processedAt,
        },
        approvedBy: null,
        processedAt,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updated) {
    const existing = await DonorRequest.findById(requestId);
    throw getProcessedStateError({ label: 'Donor request', existingRecord: existing });
  }

  await createNotification({
    userId: updated.donor,
    title: 'Donor Request Rejected',
    message: `Your donor request was rejected. Reason: ${String(reason).trim()}`,
    type: 'WARNING',
    relatedModel: 'DonorRequest',
    relatedId: updated._id,
  });

  return updated;
};

const rejectBloodRequest = async ({ requestId, adminId, reason }) => {
  if (!reason || !String(reason).trim()) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const processedAt = new Date();

  const updated = await BloodRequest.findOneAndUpdate(
    { _id: requestId, status: REQUEST_STATUS.PENDING },
    {
      $set: {
        status: REQUEST_STATUS.REJECTED,
        adminAction: {
          admin: adminId,
          reason: String(reason).trim(),
          actedAt: processedAt,
        },
        approvedBy: null,
        processedAt,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updated) {
    const existing = await BloodRequest.findById(requestId);
    throw getProcessedStateError({ label: 'Blood request', existingRecord: existing });
  }

  await createNotification({
    userId: updated.requester,
    title: 'Blood Request Rejected',
    message: `Your blood request was rejected. Reason: ${String(reason).trim()}`,
    type: 'WARNING',
    relatedModel: 'BloodRequest',
    relatedId: updated._id,
  });

  return updated;
};

const getHospitalInventorySnapshot = async ({ hospitalId }) => {
  const hospital = await Hospital.findOne({ _id: hospitalId, isActive: true }).select('name code inventory');

  if (!hospital) {
    throw new ApiError(404, 'Hospital not found or inactive');
  }

  // Admin and Hospital dashboards should read from this single source of truth.
  return {
    hospitalId: hospital._id,
    hospitalName: hospital.name,
    hospitalCode: hospital.code,
    inventory: hospital.inventory,
  };
};

module.exports = {
  addStockToHospital,
  subtractStockFromHospital,
  subtractStockFromDonor,
  approveDonorRequestAndUpdateInventory,
  approveBloodRequestAndUpdateInventory,
  rejectDonorRequest,
  rejectBloodRequest,
  getHospitalInventorySnapshot,
};
