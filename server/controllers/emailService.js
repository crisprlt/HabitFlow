const nodemailer = require('nodemailer');

// Configuración del transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({ // Fixed: removed 'er' from createTransporter
    service: 'gmail', // O tu proveedor de email preferido
    auth: {
      user: 'cristalito.gz@gmail.com', // Tu email
      pass: 'mzuv xhdc edjd tggp' // Tu contraseña de aplicación
    }
  });

  // Ejemplo para otros proveedores:
  /*
  return nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  */
};

// Generar código aleatorio de 6 dígitos
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar email de recuperación
const sendPasswordResetEmail = async (email, code, userName = '') => {
  try {
    const transporter = createTransporter();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
          }
          .code-box {
            background: #007AFF;
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 20px 0;
            display: inline-block;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🔐 Código de Recuperación de Contraseña</h2>
          ${userName ? `<p>Hola <strong>${userName}</strong>,</p>` : ''}
          <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código:</p>
          
          <div class="code-box">
            ${code}
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong><br>
            • Este código expira en <strong>15 minutos</strong><br>
            • Solo se puede usar una vez<br>
            • Si no solicitaste este código, ignora este email
          </div>
          
          <p>Si tienes problemas, contacta a nuestro equipo de soporte.</p>
          
          <div class="footer">
            Este es un email automático, por favor no respondas.
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'Tu App', // Nombre de tu aplicación
        address: 'cristalito.gz@gmail.com' // Fixed: use the actual email instead of process.env.EMAIL_USER
      },
      to: email,
      subject: '🔐 Código de recuperación de contraseña',
      html: htmlTemplate,
      text: `Tu código de recuperación es: ${code}\n\nEste código expira en 15 minutos.\n\nSi no solicitaste este código, ignora este email.`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

// Validar formato de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  sendPasswordResetEmail,
  generateResetCode,
  isValidEmail
};