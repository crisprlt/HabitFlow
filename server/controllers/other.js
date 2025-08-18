const pool = require('./conexion');

const toDoController = {
  // AREAS CONTROLLERS
  
  // Obtener todas las áreas de un usuario con estadísticas
  getAreas: async (req, res) => {
    try {
      const { id_usuario } = req.params;
      
      const query = `
        SELECT 
          a.id,
          a.id_usuario,
          a.name,
          a.emoji,
          a.color,
          a.created_at,
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.completed THEN 1 END) as completed_tasks,
          CASE 
            WHEN COUNT(t.id) > 0 THEN 
              ROUND((COUNT(CASE WHEN t.completed THEN 1 END) * 100.0 / COUNT(t.id)), 0)
            ELSE 0 
          END as completion_percentage
        FROM areas a
        LEFT JOIN tasks t ON a.id = t.area_id
        WHERE a.id_usuario = $1
        GROUP BY a.id, a.id_usuario, a.name, a.emoji, a.color, a.created_at
        ORDER BY a.created_at ASC
      `;
      
      const result = await pool.query(query, [id_usuario]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Crear nueva área
  createArea: async (req, res) => {
    try {
      const { id_usuario } = req.params;
      const { name, emoji = '📝', color = '#968ce4' } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre del área es requerido' });
      }

      const query = `
        INSERT INTO areas (id_usuario, name, emoji, color) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const result = await pool.query(query, [id_usuario, name.trim(), emoji, color]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear área:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Eliminar área (y todas sus tareas por CASCADE)
  deleteArea: async (req, res) => {
    try {
      const { id_usuario, area_id } = req.params;

      const query = 'DELETE FROM areas WHERE id = $1 AND id_usuario = $2 RETURNING *';
      const result = await pool.query(query, [area_id, id_usuario]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Área no encontrada o no pertenece al usuario' });
      }

      res.json({ message: 'Área eliminada exitosamente', area: result.rows[0] });
    } catch (error) {
      console.error('Error al eliminar área:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // TASKS CONTROLLERS

  // Obtener todas las tareas de un área específica
  getTasks: async (req, res) => {
    try {
      const { id_usuario, area_id } = req.params;

      // Verificar que el área pertenece al usuario
      const areaCheck = await pool.query(
        'SELECT id FROM areas WHERE id = $1 AND id_usuario = $2',
        [area_id, id_usuario]
      );

      if (areaCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Área no encontrada o no pertenece al usuario' });
      }

      const query = `
        SELECT 
          t.id,
          t.area_id,
          t.text,
          t.completed,
          t.priority,
          t.created_at
        FROM tasks t
        WHERE t.area_id = $1
        ORDER BY t.completed ASC, 
                 CASE t.priority 
                   WHEN 'alta' THEN 1 
                   WHEN 'media' THEN 2 
                   WHEN 'baja' THEN 3 
                 END,
                 t.created_at DESC
      `;

      const result = await pool.query(query, [area_id]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Crear nueva tarea
  createTask: async (req, res) => {
    try {
      const { id_usuario, area_id } = req.params;
      const { text, priority = 'media' } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'El texto de la tarea es requerido' });
      }

      // Verificar que el área pertenece al usuario
      const areaCheck = await pool.query(
        'SELECT id FROM areas WHERE id = $1 AND id_usuario = $2',
        [area_id, id_usuario]
      );

      if (areaCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Área no encontrada o no pertenece al usuario' });
      }

      // Validar prioridad
      if (!['alta', 'media', 'baja'].includes(priority)) {
        return res.status(400).json({ error: 'Prioridad inválida' });
      }

      const query = `
        INSERT INTO tasks (area_id, text, priority) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `;

      const result = await pool.query(query, [area_id, text.trim(), priority]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear tarea:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Alternar estado completado de una tarea
  toggleTask: async (req, res) => {
    try {
      const { id_usuario, area_id, task_id } = req.params;

      // Verificar que la tarea pertenece al área del usuario
      const taskCheck = await pool.query(`
        SELECT t.id, t.completed 
        FROM tasks t 
        JOIN areas a ON t.area_id = a.id 
        WHERE t.id = $1 AND t.area_id = $2 AND a.id_usuario = $3
      `, [task_id, area_id, id_usuario]);

      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada o no pertenece al usuario' });
      }

      const query = `
        UPDATE tasks 
        SET completed = NOT completed 
        WHERE id = $1 
        RETURNING *
      `;

      const result = await pool.query(query, [task_id]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Editar texto de una tarea
  updateTask: async (req, res) => {
    try {
      const { id_usuario, area_id, task_id } = req.params;
      const { text } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'El texto de la tarea es requerido' });
      }

      // Verificar que la tarea pertenece al área del usuario
      const taskCheck = await pool.query(`
        SELECT t.id 
        FROM tasks t 
        JOIN areas a ON t.area_id = a.id 
        WHERE t.id = $1 AND t.area_id = $2 AND a.id_usuario = $3
      `, [task_id, area_id, id_usuario]);

      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada o no pertenece al usuario' });
      }

      const query = `
        UPDATE tasks 
        SET text = $1 
        WHERE id = $2 
        RETURNING *
      `;

      const result = await pool.query(query, [text.trim(), task_id]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Eliminar tarea
  deleteTask: async (req, res) => {
    try {
      const { id_usuario, area_id, task_id } = req.params;

      // Verificar que la tarea pertenece al área del usuario
      const taskCheck = await pool.query(`
        SELECT t.id 
        FROM tasks t 
        JOIN areas a ON t.area_id = a.id 
        WHERE t.id = $1 AND t.area_id = $2 AND a.id_usuario = $3
      `, [task_id, area_id, id_usuario]);

      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada o no pertenece al usuario' });
      }

      const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [task_id]);

      res.json({ message: 'Tarea eliminada exitosamente', task: result.rows[0] });
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // ESTADÍSTICAS GENERALES

  // Obtener estadísticas generales del usuario
  getUserStats: async (req, res) => {
    try {
      const { id_usuario } = req.params;

      const query = `
        SELECT 
          COUNT(DISTINCT a.id) as total_areas,
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.completed THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN NOT t.completed THEN 1 END) as pending_tasks,
          CASE 
            WHEN COUNT(t.id) > 0 THEN 
              ROUND((COUNT(CASE WHEN t.completed THEN 1 END) * 100.0 / COUNT(t.id)), 1)
            ELSE 0 
          END as overall_completion_percentage
        FROM areas a
        LEFT JOIN tasks t ON a.id = t.area_id
        WHERE a.id_usuario = $1
      `;

      const result = await pool.query(query, [id_usuario]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener áreas con sus tareas (datos completos para la pantalla)
  getAreasWithTasks: async (req, res) => {
    try {
      const { id_usuario } = req.params;

      // Obtener áreas
      const areasQuery = `
        SELECT 
          a.id,
          a.id_usuario,
          a.name,
          a.emoji,
          a.color,
          a.created_at
        FROM areas a
        WHERE a.id_usuario = $1
        ORDER BY a.created_at ASC
      `;

      const areasResult = await pool.query(areasQuery, [id_usuario]);
      const areas = areasResult.rows;

      // Obtener tareas para cada área
      for (let area of areas) {
        const tasksQuery = `
          SELECT 
            id,
            area_id,
            text,
            completed,
            priority,
            created_at
          FROM tasks
          WHERE area_id = $1
          ORDER BY completed ASC, 
                   CASE priority 
                     WHEN 'alta' THEN 1 
                     WHEN 'media' THEN 2 
                     WHEN 'baja' THEN 3 
                   END,
                   created_at DESC
        `;

        const tasksResult = await pool.query(tasksQuery, [area.id]);
        area.tasks = tasksResult.rows;
      }

      res.json(areas);
    } catch (error) {
      console.error('Error al obtener áreas con tareas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = toDoController;