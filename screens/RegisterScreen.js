import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

const SCALE = 1.2;
const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    fechaNacimiento: '',
    password: '',
    confirmarPassword: ''
  });
  
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [errores, setErrores] = useState({});
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'El formato del email no es válido';
    }

    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    if (!aceptaTerminos) {
      nuevosErrores.terminos = 'Debes aceptar los términos y condiciones';
    }

    return nuevosErrores;
  };

  const handleSubmit = () => {
    const nuevosErrores = validarFormulario();
    
    if (Object.keys(nuevosErrores).length === 0) {
      Alert.alert('Éxito', '¡Registro exitoso! Datos guardados correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      setErrores(nuevosErrores);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <ArrowLeft size={20 * SCALE} color="#968ce4" />
        </TouchableOpacity>
        <Text style={styles.title}>Crear Cuenta</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nombre y Apellido */}
        <View style={styles.section}>
          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                style={[
                  styles.input,
                  errores.nombre && styles.inputError
                ]}
                value={formData.nombre}
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
                value={formData.apellido}
                onChangeText={(value) => handleInputChange('apellido', value)}
                placeholder="Apellido"
                placeholderTextColor="#999"
              />
              {errores.apellido && (
                <Text style={styles.errorText}>{errores.apellido}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[
              styles.input,
              errores.email && styles.inputError
            ]}
            value={formData.email}
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

        {/* Fecha de Nacimiento */}
        <View style={styles.section}>
          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TextInput
            style={styles.input}
            value={formData.fechaNacimiento}
            onChangeText={(value) => handleInputChange('fechaNacimiento', value)}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#999"
          />
        </View>

        {/* Contraseña */}
        <View style={styles.section}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errores.password && styles.inputError
              ]}
              value={formData.password}
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
                <EyeOff size={20 * SCALE} color="#999" /> : 
                <Eye size={20 * SCALE} color="#999" />
              }
            </TouchableOpacity>
          </View>
          {errores.password && (
            <Text style={styles.errorText}>{errores.password}</Text>
          )}
        </View>

        {/* Confirmar Contraseña */}
        <View style={styles.section}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errores.confirmarPassword && styles.inputError
              ]}
              value={formData.confirmarPassword}
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
                <EyeOff size={20 * SCALE} color="#999" /> : 
                <Eye size={20 * SCALE} color="#999" />
              }
            </TouchableOpacity>
          </View>
          {errores.confirmarPassword && (
            <Text style={styles.errorText}>{errores.confirmarPassword}</Text>
          )}
        </View>

        {/* Términos y Condiciones */}
        <View style={styles.termsSection}>
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
              {' '}y la{' '}
              <Text style={styles.linkText}>política de privacidad</Text>
            </Text>
          </TouchableOpacity>
          {errores.terminos && (
            <Text style={styles.errorText}>{errores.terminos}</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>
        
        {/* Link a Login */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>
            ¿Ya tienes una cuenta?{' '}
            <Text 
              style={styles.linkText}
              onPress={() => navigation.navigate('Login')}
            >
              Iniciar sesión
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 50 * SCALE,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40 * SCALE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 48,
    paddingHorizontal: 16,
    paddingRight: 48,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
  },
  termsSection: {
    marginBottom: 32,
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
    borderColor: '#e0e0e0',
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
  linkText: {
    color: '#968ce4',
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#968ce4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
});

export default RegisterScreen;