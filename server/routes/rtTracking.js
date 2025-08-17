const express = require('express');
const router = express.Router();
const TrackingController = require('../controllers/tracking');

// =============================================
// RUTAS PARA DASHBOARD/PRINCIPAL
// =============================================

// Obtener datos completos del dashboard para un usuario
router.get('/dashboard/:userId', TrackingController.getDashboardData);

// Obtener estadísticas de progreso para una fecha específica
router.get('/progress/:userId', TrackingController.getProgressData);
router.get('/progress/:userId/:date', TrackingController.getProgressData);

// =============================================
// RUTAS PARA GESTIÓN DE HÁBITOS DIARIOS
// =============================================

// Obtener hábitos del día para un usuario
router.get('/habits/today/:userId', TrackingController.getTodayHabits);

// Marcar/desmarcar un hábito como completado
router.post('/habits/toggle', TrackingController.toggleHabitCompletion);

// Actualizar progreso de un hábito (para hábitos con cantidad)
router.put('/habits/progress', TrackingController.updateHabitProgress);

// =============================================
// RUTAS PARA NOTAS DIARIAS
// =============================================

// Obtener notas del día para un usuario
router.get('/notes/today/:userId', TrackingController.getTodayNotes);

// Crear una nueva nota
router.post('/notes', TrackingController.createNote);

// Actualizar una nota existente
router.put('/notes/:noteId', TrackingController.updateNote);

// Eliminar una nota
router.delete('/notes/:noteId', TrackingController.deleteNote);

// =============================================
// RUTAS PARA ESTADÍSTICAS
// =============================================

// Obtener estadísticas semanales
router.get('/stats/weekly/:userId', TrackingController.getWeeklyStats);

// Obtener rachas de hábitos
router.get('/streaks/:userId', TrackingController.getHabitStreaks);

module.exports = router;