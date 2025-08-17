const pool = require('./conexion');

const HabitController = {
  // Crear un nuevo hábito
  createHabit: async (req, res) => {
    const {
      userId,
      name,
      description,
      notes,
      icon,
      category,
      target,
      targetUnit,
      frequency,
      reminderEnabled,
      reminderTime
    } = req.body;

    console.log('Datos recibidos:', { userId, name, description, notes, icon, category, target, targetUnit, frequency, reminderEnabled, reminderTime });

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Verificar o crear categoría
      let categoryId;
      const existingCategory = await client.query(
        'SELECT id_categoria FROM categoria WHERE descripcion = $1',
        [category]
      );

      if (existingCategory.rows.length > 0) {
        categoryId = existingCategory.rows[0].id_categoria;
      } else {
        const newCategory = await client.query(
          'INSERT INTO categoria (descripcion) VALUES ($1) RETURNING id_categoria',
          [category]
        );
        categoryId = newCategory.rows[0].id_categoria;
      }

      // 2. Verificar o crear frecuencia
      let frequencyId;
      const existingFrequency = await client.query(
        'SELECT id_frecuencia FROM frecuencia WHERE descripcion = $1',
        [frequency]
      );

      if (existingFrequency.rows.length > 0) {
        frequencyId = existingFrequency.rows[0].id_frecuencia;
      } else {
        const newFrequency = await client.query(
          'INSERT INTO frecuencia (descripcion) VALUES ($1) RETURNING id_frecuencia',
          [frequency]
        );
        frequencyId = newFrequency.rows[0].id_frecuencia;
      }

      // 3. Verificar o crear unidad de medida
      let unitId;
      const existingUnit = await client.query(
        'SELECT id_unidad_medida FROM unidad_medida WHERE descripcion = $1',
        [targetUnit]
      );

      if (existingUnit.rows.length > 0) {
        unitId = existingUnit.rows[0].id_unidad_medida;
      } else {
        const newUnit = await client.query(
          'INSERT INTO unidad_medida (descripcion) VALUES ($1) RETURNING id_unidad_medida',
          [targetUnit]
        );
        unitId = newUnit.rows[0].id_unidad_medida;
      }

      console.log('IDs obtenidos:', { categoryId, frequencyId, unitId });

      // 4. Crear meta con validación
      const targetValue = parseInt(target) || 1;
      console.log('Creando meta con:', { unitId, targetValue });
      
      const metaResult = await client.query(
        'INSERT INTO meta (id_unidad_medida, cantidad) VALUES ($1, $2) RETURNING id_meta',
        [unitId, targetValue]
      );
      
      if (!metaResult.rows[0] || !metaResult.rows[0].id_meta) {
        throw new Error('No se pudo crear la meta');
      }
      
      const metaId = metaResult.rows[0].id_meta;
      console.log('Meta creada con ID:', metaId);

      // 5. Crear hábito
      const habitResult = await client.query(`
        INSERT INTO habito (
          nombre, descripcion, notas, icono, completado, racha, actual, 
          ultimo_completado, recordatorio_activo, hora_recordatorio,
          id_frecuencia, id_categoria, id_usuario, id_meta
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          name, 
          description || '', 
          notes || '', 
          icon, 
          false, 
          0, 
          0,
          null, 
          reminderEnabled || false, 
          reminderTime || null,
          frequencyId, 
          categoryId, 
          userId, 
          metaId
        ]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Hábito creado exitosamente',
        data: { habit: habitResult.rows[0] }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando hábito:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error.message 
      });
    } finally {
      client.release();
    }
  },

  // Obtener todos los hábitos de un usuario
  getHabits: async (req, res) => {
    const { userId } = req.params;

    try {
      const habitsResult = await pool.query(`
        SELECT 
          h.*,
          c.descripcion as categoria,
          f.descripcion as frecuencia,
          m.cantidad as target,
          u.descripcion as target_unit
        FROM habito h
        JOIN categoria c ON h.id_categoria = c.id_categoria
        JOIN frecuencia f ON h.id_frecuencia = f.id_frecuencia
        JOIN meta m ON h.id_meta = m.id_meta
        JOIN unidad_medida u ON m.id_unidad_medida = u.id_unidad_medida
        WHERE h.id_usuario = $1
        ORDER BY h.id_habito DESC
      `, [userId]);

      res.status(200).json({
        success: true,
        data: { habits: habitsResult.rows }
      });

    } catch (error) {
      console.error('Error obteniendo hábitos:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener detalle de un hábito específico
  getHabitDetail: async (req, res) => {
    const { habitId } = req.params;

    try {
      const habitResult = await pool.query(`
        SELECT 
          h.*,
          c.descripcion as categoria,
          f.descripcion as frecuencia,
          m.cantidad as target,
          u.descripcion as target_unit
        FROM habito h
        JOIN categoria c ON h.id_categoria = c.id_categoria
        JOIN frecuencia f ON h.id_frecuencia = f.id_frecuencia
        JOIN meta m ON h.id_meta = m.id_meta
        JOIN unidad_medida u ON m.id_unidad_medida = u.id_unidad_medida
        WHERE h.id_habito = $1
      `, [habitId]);

      if (habitResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Hábito no encontrado' });
      }

      res.status(200).json({
        success: true,
        data: { habit: habitResult.rows[0] }
      });

    } catch (error) {
      console.error('Error obteniendo detalle del hábito:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar un hábito
  updateHabit: async (req, res) => {
    const { habitId } = req.params;
    const {
      name,
      description,
      notes,
      icon,
      category,
      target,
      targetUnit,
      frequency,
      reminderEnabled,
      reminderTime
    } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el hábito existe
      const existingHabit = await client.query(
        'SELECT * FROM habito WHERE id_habito = $1',
        [habitId]
      );

      if (existingHabit.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Hábito no encontrado' });
      }

      const habit = existingHabit.rows[0];

      // Actualizar categoría si es necesario
      let categoryId = habit.id_categoria;
      if (category) {
        const categoryResult = await client.query(
          'SELECT id_categoria FROM categoria WHERE descripcion = $1',
          [category]
        );

        if (categoryResult.rows.length === 0) {
          const newCategory = await client.query(
            'INSERT INTO categoria (descripcion) VALUES ($1) RETURNING id_categoria',
            [category]
          );
          categoryId = newCategory.rows[0].id_categoria;
        } else {
          categoryId = categoryResult.rows[0].id_categoria;
        }
      }

      // Actualizar frecuencia si es necesario
      let frequencyId = habit.id_frecuencia;
      if (frequency) {
        const frequencyResult = await client.query(
          'SELECT id_frecuencia FROM frecuencia WHERE descripcion = $1',
          [frequency]
        );

        if (frequencyResult.rows.length === 0) {
          const newFrequency = await client.query(
            'INSERT INTO frecuencia (descripcion) VALUES ($1) RETURNING id_frecuencia',
            [frequency]
          );
          frequencyId = newFrequency.rows[0].id_frecuencia;
        } else {
          frequencyId = frequencyResult.rows[0].id_frecuencia;
        }
      }

      // Actualizar meta si es necesario
      if (target || targetUnit) {
        let unitId;
        if (targetUnit) {
          const unitResult = await client.query(
            'SELECT id_unidad_medida FROM unidad_medida WHERE descripcion = $1',
            [targetUnit]
          );

          if (unitResult.rows.length === 0) {
            const newUnit = await client.query(
              'INSERT INTO unidad_medida (descripcion) VALUES ($1) RETURNING id_unidad_medida',
              [targetUnit]
            );
            unitId = newUnit.rows[0].id_unidad_medida;
          } else {
            unitId = unitResult.rows[0].id_unidad_medida;
          }

          await client.query(
            'UPDATE meta SET id_unidad_medida = $1, cantidad = $2 WHERE id_meta = $3',
            [unitId, target || habit.target, habit.id_meta]
          );
        } else if (target) {
          await client.query(
            'UPDATE meta SET cantidad = $1 WHERE id_meta = $2',
            [target, habit.id_meta]
          );
        }
      }

      // Actualizar hábito
      const updatedHabit = await client.query(`
        UPDATE habito SET 
          nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          notas = COALESCE($3, notas),
          icono = COALESCE($4, icono),
          id_categoria = $5,
          id_frecuencia = $6,
          recordatorio_activo = COALESCE($7, recordatorio_activo),
          hora_recordatorio = COALESCE($8, hora_recordatorio)
        WHERE id_habito = $9
        RETURNING *`,
        [
          name, description, notes, icon,
          categoryId, frequencyId,
          reminderEnabled, reminderTime,
          habitId
        ]
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Hábito actualizado exitosamente',
        data: { habit: updatedHabit.rows[0] }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error actualizando hábito:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  },

  // Eliminar un hábito
  deleteHabit: async (req, res) => {
    const { habitId } = req.params;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el hábito existe y obtener el id_meta
      const habitResult = await client.query(
        'SELECT id_meta FROM habito WHERE id_habito = $1',
        [habitId]
      );

      if (habitResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Hábito no encontrado' });
      }

      const metaId = habitResult.rows[0].id_meta;

      // Eliminar registros del hábito
      await client.query('DELETE FROM registro_habito WHERE id_habito = $1', [habitId]);

      // Eliminar hábito
      await client.query('DELETE FROM habito WHERE id_habito = $1', [habitId]);

      // Eliminar meta asociada
      await client.query('DELETE FROM meta WHERE id_meta = $1', [metaId]);

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Hábito eliminado exitosamente'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error eliminando hábito:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  },

  // Marcar hábito como completado
  markHabitComplete: async (req, res) => {
    const { habitId } = req.params;
    const { valor = 1, fecha = new Date().toISOString().split('T')[0] } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar si ya existe un registro para hoy
      const existingRecord = await client.query(
        'SELECT * FROM registro_habito WHERE id_habito = $1 AND fecha = $2',
        [habitId, fecha]
      );

      let recordId;
      if (existingRecord.rows.length > 0) {
        // Actualizar registro existente
        const updatedRecord = await client.query(
          'UPDATE registro_habito SET valor = $1, completado = true WHERE id_habito = $2 AND fecha = $3 RETURNING id_registro',
          [valor, habitId, fecha]
        );
        recordId = updatedRecord.rows[0].id_registro;
      } else {
        // Crear nuevo registro
        const newRecord = await client.query(
          'INSERT INTO registro_habito (id_habito, fecha, valor, completado) VALUES ($1, $2, $3, true) RETURNING id_registro',
          [habitId, fecha, valor]
        );
        recordId = newRecord.rows[0].id_registro;
      }

      // Actualizar el hábito (incrementar racha, actualizar actual y último completado)
      const habitResult = await client.query('SELECT racha FROM habito WHERE id_habito = $1', [habitId]);
      const currentStreak = habitResult.rows[0].racha;

      await client.query(`
        UPDATE habito SET 
          actual = actual + $1,
          racha = $2,
          ultimo_completado = $3,
          completado = true
        WHERE id_habito = $4`,
        [valor, currentStreak + 1, fecha, habitId]
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Hábito marcado como completado',
        data: { recordId }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error marcando hábito como completado:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  },

  // Obtener progreso de un hábito
  getHabitProgress: async (req, res) => {
    const { habitId } = req.params;
    const { startDate, endDate } = req.query;

    try {
      let query = `
        SELECT 
          rh.fecha,
          rh.valor,
          rh.completado
        FROM registro_habito rh
        WHERE rh.id_habito = $1
      `;
      let params = [habitId];

      if (startDate && endDate) {
        query += ' AND rh.fecha BETWEEN $2 AND $3';
        params.push(startDate, endDate);
      }

      query += ' ORDER BY rh.fecha DESC';

      const progressResult = await pool.query(query, params);

      res.status(200).json({
        success: true,
        data: { progress: progressResult.rows }
      });

    } catch (error) {
      console.error('Error obteniendo progreso del hábito:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener todas las categorías
  getCategories: async (req, res) => {
    try {
      const categoriesResult = await pool.query('SELECT * FROM categoria ORDER BY descripcion');
      
      res.status(200).json({
        success: true,
        data: { categories: categoriesResult.rows }
      });

    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear nueva categoría
  createCategory: async (req, res) => {
    const { descripcion } = req.body;

    try {
      const existingCategory = await pool.query(
        'SELECT * FROM categoria WHERE descripcion = $1',
        [descripcion]
      );

      if (existingCategory.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'La categoría ya existe' });
      }

      const newCategory = await pool.query(
        'INSERT INTO categoria (descripcion) VALUES ($1) RETURNING *',
        [descripcion]
      );

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: { category: newCategory.rows[0] }
      });

    } catch (error) {
      console.error('Error creando categoría:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar categoría
  updateCategory: async (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;

    try {
      const existingCategory = await pool.query(
        'SELECT * FROM categoria WHERE descripcion = $1 AND id_categoria != $2',
        [descripcion, id]
      );

      if (existingCategory.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
      }

      const updatedCategory = await pool.query(
        'UPDATE categoria SET descripcion = $1 WHERE id_categoria = $2 RETURNING *',
        [descripcion, id]
      );

      if (updatedCategory.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }

      res.status(200).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: { category: updatedCategory.rows[0] }
      });

    } catch (error) {
      console.error('Error actualizando categoría:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar categoría
  deleteCategory: async (req, res) => {
    const { id } = req.params;
    
    try {
      await pool.query('DELETE FROM categoria WHERE id_categoria = $1', [id]);
      res.status(200).json({ 
        success: true, 
        message: 'Categoría eliminada exitosamente' 
      });
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al eliminar categoría' 
      });
    }
  },

  // Crear nueva frecuencia
  createFrequency: async (req, res) => {
    const { descripcion } = req.body;

    try {
      const existingFrequency = await pool.query(
        'SELECT * FROM frecuencia WHERE descripcion = $1',
        [descripcion]
      );

      if (existingFrequency.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'La frecuencia ya existe' });
      }

      const newFrequency = await pool.query(
        'INSERT INTO frecuencia (descripcion) VALUES ($1) RETURNING *',
        [descripcion]
      );

      res.status(201).json({
        success: true,
        message: 'Frecuencia creada exitosamente',
        data: { frequency: newFrequency.rows[0] }
      });

    } catch (error) {
      console.error('Error creando frecuencia:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener todas las frecuencias
  getFrequencies: async (req, res) => {
    try {
      const frequenciesResult = await pool.query('SELECT * FROM frecuencia ORDER BY descripcion');
      
      res.status(200).json({
        success: true,
        data: { frequencies: frequenciesResult.rows }
      });

    } catch (error) {
      console.error('Error obteniendo frecuencias:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar frecuencia
  updateFrequency: async (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;

    try {
      const existingFrequency = await pool.query(
        'SELECT * FROM frecuencia WHERE descripcion = $1 AND id_frecuencia != $2',
        [descripcion, id]
      );

      if (existingFrequency.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una frecuencia con ese nombre' });
      }

      const updatedFrequency = await pool.query(
        'UPDATE frecuencia SET descripcion = $1 WHERE id_frecuencia = $2 RETURNING *',
        [descripcion, id]
      );

      if (updatedFrequency.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Frecuencia no encontrada' });
      }

      res.status(200).json({
        success: true,
        message: 'Frecuencia actualizada exitosamente',
        data: { frequency: updatedFrequency.rows[0] }
      });

    } catch (error) {
      console.error('Error actualizando frecuencia:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar frecuencia
  deleteFrequency: async (req, res) => {
    const { id } = req.params;
    
    try {
      await pool.query('DELETE FROM frecuencia WHERE id_frecuencia = $1', [id]);
      res.status(200).json({ 
        success: true, 
        message: 'Frecuencia eliminada exitosamente' 
      });
    } catch (error) {
      console.error('Error eliminando frecuencia:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al eliminar frecuencia' 
      });
    }
  },

  // Obtener todas las unidades de medida
  getUnits: async (req, res) => {
    try {
      const unitsResult = await pool.query('SELECT * FROM unidad_medida ORDER BY descripcion');
      
      res.status(200).json({
        success: true,
        data: { units: unitsResult.rows }
      });

    } catch (error) {
      console.error('Error obteniendo unidades de medida:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear nueva unidad de medida
  createUnit: async (req, res) => {
    const { descripcion } = req.body;

    try {
      const existingUnit = await pool.query(
        'SELECT * FROM unidad_medida WHERE descripcion = $1',
        [descripcion]
      );

      if (existingUnit.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'La unidad de medida ya existe' });
      }

      const newUnit = await pool.query(
        'INSERT INTO unidad_medida (descripcion) VALUES ($1) RETURNING *',
        [descripcion]
      );

      res.status(201).json({
        success: true,
        message: 'Unidad de medida creada exitosamente',
        data: { unit: newUnit.rows[0] }
      });

    } catch (error) {
      console.error('Error creando unidad de medida:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar unidad de medida
  updateUnit: async (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;

    try {
      const existingUnit = await pool.query(
        'SELECT * FROM unidad_medida WHERE descripcion = $1 AND id_unidad_medida != $2',
        [descripcion, id]
      );

      if (existingUnit.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una unidad de medida con ese nombre' });
      }

      const updatedUnit = await pool.query(
        'UPDATE unidad_medida SET descripcion = $1 WHERE id_unidad_medida = $2 RETURNING *',
        [descripcion, id]
      );

      if (updatedUnit.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Unidad de medida no encontrada' });
      }

      res.status(200).json({
        success: true,
        message: 'Unidad de medida actualizada exitosamente',
        data: { unit: updatedUnit.rows[0] }
      });

    } catch (error) {
      console.error('Error actualizando unidad de medida:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar unidad de medida
  deleteUnit: async (req, res) => {
    const { id } = req.params;
    
    try {
      await pool.query('DELETE FROM unidad_medida WHERE id_unidad_medida = $1', [id]);
      res.status(200).json({ 
        success: true, 
        message: 'Unidad de medida eliminada exitosamente' 
      });
    } catch (error) {
      console.error('Error eliminando unidad de medida:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al eliminar unidad de medida' 
      });
    }
  }
};

module.exports = HabitController;