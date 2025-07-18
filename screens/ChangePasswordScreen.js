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

const SCALE = 1.0;

const ChangePasswordScreen = ({ navigation }) => {
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
    if (passwordStrength.score <= 2) return '#ff4757';
    if (passwordStrength.score <= 3) return '#ffa502';
    if (passwordStrength.score <= 4) return '#2ed573';
    return '#4CAF50';
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24 * SCALE} color="#968ce4" />
          </TouchableOpacity>
          <Text style={styles.title}>Cambiar Contraseña</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Información de seguridad */}
          <View style={styles.securityInfo}>
            <Shield size={24 * SCALE} color="#968ce4" />
            <Text style={styles.securityText}>
              Mantén tu cuenta segura con una contraseña fuerte
            </Text>
          </View>

          {/* Contraseña actual */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Contraseña actual</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor="#999"
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
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Nueva contraseña */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Nueva contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor="#999"
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
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            {/* Indicador de fortaleza */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
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
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Requisitos:</Text>
                
                <View style={styles.requirement}>
                  {passwordStrength.validations.length ? (
                    <Check size={14 * SCALE} color="#4CAF50" />
                  ) : (
                    <AlertCircle size={14 * SCALE} color="#999" />
                  )}
                  <Text style={[
                    styles.requirementText,
                    passwordStrength.validations.length && styles.requirementMet
                  ]}>
                    Al menos 8 caracteres
                  </Text>
                </View>

                <View style={styles.requirement}>
                  {passwordStrength.validations.uppercase ? (
                    <Check size={14 * SCALE} color="#4CAF50" />
                  ) : (
                    <AlertCircle size={14 * SCALE} color="#999" />
                  )}
                  <Text style={[
                    styles.requirementText,
                    passwordStrength.validations.uppercase && styles.requirementMet
                  ]}>
                    Una letra mayúscula
                  </Text>
                </View>

                <View style={styles.requirement}>
                  {passwordStrength.validations.lowercase ? (
                    <Check size={14 * SCALE} color="#4CAF50" />
                  ) : (
                    <AlertCircle size={14 * SCALE} color="#999" />
                  )}
                  <Text style={[
                    styles.requirementText,
                    passwordStrength.validations.lowercase && styles.requirementMet
                  ]}>
                    Una letra minúscula
                  </Text>
                </View>

                <View style={styles.requirement}>
                  {passwordStrength.validations.number ? (
                    <Check size={14 * SCALE} color="#4CAF50" />
                  ) : (
                    <AlertCircle size={14 * SCALE} color="#999" />
                  )}
                  <Text style={[
                    styles.requirementText,
                    passwordStrength.validations.number && styles.requirementMet
                  ]}>
                    Un número
                  </Text>
                </View>

                <View style={styles.requirement}>
                  {passwordStrength.validations.special ? (
                    <Check size={14 * SCALE} color="#4CAF50" />
                  ) : (
                    <AlertCircle size={14 * SCALE} color="#999" />
                  )}
                  <Text style={[
                    styles.requirementText,
                    passwordStrength.validations.special && styles.requirementMet
                  ]}>
                    Un carácter especial (!@#$%^&*)
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor="#999"
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
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            {/* Verificación de coincidencia */}
            {confirmPassword.length > 0 && newPassword.length > 0 && (
              <View style={styles.matchContainer}>
                {newPassword === confirmPassword ? (
                  <View style={styles.matchSuccess}>
                    <Check size={14 * SCALE} color="#4CAF50" />
                    <Text style={styles.matchSuccessText}>Las contraseñas coinciden</Text>
                  </View>
                ) : (
                  <View style={styles.matchError}>
                    <AlertCircle size={14 * SCALE} color="#ff4757" />
                    <Text style={styles.matchErrorText}>Las contraseñas no coinciden</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Consejos de seguridad */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Consejos de seguridad:</Text>
            <Text style={styles.tipText}>• Usa una combinación de letras, números y símbolos</Text>
            <Text style={styles.tipText}>• Evita información personal como nombres o fechas</Text>
            <Text style={styles.tipText}>• No reutilices contraseñas de otras cuentas</Text>
            <Text style={styles.tipText}>• Cambia tu contraseña regularmente</Text>
          </View>
        </ScrollView>

        {/* Botón de cambiar contraseña */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.changeButton,
              (!currentPassword || !newPassword || !confirmPassword || 
               newPassword !== confirmPassword || isLoading) && styles.changeButtonDisabled
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
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 20 * SCALE,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: '#f3f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20 * SCALE,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#f3f0ff',
    padding: 12 * SCALE,
    borderRadius: 10 * SCALE,
    marginTop: 16 * SCALE,
    marginBottom: 20 * SCALE,
  },
  securityText: {
    marginLeft: 12 * SCALE,
    fontSize: 14 * SCALE,
    color: '#666',
    flex: 1,
  },
  inputSection: {
    marginBottom: 20 * SCALE,
  },
  inputLabel: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6 * SCALE,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10 * SCALE,
    backgroundColor: '#FAFAFA',
    minHeight: 44 * SCALE,
  },
  passwordInput: {
    flex: 1,
    padding: 12 * SCALE,
    fontSize: 14 * SCALE,
    color: '#333',
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
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 8 * SCALE,
  },
  requirementsTitle: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#333',
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
    color: '#666',
  },
  requirementMet: {
    color: '#4CAF50',
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
    color: '#4CAF50',
  },
  matchError: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchErrorText: {
    marginLeft: 6 * SCALE,
    fontSize: 12 * SCALE,
    color: '#ff4757',
  },
  tipsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12 * SCALE,
    borderRadius: 10 * SCALE,
    marginBottom: 20 * SCALE,
  },
  tipsTitle: {
    fontSize: 14 * SCALE,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8 * SCALE,
  },
  tipText: {
    fontSize: 12 * SCALE,
    color: '#666',
    lineHeight: 18 * SCALE,
    marginBottom: 4 * SCALE,
  },
  buttonContainer: {
    paddingHorizontal: 20 * SCALE,
    paddingBottom: 20 * SCALE,
    paddingTop: 10 * SCALE,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  changeButton: {
    backgroundColor: '#968ce4',
    borderRadius: 10 * SCALE,
    padding: 14 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#968ce4',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  changeButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
    marginLeft: 8 * SCALE,
  },
});

export default ChangePasswordScreen;