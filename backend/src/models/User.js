const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES, BLOOD_GROUPS } = require('../constants/enums');

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

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+()\-\s]{7,20}$/, 'Invalid phone format'],
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 250,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: null,
      index: true,
    },
    neededBloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: null,
      index: true,
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
      default: null,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      default: null,
    },
    medicalEligibility: {
      type: Boolean,
      default: null,
    },
    hospitalName: {
      type: String,
      trim: true,
      default: null,
      maxlength: 120,
    },
    licenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: undefined,
      unique: true,
      sparse: true,
      index: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
      index: true,
    },
    inventory: {
      type: bloodInventorySchema,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.pre('validate', function roleConstraint(next) {
  if (this.role === USER_ROLES.HOSPITAL) {
    if (!this.hospitalName || !this.licenseNumber) {
      return next(new Error('Hospital role requires hospitalName and licenseNumber'));
    }
  }

  if (this.role === USER_ROLES.DONOR) {
    if (!this.bloodGroup || !this.age || !this.gender) {
      return next(new Error('Donor role requires bloodGroup, age, and gender'));
    }

    if (this.medicalEligibility !== true) {
      return next(new Error('Donor must be medically eligible to register'));
    }
  }

  if (this.role === USER_ROLES.BLOOD_REQUESTER) {
    if (!this.neededBloodGroup || !this.age || !this.gender) {
      return next(new Error('Blood requester role requires neededBloodGroup, age, and gender'));
    }
  }

  if (this.role !== USER_ROLES.HOSPITAL) {
    this.hospitalName = null;
    this.licenseNumber = undefined;
  }

  if (this.role !== USER_ROLES.DONOR) {
    this.bloodGroup = null;
    this.medicalEligibility = null;
    this.inventory = undefined;
  } else if (!this.inventory) {
    this.inventory = {};
  }

  if (this.role !== USER_ROLES.BLOOD_REQUESTER) {
    this.neededBloodGroup = null;
  }

  if (![USER_ROLES.DONOR, USER_ROLES.BLOOD_REQUESTER].includes(this.role)) {
    this.age = null;
    this.gender = null;
  }

  if (this.role !== USER_ROLES.HOSPITAL) {
    this.hospital = null;
  }

  next();
});

UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.fullName,
    email: this.email,
    phone: this.phone,
    address: this.address,
    role: this.role,
    bloodGroup: this.bloodGroup,
    neededBloodGroup: this.neededBloodGroup,
    age: this.age,
    gender: this.gender,
    medicalEligibility: this.medicalEligibility,
    hospitalName: this.hospitalName,
    licenseNumber: this.licenseNumber,
    inventory: this.inventory || null,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
