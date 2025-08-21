import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { 
  ArrowLeft, 
  Mail, 
  Send,
  CheckCircle,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext'; // ✅ Importar useLanguage
import api from '../services/api';

const SCALE = 1.0;

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t, currentLanguage } = useLanguage(); // ✅ Usar contexto de idioma
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // ✅ Traducciones específicas para Forgot Password
  const forgotPasswordTranslations = {
    es: {
      forgotPassword: '¿Olvidaste tu contraseña?',
      forgotPasswordDescription: 'No te preocupes, ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.',
      email: 'Correo electrónico',
      emailPlaceholder: 'ejemplo@correo.com',
      enterEmail: 'Por favor ingresa tu correo electrónico',
      enterValidEmail: 'Por favor ingresa un correo electrónico válido',
      validEmail: 'Correo electrónico válido',
      sendCode: 'Enviar código',
      sending: 'Enviando...',
      codeSent: '¡Código enviado!',
      codeSentMessage: 'Hemos enviado un código de recuperación a',
      checkInboxSpam: 'Revisa tu bandeja de entrada y spam.',
      verifyCode: 'Verificar código',
      resendCode: 'Reenviar código',
      resendIn: 'Reenviar en',
      seconds: 's',
      backToLogin: 'Volver al inicio de sesión',
      codeExpires: 'El código expira en 15 minutos',
      tips: '💡 Consejos:',
      tipCheckEmail: '• Verifica que el correo esté escrito correctamente',
      tipCheckSpam: '• Revisa tu bandeja de spam si no recibes el código',
      tipExpiration: '• El código expira en 15 minutos',
      codeSentTitle: '¡Código enviado!',
      codeSentTo: 'Hemos enviado un código de 6 dígitos a:',
      codeSentSubtext: 'Revisa tu bandeja de entrada y spam. El código expira en 15 minutos.',
      error: 'Error',
      connectionError: 'Error de conexión',
      connectionErrorMessage: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      unexpectedError: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
      serverError: 'Error del servidor',
      codeResent: '¡Código reenviado!',
      codeResentMessage: 'Hemos enviado un nuevo código a tu correo.',
      couldNotSend: 'No se pudo enviar el código. Inténtalo de nuevo.',
      couldNotResend: 'No se pudo reenviar el código. Inténtalo de nuevo.'
    },
    en: {
      forgotPassword: 'Forgot your password?',
      forgotPasswordDescription: 'Don\'t worry, enter your email address and we\'ll send you a code to reset your password.',
      email: 'Email address',
      emailPlaceholder: 'example@email.com',
      enterEmail: 'Please enter your email address',
      enterValidEmail: 'Please enter a valid email address',
      validEmail: 'Valid email address',
      sendCode: 'Send code',
      sending: 'Sending...',
      codeSent: 'Code sent!',
      codeSentMessage: 'We have sent a recovery code to',
      checkInboxSpam: 'Check your inbox and spam folder.',
      verifyCode: 'Verify code',
      resendCode: 'Resend code',
      resendIn: 'Resend in',
      seconds: 's',
      backToLogin: 'Back to login',
      codeExpires: 'Code expires in 15 minutes',
      tips: '💡 Tips:',
      tipCheckEmail: '• Check that the email is spelled correctly',
      tipCheckSpam: '• Check your spam folder if you don\'t receive the code',
      tipExpiration: '• Code expires in 15 minutes',
      codeSentTitle: 'Code sent!',
      codeSentTo: 'We have sent a 6-digit code to:',
      codeSentSubtext: 'Check your inbox and spam folder. Code expires in 15 minutes.',
      error: 'Error',
      connectionError: 'Connection error',
      connectionErrorMessage: 'Could not connect to server. Check your internet connection.',
      unexpectedError: 'An unexpected error occurred. Please try again.',
      serverError: 'Server error',
      codeResent: 'Code resent!',
      codeResentMessage: 'We have sent a new code to your email.',
      couldNotSend: 'Could not send code. Please try again.',
      couldNotResend: 'Could not resend code. Please try again.'
    }
  };

  // ✅ Función helper para obtener traducciones de forgot password
  const tf = (key) => {
    const keys = key.split('.');
    let value = forgotPasswordTranslations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || forgotPasswordTranslations['en'][key] || key;
  };

  // Validación de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidEmail = validateEmail(email);

  // Función para enviar código de recuperación
  const handleSendResetCode = async () => {
    if (!email.trim()) {
      Alert.alert(tf('error'), tf('enterEmail'));
      return;
    }

    if (!isValidEmail) {
      Alert.alert(tf('error'), tf('enterValidEmail'));
      return;
    }

    setIsLoading(true);

    try {
      console.log('Enviando código de recuperación a:', email);
      
      const response = await api.post('/api/users/enviar-codigo-recuperacion', {
        email: email.trim().toLowerCase()
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.data.success) {
        setEmailSent(true);
        startCountdown();

        Alert.alert(
          tf('codeSent'),
          response.data.message || `${tf('codeSentMessage')} ${email}. ${tf('checkInboxSpam')}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          tf('error'), 
          response.data.message || tf('couldNotSend')
        );
      }

    } catch (error) {
      console.error('Error enviando código:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un error
        const errorMessage = error.response.data?.message || tf('serverError');
        Alert.alert(tf('error'), errorMessage);
      } else if (error.request) {
        // No se pudo conectar al servidor
        Alert.alert(
          tf('connectionError'), 
          tf('connectionErrorMessage')
        );
      } else {
        // Otro tipo de error
        Alert.alert(tf('error'), tf('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para reenviar código
  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsLoading(true);

    try {
      console.log('Reenviando código a:', email);
      
      const response = await api.post('/api/users/enviar-codigo-recuperacion', {
        email: email.trim().toLowerCase()
      });

      if (response.data.success) {
        startCountdown();
        Alert.alert(
          tf('codeResent'), 
          response.data.message || tf('codeResentMessage')
        );
      } else {
        Alert.alert(
          tf('error'), 
          response.data.message || tf('couldNotResend')
        );
      }

    } catch (error) {
      console.error('Error reenviando código:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || tf('serverError');
        Alert.alert(tf('error'), errorMessage);
      } else if (error.request) {
        Alert.alert(
          tf('connectionError'), 
          tf('connectionErrorMessage')
        );
      } else {
        Alert.alert(tf('error'), tf('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar countdown para reenvío
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Función para volver al login
  const handleBackToLogin = () => {
    setEmailSent(false);
    setEmail('');
    setCountdown(0);
    navigation.goBack();
  };

  // Función para ir a verificar código
  const handleVerifyCode = () => {
    // Navegar a la pantalla de verificar código pasando el email
    navigation.navigate('VerifyCode', { 
      email: email.trim().toLowerCase() 
    });
  };

  const renderInitialForm = () => (
    <>
      {/* Información */}
      <View style={styles.infoContainer}>
        <Mail size={48 * SCALE} color={colors.primary} />
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          {tf('forgotPassword')}
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {tf('forgotPasswordDescription')}
        </Text>
      </View>

      {/* Input de email */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {tf('email')}
        </Text>
        <View style={[
          styles.emailContainer,
          { 
            borderColor: colors.border,
            backgroundColor: colors.input 
          },
          email.length > 0 && !isValidEmail && { 
            borderColor: colors.error,
            backgroundColor: colors.error + '10'
          }
        ]}>
          <Mail size={20 * SCALE} color={colors.textSecondary} style={styles.emailIcon} />
          <TextInput
            style={[styles.emailInput, { color: colors.text }]}
            placeholder={tf('emailPlaceholder')}
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
            editable={!isLoading}
          />
        </View>
        
        {/* Validación visual */}
        {email.length > 0 && !isValidEmail && (
          <View style={styles.errorContainer}>
            <Info size={14 * SCALE} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {tf('enterValidEmail')}
            </Text>
          </View>
        )}
        
        {email.length > 0 && isValidEmail && (
          <View style={styles.successContainer}>
            <CheckCircle size={14 * SCALE} color={colors.success} />
            <Text style={[styles.successText, { color: colors.success }]}>
              {tf('validEmail')}
            </Text>
          </View>
        )}
      </View>

      {/* Consejos */}
      <View style={[styles.tipsContainer, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>{tf('tips')}</Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          {tf('tipCheckEmail')}
        </Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          {tf('tipCheckSpam')}
        </Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          {tf('tipExpiration')}
        </Text>
      </View>
    </>
  );

  const renderEmailSentConfirmation = () => (
    <>
      {/* Confirmación */}
      <View style={styles.confirmationContainer}>
        <CheckCircle size={64 * SCALE} color={colors.success} />
        <Text style={[styles.confirmationTitle, { color: colors.text }]}>
          {tf('codeSentTitle')}
        </Text>
        <Text style={[styles.confirmationText, { color: colors.textSecondary }]}>
          {tf('codeSentTo')}
        </Text>
        <Text style={[styles.emailDisplay, { color: colors.primary }]}>
          {email}
        </Text>
        <Text style={[styles.confirmationSubtext, { color: colors.textTertiary }]}>
          {tf('codeSentSubtext')}
        </Text>
      </View>

      {/* Opciones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.verifyButton, { 
            backgroundColor: colors.primary,
            shadowColor: colors.primary 
          }]}
          onPress={handleVerifyCode}
          disabled={isLoading}
        >
          <Text style={styles.verifyButtonText}>{tf('verifyCode')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.resendButton,
            { 
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border 
            },
            (countdown > 0 || isLoading) && { backgroundColor: colors.surfaceVariant }
          ]}
          onPress={handleResendCode}
          disabled={countdown > 0 || isLoading}
        >
          {isLoading ? (
            <RefreshCw size={16 * SCALE} color={colors.textSecondary} />
          ) : (
            <Send size={16 * SCALE} color={countdown > 0 ? colors.textSecondary : colors.primary} />
          )}
          <Text style={[
            styles.resendButtonText,
            { color: (countdown > 0 || isLoading) ? colors.textSecondary : colors.primary }
          ]}>
            {isLoading ? tf('sending') : countdown > 0 ? `${tf('resendIn')} ${countdown}${tf('seconds')}` : tf('resendCode')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backToLoginButton}
          onPress={handleBackToLogin}
          disabled={isLoading}
        >
          <Text style={[styles.backToLoginText, { 
            color: isLoading ? colors.textTertiary : colors.textSecondary 
          }]}>
            {tf('backToLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <ArrowLeft size={24 * SCALE} color={isLoading ? colors.textTertiary : colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!isLoading}
        >
          {emailSent ? renderEmailSentConfirmation() : renderInitialForm()}
        </ScrollView>

        {/* Botón principal */}
        {!emailSent && (
          <View style={[styles.buttonContainer, { 
            backgroundColor: colors.surface,
            borderTopColor: colors.border 
          }]}>
            <TouchableOpacity 
              style={[
                styles.sendButton,
                { 
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary 
                },
                (!email.trim() || !isValidEmail || isLoading) && { 
                  backgroundColor: colors.textTertiary,
                  shadowOpacity: 0,
                  elevation: 0 
                }
              ]}
              onPress={handleSendResetCode}
              disabled={!email.trim() || !isValidEmail || isLoading}
            >
              {isLoading ? (
                <RefreshCw size={18 * SCALE} color="#fff" />
              ) : (
                <Send size={18 * SCALE} color="#fff" />
              )}
              <Text style={styles.sendButtonText}>
                {isLoading ? tf('sending') : tf('sendCode')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20 * SCALE,
    paddingTop: 10 * SCALE,
    paddingBottom: 20 * SCALE
  },
  backButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20 * SCALE,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40 * SCALE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20 * SCALE,
  },
  scrollContent: {
    paddingBottom: 20 * SCALE,
  },
  
  // Formulario inicial
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 40 * SCALE,
  },
  infoTitle: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    marginTop: 16 * SCALE,
    marginBottom: 12 * SCALE,
  },
  infoText: {
    fontSize: 16 * SCALE,
    textAlign: 'center',
    lineHeight: 24 * SCALE,
    paddingHorizontal: 10 * SCALE,
  },
  inputSection: {
    marginBottom: 20 * SCALE,
  },
  inputLabel: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    marginBottom: 6 * SCALE,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10 * SCALE,
    minHeight: 44 * SCALE,
  },
  emailIcon: {
    marginLeft: 12 * SCALE,
  },
  emailInput: {
    flex: 1,
    padding: 12 * SCALE,
    fontSize: 14 * SCALE,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6 * SCALE,
  },
  errorText: {
    marginLeft: 6 * SCALE,
    fontSize: 12 * SCALE,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6 * SCALE,
  },
  successText: {
    marginLeft: 6 * SCALE,
    fontSize: 12 * SCALE,
  },
  tipsContainer: {
    padding: 12 * SCALE,
    borderRadius: 10 * SCALE,
    marginBottom: 20 * SCALE,
  },
  tipsTitle: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    marginBottom: 8 * SCALE,
  },
  tipText: {
    fontSize: 12 * SCALE,
    lineHeight: 18 * SCALE,
    marginBottom: 4 * SCALE,
  },
  
  // Confirmación de envío
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 40 * SCALE,
  },
  confirmationTitle: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    marginTop: 16 * SCALE,
    marginBottom: 12 * SCALE,
  },
  confirmationText: {
    fontSize: 16 * SCALE,
    textAlign: 'center',
    marginBottom: 8 * SCALE,
  },
  emailDisplay: {
    fontSize: 16 * SCALE,
    fontWeight: '600',
    marginBottom: 12 * SCALE,
  },
  confirmationSubtext: {
    fontSize: 14 * SCALE,
    textAlign: 'center',
    lineHeight: 20 * SCALE,
    paddingHorizontal: 10 * SCALE,
  },
  actionsContainer: {
    gap: 12 * SCALE,
  },
  verifyButton: {
    borderRadius: 10 * SCALE,
    padding: 14 * SCALE,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10 * SCALE,
    padding: 14 * SCALE,
    borderWidth: 1,
  },
  resendButtonText: {
    fontSize: 14 * SCALE,
    fontWeight: '500',
    marginLeft: 8 * SCALE,
  },
  backToLoginButton: {
    alignItems: 'center',
    padding: 12 * SCALE,
  },
  backToLoginText: {
    fontSize: 14 * SCALE,
    textDecorationLine: 'underline',
  },
  
  // Botón principal
  buttonContainer: {
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 20 * SCALE,
    paddingTop: 10 * SCALE,
    borderTopWidth: 1,
  },
  sendButton: {
    borderRadius: 10 * SCALE,
    padding: 14 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
    marginLeft: 8 * SCALE,
  },
});

export default ForgotPasswordScreen;