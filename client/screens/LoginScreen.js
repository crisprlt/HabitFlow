// LoginScreen.js - Corregido con mejor gestión de GitHub OAuth
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
import { Infinity, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import api from '../services/api';
import { useGitHubAuth, GitHubButton } from '../services/GitHubAuth';

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
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);

  // GitHub Auth Hook
  const { 
    isLoading: isGitHubLoading, 
    user: gitHubUser, 
    isAuthenticated, 
    signInWithGitHub,
    forceNewAuth,
    request: gitHubRequest 
  } = useGitHubAuth();

  // Efecto para manejar autenticación exitosa con GitHub
  useEffect(() => {
    if (isAuthenticated && gitHubUser) {
      handleGitHubAuthSuccess(gitHubUser);
    }
  }, [isAuthenticated, gitHubUser]);

  const handleGitHubAuthSuccess = async (userData) => {
    try {
      console.log('Datos recibidos de GitHub:', userData);
      
      // Buscar email principal
      let primaryEmail = userData.email;
      if (!primaryEmail && userData.emails && userData.emails.length > 0) {
        const primaryEmailObj = userData.emails.find(email => email.primary);
        primaryEmail = primaryEmailObj ? primaryEmailObj.email : userData.emails[0].email;
      }

      if (!primaryEmail) {
        Alert.alert(
          'Error', 
          'No se pudo obtener el email de tu cuenta de GitHub. Asegúrate de que tu email sea público o usa el registro manual.'
        );
        return;
      }

      // Enviar datos de GitHub al backend para crear/actualizar usuario
      const response = await api.post('/api/github/auth', {
        githubId: userData.id,
        name: userData.name || userData.login,
        email: primaryEmail,
        avatarUrl: userData.avatar_url,
        githubUsername: userData.login
      });

      console.log('Usuario autenticado con GitHub:', response.data);
      
      Alert.alert(
        'Éxito',
        `¡Bienvenido, ${userData.name || userData.login}!`,
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('Principal')
          }
        ]
      );
      
    } catch (error) {
      console.error('Error procesando autenticación de GitHub:', error);
      
      let errorMessage = 'Error al procesar la autenticación con GitHub.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Datos inválidos de GitHub.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error del servidor. Por favor intenta nuevamente.';
        }
      } else if (error.request) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      
      // Determinar el mensaje de error
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        // El servidor respondió con un código de error
        if (error.response.status === 401) {
          errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // No hay respuesta del servidor
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
      
      // Determinar el mensaje de error
      let errorMessage = 'Error al registrar usuario';
      
      if (error.response) {
        // El servidor respondió con un código de error
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Datos inválidos. Verifica la información ingresada.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // No hay respuesta del servidor
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (!gitHubRequest) {
      Alert.alert('Error', 'GitHub OAuth no está configurado correctamente');
      return;
    }

    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Error iniciando sesión con GitHub:', error);
      Alert.alert('Error', 'Error al iniciar sesión con GitHub');
    }
  };

  const handleForceNewGitHubAuth = async () => {
    Alert.alert(
      'Nueva Sesión de GitHub',
      '¿Quieres limpiar la sesión actual y crear una nueva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, Nueva Sesión', 
          onPress: async () => {
            try {
              await forceNewAuth();
            } catch (error) {
              console.error('Error en nueva autenticación:', error);
              Alert.alert('Error', 'Error al iniciar nueva sesión');
            }
          }
        }
      ]
    );
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
          editable={!isLoading && !isGitHubLoading}
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
            editable={!isLoading && !isGitHubLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('login')}
            disabled={isLoading || isGitHubLoading}
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
          { backgroundColor: (isLoading || isGitHubLoading) ? colors.textSecondary : colors.primary }
        ]} 
        onPress={handleLogin}
        disabled={isLoading || isGitHubLoading}
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
        colors={colors}
      />

      <TouchableOpacity 
        style={styles.forgotPassword}  
        onPress={() => navigation.navigate('ForgotPassword')}
        disabled={isLoading || isGitHubLoading}
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
          editable={!isLoading && !isGitHubLoading}
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
          editable={!isLoading && !isGitHubLoading}
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
          editable={!isLoading && !isGitHubLoading}
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
            editable={!isLoading && !isGitHubLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('register')}
            disabled={isLoading || isGitHubLoading}
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
            editable={!isLoading && !isGitHubLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('confirm')}
            disabled={isLoading || isGitHubLoading}
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
          { backgroundColor: (isLoading || isGitHubLoading) ? colors.textSecondary : colors.primary }
        ]} 
        onPress={handleRegister}
        disabled={isLoading || isGitHubLoading}
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
            disabled={isLoading || isGitHubLoading}
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
            disabled={isLoading || isGitHubLoading}
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