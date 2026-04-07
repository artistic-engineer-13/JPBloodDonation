const mongoose = require('mongoose');
const { BLOOD_GROUPS } = require('../constants/enums');

const { Schema } = mongoose;

const bloodInventorySchema = new Schema(
  {
    'A+': { type: Number, default: 0, min: 0 },
    'A-': { type: Number, default: 0, min: 0 },
    'B+': { type: Number, default: 0, min: 0 },
    'B-': { type: Number, default: 0, min: 0 },
    'AB+': { type: Number, default: 0, min: 0 },
    'AB-': { type: Number, default: 0, min: 0 },
    'O+': { type: Number, default: 0, min: 0 },
    'O-': { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const hospitalAddressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const HospitalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+()\-\s]{7,20}$/, 'Invalid phone format'],
    },
    address: {
      type: hospitalAddressSchema,
      required: true,
    },
    adminUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    inventory: {
      type: bloodInventorySchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

HospitalSchema.methods.adjustInventory = async function adjustInventory({
  bloodGroup,
  units,
  direction,
}) {
  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    throw new Error('Invalid blood group');
  }

  if (units <= 0) {
    throw new Error('Units should be greater than zero');
  }

  if (direction === 'IN') {
    this.inventory[bloodGroup] += units;
  } else if (direction === 'OUT') {
    if (this.inventory[bloodGroup] < units) {
      throw new Error('Insufficient inventory');
    }
    this.inventory[bloodGroup] -= units;
  } else {
    throw new Error('Invalid inventory direction');
  }

  return this.save();
};

HospitalSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model('Hospital', HospitalSchema);
