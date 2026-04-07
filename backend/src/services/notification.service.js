const Notification = require('../models/Notification');
const User = require('../models/User');
const { USER_ROLES, NOTIFICATION_TYPE } = require('../constants/enums');

const createNotification = async ({
  userId,
  title,
  message,
  type = NOTIFICATION_TYPE.INFO,
  relatedModel = null,
  relatedId = null,
  session,
}) => {
  const payload = {
    recipient: userId,
    title,
    message,
    type,
    relatedModel,
    relatedId,
  };

  const options = session ? { session } : undefined;
  const created = await Notification.create([payload], options);
  return created[0];
};

const createNotificationsForHospitalUsers = async ({
  hospitalId,
  hospitalName,
  title,
  message,
  type = NOTIFICATION_TYPE.INFO,
  relatedModel = null,
  relatedId = null,
  session,
}) => {
  const hospitalUsers = await User.find({
    role: USER_ROLES.HOSPITAL,
    isActive: true,
    $or: [
      { hospital: hospitalId },
      ...(hospitalName ? [{ hospitalName }] : []),
    ],
  }).select('_id');

  if (!hospitalUsers.length) {
    return [];
  }

  const docs = hospitalUsers.map((user) => ({
    recipient: user._id,
    title,
    message,
    type,
    relatedModel,
    relatedId,
  }));

  const options = session ? { session } : undefined;
  return Notification.insertMany(docs, options);
};

module.exports = {
  createNotification,
  createNotificationsForHospitalUsers,
};
