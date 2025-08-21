import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import api from '../services/api';

const SCALE = 1.0;

// Traducciones locales para esta pantalla
const translations = {
  es: {
    // Títulos
    verifyCodeTitle: 'Verificar código',
    newPasswordTitle: 'Nueva contraseña',
    
    // Subtítulos
    sendCodeTo: 'Ingresa el código de 6 dígitos enviado a',
    setNewPassword: 'Establece tu nueva contraseña',
    
    // Campos de formulario
    newPasswordField: 'Nueva contraseña',
    confirmPassword: 'Confirmar contraseña',
    minSixChars: 'Mínimo 6 caracteres',
    confirmYourPassword: 'Confirma tu contraseña',
    
    // Botones
    verifying: 'Verificando...',
    verifyCodeButton: 'Verificar código',
    resetting: 'Restableciendo...',
    resetPassword: 'Restablecer contraseña',
    login: 'Iniciar sesión',
    
    // Mensajes de validación
    error: 'Error',
    enterCompleteCode: 'Por favor ingresa el código completo',
    fillAllFields: 'Por favor llena todos los campos',
    passwordsDoNotMatch: 'Las contraseñas no coinciden',
    passwordMinLength: 'La contraseña debe tener al menos 6 caracteres',
    
    // Mensajes de error
    invalidOrExpiredCode: 'Código inválido o expirado',
    serverError: 'Error del servidor',
    connectionError: 'No se pudo conectar al servidor.',
    unexpectedError: 'Ocurrió un error inesperado.',
    couldNotResetPassword: 'No se pudo restablecer la contraseña',
    
    // Mensajes de éxito
    codeVerified: '¡Código verificado!',
    nowCanSetPassword: 'Ahora puedes establecer tu nueva contraseña',
    passwordReset: '¡Contraseña restablecida!',
    passwordUpdatedSuccess: 'Tu contraseña ha sido actualizada exitosamente',
    
    // Consejos
    tips: '💡 Consejos:',
    codeExpires: '• El código expira en 15 minutos',
    checkSpam: '• Revisa tu bandeja de spam si no lo encuentras',
    requestNewCode: '• Puedes solicitar un nuevo código si es necesario',
    useAtLeastSixChars: '• Usa al menos 6 caracteres',
    combineCharsNumbersSymbols: '• Combina letras, números y símbolos',
    avoidPersonalInfo: '• Evita información personal',
  },
  en: {
    // Títulos
    verifyCodeTitle: 'Verify code',
    newPasswordTitle: 'New password',
    
    // Subtítulos
    sendCodeTo: 'Enter the 6-digit code sent to',
    setNewPassword: 'Set your new password',
    
    // Campos de formulario
    newPasswordField: 'New password',
    confirmPassword: 'Confirm password',
    minSixChars: 'Minimum 6 characters',
    confirmYourPassword: 'Confirm your password',
    
    // Botones
    verifying: 'Verifying...',
    verifyCodeButton: 'Verify code',
    resetting: 'Resetting...',
    resetPassword: 'Reset password',
    login: 'Log in',
    
    // Mensajes de validación
    error: 'Error',
    enterCompleteCode: 'Please enter the complete code',
    fillAllFields: 'Please fill all fields',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordMinLength: 'Password must be at least 6 characters',
    
    // Mensajes de error
    invalidOrExpiredCode: 'Invalid or expired code',
    serverError: 'Server error',
    connectionError: 'Could not connect to server.',
    unexpectedError: 'An unexpected error occurred.',
    couldNotResetPassword: 'Could not reset password',
    
    // Mensajes de éxito
    codeVerified: 'Code verified!',
    nowCanSetPassword: 'Now you can set your new password',
    passwordReset: 'Password reset!',
    passwordUpdatedSuccess: 'Your password has been updated successfully',
    
    // Consejos
    tips: '💡 Tips:',
    codeExpires: '• Code expires in 15 minutes',
    checkSpam: '• Check your spam folder if you can\'t find it',
    requestNewCode: '• You can request a new code if needed',
    useAtLeastSixChars: '• Use at least 6 characters',
    combineCharsNumbersSymbols: '• Combine letters, numbers and symbols',
    avoidPersonalInfo: '• Avoid personal information',
  }
};

const VerifyCodeScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { currentLanguage } = useLanguage();
  const { email } = route.params;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const inputRefs = useRef([]);

  // Función para obtener traducciones locales
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
  };

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Mover al siguiente input si hay texto
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Mover al input anterior si se presiona backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isCodeComplete = code.every(digit => digit.length === 1);
  const codeString = code.join('');

  const handleVerifyCode = async () => {
    if (!isCodeComplete) {
      Alert.alert(t('error'), t('enterCompleteCode'));
      return;
    }

    setIsLoading(true);

    try {
      console.log('Verificando código:', codeString, 'para email:', email);
      
      const response = await api.post('/api/users/verificar-codigo-recuperacion', {
        email: email,
        code: codeString
      });

      console.log('Respuesta verificación:', response.data);

      if (response.data.success) {
        setShowPasswordFields(true);
        Alert.alert(t('codeVerified'), t('nowCanSetPassword'));
      } else {
        Alert.alert(t('error'), response.data.message || t('invalidOrExpiredCode'));
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || t('serverError');
        Alert.alert(t('error'), errorMessage);
      } else if (error.request) {
        Alert.alert(t('error'), t('connectionError'));
      } else {
        Alert.alert(t('error'), t('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('passwordMinLength'));
      return;
    }

    setIsLoading(true);

    try {
      console.log('Restableciendo contraseña para:', email);
      
      const response = await api.put('/api/users/reset-pw-code', {
        email: email,
        code: codeString,
        newPassword: newPassword
      });

      console.log('Respuesta reset password:', response.data);

      if (response.data.success) {
        Alert.alert(
          t('passwordReset'),
          t('passwordUpdatedSuccess'),
          [
            {
              text: t('login'),
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert(t('error'), response.data.message || t('couldNotResetPassword'));
      }
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || t('serverError');
        Alert.alert(t('error'), errorMessage);
      } else if (error.request) {
        Alert.alert(t('error'), t('connectionError'));
      } else {
        Alert.alert(t('error'), t('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24 * SCALE} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Información */}
          <View style={styles.infoContainer}>
            <Shield size={48 * SCALE} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              {showPasswordFields ? t('newPasswordTitle') : t('verifyCodeTitle')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {showPasswordFields 
                ? t('setNewPassword')
                : `${t('sendCodeTo')} ${email}`
              }
            </Text>
          </View>

          {!showPasswordFields ? (
            <>
              {/* Inputs de código */}
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => inputRefs.current[index] = ref}
                    style={[
                      styles.codeInput,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.input,
                        color: colors.text
                      },
                      digit && { borderColor: colors.primary }
                    ]}
                    value={digit}
                    onChangeText={text => handleCodeChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Botón verificar */}
              <TouchableOpacity 
                style={[
                  styles.verifyButton,
                  { backgroundColor: colors.primary },
                  (!isCodeComplete || isLoading) && { 
                    backgroundColor: colors.textTertiary 
                  }
                ]}
                onPress={handleVerifyCode}
                disabled={!isCodeComplete || isLoading}
              >
                {isLoading ? (
                  <RefreshCw size={18 * SCALE} color="#fff" />
                ) : (
                  <Shield size={18 * SCALE} color="#fff" />
                )}
                <Text style={styles.verifyButtonText}>
                  {isLoading ? t('verifying') : t('verifyCodeButton')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Campos de nueva contraseña */}
              <View style={styles.passwordSection}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    {t('newPasswordField')}
                  </Text>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.input,
                        color: colors.text
                      }
                    ]}
                    placeholder={t('minSixChars')}
                    placeholderTextColor={colors.placeholder}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    {t('confirmPassword')}
                  </Text>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.input,
                        color: colors.text
                      },
                      confirmPassword && newPassword !== confirmPassword && {
                        borderColor: colors.error
                      }
                    ]}
                    placeholder={t('confirmYourPassword')}
                    placeholderTextColor={colors.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {t('passwordsDoNotMatch')}
                    </Text>
                  )}
                </View>
              </View>

              {/* Botón restablecer */}
              <TouchableOpacity 
                style={[
                  styles.resetButton,
                  { backgroundColor: colors.primary },
                  (!newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading) && { 
                    backgroundColor: colors.textTertiary 
                  }
                ]}
                onPress={handleResetPassword}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading}
              >
                {isLoading ? (
                  <RefreshCw size={18 * SCALE} color="#fff" />
                ) : (
                  <Shield size={18 * SCALE} color="#fff" />
                )}
                <Text style={styles.resetButtonText}>
                  {isLoading ? t('resetting') : t('resetPassword')}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Consejos */}
          <View style={[styles.tipsContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              {t('tips')}
            </Text>
            {!showPasswordFields ? (
              <>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  {t('codeExpires')}
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  {t('checkSpam')}
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  {t('requestNewCode')}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  {t('useAtLeastSixChars')}
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  {t('combineCharsNumbersSymbols')}
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  {t('avoidPersonalInfo')}
                </Text>
              </>
            )}
          </View>
        </View>
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
    paddingHorizontal: 20 * SCALE,
    paddingTop: 10 * SCALE,
    paddingBottom: 20 * SCALE,
  },
  backButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20 * SCALE,
  },
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 40 * SCALE,
  },
  title: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
    marginTop: 16 * SCALE,
    marginBottom: 12 * SCALE,
  },
  subtitle: {
    fontSize: 16 * SCALE,
    textAlign: 'center',
    lineHeight: 24 * SCALE,
    paddingHorizontal: 10 * SCALE,
  },
  
  // Código de verificación
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30 * SCALE,
    paddingHorizontal: 10 * SCALE,
  },
  codeInput: {
    width: 45 * SCALE,
    height: 50 * SCALE,
    borderWidth: 2,
    borderRadius: 10 * SCALE,
    fontSize: 20 * SCALE,
    fontWeight: 'bold',
  },
  verifyButton: {
    borderRadius: 10 * SCALE,
    padding: 14 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20 * SCALE,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
    marginLeft: 8 * SCALE,
  },
  
  // Campos de contraseña
  passwordSection: {
    marginBottom: 30 * SCALE,
  },
  inputGroup: {
    marginBottom: 20 * SCALE,
  },
  inputLabel: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    marginBottom: 6 * SCALE,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 10 * SCALE,
    padding: 12 * SCALE,
    fontSize: 14 * SCALE,
    minHeight: 44 * SCALE,
  },
  errorText: {
    fontSize: 12 * SCALE,
    marginTop: 4 * SCALE,
  },
  resetButton: {
    borderRadius: 10 * SCALE,
    padding: 14 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20 * SCALE,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
    marginLeft: 8 * SCALE,
  },
  
  // Consejos
  tipsContainer: {
    padding: 12 * SCALE,
    borderRadius: 10 * SCALE,
    marginTop: 20 * SCALE,
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
});

export default VerifyCodeScreen;