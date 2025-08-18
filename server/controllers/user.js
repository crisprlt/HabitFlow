const pool = require('./conexion');
const { sendPasswordResetEmail, generateResetCode, isValidEmail } = require('./emailService');

const UserController = {
  // Registro de usuario
  register: async (req, res) => {
    const { name, lastName, email, password } = req.body;
    
    console.log('Datos recibidos:', { name, lastName, email, password });
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await pool.query('SELECT * FROM usuario WHERE correo = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'El correo ya está registrado' 
        });
      }

      // Insertar nuevo usuario
      const newUser = await pool.query(
        `INSERT INTO usuario (nombre, apellido, correo, clave, tipo_usuario)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id_usuario, nombre, apellido, correo`,
        [name, lastName, email, password, 1]
      );

      const user = newUser.rows[0];

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: { user }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, password });

    try {
      // Buscar usuario
      const userResult = await pool.query('SELECT * FROM usuario WHERE correo = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciales inválidas' 
        });
      }

      const user = userResult.rows[0];

      // Verificar contraseña
      if (password !== user.clave) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciales inválidas' 
        });
      }

      // Login exitoso
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user.id_usuario,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.correo
          }
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // Obtener perfil
  getProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const userResult = await pool.query(
        'SELECT id_usuario, nombre, apellido, correo FROM usuario WHERE id_usuario = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }

      res.status(200).json({ 
        success: true, 
        data: { user: userResult.rows[0] } 
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // Actualizar perfil (nombre, apellido, email)
  updateProfile: async (req, res) => {
    const { userId, name, lastName, email } = req.body;

    try {
      // Verificar que el usuario existe
      const userExists = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [userId]);
      
      if (userExists.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }

      // Verificar si el nuevo email ya está en uso por otro usuario
      if (email) {
        const emailExists = await pool.query(
          'SELECT * FROM usuario WHERE correo = $1 AND id_usuario != $2', 
          [email, userId]
        );
        
        if (emailExists.rows.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'El correo ya está registrado por otro usuario' 
          });
        }
      }

      // Actualizar los datos del usuario
      const updatedUser = await pool.query(
        `UPDATE usuario 
         SET nombre = $1, apellido = $2, correo = $3 
         WHERE id_usuario = $4 
         RETURNING id_usuario, nombre, apellido, correo`,
        [name, lastName, email, userId]
      );

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: updatedUser.rows[0]
        }
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // Cambiar contraseña
  changePassword: async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    try {
      const userResult = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }

      const user = userResult.rows[0];

      if (currentPassword !== user.clave) {
        return res.status(400).json({ 
          success: false, 
          message: 'Contraseña actual incorrecta' 
        });
      }

      await pool.query('UPDATE usuario SET clave = $1 WHERE id_usuario = $2', [newPassword, userId]);

      res.status(200).json({ 
        success: true, 
        message: 'Contraseña actualizada exitosamente' 
      });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  },

  // ==================== FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ====================

  // Enviar código de recuperación
  sendResetCode: async (req, res) => {
    const { email } = req.body;

    try {
      // Validar email
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Por favor proporciona un correo válido'
        });
      }

      // Verificar si el usuario existe
      const userResult = await pool.query('SELECT * FROM usuario WHERE correo = $1', [email]);
      if (userResult.rows.length === 0) {
        // Por seguridad, no revelamos si el email existe o no
        return res.status(200).json({
          success: true,
          message: 'Si el correo está registrado, recibirás un código de recuperación'
        });
      }

      const user = userResult.rows[0];

      // Invalidar códigos anteriores para este email
      await pool.query(
        'UPDATE password_reset_codes SET used = true WHERE email = $1 AND used = false',
        [email]
      );

      // Generar nuevo código
      const resetCode = generateResetCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Guardar código en la base de datos
      await pool.query(
        `INSERT INTO password_reset_codes (user_id, code, email, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id_usuario, resetCode, email, expiresAt]
      );

      // Enviar email
      const emailResult = await sendPasswordResetEmail(
        email, 
        resetCode, 
        `${user.nombre} ${user.apellido}`
      );

      if (!emailResult.success) {
        console.error('Error enviando email:', emailResult.error);
        return res.status(500).json({
          success: false,
          message: 'Error enviando el código. Inténtalo de nuevo'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Código de recuperación enviado a tu correo',
        data: {
          email: email,
          expiresIn: 15 // minutos
        }
      });

    } catch (error) {
      console.error('Error enviando código de recuperación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Verificar código de recuperación
  verifyResetCode: async (req, res) => {
    const { email, code } = req.body;

    try {
      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email y código son requeridos'
        });
      }

      // Buscar código válido
      const codeResult = await pool.query(
        `SELECT * FROM password_reset_codes 
         WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [email, code]
      );

      if (codeResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Código inválido o expirado'
        });
      }

      const resetRecord = codeResult.rows[0];

      res.status(200).json({
        success: true,
        message: 'Código verificado correctamente',
        data: {
          resetId: resetRecord.id,
          email: email
        }
      });

    } catch (error) {
      console.error('Error verificando código:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Restablecer contraseña con código
  resetPasswordWithCode: async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
      if (!email || !code || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, código y nueva contraseña son requeridos'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Verificar código válido
      const codeResult = await pool.query(
        `SELECT prc.*, u.id_usuario FROM password_reset_codes prc
         JOIN usuario u ON prc.user_id = u.id_usuario
         WHERE prc.email = $1 AND prc.code = $2 AND prc.used = false AND prc.expires_at > NOW()
         ORDER BY prc.created_at DESC
         LIMIT 1`,
        [email, code]
      );

      if (codeResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Código inválido o expirado'
        });
      }

      const resetRecord = codeResult.rows[0];

      // Iniciar transacción
      await pool.query('BEGIN');

      try {
        // Actualizar contraseña
        await pool.query(
          'UPDATE usuario SET clave = $1 WHERE id_usuario = $2',
          [newPassword, resetRecord.id_usuario]
        );

        // Marcar código como usado
        await pool.query(
          'UPDATE password_reset_codes SET used = true WHERE id = $1',
          [resetRecord.id]
        );

        // Invalidar todos los demás códigos para este email
        await pool.query(
          'UPDATE password_reset_codes SET used = true WHERE email = $1 AND id != $2',
          [email, resetRecord.id]
        );

        await pool.query('COMMIT');

        res.status(200).json({
          success: true,
          message: 'Contraseña restablecida exitosamente'
        });

      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Limpiar códigos expirados (función de mantenimiento)
  cleanExpiredCodes: async () => {
    try {
      const result = await pool.query(
        'DELETE FROM password_reset_codes WHERE expires_at < NOW() OR used = true'
      );
      console.log(`Limpiados ${result.rowCount} códigos expirados/usados`);
      return result.rowCount;
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
      return 0;
    }
  }
};

module.exports = UserController;