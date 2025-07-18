// LoginScreen.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Infinity, Eye, EyeOff } from 'lucide-react-native';

const LoginScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' o 'register'
  
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

  const handleLogin = () => {
    console.log('Login attempt:', { email, password });
    navigation.navigate('Principal');
  };

  const handleRegister = () => {
    if (registerPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Register attempt:', { 
      name: registerName, 
      lastName: registerLastName, 
      email: registerEmail, 
      password: registerPassword 
    });
    // Aquí puedes agregar tu lógica de registro
    navigation.navigate('Principal');
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
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('login')}
          >
            {showPassword ? (
              <EyeOff size={20} color="#999" />
            ) : (
              <Eye size={20} color="#999" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotPassword}  onPress={() => navigation.navigate('ForgotPassword')} >
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#999"
          value={registerName}
          onChangeText={setRegisterName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          placeholderTextColor="#999"
          value={registerLastName}
          onChangeText={setRegisterLastName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          value={registerEmail}
          onChangeText={setRegisterEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={registerPassword}
            onChangeText={setRegisterPassword}
            secureTextEntry={!showRegisterPassword}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility('register')}
          >
            {showRegisterPassword ? (
              <EyeOff size={20} color="#999" />
            ) : (
              <Eye size={20} color="#999" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
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
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
        <Text style={styles.loginButtonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Infinity 
            size={60} 
            color="#333333" 
            strokeWidth={2.5}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.appName}>HabitFlow</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'login' && styles.activeTab]}
            onPress={() => setActiveTab('login')}
          >
            <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'register' && styles.activeTab]}
            onPress={() => setActiveTab('register')}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
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
    backgroundColor: '#FFFFFF',
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
    color: '#968ce4',
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#FFFFFF',
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
    color: '#666',
  },
  activeTabText: {
    color: '#968ce4',
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
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#968ce4',
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
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#968ce4',
    fontSize: 16,
  },
});

export default LoginScreen;