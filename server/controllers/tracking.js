const pool = require('./conexion');

const TrackingController = {
  // =============================================
  // DASHBOARD PRINCIPAL
  // =============================================

  // Obtener todos los datos necesarios para la pantalla principal
  getDashboardData: async (req, res) => {
    const { userId } = req.params;
    const fecha = req.query.date || new Date().toISOString().split('T')[0];

    try {
      // Obtener hábitos del usuario con su progreso del día
      const habitsQuery = `
        SELECT 
          h.*,
          c.descripcion as categoria,
          f.descripcion as frecuencia,
          m.cantidad as target,
          u.descripcion as target_unit,
          COALESCE(rh.valor, 0) as current,
          COALESCE(rh.completado, false) as completed,
          calcular_racha_habito(h.id_habito) as streak
        FROM habito h
        JOIN categoria c ON h.id_categoria = c.id_categoria
        JOIN frecuencia f ON h.id_frecuencia = f.id_frecuencia
        JOIN meta m ON h.id_meta = m.id_meta
        JOIN unidad_medida u ON m.id_unidad_medida = u.id_unidad_medida
        LEFT JOIN registro_habito rh ON h.id_habito = rh.id_habito AND rh.fecha = $2
        WHERE h.id_usuario = $1
        ORDER BY h.id_habito DESC
      `;

      // Obtener notas del día
      const notesQuery = `
        SELECT * FROM notas_diarias 
        WHERE id_usuario = $1 AND fecha = $2 
        ORDER BY fecha_creacion DESC
      `;

      // Obtener estadísticas del día
      const statsQuery = `
        SELECT 
          COUNT(*) as total_habitos,
          COUNT(CASE WHEN rh.completado = true THEN 1 END) as habitos_completados,
          ROUND(
            (COUNT(CASE WHEN rh.completado = true THEN 1 END)::numeric / 
             NULLIF(COUNT(*)::numeric, 0)) * 100, 2
          ) as porcentaje_completado
        FROM habito h
        LEFT JOIN registro_habito rh ON h.id_habito = rh.id_habito AND rh.fecha = $2
        WHERE h.id_usuario = $1
      `;

      const [habitsResult, notesResult, statsResult] = await Promise.all([
        pool.query(habitsQuery, [userId, fecha]),
        pool.query(notesQuery, [userId, fecha]),
        pool.query(statsQuery, [userId, fecha])
      ]);

      // Actualizar estadísticas diarias
      await pool.query('SELECT actualizar_estadisticas_diarias($1, $2)', [userId, fecha]);

      res.status(200).json({
        success: true,
        data: {
          habits: habitsResult.rows,
          notes: notesResult.rows,
          stats: statsResult.rows[0],
          date: fecha
        }
      });

    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // =============================================
  // GESTIÓN DE HÁBITOS DIARIOS
  // =============================================

  // Obtener hábitos de hoy
  getTodayHabits: async (req, res) => {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    try {
      const result = await pool.query(`
        SELECT 
          h.*,
          c.descripcion as categoria,
          m.cantidad as target,
          u.descripcion as target_unit,
          COALESCE(rh.valor, 0) as current,
          COALESCE(rh.completado, false) as completed,
          calcular_racha_habito(h.id_habito) as streak
        FROM habito h
        JOIN categoria c ON h.id_categoria = c.id_categoria
        JOIN meta m ON h.id_meta = m.id_meta
        JOIN unidad_medida u ON m.id_unidad_medida = u.id_unidad_medida
        LEFT JOIN registro_habito rh ON h.id_habito = rh.id_habito AND rh.fecha = $2
        WHERE h.id_usuario = $1
        ORDER BY h.id_habito DESC
      `, [userId, today]);

      res.status(200).json({
        success: true,
        data: { habits: result.rows }
      });

    } catch (error) {
      console.error('Error obteniendo hábitos de hoy:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Marcar/desmarcar hábito como completado
  toggleHabitCompletion: async (req, res) => {
    const { habitId, userId, completed, valor = null, fecha = null } = req.body;
    const targetDate = fecha || new Date().toISOString().split('T')[0];

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el hábito pertenece al usuario
      const habitCheck = await client.query(
        'SELECT id_habito, id_meta FROM habito WHERE id_habito = $1 AND id_usuario = $2',
        [habitId, userId]
      );

      if (habitCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Hábito no encontrado' });
      }

      // Obtener meta del hábito
      const metaResult = await client.query(
        'SELECT cantidad FROM meta WHERE id_meta = $1',
        [habitCheck.rows[0].id_meta]
      );
      const targetValue = metaResult.rows[0].cantidad;

      // Verificar si ya existe un registro para esta fecha
      const existingRecord = await client.query(
        'SELECT * FROM registro_habito WHERE id_habito = $1 AND fecha = $2',
        [habitId, targetDate]
      );

      let finalValue = valor || (completed ? targetValue : 0);

      if (existingRecord.rows.length > 0) {
        // Actualizar registro existente
        await client.query(
          'UPDATE registro_habito SET valor = $1, completado = $2, fecha_registro = CURRENT_TIMESTAMP WHERE id_habito = $3 AND fecha = $4',
          [finalValue, completed, habitId, targetDate]
        );
      } else {
        // Crear nuevo registro
        await client.query(
          'INSERT INTO registro_habito (id_habito, fecha, valor, completado) VALUES ($1, $2, $3, $4)',
          [habitId, targetDate, finalValue, completed]
        );
      }

      // Actualizar racha en la tabla hábito
      const newStreak = completed ? 
        await client.query('SELECT calcular_racha_habito($1)', [habitId]) : 
        { rows: [{ calcular_racha_habito: 0 }] };

      await client.query(
        'UPDATE habito SET racha = $1, ultimo_completado = $2 WHERE id_habito = $3',
        [newStreak.rows[0].calcular_racha_habito, completed ? targetDate : null, habitId]
      );

      // Actualizar estadísticas diarias
      await client.query('SELECT actualizar_estadisticas_diarias($1, $2)', [userId, targetDate]);

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: completed ? 'Hábito marcado como completado' : 'Hábito desmarcado',
        data: {
          habitId,
          completed,
          valor: finalValue,
          streak: newStreak.rows[0].calcular_racha_habito
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error actualizando hábito:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  },

  // Actualizar progreso de un hábito (para hábitos con cantidad)
  updateHabitProgress: async (req, res) => {
    const { habitId, userId, valor, fecha = null } = req.body;
    const targetDate = fecha || new Date().toISOString().split('T')[0];

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el hábito pertenece al usuario y obtener meta
      const habitResult = await client.query(`
        SELECT h.id_habito, h.id_meta, m.cantidad as target
        FROM habito h
        JOIN meta m ON h.id_meta = m.id_meta
        WHERE h.id_habito = $1 AND h.id_usuario = $2
      `, [habitId, userId]);

      if (habitResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Hábito no encontrado' });
      }

      const { target } = habitResult.rows[0];
      const completed = valor >= target;

      // Insertar o actualizar registro
      await client.query(`
        INSERT INTO registro_habito (id_habito, fecha, valor, completado)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id_habito, fecha)
        DO UPDATE SET valor = $3, completado = $4, fecha_registro = CURRENT_TIMESTAMP
      `, [habitId, targetDate, valor, completed]);

      // Actualizar estadísticas
      await client.query('SELECT actualizar_estadisticas_diarias($1, $2)', [userId, targetDate]);

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Progreso actualizado exitosamente',
        data: { habitId, valor, completed, target }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error actualizando progreso:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  },

  // =============================================
  // GESTIÓN DE NOTAS DIARIAS
  // =============================================

  // Obtener notas de hoy
  getTodayNotes: async (req, res) => {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    try {
      const result = await pool.query(
        'SELECT * FROM notas_diarias WHERE id_usuario = $1 AND fecha = $2 ORDER BY fecha_creacion DESC',
        [userId, today]
      );

      res.status(200).json({
        success: true,
        data: { notes: result.rows }
      });

    } catch (error) {
      console.error('Error obteniendo notas:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear nueva nota
  createNote: async (req, res) => {
    const { userId, texto, fecha = null } = req.body;
    const targetDate = fecha || new Date().toISOString().split('T')[0];

    try {
      const result = await pool.query(
        'INSERT INTO notas_diarias (id_usuario, texto, fecha) VALUES ($1, $2, $3) RETURNING *',
        [userId, texto, targetDate]
      );

      res.status(201).json({
        success: true,
        message: 'Nota creada exitosamente',
        data: { note: result.rows[0] }
      });

    } catch (error) {
      console.error('Error creando nota:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar nota existente
  updateNote: async (req, res) => {
    const { noteId } = req.params;
    const { texto, userId } = req.body;

    try {
      const result = await pool.query(
        'UPDATE notas_diarias SET texto = $1, fecha_modificacion = CURRENT_TIMESTAMP WHERE id_nota = $2 AND id_usuario = $3 RETURNING *',
        [texto, noteId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Nota no encontrada' });
      }

      res.status(200).json({
        success: true,
        message: 'Nota actualizada exitosamente',
        data: { note: result.rows[0] }
      });

    } catch (error) {
      console.error('Error actualizando nota:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar nota
  deleteNote: async (req, res) => {
    const { noteId } = req.params;
    const { userId } = req.body;

    try {
      const result = await pool.query(
        'DELETE FROM notas_diarias WHERE id_nota = $1 AND id_usuario = $2 RETURNING *',
        [noteId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Nota no encontrada' });
      }

      res.status(200).json({
        success: true,
        message: 'Nota eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando nota:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // =============================================
  // ESTADÍSTICAS Y PROGRESO
  // =============================================

  // Obtener datos de progreso
  getProgressData: async (req, res) => {
    const { userId, date } = req.params;
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
      const result = await pool.query(`
        SELECT 
          total_habitos,
          habitos_completados,
          porcentaje_completado,
          racha_actual
        FROM estadisticas_diarias 
        WHERE id_usuario = $1 AND fecha = $2
      `, [userId, targetDate]);

      // Si no hay estadísticas, calcularlas
      if (result.rows.length === 0) {
        await pool.query('SELECT actualizar_estadisticas_diarias($1, $2)', [userId, targetDate]);
        const newResult = await pool.query(`
          SELECT total_habitos, habitos_completados, porcentaje_completado, racha_actual
          FROM estadisticas_diarias 
          WHERE id_usuario = $1 AND fecha = $2
        `, [userId, targetDate]);
        
        return res.status(200).json({
          success: true,
          data: newResult.rows[0] || { total_habitos: 0, habitos_completados: 0, porcentaje_completado: 0, racha_actual: 0 }
        });
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener estadísticas semanales
  getWeeklyStats: async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await pool.query(`
        SELECT 
          fecha,
          porcentaje_completado,
          habitos_completados,
          total_habitos
        FROM estadisticas_diarias 
        WHERE id_usuario = $1 
        AND fecha >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY fecha DESC
      `, [userId]);

      res.status(200).json({
        success: true,
        data: { weeklyStats: result.rows }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas semanales:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener rachas de hábitos
  getHabitStreaks: async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await pool.query(`
        SELECT 
          h.id_habito,
          h.nombre,
          h.racha as current_streak,
          calcular_racha_habito(h.id_habito) as calculated_streak
        FROM habito h
        WHERE h.id_usuario = $1
        ORDER BY h.racha DESC
      `, [userId]);

      res.status(200).json({
        success: true,
        data: { streaks: result.rows }
      });

    } catch (error) {
      console.error('Error obteniendo rachas:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = TrackingController;