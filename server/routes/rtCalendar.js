const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendar');
// Rutas del calendario
router.get('/habits/user/:userId', CalendarController.getUserHabits);
router.get('/habits/calendar/:habitId', CalendarController.getCalendarData);
router.get('/habits/stats/:habitId', CalendarController.getHabitStats);
router.get('/habits/streak/:habitId', CalendarController.getHabitStreak);
router.post('/habits/progress/:habitId', CalendarController.recordHabitProgress);

module.exports = router;