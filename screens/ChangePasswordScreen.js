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
  Eye, 
  EyeOff, 
  Check, 
  Lock,
  Shield,
  AlertCircle
} from 'lucide-react-native';
import { useTheme } from './ThemeContext'; // ✅ Importar el hook del contexto

const SCALE = 1.0;

const ChangePasswordScreen = ({ navigation }) => {
  const { colors } = useTheme(); // ✅ Usar el contexto de tema
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

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

  const getStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Débil';
    if (passwordStrength.score <= 3) return 'Media';
    if (passwordStrength.score <= 4) return 'Fuerte';
    return 'Muy fuerte';
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
    // Validaciones
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña actual');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa una nueva contraseña');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }

    if (passwordStrength.score < 3) {
      Alert.alert(
        'Contraseña débil',
        'Te recomendamos usar una contraseña más fuerte. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => processPasswordChange() }
        ]
      );
      return;
    }

    processPasswordChange();
  };

  const processPasswordChange = async () => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí harías la llamada real a tu API
      console.log('Changing password...', {
        currentPassword,
        newPassword
      });

      Alert.alert(
        '¡Éxito!',
        'Tu contraseña ha sido cambiada correctamente',
        [
          { 
            text: 'OK', 
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

    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
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
        <View style={[styles.header, { 
        }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24 * SCALE} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Cambiar Contraseña
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
              Mantén tu cuenta segura con una contraseña fuerte
            </Text>
          </View>

          {/* Contraseña actual */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Contraseña actual
            </Text>
            <View style={[styles.passwordContainer, {
              borderColor: colors.border,
              backgroundColor: colors.input
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor={colors.placeholder}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('current')}
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
              Nueva contraseña
            </Text>
            <View style={[styles.passwordContainer, {
              borderColor: colors.border,
              backgroundColor: colors.input
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor={colors.placeholder}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('new')}
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
                  Requisitos:
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
                    Al menos 8 caracteres
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
                    Una letra mayúscula
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
                    Una letra minúscula
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
                    Un número
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
                    Un carácter especial (!@#$%^&*)
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Confirmar nueva contraseña
            </Text>
            <View style={[styles.passwordContainer, {
              borderColor: colors.border,
              backgroundColor: colors.input
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor={colors.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('confirm')}
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
                      Las contraseñas coinciden
                    </Text>
                  </View>
                ) : (
                  <View style={styles.matchError}>
                    <AlertCircle size={14 * SCALE} color={colors.error} />
                    <Text style={[styles.matchErrorText, { color: colors.error }]}>
                      Las contraseñas no coinciden
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Consejos de seguridad */}
          <View style={[styles.tipsContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              💡 Consejos de seguridad:
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Usa una combinación de letras, números y símbolos
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Evita información personal como nombres o fechas
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • No reutilices contraseñas de otras cuentas
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Cambia tu contraseña regularmente
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
               newPassword !== confirmPassword || isLoading) && { 
                backgroundColor: colors.textTertiary,
                shadowOpacity: 0,
                elevation: 0 
              }
            ]}
            onPress={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword || 
                     newPassword !== confirmPassword || isLoading}
          >
            {isLoading ? (
              <Text style={styles.changeButtonText}>Cambiando...</Text>
            ) : (
              <>
                <Lock size={18 * SCALE} color="#fff" />
                <Text style={styles.changeButtonText}>Cambiar Contraseña</Text>
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
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
    marginLeft: 8 * SCALE,
  },
});

export default ChangePasswordScreen;