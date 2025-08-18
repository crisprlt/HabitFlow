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
import api from '../services/api';

const SCALE = 1.0;

const VerifyCodeScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { email } = route.params;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const inputRefs = useRef([]);

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
      Alert.alert('Error', 'Por favor ingresa el código completo');
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
        Alert.alert('¡Código verificado!', 'Ahora puedes establecer tu nueva contraseña');
      } else {
        Alert.alert('Error', response.data.message || 'Código inválido o expirado');
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Error del servidor';
        Alert.alert('Error', errorMessage);
      } else if (error.request) {
        Alert.alert('Error de conexión', 'No se pudo conectar al servidor.');
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
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
          '¡Contraseña restablecida!',
          'Tu contraseña ha sido actualizada exitosamente',
          [
            {
              text: 'Iniciar sesión',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'No se pudo restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Error del servidor';
        Alert.alert('Error', errorMessage);
      } else if (error.request) {
        Alert.alert('Error de conexión', 'No se pudo conectar al servidor.');
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
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
              {showPasswordFields ? 'Nueva contraseña' : 'Verificar código'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {showPasswordFields 
                ? 'Establece tu nueva contraseña' 
                : `Ingresa el código de 6 dígitos enviado a ${email}`
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
                  {isLoading ? 'Verificando...' : 'Verificar código'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Campos de nueva contraseña */}
              <View style={styles.passwordSection}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Nueva contraseña
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
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.placeholder}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Confirmar contraseña
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
                    placeholder="Confirma tu contraseña"
                    placeholderTextColor={colors.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      Las contraseñas no coinciden
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
                  {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Consejos */}
          <View style={[styles.tipsContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 Consejos:</Text>
            {!showPasswordFields ? (
              <>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • El código expira en 15 minutos
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Revisa tu bandeja de spam si no lo encuentras
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Puedes solicitar un nuevo código si es necesario
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Usa al menos 6 caracteres
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Combina letras, números y símbolos
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Evita información personal
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