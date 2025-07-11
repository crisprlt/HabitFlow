// LoginScreen.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Infinity, Eye, EyeOff } from 'lucide-react-native';

const LoginScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('login'); 
  
  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Estados para Registro
  const [registroData, setRegistroData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmarPassword: ''
  });
  
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [errores, setErrores] = useState({});
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const handleLogin = () => {
    console.log('Login attempt:', { loginEmail, loginPassword });
    navigation.navigate('Principal');
  };

  const handleInputChange = (name, value) => {
    setRegistroData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!registroData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (!registroData.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es requerido';
    }

    if (!registroData.email.trim()) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(registroData.email)) {
      nuevosErrores.email = 'El formato del email no es válido';
    }

    if (!registroData.password) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (registroData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (registroData.password !== registroData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    if (!aceptaTerminos) {
      nuevosErrores.terminos = 'Debes aceptar los términos y condiciones';
    }

    return nuevosErrores;
  };

  const handleRegistro = () => {
    const nuevosErrores = validarFormulario();
    
    if (Object.keys(nuevosErrores).length === 0) {
      Alert.alert('Éxito', '¡Registro exitoso! Datos guardados correctamente.', [
        { text: 'OK', onPress: () => setActiveTab('login') }
      ]);
    } else {
      setErrores(nuevosErrores);
    }
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          value={loginEmail}
          onChangeText={setLoginEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegistroForm = () => (
    <View style={styles.formContainer}>
   
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <TextInput
            style={[
              styles.input,
              errores.nombre && styles.inputError
            ]}
            value={registroData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            placeholder="Nombre"
            placeholderTextColor="#999"
          />
          {errores.nombre && (
            <Text style={styles.errorText}>{errores.nombre}</Text>
          )}
        </View>
        
        <View style={styles.halfInput}>
          <TextInput
            style={[
              styles.input,
              errores.apellido && styles.inputError
            ]}
            value={registroData.apellido}
            onChangeText={(value) => handleInputChange('apellido', value)}
            placeholder="Apellido"
            placeholderTextColor="#999"
          />
          {errores.apellido && (
            <Text style={styles.errorText}>{errores.apellido}</Text>
          )}
        </View>
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            errores.email && styles.inputError
          ]}
          value={registroData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errores.email && (
          <Text style={styles.errorText}>{errores.email}</Text>
        )}
      </View>

      {/* Contraseña */}
      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              errores.password && styles.inputError
            ]}
            value={registroData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#999"
            secureTextEntry={!mostrarPassword}
          />
          <TouchableOpacity
            onPress={() => setMostrarPassword(!mostrarPassword)}
            style={styles.eyeButton}
          >
            {mostrarPassword ? 
              <EyeOff size={20} color="#999" /> : 
              <Eye size={20} color="#999" />
            }
          </TouchableOpacity>
        </View>
        {errores.password && (
          <Text style={styles.errorText}>{errores.password}</Text>
        )}
      </View>

      {/* Confirmar Contraseña */}
      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              errores.confirmarPassword && styles.inputError
            ]}
            value={registroData.confirmarPassword}
            onChangeText={(value) => handleInputChange('confirmarPassword', value)}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!mostrarConfirmarPassword}
          />
          <TouchableOpacity
            onPress={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
            style={styles.eyeButton}
          >
            {mostrarConfirmarPassword ? 
              <EyeOff size={20} color="#999" /> : 
              <Eye size={20} color="#999" />
            }
          </TouchableOpacity>
        </View>
        {errores.confirmarPassword && (
          <Text style={styles.errorText}>{errores.confirmarPassword}</Text>
        )}
      </View>

      {/* Términos y Condiciones */}
      <View style={styles.termsContainer}>
        <TouchableOpacity
          onPress={() => setAceptaTerminos(!aceptaTerminos)}
          style={styles.checkboxContainer}
        >
          <View style={[
            styles.checkbox,
            aceptaTerminos && styles.checkboxSelected
          ]}>
            {aceptaTerminos && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Acepto los{' '}
            <Text style={styles.linkText}>términos y condiciones</Text>
          </Text>
        </TouchableOpacity>
        {errores.terminos && (
          <Text style={styles.errorText}>{errores.terminos}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleRegistro}>
        <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === 'login' && styles.activeTab
              ]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'login' && styles.activeTabText
              ]}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === 'registro' && styles.activeTab
              ]}
              onPress={() => setActiveTab('registro')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'registro' && styles.activeTabText
              ]}>
                Registro
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          {activeTab === 'login' ? renderLoginForm() : renderRegistroForm()}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al continuar, aceptas nuestros{' '}
              <Text style={styles.linkText}>Términos de Servicio</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    minHeight: '100%',
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
    backgroundColor: '#F8F8F8',
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
    backgroundColor: '#968ce4',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
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
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    paddingRight: 48,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  termsContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#968ce4',
    borderColor: '#968ce4',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#968ce4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#968ce4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#968ce4',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#968ce4',
    fontWeight: '500',
  },
});

export default LoginScreen;