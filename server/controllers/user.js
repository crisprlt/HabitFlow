const pool = require('./conexion');

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
    const { userId } = req.params; // Cambiar de req.body a req.query
      
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
  }
  
};

module.exports = UserController;