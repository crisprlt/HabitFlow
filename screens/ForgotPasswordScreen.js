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
import { useTheme } from './ThemeContext'; // ✅ Importar el hook del contexto

const SCALE = 1.0;

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme(); // ✅ Usar el contexto de tema
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Validación de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidEmail = validateEmail(email);

  // Función para enviar código de recuperación
  const handleSendResetCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    if (!isValidEmail) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí harías la llamada real a tu API
      console.log('Sending reset code to:', email);

      setEmailSent(true);
      startCountdown();

      Alert.alert(
        '¡Código enviado!',
        `Hemos enviado un código de recuperación a ${email}. Revisa tu bandeja de entrada y spam.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el código. Verifica tu correo e inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para reenviar código
  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Resending reset code to:', email);
      
      startCountdown();
      
      Alert.alert('¡Código reenviado!', 'Hemos enviado un nuevo código a tu correo.');

    } catch (error) {
      Alert.alert('Error', 'No se pudo reenviar el código. Inténtalo de nuevo.');
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

  // Función para ir a verificar código (simulated)
  const handleVerifyCode = () => {
    Alert.alert(
      'Verificar código',
      'En una app real, aquí navegarías a una pantalla para ingresar el código de verificación.',
      [
        { text: 'OK' }
      ]
    );
  };

  const renderInitialForm = () => (
    <>
      {/* Información */}
      <View style={styles.infoContainer}>
        <Mail size={48 * SCALE} color={colors.primary} />
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          ¿Olvidaste tu contraseña?
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          No te preocupes, ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
        </Text>
      </View>

      {/* Input de email */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Correo electrónico
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
            placeholder="ejemplo@correo.com"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
          />
        </View>
        
        {/* Validación visual */}
        {email.length > 0 && !isValidEmail && (
          <View style={styles.errorContainer}>
            <Info size={14 * SCALE} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              Ingresa un correo electrónico válido
            </Text>
          </View>
        )}
        
        {email.length > 0 && isValidEmail && (
          <View style={styles.successContainer}>
            <CheckCircle size={14 * SCALE} color={colors.success} />
            <Text style={[styles.successText, { color: colors.success }]}>
              Correo electrónico válido
            </Text>
          </View>
        )}
      </View>

      {/* Consejos */}
      <View style={[styles.tipsContainer, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 Consejos:</Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          • Verifica que el correo esté escrito correctamente
        </Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          • Revisa tu bandeja de spam si no recibes el código
        </Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          • El código expira en 15 minutos
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
          ¡Código enviado!
        </Text>
        <Text style={[styles.confirmationText, { color: colors.textSecondary }]}>
          Hemos enviado un código de 6 dígitos a:
        </Text>
        <Text style={[styles.emailDisplay, { color: colors.primary }]}>
          {email}
        </Text>
        <Text style={[styles.confirmationSubtext, { color: colors.textTertiary }]}>
          Revisa tu bandeja de entrada y spam. El código expira en 15 minutos.
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
        >
          <Text style={styles.verifyButtonText}>Verificar código</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.resendButton,
            { 
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border 
            },
            countdown > 0 && { backgroundColor: colors.surfaceVariant }
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
            { color: countdown > 0 ? colors.textSecondary : colors.primary }
          ]}>
            {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backToLoginButton}
          onPress={handleBackToLogin}
        >
          <Text style={[styles.backToLoginText, { color: colors.textSecondary }]}>
            Volver al inicio de sesión
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
        <View style={[styles.header, { 
        }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24 * SCALE} color={colors.primary} />
          </TouchableOpacity>
          {/* <Text style={[styles.title, { color: colors.text }]}>
            {emailSent ? 'Verificar código' : 'Recuperar contraseña'}
          </Text> */}
          {/* <View style={styles.placeholder} /> */}
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
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
                {isLoading ? 'Enviando...' : 'Enviar código'}
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