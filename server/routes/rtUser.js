const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Rutas de usuario
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', UserController.getProfile);
router.put('/change-password', UserController.changePassword);

module.exports = router;