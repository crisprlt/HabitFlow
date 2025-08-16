const jwt = require('jsonwebtoken');
const pool = require('./conexion');

const UserController = {
  // Registro de usuario
  register: async (req, res) => {
    const { registerName, registerLastName, registerEmail, registerPassword } = req.body;
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await pool.query('SELECT * FROM usuario WHERE correo = $1', [registerEmail]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
      }

      // Generar nombre de usuario
      const nombreUsuario = `${registerName.toLowerCase()}${registerLastName.toLowerCase()}`;

      // ✅ Insertar nuevo usuario SIN id_usuario (se genera automáticamente)
      const newUser = await pool.query(
        `INSERT INTO usuario (nombre_usuario, nombre, apellido, correo, clave, tipo_usuario) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id_usuario, nombre_usuario, nombre, apellido, correo`,
        [nombreUsuario, registerName, registerLastName, registerEmail, registerPassword, 1]
      );

      const user = newUser.rows[0];

      // ✅ Generar token con el ID correcto
      const token = jwt.sign(
        { userId: user.id_usuario, email: user.correo },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: { user, token }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Buscar usuario
      const userResult = await pool.query('SELECT * FROM usuario WHERE correo = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      const user = userResult.rows[0];

      // Verificar contraseña
      if (password !== user.clave) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      // Generar token
      const token = jwt.sign(
        { userId: user.id_usuario, email: user.correo },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user.id_usuario,
            username: user.nombre_usuario,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.correo
          },
          token
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener perfil
  getProfile: async (req, res) => {
    try {
      const { userId } = req.body;
      
      const userResult = await pool.query(
        'SELECT id_usuario, nombre_usuario, nombre, apellido, correo FROM usuario WHERE id_usuario = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.status(200).json({ success: true, data: { user: userResult.rows[0] } });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Cambiar contraseña
  changePassword: async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    try {
      const userResult = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const user = userResult.rows[0];

      if (currentPassword !== user.clave) {
        return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
      }

      await pool.query('UPDATE usuario SET clave = $1 WHERE id_usuario = $2', [newPassword, userId]);

      res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = UserController;