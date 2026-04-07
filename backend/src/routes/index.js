const express = require('express');
const adminRoutes = require('./admin.routes');
const authRoutes = require('./auth.routes');
const bloodRequestRoutes = require('./bloodRequest.routes');
const donorRequestRoutes = require('./donorRequest.routes');
const healthRoutes = require('./health.routes');
const hospitalRoutes = require('./hospital.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/request', bloodRequestRoutes);
router.use('/donor', donorRequestRoutes);
router.use('/hospital', hospitalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/health', healthRoutes);

module.exports = router;
