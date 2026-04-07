const mongoose = require('mongoose');
const { BLOOD_GROUPS, REQUEST_STATUS, REQUEST_URGENCY } = require('../constants/enums');

const { Schema } = mongoose;

const adminActionSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reason: {
      type: String,
      trim: true,
      default: null,
      maxlength: 400,
    },
    actedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const BloodRequestSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 120,
      default: null,
    },
    patientAge: {
      type: Number,
      min: 0,
      max: 120,
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      index: true,
    },
    units: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    urgency: {
      type: String,
      enum: Object.values(REQUEST_URGENCY),
      default: REQUEST_URGENCY.MEDIUM,
      index: true,
    },
    requiredOn: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
      index: true,
    },
    adminAction: {
      type: adminActionSchema,
      default: () => ({}),
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
      index: true,
    },
    inventoryApplied: {
      type: Boolean,
      default: false,
      index: true,
    },
    inventoryAppliedAt: {
      type: Date,
      default: null,
    },
    inventoryUpdated: {
      type: Boolean,
      default: false,
      index: true,
    },
    inventoryUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

BloodRequestSchema.pre('validate', function validateAdminAction(next) {
  if (
    this.status === REQUEST_STATUS.REJECTED &&
    (!this.adminAction || !this.adminAction.reason)
  ) {
    return next(new Error('Rejection reason is required when blood request is rejected'));
  }

  if (
    (this.status === REQUEST_STATUS.APPROVED || this.status === REQUEST_STATUS.REJECTED) &&
    (!this.adminAction || !this.adminAction.admin)
  ) {
    return next(new Error('Admin reference is required for final decision'));
  }

  next();
});

BloodRequestSchema.statics.applyAdminDecision = function applyAdminDecision({
  requestId,
  adminId,
  status,
  reason,
  session,
}) {
  return this.findOneAndUpdate(
    {
      _id: requestId,
      status: REQUEST_STATUS.PENDING,
    },
    {
      $set: {
        status,
        adminAction: {
          admin: adminId,
          reason: reason || null,
          actedAt: new Date(),
        },
      },
    },
    {
      new: true,
      session,
      runValidators: true,
    }
  );
};

BloodRequestSchema.statics.markInventoryApplied = function markInventoryApplied({
  requestId,
  session,
}) {
  const now = new Date();

  return this.findOneAndUpdate(
    {
      _id: requestId,
      status: REQUEST_STATUS.APPROVED,
      inventoryUpdated: false,
    },
    {
      $set: {
        inventoryApplied: true,
        inventoryAppliedAt: now,
        inventoryUpdated: true,
        inventoryUpdatedAt: now,
      },
    },
    {
      new: true,
      session,
    }
  );
};

BloodRequestSchema.index({ hospital: 1, status: 1, createdAt: -1 });
BloodRequestSchema.index({ requester: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);
