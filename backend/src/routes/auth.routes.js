const express = require('express');

const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public auth APIs.
router.post('/register', register);
router.post('/login', login);

// Protected profile API.
router.get('/me', protect, getMe);

module.exports = router;
