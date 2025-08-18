const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Rutas de usuario
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile/:userId', UserController.getProfile);
router.put('/change-password', UserController.changePassword);
router.put('/change-profile', UserController.updateProfile);
router.post('/enviar-codigo-recuperacion', UserController.sendResetCode);
router.post('/verificar-codigo-recuperacion', UserController.verifyResetCode);
router.put('/reset-pw-code', UserController.resetPasswordWithCode);

module.exports = router;