const express = require('express');
const router = express.Router();
const toDoController = require('../controllers/other'); // Cambié el path

// =============================================
// RUTAS PARA AREAS
// =============================================

// Obtener todas las áreas de un usuario con estadísticas
router.get('/todo/:id_usuario/areas', toDoController.getAreas);

// Crear nueva área
router.post('/todo/:id_usuario/areas', toDoController.createArea);

// Eliminar área
router.delete('/todo/:id_usuario/areas/:area_id', toDoController.deleteArea);

// =============================================
// RUTAS PARA TAREAS
// =============================================

// Obtener todas las tareas de un área específica
router.get('/todo/:id_usuario/areas/:area_id/tasks', toDoController.getTasks);

// Crear nueva tarea en un área
router.post('/todo/:id_usuario/areas/:area_id/tasks', toDoController.createTask);

// Cambiar estado de completado de una tarea
router.patch('/todo/:id_usuario/areas/:area_id/tasks/:task_id/toggle', toDoController.toggleTask);

// Editar texto de una tarea
router.put('/todo/:id_usuario/areas/:area_id/tasks/:task_id', toDoController.updateTask);

// Eliminar tarea
router.delete('/todo/:id_usuario/areas/:area_id/tasks/:task_id', toDoController.deleteTask);

// =============================================
// RUTAS ESPECIALES
// =============================================

// Obtener estadísticas generales del usuario
router.get('/todo/:id_usuario/stats', toDoController.getUserStats);

// Obtener datos completos del dashboard para un usuario (áreas + tareas)
router.get('/todo/:id_usuario', toDoController.getAreasWithTasks);

module.exports = router;