import React, { useState, useEffect } from 'react';
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
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Check, 
  Lock,
  Shield,
  AlertCircle
} from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext'; // ✅ Importar useLanguage
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

const SCALE = 1.0;

const ChangePasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t, currentLanguage } = useLanguage(); // ✅ Usar contexto de idioma
  
  const [userId, setUserId] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Traducciones específicas para cambio de contraseña
  const changePasswordTranslations = {
    es: {
      changePassword: 'Cambiar Contraseña',
      securityMessage: 'Mantén tu cuenta segura con una contraseña fuerte',
      currentPassword: 'Contraseña actual',
      currentPasswordPlaceholder: 'Ingresa tu contraseña actual',
      newPassword: 'Nueva contraseña',
      newPasswordPlaceholder: 'Ingresa tu nueva contraseña',
      confirmPassword: 'Confirmar nueva contraseña',
      confirmPasswordPlaceholder: 'Confirma tu nueva contraseña',
      // Fortaleza de contraseña
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte',
      veryStrong: 'Muy fuerte',
      // Requisitos
      requirements: 'Requisitos:',
      atLeast8Chars: 'Al menos 8 caracteres',
      oneUppercase: 'Una letra mayúscula',
      oneLowercase: 'Una letra minúscula',
      oneNumber: 'Un número',
      oneSpecialChar: 'Un carácter especial (!@#$%^&*)',
      // Coincidencia
      passwordsMatch: 'Las contraseñas coinciden',
      passwordsNoMatch: 'Las contraseñas no coinciden',
      // Consejos
      securityTips: '💡 Consejos de seguridad:',
      tip1: '• Usa una combinación de letras, números y símbolos',
      tip2: '• Evita información personal como nombres o fechas',
      tip3: '• No reutilices contraseñas de otras cuentas',
      tip4: '• Cambia tu contraseña regularmente',
      // Botones y acciones
      changing: 'Cambiando...',
      // Validaciones y errores
      sessionExpired: 'Sesión expirada',
      loginAgain: 'Por favor, inicia sesión nuevamente',
      userInfoError: 'Error al obtener información de usuario',
      enterCurrentPassword: 'Por favor ingresa tu contraseña actual',
      enterNewPassword: 'Por favor ingresa una nueva contraseña',
      passwordMinLength: 'La nueva contraseña debe tener al menos 8 caracteres',
      passwordsNoMatchError: 'Las contraseñas no coinciden',
      passwordsMustBeDifferent: 'La nueva contraseña debe ser diferente a la actual',
      weakPasswordWarning: 'Contraseña débil',
      weakPasswordMessage: 'Te recomendamos usar una contraseña más fuerte. ¿Deseas continuar?',
      cancel: 'Cancelar',
      continue: 'Continuar',
      success: '¡Éxito!',
      passwordChanged: 'Tu contraseña ha sido cambiada correctamente',
      ok: 'OK',
      error: 'Error',
      incorrectCurrentPassword: 'Contraseña actual incorrecta',
      userNotFound: 'Usuario no encontrado',
      changePasswordError: 'No se pudo cambiar la contraseña. Inténtalo de nuevo.',
      userIdError: 'No se pudo obtener la información del usuario'
    },
    en: {
      changePassword: 'Change Password',
      securityMessage: 'Keep your account secure with a strong password',
      currentPassword: 'Current password',
      currentPasswordPlaceholder: 'Enter your current password',
      newPassword: 'New password',
      newPasswordPlaceholder: 'Enter your new password',
      confirmPassword: 'Confirm new password',
      confirmPasswordPlaceholder: 'Confirm your new password',
      // Password strength
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very strong',
      // Requirements
      requirements: 'Requirements:',
      atLeast8Chars: 'At least 8 characters',
      oneUppercase: 'One uppercase letter',
      oneLowercase: 'One lowercase letter',
      oneNumber: 'One number',
      oneSpecialChar: 'One special character (!@#$%^&*)',
      // Match validation
      passwordsMatch: 'Passwords match',
      passwordsNoMatch: 'Passwords do not match',
      // Tips
      securityTips: '💡 Security tips:',
      tip1: '• Use a combination of letters, numbers and symbols',
      tip2: '• Avoid personal information like names or dates',
      tip3: '• Don\'t reuse passwords from other accounts',
      tip4: '• Change your password regularly',
      // Buttons and actions
      changing: 'Changing...',
      // Validations and errors
      sessionExpired: 'Session expired',
      loginAgain: 'Please log in again',
      userInfoError: 'Error getting user information',
      enterCurrentPassword: 'Please enter your current password',
      enterNewPassword: 'Please enter a new password',
      passwordMinLength: 'New password must be at least 8 characters',
      passwordsNoMatchError: 'Passwords do not match',
      passwordsMustBeDifferent: 'New password must be different from current',
      weakPasswordWarning: 'Weak password',
      weakPasswordMessage: 'We recommend using a stronger password. Do you want to continue?',
      cancel: 'Cancel',
      continue: 'Continue',
      success: 'Success!',
      passwordChanged: 'Your password has been changed successfully',
      ok: 'OK',
      error: 'Error',
      incorrectCurrentPassword: 'Incorrect current password',
      userNotFound: 'User not found',
      changePasswordError: 'Could not change password. Please try again.',
      userIdError: 'Could not get user information'
    }
  };

  // ✅ Función helper para obtener traducciones de cambio de contraseña
  const tcp = (key) => {
    const keys = key.split('.');
    let value = changePasswordTranslations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || changePasswordTranslations['en'][key] || key;
  };

  // Obtener userId del SecureStore al montar el componente
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('user_id');
        console.log('✅ ChangePasswordScreen - User ID obtenido del storage:', storedUserId);
        
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.log('❌ No se encontró user_id en SecureStore');
          Alert.alert(
            tcp('sessionExpired'),
            tcp('loginAgain'),
            [
              {
                text: tcp('ok'),
                onPress: () => navigation.navigate('Login')
              }
            ]
          );
        }
      } catch (error) {
        console.error('❌ Error obteniendo userId del storage:', error);
        Alert.alert(tcp('error'), tcp('userInfoError'));
      }
    };

    getUserId();
  }, [currentLanguage]); // ✅ Agregar currentLanguage como dependencia

  // Validaciones de contraseña
  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(validations).filter(Boolean).length;
    return { validations, score };
  };

  const passwordStrength = validatePassword(newPassword);

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return colors.error;
    if (passwordStrength.score <= 3) return colors.warning;
    if (passwordStrength.score <= 4) return colors.success;
    return colors.success;
  };

  // ✅ Función para obtener texto de fortaleza traducido
  const getStrengthText = () => {
    if (passwordStrength.score <= 2) return tcp('weak');
    if (passwordStrength.score <= 3) return tcp('medium');
    if (passwordStrength.score <= 4) return tcp('strong');
    return tcp('veryStrong');
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  const handleChangePassword = async () => {
    // Validar que tenemos el userId
    if (!userId) {
      Alert.alert(tcp('error'), tcp('userIdError'));
      return;
    }

    // Validaciones básicas
    if (!currentPassword.trim()) {
      Alert.alert(tcp('error'), tcp('enterCurrentPassword'));
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert(tcp('error'), tcp('enterNewPassword'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(tcp('error'), tcp('passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(tcp('error'), tcp('passwordsNoMatchError'));
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(tcp('error'), tcp('passwordsMustBeDifferent'));
      return;
    }

    if (passwordStrength.score < 3) {
      Alert.alert(
        tcp('weakPasswordWarning'),
        tcp('weakPasswordMessage'),
        [
          { text: tcp('cancel'), style: 'cancel' },
          { text: tcp('continue'), onPress: () => processPasswordChange() }
        ]
      );
      return;
    }

    processPasswordChange();
  };

  const processPasswordChange = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Cambiando contraseña para usuario ID:', userId);

      const response = await api.put('/api/users/change-password', {
        userId: parseInt(userId),
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim()
      });

      console.log('✅ Respuesta del servidor:', response.data);

      if (response.data.success) {
        Alert.alert(
          tcp('success'),
          tcp('passwordChanged'),
          [
            { 
              text: tcp('ok'), 
              onPress: () => {
                // Limpiar campos
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                navigation.goBack();
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      
      if (error.response?.data?.message) {
        Alert.alert(tcp('error'), error.response.data.message);
      } else if (error.response?.status === 400) {
        Alert.alert(tcp('error'), tcp('incorrectCurrentPassword'));
      } else if (error.response?.status === 404) {
        Alert.alert(tcp('error'), tcp('userNotFound'));
      } else {
        Alert.alert(tcp('error'), tcp('changePasswordError'));
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24 * SCALE} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {tcp('changePassword')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Información de seguridad */}
          <View style={[styles.securityInfo, { backgroundColor: colors.cardCompleted }]}>
            <Shield size={24 * SCALE} color={colors.primary} />
            <Text style={[styles.securityText, { color: colors.textSecondary }]}>
              {tcp('securityMessage')}
            </Text>
          </View>

          {/* Contraseña actual */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {tcp('currentPassword')}
            </Text>
            <View style={[styles.passwordContainer, {
              borderColor: colors.border,
              backgroundColor: colors.input
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder={tcp('currentPasswordPlaceholder')}
                placeholderTextColor={colors.placeholder}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Nueva contraseña */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {tcp('newPassword')}
            </Text>
            <View style={[styles.passwordContainer, {
              borderColor: colors.border,
              backgroundColor: colors.input
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder={tcp('newPasswordPlaceholder')}
                placeholderTextColor={colors.placeholder}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Indicador de fortaleza */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={[styles.strengthBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor()
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                  {getStrengthText()}
                </Text>
              </View>
            )}

            {/* Requisitos de contraseña */}
            {newPassword.length > 0 && (
              <View style={[styles.requirementsContainer, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.requirementsTitle, { color: colors.text }]}>
                  {tcp('requirements')}
                </Text>
                
                <View style={styles.requirement}>
                  {passwordStrength.validations.length ? (
                    <Check size={14 * SCALE} color={colors.success} />
                  ) : (
                    <AlertCircle size={14 * SCALE} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.requirementText,
                    { color: colors.textSecondary },
                    passwordStrength.validations.length && { color: colors.success }
                  ]}>
                    {tcp('atLeast8Chars')}
                  </Text>
                </View>

                <View style={styles.requirement}>
                  {passwordStrength.validations.uppercase ? (
                    <Check size={14 * SCALE} color={colors.success} />
                  ) : (
                    <AlertCircle size={14 * SCALE} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.requirementText,
                    { color: colors.textSecondary },
                    passwordStrength.validations.uppercase && { color: colors.success }
                  ]}>
                    {tcp('oneUppercase')}
                  </Text>
                </View>

                <View style={styles.requirement}>
                  {passwordStrength.validations.lowercase ? (
                    <Check size={14 * SCALE} color={colors.success} />
                  ) : (
                    <AlertCircle size={14 * SCALE} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.requirementText,
                    { color: colors.textSecondary },
                    passwordStrength.validations.lowercase && { color: colors.success }
                  ]}>
                    {tcp('oneLowercase')}
                  </Text>
                </View>

                <View style={styles.requirement}>
                  {passwordStrength.validations.number ? (
                    <Check size={14 * SCALE} color={colors.success} />
                  ) : (
                    <AlertCircle size={14 * SCALE} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.requirementText,
                    { color: colors.textSecondary },
                    passwordStrength.validations.number && { color: colors.success }
                  ]}>
                    {tcp('oneNumber')}
                  </Text>
                </View>

                <View style={styles.requirement}>
                  {passwordStrength.validations.special ? (
                    <Check size={14 * SCALE} color={colors.success} />
                  ) : (
                    <AlertCircle size={14 * SCALE} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.requirementText,
                    { color: colors.textSecondary },
                    passwordStrength.validations.special && { color: colors.success }
                  ]}>
                    {tcp('oneSpecialChar')}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {tcp('confirmPassword')}
            </Text>
            <View style={[styles.passwordContainer, {
              borderColor: colors.border,
              backgroundColor: colors.input
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder={tcp('confirmPasswordPlaceholder')}
                placeholderTextColor={colors.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Verificación de coincidencia */}
            {confirmPassword.length > 0 && newPassword.length > 0 && (
              <View style={styles.matchContainer}>
                {newPassword === confirmPassword ? (
                  <View style={styles.matchSuccess}>
                    <Check size={14 * SCALE} color={colors.success} />
                    <Text style={[styles.matchSuccessText, { color: colors.success }]}>
                      {tcp('passwordsMatch')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.matchError}>
                    <AlertCircle size={14 * SCALE} color={colors.error} />
                    <Text style={[styles.matchErrorText, { color: colors.error }]}>
                      {tcp('passwordsNoMatch')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Consejos de seguridad */}
          <View style={[styles.tipsContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              {tcp('securityTips')}
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              {tcp('tip1')}
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              {tcp('tip2')}
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              {tcp('tip3')}
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              {tcp('tip4')}
            </Text>
          </View>
        </ScrollView>

        {/* Botón de cambiar contraseña */}
        <View style={[styles.buttonContainer, { 
          backgroundColor: colors.surface,
          borderTopColor: colors.border 
        }]}>
          <TouchableOpacity 
            style={[
              styles.changeButton,
              { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary 
              },
              (!currentPassword || !newPassword || !confirmPassword || 
               newPassword !== confirmPassword || isLoading || !userId) && { 
                backgroundColor: colors.textTertiary,
                shadowOpacity: 0,
                elevation: 0 
              }
            ]}
            onPress={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword || 
                     newPassword !== confirmPassword || isLoading || !userId}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.changeButtonText}>{tcp('changing')}</Text>
              </View>
            ) : (
              <>
                <Lock size={18 * SCALE} color="#fff" />
                <Text style={styles.changeButtonText}>{tcp('changePassword')}</Text>
              </>
            )}
          </TouchableOpacity>
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
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12 * SCALE,
    borderRadius: 10 * SCALE,
    marginTop: 16 * SCALE,
    marginBottom: 20 * SCALE,
  },
  securityText: {
    marginLeft: 12 * SCALE,
    fontSize: 14 * SCALE,
    flex: 1,
  },
  inputSection: {
    marginBottom: 20 * SCALE,
  },
  inputLabel: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    marginBottom: 6 * SCALE,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10 * SCALE,
    minHeight: 44 * SCALE,
  },
  passwordInput: {
    flex: 1,
    padding: 12 * SCALE,
    fontSize: 14 * SCALE,
  },
  eyeButton: {
    padding: 12 * SCALE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strengthContainer: {
    marginTop: 8 * SCALE,
  },
  strengthBar: {
    height: 4 * SCALE,
    borderRadius: 2 * SCALE,
    overflow: 'hidden',
    marginBottom: 8 * SCALE,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2 * SCALE,
  },
  strengthText: {
    fontSize: 12 * SCALE,
    fontWeight: '500',
  },
  requirementsContainer: {
    marginTop: 12 * SCALE,
    padding: 12 * SCALE,
    borderRadius: 8 * SCALE,
  },
  requirementsTitle: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    marginBottom: 8 * SCALE,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6 * SCALE,
  },
  requirementText: {
    marginLeft: 8 * SCALE,
    fontSize: 12 * SCALE,
  },
  matchContainer: {
    marginTop: 8 * SCALE,
  },
  matchSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchSuccessText: {
    marginLeft: 6 * SCALE,
    fontSize: 12 * SCALE,
  },
  matchError: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchErrorText: {
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
  buttonContainer: {
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 20 * SCALE,
    paddingTop: 10 * SCALE,
    borderTopWidth: 1,
  },
  changeButton: {
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
    marginLeft: 8 * SCALE,
  },
});

export default ChangePasswordScreen;