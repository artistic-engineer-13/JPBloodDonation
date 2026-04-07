const mongoose = require('mongoose');

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const parseBoolean = (value) => {
  if (value === undefined) {
    return null;
  }

  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return null;
};

const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const readFilter = parseBoolean(req.query.read);
  const filter = { recipient: req.user._id };

  if (readFilter !== null) {
    filter.isRead = readFilter;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
  ]);

  const normalized = notifications.map((item) => ({
    id: item._id,
    userId: item.recipient,
    title: item.title,
    message: item.message,
    type: item.type,
    read: item.isRead,
    readAt: item.readAt,
    createdAt: item.createdAt,
    relatedModel: item.relatedModel,
    relatedId: item.relatedId,
  }));

  res.status(200).json({
    success: true,
    message: 'Notifications fetched',
    data: {
      notifications: normalized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  if (!mongoose.isValidObjectId(notificationId)) {
    throw new ApiError(400, 'Invalid notification id');
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: req.user._id,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: {
      notification: {
        id: notification._id,
        userId: notification.recipient,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.isRead,
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      },
    },
  });
});

module.exports = {
  getNotifications,
  markNotificationAsRead,
};
