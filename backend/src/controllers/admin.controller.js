const mongoose = require('mongoose');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const {
  approveDonorRequestAndUpdateInventory,
  approveBloodRequestAndUpdateInventory,
  rejectDonorRequest,
  rejectBloodRequest,
} = require('../services/inventory.service');
const { createAuditLog } = require('../services/audit.service');
const { AUDIT_ACTIONS } = require('../constants/enums');

const validateRequestId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
};

const approveDonor = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  validateRequestId(requestId, 'donor request');

  const result = await approveDonorRequestAndUpdateInventory({
    requestId,
    adminId: req.user._id,
    reason: req.body.reason || null,
  });

  await createAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.APPROVE_DONATION,
    entityType: 'DonorRequest',
    entityId: result._id,
    description: 'Admin approved donor request',
    metadata: {
      bloodGroup: result.bloodGroup,
      units: result.units,
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Donor request approved successfully',
    data: {
      request: result,
    },
  });
});

const rejectDonor = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  validateRequestId(requestId, 'donor request');

  const result = await rejectDonorRequest({
    requestId,
    adminId: req.user._id,
    reason: req.body.reason,
  });

  await createAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.REJECT_DONATION,
    entityType: 'DonorRequest',
    entityId: result._id,
    description: 'Admin rejected donor request',
    metadata: {
      reason: req.body.reason,
      bloodGroup: result.bloodGroup,
      units: result.units,
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Donor request rejected successfully',
    data: {
      request: result,
    },
  });
});

const approveBloodRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  validateRequestId(requestId, 'blood request');

  const result = await approveBloodRequestAndUpdateInventory({
    requestId,
    adminId: req.user._id,
    reason: req.body.reason || null,
  });

  await createAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.APPROVE_BLOOD_REQUEST,
    entityType: 'BloodRequest',
    entityId: result._id,
    description: 'Admin approved blood request',
    metadata: {
      bloodGroup: result.bloodGroup,
      units: result.units,
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Blood request approved successfully',
    data: {
      request: result,
    },
  });
});

const rejectBloodRequestController = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  validateRequestId(requestId, 'blood request');

  const result = await rejectBloodRequest({
    requestId,
    adminId: req.user._id,
    reason: req.body.reason,
  });

  await createAuditLog({
    actor: req.user._id,
    action: AUDIT_ACTIONS.REJECT_BLOOD_REQUEST,
    entityType: 'BloodRequest',
    entityId: result._id,
    description: 'Admin rejected blood request',
    metadata: {
      reason: req.body.reason,
      bloodGroup: result.bloodGroup,
      units: result.units,
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Blood request rejected successfully',
    data: {
      request: result,
    },
  });
});

module.exports = {
  approveDonor,
  rejectDonor,
  approveBloodRequest,
  rejectBloodRequest: rejectBloodRequestController,
};
