const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Rutas de usuario
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile/:userId', UserController.getProfile);
router.put('/change-password', UserController.changePassword);
router.put('/change-profile', UserController.updateProfile);

module.exports = router;