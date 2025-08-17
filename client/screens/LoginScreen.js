// LoginScreen.js - Con lógica de autenticación separada
import React, { useState } from 'react';
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
import { Infinity, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import api from '../services/api';
import { GitHubButton } from '../services/GitHubAuth';
import { useGitHubLogin } from '../hooks/useGithubLogin';
// Ocultar advertencias y errores de consola en pantalla
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login');
  const { colors } = useTheme();
  
  // Estados para Login Regular
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Estados para Registro Regular
  const [registerName, setRegisterName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Hook personalizado para GitHub
  const { 
    isGitHubLoading, 
    handleGitHubLogin, 
    handleForceNewGitHubAuth 
  } = useGitHubLogin(navigation);

  // Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // LÓGICA DE LOGIN REGULAR
  const handleRegularLogin = async () => {
    // Validaciones básicas
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsLoginLoading(true);

    try {
      const response = await api.post('/api/users/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      console.log('Login regular exitoso:', response.data);
      
      Alert.alert(
        'Éxito', 
        'Inicio de sesión exitoso',
        [
          {
            text: 'OK',
            onPress: () => {
              clearLoginFields();
              navigation.navigate('Principal');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error en login regular:', error.response?.data || error.message);
      
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
      setIsLoginLoading(false);
    }
  };

  // LÓGICA DE REGISTRO REGULAR
  const handleRegularRegister = async () => {
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

    setIsRegisterLoading(true);

    try {
      const response = await api.post('/api/users/register', {
        name: registerName.trim(),
        lastName: registerLastName.trim(),
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword
      });

      console.log('Registro regular exitoso:', response.data);
      
      Alert.alert(
        'Éxito', 
        'Usuario registrado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              clearRegisterFields();
              navigation.navigate('Principal');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error en registro regular:', error.response?.data || error.message);
      
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
      setIsRegisterLoading(false);
    }
  };

  // FUNCIONES AUXILIARES
  const clearLoginFields = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const clearRegisterFields = () => {
    setRegisterName('');
    setRegisterLastName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setConfirmPassword('');
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'login':
        setShowPassword(!showPassword);
        break;
      case 'register':
        setShowRegisterPassword(!showRegisterPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  const isAnyLoading = isLoginLoading || isRegisterLoading || isGitHubLoading;

  // RENDER LOGIN FORM
  const renderLoginForm = () => (
    <View style={styles.formContainer}>
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
          editable={!isAnyLoading}
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
            editable={!isAnyLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('login')}
            disabled={isAnyLoading}
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
          { backgroundColor: isAnyLoading ? colors.textSecondary : colors.primary }
        ]} 
        onPress={handleRegularLogin}
        disabled={isAnyLoading}
      >
        {isLoginLoading ? (
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

      {/* Separador */}
      <View style={styles.separatorContainer}>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.separatorText, { color: colors.textSecondary }]}>o</Text>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Botón de GitHub */}
      <GitHubButton 
        onPress={handleGitHubLogin}
        onForceNewAuth={handleForceNewGitHubAuth}
        isLoading={isGitHubLoading}
        disabled={isAnyLoading}
        colors={colors}
      />

      <TouchableOpacity 
        style={styles.forgotPassword}  
        onPress={() => navigation.navigate('ForgotPassword')}
        disabled={isAnyLoading}
      >
        <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>
    </View>
  );

  // RENDER REGISTER FORM
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
          editable={!isAnyLoading}
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
          editable={!isAnyLoading}
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
          editable={!isAnyLoading}
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
            editable={!isAnyLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('register')}
            disabled={isAnyLoading}
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
            editable={!isAnyLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('confirm')}
            disabled={isAnyLoading}
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
          { backgroundColor: isAnyLoading ? colors.textSecondary : colors.primary }
        ]} 
        onPress={handleRegularRegister}
        disabled={isAnyLoading}
      >
        {isRegisterLoading ? (
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

      {/* Separador */}
      <View style={styles.separatorContainer}>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.separatorText, { color: colors.textSecondary }]}>o</Text>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Botón de GitHub */}
      <GitHubButton 
        onPress={handleGitHubLogin}
        onForceNewAuth={handleForceNewGitHubAuth}
        isLoading={isGitHubLoading}
        disabled={isAnyLoading}
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
            disabled={isAnyLoading}
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
            disabled={isAnyLoading}
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
});

export default LoginScreen;