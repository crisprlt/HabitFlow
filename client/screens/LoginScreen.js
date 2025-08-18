// LoginScreen.js - CON AUTENTICACIÓN BIOMÉTRICA INTEGRADA
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
  LogBox
} from 'react-native';
import { Infinity, Eye, EyeOff, Fingerprint } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import api from '../services/api';
import { useGitHubAuth, GitHubButton } from '../services/GitHubAuth';
import BiometricAuthService from '../services/BiometricAuth';
import * as SecureStore from 'expo-secure-store';

// Ocultar advertencias y errores de consola en pantalla
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login');
  const { colors } = useTheme();
  
  // Estados para Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para Registro
  const [registerName, setRegisterName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados de carga y biométrico
  const [isLoading, setIsLoading] = useState(false);
  const [biometricSupport, setBiometricSupport] = useState(null);
  const [showBiometricButton, setShowBiometricButton] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Hook de GitHub
  const { 
    isLoading: isGitHubLoading, 
    signInWithGitHub,
    request: gitHubRequest
  } = useGitHubAuth();

  // ✅ VERIFICAR SOPORTE BIOMÉTRICO AL CARGAR COMPONENTE
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const support = await BiometricAuthService.checkBiometricSupport();
      setBiometricSupport(support);
      
      if (support.isSupported) {
        // Verificar si hay sesión guardada y biométrico habilitado
        const shouldShow = await BiometricAuthService.shouldShowBiometricPrompt();
        const isEnabled = await BiometricAuthService.isBiometricEnabled();
        const hasSession = await BiometricAuthService.checkUserHasStoredSession();
        
        setShowBiometricButton(hasSession && isEnabled);
        
        console.log('🔐 Estado biométrico:', {
          soportado: support.isSupported,
          habilitado: isEnabled,
          tieneSesion: hasSession,
          mostrarBoton: hasSession && isEnabled
        });
      }
    } catch (error) {
      console.error('Error verificando capacidades biométricas:', error);
    }
  };

  // ✅ FUNCIÓN PARA LOGIN BIOMÉTRICO RÁPIDO
  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    
    try {
      console.log('🔐 Iniciando login biométrico...');
      
      const result = await BiometricAuthService.quickBiometricLogin();
      
      if (result.success) {
        console.log('✅ Login biométrico exitoso');
        
        Alert.alert(
          'Éxito', 
          'Inicio de sesión biométrico exitoso',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Principal')
            }
          ]
        );
      } else {
        console.log('❌ Login biométrico fallido:', result.reason);
        
        // Solo mostrar alerta si no fue cancelado por el usuario
        if (!result.reason?.includes('cancelada') && !result.reason?.includes('UserCancel')) {
          Alert.alert('Error Biométrico', result.reason);
        }
      }
    } catch (error) {
      console.error('Error en login biométrico:', error);
      Alert.alert('Error', 'Error al realizar autenticación biométrica');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // ✅ FUNCIÓN MEJORADA PARA MOSTRAR PROMPT BIOMÉTRICO DESPUÉS DEL LOGIN
  const promptBiometricSetup = async () => {
    try {
      const shouldPrompt = await BiometricAuthService.shouldShowBiometricPrompt();
      
      if (shouldPrompt) {
        console.log('💡 Mostrando prompt para habilitar biométrico...');
        
        const result = await BiometricAuthService.promptToEnableBiometric();
        
        if (result.success) {
          console.log('✅ Biométrico habilitado desde prompt');
          setShowBiometricButton(true);
        } else if (!result.cancelled) {
          console.log('❌ Error habilitando biométrico:', result.reason);
        }
      }
    } catch (error) {
      console.error('Error en prompt biométrico:', error);
    }
  };

  // Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ FUNCIÓN DE MANEJO DE ÉXITO DE GITHUB MEJORADA
  const handleGitHubAuthSuccess = async (userData) => {
    try {
      console.log('🎉 GitHub auth exitosa, procesando navegación...');
      console.log('🎉 Usuario:', userData.login || userData.name);
      console.log('🎉 ID de usuario en BD:', userData.id_usuario);
      
      // Verificar que el ID de usuario esté guardado
      const storedUserId = await SecureStore.getItemAsync('user_id');
      console.log('✅ User ID en storage:', storedUserId);
      
      if (!storedUserId && userData.id_usuario) {
        await SecureStore.setItemAsync('user_id', userData.id_usuario.toString());
        console.log('✅ User ID guardado como fallback:', userData.id_usuario);
      }
      
      // Verificar si mostrar prompt biométrico
      await promptBiometricSetup();
      
      Alert.alert(
        'Éxito', 
        `¡Bienvenido ${userData.name || userData.login}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Principal')
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error procesando navegación de GitHub:', error);
      Alert.alert(
        'Error', 
        'Error al completar el inicio de sesión. Intenta nuevamente.'
      );
    }
  };

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      // Hacer petición al backend
      const response = await api.post('/api/users/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      // Si llegamos aquí, el login fue exitoso
      console.log('Login exitoso:', response.data);
      
      // Guardar user ID
      if (response.data?.data?.user?.id) {
        const userId = response.data.data.user.id.toString();
        await SecureStore.setItemAsync('user_id', userId);
        console.log('✅ User ID guardado para login normal:', userId);
        
        const verificacion = await SecureStore.getItemAsync('user_id');
        console.log('✅ Verificación - User ID en storage después del login:', verificacion);
      } else {
        console.error('❌ Estructura de respuesta inesperada:', response.data);
        const possibleId = response.data?.user?.id || response.data?.data?.user?.id_usuario || response.data?.user?.id_usuario;
        if (possibleId) {
          await SecureStore.setItemAsync('user_id', possibleId.toString());
          console.log('✅ User ID guardado con fallback:', possibleId);
        }
      }
      
      // ✅ VERIFICAR SI MOSTRAR PROMPT BIOMÉTRICO DESPUÉS DEL LOGIN EXITOSO
      await promptBiometricSetup();
      
      Alert.alert(
        'Éxito', 
        'Inicio de sesión exitoso',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar campos
              setEmail('');
              setPassword('');
              // Navegar a la pantalla principal
              navigation.navigate('Principal');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validaciones básicas
    if (!registerName || !registerLastName || !registerEmail || !registerPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(registerEmail)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (registerPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (registerPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // Hacer petición al backend
      const response = await api.post('/api/users/register', {
        name: registerName.trim(),
        lastName: registerLastName.trim(),
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword
      });

      // Si llegamos aquí, el registro fue exitoso
      console.log('Registro exitoso:', response.data);
      
      // Guardar user ID
      if (response.data?.data?.user?.id) {
        const userId = response.data.data.user.id.toString();
        await SecureStore.setItemAsync('user_id', userId);
        console.log('✅ User ID guardado para registro:', userId);
        
        const verificacion = await SecureStore.getItemAsync('user_id');
        console.log('✅ Verificación - User ID en storage después del registro:', verificacion);
      } else {
        console.error('❌ Estructura de respuesta inesperada en registro:', response.data);
        const possibleId = response.data?.user?.id || response.data?.data?.user?.id_usuario || response.data?.user?.id_usuario;
        if (possibleId) {
          await SecureStore.setItemAsync('user_id', possibleId.toString());
          console.log('✅ User ID guardado con fallback en registro:', possibleId);
        }
      }
      
      // ✅ VERIFICAR SI MOSTRAR PROMPT BIOMÉTRICO DESPUÉS DEL REGISTRO EXITOSO
      await promptBiometricSetup();
      
      Alert.alert(
        'Éxito', 
        'Usuario registrado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar campos
              setRegisterName('');
              setRegisterLastName('');
              setRegisterEmail('');
              setRegisterPassword('');
              setConfirmPassword('');
              // Navegar a la pantalla principal
              navigation.navigate('Principal');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error en registro:', error.response?.data || error.message);
      
      let errorMessage = 'Error al registrar usuario';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Datos inválidos. Verifica la información ingresada.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función simplificada para GitHub login
  const handleGitHubLogin = async () => {
    if (!gitHubRequest) {
      Alert.alert('Error', 'GitHub OAuth no está configurado correctamente. Verifica la configuración en GitHubAuth.js');
      return;
    }

    try {
      console.log('🚀 Iniciando autenticación con GitHub...');
      await signInWithGitHub(handleGitHubAuthSuccess);
    } catch (error) {
      console.error('Error iniciando sesión con GitHub:', error);
      Alert.alert(
        'Error de GitHub', 
        'Error al iniciar sesión con GitHub. Verifica tu conexión e intenta nuevamente.'
      );
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'login') {
      setShowPassword(!showPassword);
    } else if (field === 'register') {
      setShowRegisterPassword(!showRegisterPassword);
    } else if (field === 'confirm') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // ✅ BOTÓN BIOMÉTRICO PERSONALIZADO
  const renderBiometricButton = () => {
    if (!showBiometricButton || !biometricSupport?.isSupported) {
      return null;
    }

    const biometricTypeText = BiometricAuthService.getBiometricTypeText(biometricSupport.supportedTypes);

    return (
      <TouchableOpacity 
        style={[styles.biometricButton, { 
          borderColor: colors.primary,
          backgroundColor: colors.surface 
        }]}
        onPress={handleBiometricLogin}
        disabled={isBiometricLoading || isLoading || isGitHubLoading}
      >
        {isBiometricLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={[styles.biometricButtonText, { 
              color: colors.primary,
              marginLeft: 8 
            }]}>
              Autenticando...
            </Text>
          </View>
        ) : (
          <View style={styles.biometricContent}>
            <Fingerprint size={24} color={colors.primary} />
            <Text style={[styles.biometricButtonText, { color: colors.primary }]}>
              Usar {biometricTypeText}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      {/* ✅ BOTÓN BIOMÉTRICO AL INICIO DEL LOGIN */}
      {renderBiometricButton()}
      
      {showBiometricButton && (
        <View style={styles.separatorContainer}>
          <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.separatorText, { color: colors.textSecondary }]}>o inicia sesión con</Text>
          <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border,
            backgroundColor: colors.input,
            color: colors.text
          }]}
          placeholder="Correo electrónico"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading && !isGitHubLoading && !isBiometricLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={[styles.passwordContainer, {
          borderColor: colors.border,
          backgroundColor: colors.input
        }]}>
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            placeholder="Contraseña"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading && !isGitHubLoading && !isBiometricLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('login')}
            disabled={isLoading || isGitHubLoading || isBiometricLoading}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.loginButton, 
          { backgroundColor: (isLoading || isGitHubLoading || isBiometricLoading) ? colors.textSecondary : colors.primary }
        ]} 
        onPress={handleLogin}
        disabled={isLoading || isGitHubLoading || isBiometricLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>
              Iniciando sesión...
            </Text>
          </View>
        ) : (
          <Text style={styles.loginButtonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Separador para GitHub */}
      <View style={styles.separatorContainer}>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.separatorText, { color: colors.textSecondary }]}>o</Text>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Botón de GitHub */}
      <GitHubButton 
        onPress={handleGitHubLogin}
        isLoading={isGitHubLoading}
        colors={colors}
      />

      <TouchableOpacity 
        style={styles.forgotPassword}  
        onPress={() => navigation.navigate('ForgotPassword')}
        disabled={isLoading || isGitHubLoading || isBiometricLoading}
      >
        <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, {
            borderColor: colors.border,
            backgroundColor: colors.input,
            color: colors.text
          }]}
          placeholder="Nombre"
          placeholderTextColor={colors.placeholder}
          value={registerName}
          onChangeText={setRegisterName}
          autoCapitalize="words"
          editable={!isLoading && !isGitHubLoading && !isBiometricLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, {
            borderColor: colors.border,
            backgroundColor: colors.input,
            color: colors.text
          }]}
          placeholder="Apellido"
          placeholderTextColor={colors.placeholder}
          value={registerLastName}
          onChangeText={setRegisterLastName}
          autoCapitalize="words"
          editable={!isLoading && !isGitHubLoading && !isBiometricLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, {
            borderColor: colors.border,
            backgroundColor: colors.input,
            color: colors.text
          }]}
          placeholder="Correo electrónico"
          placeholderTextColor={colors.placeholder}
          value={registerEmail}
          onChangeText={setRegisterEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading && !isGitHubLoading && !isBiometricLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={[styles.passwordContainer, {
          borderColor: colors.border,
          backgroundColor: colors.input
        }]}>
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            placeholder="Contraseña (mín. 6 caracteres)"
            placeholderTextColor={colors.placeholder}
            value={registerPassword}
            onChangeText={setRegisterPassword}
            secureTextEntry={!showRegisterPassword}
            editable={!isLoading && !isGitHubLoading && !isBiometricLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('register')}
            disabled={isLoading || isGitHubLoading || isBiometricLoading}
          >
            {showRegisterPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={[styles.passwordContainer, {
          borderColor: colors.border,
          backgroundColor: colors.input
        }]}>
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            placeholder="Confirmar contraseña"
            placeholderTextColor={colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            editable={!isLoading && !isGitHubLoading && !isBiometricLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('confirm')}
            disabled={isLoading || isGitHubLoading || isBiometricLoading}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.loginButton, 
          { backgroundColor: (isLoading || isGitHubLoading || isBiometricLoading) ? colors.textSecondary : colors.primary }
        ]} 
        onPress={handleRegister}
        disabled={isLoading || isGitHubLoading || isBiometricLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>
              Registrando...
            </Text>
          </View>
        ) : (
          <Text style={styles.loginButtonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      {/* Separador para GitHub */}
      <View style={styles.separatorContainer}>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.separatorText, { color: colors.textSecondary }]}>o</Text>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Botón de GitHub */}
      <GitHubButton 
        onPress={handleGitHubLogin}
        isLoading={isGitHubLoading}
        colors={colors}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Infinity 
            size={60} 
            color={colors.text} 
            strokeWidth={2.5}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.appName, { color: colors.primary }]}>HabitFlow</Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceVariant }]}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'login' && { ...styles.activeTab, backgroundColor: colors.surface }
            ]}
            onPress={() => setActiveTab('login')}
            disabled={isLoading || isGitHubLoading || isBiometricLoading}
          >
            <Text style={[
              styles.tabText, 
              { color: colors.textSecondary },
              activeTab === 'login' && { ...styles.activeTabText, color: colors.primary }
            ]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'register' && { ...styles.activeTab, backgroundColor: colors.surface }
            ]}
            onPress={() => setActiveTab('register')}
            disabled={isLoading || isGitHubLoading || isBiometricLoading}
          >
            <Text style={[
              styles.tabText, 
              { color: colors.textSecondary },
              activeTab === 'register' && { ...styles.activeTabText, color: colors.primary }
            ]}>
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        {activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#968ce4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    fontSize: 16,
  },
  // ✅ ESTILOS PARA EL BOTÓN BIOMÉTRICO
  biometricButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biometricContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LoginScreen;