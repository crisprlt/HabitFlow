const express = require('express');
const router = express.Router();
const HabitController = require('../controllers/habit');

// Rutas de Habitos
router.post('/create', HabitController.createHabit);
router.get('/list/:userId', HabitController.getHabits);
router.get('/detail/:habitId', HabitController.getHabitDetail);
router.put('/update/:habitId', HabitController.updateHabit);
router.delete('/delete/:habitId', HabitController.deleteHabit);
router.post('/complete/:habitId', HabitController.markHabitComplete);
router.get('/progress/:habitId', HabitController.getHabitProgress);

// Rutas para categorías
router.get('/categories', HabitController.getCategories);
router.post('/categories', HabitController.createCategory);

// Rutas para frecuencias
router.get('/frequencies', HabitController.getFrequencies);
router.post('/frequencies', HabitController.createFrequency);

// Rutas para unidades de medida
router.get('/units', HabitController.getUnits);
router.post('/units', HabitController.createUnit);

module.exports = router;
module.exports = router;