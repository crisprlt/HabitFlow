const pool = require('./conexion');

const CalendarController = {
  // Obtener hábitos del usuario
  getUserHabits: async (req, res) => {
    const { userId } = req.params;
    
    try {
      const query = `
        SELECT 
          h.id_habito,
          h.nombre,
          h.color,
          c.descripcion as categoria,
          m.cantidad as target,
          f.descripcion as frecuencia
        FROM habito h
        JOIN categoria c ON h.id_categoria = c.id_categoria
        JOIN meta m ON h.id_meta = m.id_meta
        JOIN frecuencia f ON h.id_frecuencia = f.id_frecuencia
        WHERE h.id_usuario = $1 AND h.activo = true
        ORDER BY h.nombre
      `;
      
      const result = await pool.query(query, [userId]);
      
      res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error obteniendo hábitos del usuario:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // Obtener datos del calendario para un hábito específico
  getCalendarData: async (req, res) => {
    const { habitId } = req.params;
    const { startDate, endDate } = req.query;
    
    try {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren fechas de inicio y fin'
        });
      }

      const query = `
        SELECT 
          rh.fecha,
          rh.valor,
          rh.completado,
          m.cantidad as target
        FROM registro_habito rh
        JOIN habito h ON rh.id_habito = h.id_habito
        JOIN meta m ON h.id_meta = m.id_meta
        WHERE rh.id_habito = $1 
          AND rh.fecha BETWEEN $2 AND $3
        ORDER BY rh.fecha
      `;
      
      const result = await pool.query(query, [habitId, startDate, endDate]);
      
      // Convertir a objeto con fecha como key para fácil acceso en frontend
      const habitData = {};
      result.rows.forEach(row => {
        const dateKey = row.fecha.toISOString().split('T')[0];
        habitData[dateKey] = {
          completed: row.completado,
          value: row.valor || 0,
          target: row.target
        };
      });
      
      res.status(200).json({
        success: true,
        data: habitData
      });

    } catch (error) {
      console.error('Error obteniendo datos del calendario:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // Obtener estadísticas del período
  getHabitStats: async (req, res) => {
    const { habitId } = req.params;
    const { startDate, endDate } = req.query;
    
    try {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren fechas de inicio y fin'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN rh.completado = true THEN 1 END) as dias_completados,
          COUNT(rh.fecha) as total_dias,
          ROUND(
            (COUNT(CASE WHEN rh.completado = true THEN 1 END)::numeric / 
             NULLIF(COUNT(rh.fecha), 0)) * 100, 2
          ) as porcentaje,
          COALESCE(SUM(rh.valor), 0) as total_realizado,
          m.cantidad as target_diario
        FROM registro_habito rh
        JOIN habito h ON rh.id_habito = h.id_habito
        JOIN meta m ON h.id_meta = m.id_meta
        WHERE rh.id_habito = $1 
          AND rh.fecha BETWEEN $2 AND $3
        GROUP BY m.cantidad
      `;
      
      const result = await pool.query(query, [habitId, startDate, endDate]);
      
      // Si no hay datos, devolver valores por defecto
      const stats = result.rows.length > 0 ? result.rows[0] : {
        dias_completados: 0,
        total_dias: 0,
        porcentaje: 0,
        total_realizado: 0,
        target_diario: 0
      };
      
      res.status(200).json({
        success: true,
        data: {
          diasCompletados: parseInt(stats.dias_completados),
          totalDias: parseInt(stats.total_dias),
          porcentaje: parseFloat(stats.porcentaje) || 0,
          totalRealizado: parseInt(stats.total_realizado),
          targetDiario: parseInt(stats.target_diario)
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // Obtener racha actual de un hábito
  getHabitStreak: async (req, res) => {
    const { habitId } = req.params;
    
    try {
      // Usar la función que ya tienes en la BD
      const query = `SELECT calcular_racha_habito($1) as racha_actual`;
      const result = await pool.query(query, [habitId]);
      
      res.status(200).json({
        success: true,
        data: {
          rachaActual: result.rows[0].racha_actual
        }
      });

    } catch (error) {
      console.error('Error obteniendo racha:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // Registrar progreso de un hábito (útil para futuras funcionalidades)
  recordHabitProgress: async (req, res) => {
    const { habitId } = req.params;
    const { fecha, valor, completado, nota } = req.body;
    
    try {
      const query = `
        INSERT INTO registro_habito (id_habito, fecha, valor, completado, nota)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id_habito, fecha) 
        DO UPDATE SET 
          valor = EXCLUDED.valor,
          completado = EXCLUDED.completado,
          nota = EXCLUDED.nota,
          fecha_registro = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        habitId, 
        fecha || new Date().toISOString().split('T')[0], 
        valor, 
        completado, 
        nota
      ]);
      
      // Actualizar estadísticas diarias
      const habitResult = await pool.query('SELECT id_usuario FROM habito WHERE id_habito = $1', [habitId]);
      if (habitResult.rows.length > 0) {
        const userId = habitResult.rows[0].id_usuario;
        await pool.query('SELECT actualizar_estadisticas_diarias($1, $2)', [userId, fecha]);
      }
      
      res.status(200).json({
        success: true,
        message: 'Progreso registrado exitosamente',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error registrando progreso:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }
};

module.exports = CalendarController;