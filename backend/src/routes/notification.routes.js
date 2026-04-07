const express = require('express');

const {
  getNotifications,
  markNotificationAsRead,
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.patch('/:id/read', markNotificationAsRead);

module.exports = router;
