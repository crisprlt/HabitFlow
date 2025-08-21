// LoginScreen.js - CON AUTENTICACIÓN BIOMÉTRICA INTEGRADA Y SOPORTE MULTIIDIOMA
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
import { useLanguage } from './LanguageContext'; // ✅ AGREGAR ESTA LÍNEA
import api from '../services/api';
import { useGitHubAuth, GitHubButton } from '../services/GitHubAuth';
import BiometricAuthService from '../services/BiometricAuth';
import * as SecureStore from 'expo-secure-store';

// Ocultar advertencias y errores de consola en pantalla
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

// ✅ AGREGAR TODO ESTE OBJETO DE TEXTOS
const loginTexts = {
  es: {
    // Tabs
    loginTab: 'Iniciar Sesión',
    registerTab: 'Registrarse',
    
    // Form fields
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    name: 'Nombre',
    lastName: 'Apellido',
    passwordMinChars: 'Contraseña (mín. 6 caracteres)',
    
    // Buttons
    login: 'Entrar',
    register: 'Registrarse',
    forgotPassword: '¿Olvidaste tu contraseña?',
    
    // Loading states
    loggingIn: 'Iniciando sesión...',
    registering: 'Registrando...',
    authenticating: 'Autenticando...',
    
    // Biometric
    useBiometric: 'Usar',
    
    // Separators
    orLoginWith: 'o inicia sesión con',
    or: 'o',
    
    // Validations
    completeAllFields: 'Por favor completa todos los campos',
    invalidEmail: 'Por favor ingresa un email válido',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    passwordsDontMatch: 'Las contraseñas no coinciden',
    
    // Success messages
    loginSuccess: 'Inicio de sesión exitoso',
    registerSuccess: 'Usuario registrado exitosamente',
    biometricLoginSuccess: 'Inicio de sesión biométrico exitoso',
    
    // Error messages
    loginError: 'Error al iniciar sesión',
    registerError: 'Error al registrar usuario',
    biometricError: 'Error Biométrico',
    biometricGeneralError: 'Error al realizar autenticación biométrica',
    incorrectCredentials: 'Credenciales incorrectas. Verifica tu email y contraseña.',
    connectionError: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
    invalidData: 'Datos inválidos. Verifica la información ingresada.',
    gitHubError: 'Error de GitHub',
    gitHubConnectionError: 'Error al iniciar sesión con GitHub. Verifica tu conexión e intenta nuevamente.',
    gitHubConfigError: 'GitHub OAuth no está configurado correctamente. Verifica la configuración en GitHubAuth.js',
    gitHubProcessError: 'Error al completar el inicio de sesión. Intenta nuevamente.',
    
    // Welcome
    welcome: '¡Bienvenido',
    
    // General
    success: 'Éxito',
    error: 'Error',
    ok: 'OK'
  },
  en: {
    // Tabs
    loginTab: 'Sign In',
    registerTab: 'Sign Up',
    
    // Form fields
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    name: 'First Name',
    lastName: 'Last Name',
    passwordMinChars: 'Password (min. 6 characters)',
    
    // Buttons
    login: 'Sign In',
    register: 'Sign Up',
    forgotPassword: 'Forgot your password?',
    
    // Loading states
    loggingIn: 'Signing in...',
    registering: 'Signing up...',
    authenticating: 'Authenticating...',
    
    // Biometric
    useBiometric: 'Use',
    
    // Separators
    orLoginWith: 'or sign in with',
    or: 'or',
    
    // Validations
    completeAllFields: 'Please complete all fields',
    invalidEmail: 'Please enter a valid email',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDontMatch: 'Passwords do not match',
    
    // Success messages
    loginSuccess: 'Login successful',
    registerSuccess: 'User registered successfully',
    biometricLoginSuccess: 'Biometric login successful',
    
    // Error messages
    loginError: 'Login error',
    registerError: 'Registration error',
    biometricError: 'Biometric Error',
    biometricGeneralError: 'Error performing biometric authentication',
    incorrectCredentials: 'Incorrect credentials. Check your email and password.',
    connectionError: 'Connection error. Check your internet and try again.',
    invalidData: 'Invalid data. Check the entered information.',
    gitHubError: 'GitHub Error',
    gitHubConnectionError: 'Error signing in with GitHub. Check your connection and try again.',
    gitHubConfigError: 'GitHub OAuth is not configured correctly. Check the configuration in GitHubAuth.js',
    gitHubProcessError: 'Error completing sign in. Please try again.',
    
    // Welcome
    welcome: 'Welcome',
    
    // General
    success: 'Success',
    error: 'Error',
    ok: 'OK'
  }
};

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login');
  const { colors } = useTheme();
  const { currentLanguage } = useLanguage(); // ✅ AGREGAR ESTA LÍNEA
  
  // ✅ AGREGAR ESTA FUNCIÓN
  const getText = (key) => {
    return loginTexts[currentLanguage]?.[key] || loginTexts['en'][key] || key;
  };
  
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
        const shouldShow = await BiometricAuthService.shouldShowBiometricPrompt();
        const isEnabled = await BiometricAuthService.isBiometricEnabled();
        const hasSession = await BiometricAuthService.checkUserHasStoredSession();
        
        setShowBiometricButton(hasSession && isEnabled);
      }
    } catch (error) {
      console.error('Error verificando capacidades biométricas:', error);
    }
  };

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    
    try {
      const result = await BiometricAuthService.quickBiometricLogin();
      
      if (result.success) {
        Alert.alert(
          getText('success'), 
          getText('biometricLoginSuccess'),
          [{ text: getText('ok'), onPress: () => navigation.navigate('Principal') }]
        );
      } else {
        if (!result.reason?.includes('cancelada') && !result.reason?.includes('UserCancel')) {
          Alert.alert(getText('biometricError'), result.reason);
        }
      }
    } catch (error) {
      Alert.alert(getText('error'), getText('biometricGeneralError'));
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const promptBiometricSetup = async () => {
    try {
      const shouldPrompt = await BiometricAuthService.shouldShowBiometricPrompt();
      
      if (shouldPrompt) {
        const result = await BiometricAuthService.promptToEnableBiometric();
        if (result.success) {
          setShowBiometricButton(true);
        }
      }
    } catch (error) {
      console.error('Error en prompt biométrico:', error);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGitHubAuthSuccess = async (userData) => {
    try {
      const storedUserId = await SecureStore.getItemAsync('user_id');
      
      if (!storedUserId && userData.id_usuario) {
        await SecureStore.setItemAsync('user_id', userData.id_usuario.toString());
      }
      
      await promptBiometricSetup();
      
      Alert.alert(
        getText('success'), 
        `${getText('welcome')} ${userData.name || userData.login}!`,
        [{ text: getText('ok'), onPress: () => navigation.navigate('Principal') }]
      );
      
    } catch (error) {
      Alert.alert(getText('error'), getText('gitHubProcessError'));
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(getText('error'), getText('completeAllFields'));
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(getText('error'), getText('invalidEmail'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/users/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      if (response.data?.data?.user?.id) {
        const userId = response.data.data.user.id.toString();
        await SecureStore.setItemAsync('user_id', userId);
      }
      
      await promptBiometricSetup();
      
      Alert.alert(
        getText('success'), 
        getText('loginSuccess'),
        [
          {
            text: getText('ok'),
            onPress: () => {
              setEmail('');
              setPassword('');
              navigation.navigate('Principal');
            }
          }
        ]
      );

    } catch (error) {
      let errorMessage = getText('loginError');
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = getText('incorrectCredentials');
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = getText('connectionError');
      }
      
      Alert.alert(getText('error'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerLastName || !registerEmail || !registerPassword || !confirmPassword) {
      Alert.alert(getText('error'), getText('completeAllFields'));
      return;
    }

    if (!isValidEmail(registerEmail)) {
      Alert.alert(getText('error'), getText('invalidEmail'));
      return;
    }

    if (registerPassword.length < 6) {
      Alert.alert(getText('error'), getText('passwordTooShort'));
      return;
    }

    if (registerPassword !== confirmPassword) {
      Alert.alert(getText('error'), getText('passwordsDontMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/users/register', {
        name: registerName.trim(),
        lastName: registerLastName.trim(),
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword
      });

      if (response.data?.data?.user?.id) {
        const userId = response.data.data.user.id.toString();
        await SecureStore.setItemAsync('user_id', userId);
      }
      
      await promptBiometricSetup();
      
      Alert.alert(
        getText('success'), 
        getText('registerSuccess'),
        [
          {
            text: getText('ok'),
            onPress: () => {
              setRegisterName('');
              setRegisterLastName('');
              setRegisterEmail('');
              setRegisterPassword('');
              setConfirmPassword('');
              navigation.navigate('Principal');
            }
          }
        ]
      );

    } catch (error) {
      let errorMessage = getText('registerError');
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || getText('invalidData');
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = getText('connectionError');
      }
      
      Alert.alert(getText('error'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (!gitHubRequest) {
      Alert.alert(getText('error'), getText('gitHubConfigError'));
      return;
    }

    try {
      await signInWithGitHub(handleGitHubAuthSuccess);
    } catch (error) {
      Alert.alert(getText('gitHubError'), getText('gitHubConnectionError'));
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
              {getText('authenticating')}
            </Text>
          </View>
        ) : (
          <View style={styles.biometricContent}>
            <Fingerprint size={24} color={colors.primary} />
            <Text style={[styles.biometricButtonText, { color: colors.primary }]}>
              {getText('useBiometric')} {biometricTypeText}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      {renderBiometricButton()}
      
      {showBiometricButton && (
        <View style={styles.separatorContainer}>
          <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.separatorText, { color: colors.textSecondary }]}>{getText('orLoginWith')}</Text>
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
          placeholder={getText('email')}
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
            placeholder={getText('password')}
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
              {getText('loggingIn')}
            </Text>
          </View>
        ) : (
          <Text style={styles.loginButtonText}>{getText('login')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.separatorContainer}>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.separatorText, { color: colors.textSecondary }]}>{getText('or')}</Text>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
      </View>

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
          {getText('forgotPassword')}
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
          placeholder={getText('name')}
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
          placeholder={getText('lastName')}
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
          placeholder={getText('email')}
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
            placeholder={getText('passwordMinChars')}
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
            placeholder={getText('confirmPassword')}
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
              {getText('registering')}
            </Text>
          </View>
        ) : (
          <Text style={styles.loginButtonText}>{getText('register')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.separatorContainer}>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.separatorText, { color: colors.textSecondary }]}>{getText('or')}</Text>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
      </View>

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
        <View style={styles.logoSection}>
          <Infinity 
            size={60} 
            color={colors.text} 
            strokeWidth={2.5}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.appName, { color: colors.primary }]}>HabitFlow</Text>
        </View>

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
              {getText('loginTab')}
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
              {getText('registerTab')}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
      </View>
    </SafeAreaView>
  );
};

// MANTÉN TODOS TUS ESTILOS ORIGINALES
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