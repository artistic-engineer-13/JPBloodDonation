const mongoose = require('mongoose');
const { BLOOD_GROUPS, REQUEST_STATUS } = require('../constants/enums');

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

const DonorRequestSchema = new Schema(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    donorName: {
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
      max: 4,
    },
    preferredDonationDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
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
    donorInventoryUpdatedAt: {
      type: Date,
      default: null,
    },
    hospitalInventoryUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

DonorRequestSchema.pre('validate', function validateAdminAction(next) {
  if (
    this.status === REQUEST_STATUS.REJECTED &&
    (!this.adminAction || !this.adminAction.reason)
  ) {
    return next(new Error('Rejection reason is required when donor request is rejected'));
  }

  if (
    (this.status === REQUEST_STATUS.APPROVED || this.status === REQUEST_STATUS.REJECTED) &&
    (!this.adminAction || !this.adminAction.admin)
  ) {
    return next(new Error('Admin reference is required for final decision'));
  }

  next();
});

DonorRequestSchema.statics.applyAdminDecision = function applyAdminDecision({
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

DonorRequestSchema.statics.markInventoryApplied = function markInventoryApplied({
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

DonorRequestSchema.index({ hospital: 1, status: 1, createdAt: -1 });
DonorRequestSchema.index({ donor: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('DonorRequest', DonorRequestSchema);
