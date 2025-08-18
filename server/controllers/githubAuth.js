const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('./conexion');
const router = express.Router();

// Configuración de GitHub OAuth (usar variables de entorno)
const CLIENT_ID = 'Ov23liy6c6sRX5zYCac7';
const CLIENT_SECRET = '3c3b53905517e081b89d3a501dd964aabcdb4ca7'; // NUNCA hardcodear esto

function generarAccessToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
    },
    'cris',
    { expiresIn: '8h' }
  );
}

/**
 * POST /api/github/auth
 * Endpoint para manejar la autenticación con GitHub OAuth (con soporte para PKCE)
 */
// Endpoint completo /auth en tu backend para incluir code_verifier
router.post('/auth', async (req, res) => {
  try {
    console.log('🚀 Iniciando autenticación GitHub CON PKCE...')
    const { code, code_verifier } = req.body; // ✅ Agregamos code_verifier
    console.log('✅ Paso 1: Código recibido del frontend:', code)
    console.log('✅ Paso 1: Code verifier recibido:', code_verifier ? '[PRESENTE]' : '[AUSENTE]')
    
    // Validar que se recibió el código de autorización
    if (!code) {
      console.log('❌ Paso 1 FALLO: No se recibió código de autorización')
      return res.status(400).json({ 
        success: false,
        error: 'Código de autorización requerido' 
      });
    }

    // ✅ Validar que se recibió el code_verifier (requerido para PKCE)
    if (!code_verifier) {
      console.log('❌ Paso 1 FALLO: No se recibió code_verifier (requerido para PKCE)')
      return res.status(400).json({ 
        success: false,
        error: 'Code verifier requerido para PKCE' 
      });
    }

    // Validar que el CLIENT_SECRET esté configurado
    if (!CLIENT_SECRET) {
      console.error('❌ Paso 2 FALLO: GITHUB_CLIENT_SECRET no está configurado en las variables de entorno');
      return res.status(500).json({
        success: false,
        error: 'Configuración del servidor incompleta'
      });
    }
    console.log('✅ Paso 2: CLIENT_SECRET configurado correctamente')

    // ✅ Preparar los datos para el intercambio de token CON PKCE
    const tokenRequestData = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      code_verifier: code_verifier, // ✅ Incluir el code_verifier
    };
    console.log('✅ Paso 3: Datos preparados para intercambio de token CON PKCE:', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET ? '[PRESENTE]' : '[AUSENTE]',
      code: code ? '[PRESENTE]' : '[AUSENTE]',
      code_verifier: code_verifier ? '[PRESENTE]' : '[AUSENTE]'
    })

    console.log('🔄 Paso 4: Iniciando intercambio de código por token con GitHub CON PKCE...')
    // Paso 1: Intercambiar el código por un access token CON PKCE
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      tokenRequestData,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CashPilot-App',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Paso 4: Respuesta recibida de GitHub - Status:', tokenResponse.status)
    console.log('✅ Paso 4: Datos de respuesta de GitHub:', tokenResponse.data)

    const { access_token, token_type, scope, error, error_description } = tokenResponse.data;

    // Verificar si hubo un error en la respuesta
    if (error) {
      console.log('❌ Paso 4 FALLO: Error en respuesta de GitHub:', error, error_description)
      return res.status(400).json({
        success: false,
        error: `GitHub OAuth Error: ${error}`,
        details: error_description
      });
    }

    // Verificar que se recibió el access token
    if (!access_token) {
      console.log('❌ Paso 4 FALLO: No se recibió access_token en la respuesta')
      console.log('Datos completos de respuesta:', tokenResponse.data)
      return res.status(400).json({
        success: false,
        error: 'Error al obtener token de acceso de GitHub',
        details: tokenResponse.data
      });
    }

    console.log('✅ Paso 4: Access token recibido exitosamente CON PKCE')
    console.log('✅ Paso 4: Token type:', token_type, 'Scope:', scope)

    console.log('🔄 Paso 5: Obteniendo información del usuario de GitHub...')
    // Paso 2: Obtener información del usuario de GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `${token_type || 'Bearer'} ${access_token}`,
        'User-Agent': 'CashPilot-App',
        Accept: 'application/vnd.github.v3+json',
      },
      timeout: 10000,
    });

    console.log('✅ Paso 5: Información del usuario obtenida - Status:', userResponse.status)
    console.log('✅ Paso 5: Usuario:', userResponse.data.login || userResponse.data.name)

    // Paso 3: Obtener emails del usuario (pueden ser privados)
    let primaryEmail = userResponse.data.email;
    
    try {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `${token_type || 'Bearer'} ${access_token}`,
          'User-Agent': 'CashPilot-App',
          Accept: 'application/vnd.github.v3+json',
        },
        timeout: 5000,
      });

      // Buscar el email primario
      const emails = emailResponse.data;
      const primaryEmailObj = emails.find(email => email.primary && email.verified);
      if (primaryEmailObj) {
        primaryEmail = primaryEmailObj.email;
      }
    } catch (emailError) {
      // No es crítico, continuar con el email del perfil público
      console.log('No se pudieron obtener emails privados, usando email público');
    }

    console.log('🔄 Paso 6: Verificando/creando usuario en base de datos...')
    // Paso 4: Verificar si el usuario existe en la base de datos
    const queryBuscarUsuario = `
      SELECT * FROM usuario WHERE correo = $1
    `;
    const resultBuscarUsuario = await pool.query(queryBuscarUsuario, [primaryEmail]);

    let usuarioBD;

    if (resultBuscarUsuario.rowCount > 0) {
      // Usuario existe - actualizar githublogin
      const usuarioExistente = resultBuscarUsuario.rows[0];
      
      const queryActualizarGithub = `
        UPDATE usuario SET githublogin = true WHERE id_usuario = $1
        RETURNING *
      `;
      const resultActualizar = await pool.query(queryActualizarGithub, [usuarioExistente.id_usuario]);
      
      usuarioBD = resultActualizar.rows[0];
      console.log('✅ Paso 6: Usuario existente autenticado con GitHub:', usuarioExistente.nombre);
    } else {
      // Usuario no existe - crear nuevo usuario
      const queryCrearUsuario = `
        INSERT INTO usuario (nombre, correo, clave, githublogin,tipo_usuario)
        VALUES ($1, $2, $3, true,2)
        RETURNING *
      `;
      
      const nombreUsuario = userResponse.data.name || userResponse.data.login;
      const username = userResponse.data.login;
      const passwordTemporal = 'github_oauth_' + Date.now(); // Password temporal para usuarios de GitHub
      
      const resultCrearUsuario = await pool.query(queryCrearUsuario, [
        nombreUsuario,
        primaryEmail,
        passwordTemporal
      ]);
      
      usuarioBD = resultCrearUsuario.rows[0];
      console.log('✅ Paso 6: Nuevo usuario creado desde GitHub:', usuarioBD.nombre);
    }

    console.log('🔄 Paso 7: Generando JWT token...')
    // Paso 5: Generar JWT token
    const token = generarAccessToken({
      id_usuario: usuarioBD.id_usuario,
      nombre: usuarioBD.nombre,
    });

    console.log('🔄 Paso 8: Preparando datos del usuario para el frontend...')
    // Paso 6: Preparar datos del usuario para el frontend
    const userData = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      name: userResponse.data.name,
      email: primaryEmail,
      avatar_url: userResponse.data.avatar_url,
      bio: userResponse.data.bio,
      location: userResponse.data.location,
      public_repos: userResponse.data.public_repos,
      followers: userResponse.data.followers,
      following: userResponse.data.following,
      created_at: userResponse.data.created_at,
      updated_at: userResponse.data.updated_at,
      // Agregar datos de la BD local
      id_usuario: usuarioBD.id_usuario,
      nombre_bd: usuarioBD.nombre,
      username_bd: usuarioBD.username,
    };

    console.log('✅ Paso 8: Datos del usuario preparados para:', userData.login);

    console.log('🔄 Paso 9: Enviando respuesta exitosa al frontend...')
    // Paso 7: Responder con los datos (igual que iniciarSesion)
    res.status(200).json({
      success: true,
      message: 'Autenticación GitHub exitosa CON PKCE',
      token: token, // JWT token como en iniciarSesion
      access_token: access_token, // Token de GitHub para llamadas a API
      user: userData,
      timestamp: new Date().toISOString(),
    });

    console.log('✅ Paso 9: ¡Autenticación GitHub CON PKCE completada exitosamente!')

  } catch (error) {
    console.error('❌ ERROR CRÍTICO en autenticación GitHub CON PKCE:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      console.error('❌ Error de respuesta HTTP - Status:', error.response.status);
      console.error('❌ Error de respuesta HTTP - Data:', error.response.data);
      console.error('❌ Error de respuesta HTTP - Headers:', error.response.headers);
      
      // Error de respuesta de GitHub
      if (error.response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales de GitHub inválidas',
          details: 'Verifica CLIENT_ID y CLIENT_SECRET'
        });
      } else if (error.response.status === 403) {
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado por GitHub',
          details: error.response.data.message
        });
      } else if (error.response.status === 400) {
        // Error específico de PKCE
        if (error.response.data.error === 'invalid_grant') {
          return res.status(400).json({
            success: false,
            error: 'Error PKCE: Grant inválido',
            details: error.response.data.error_description || 'Verifica que el code_verifier sea correcto'
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Error en petición a GitHub',
          details: error.response.data
        });
      } else {
        return res.status(error.response.status).json({
          success: false,
          error: 'Error de GitHub API',
          details: error.response.data
        });
      }
    } else if (error.request) {
      console.error('❌ Error de request (sin respuesta):', error.request);
      // Error de red/timeout
      return res.status(503).json({
        success: false,
        error: 'Error de conexión con GitHub',
        details: 'Verifica tu conexión a internet'
      });
    } else {
      console.error('❌ Error de configuración u otro:', error.message);
      // Error interno del servidor (incluyendo errores de BD)
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
});
/**
 * GET /api/github/status
 * Endpoint para verificar el estado de la configuración GitHub
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    configured: !!CLIENT_SECRET,
    client_id: CLIENT_ID ? CLIENT_ID.substring(0, 8) + '...' : 'No configurado',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;