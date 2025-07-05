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
import { Infinity } from 'lucide-react-native';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login attempt:', { email, password });
    // Aquí puedes agregar tu lógica de autenticación
  };

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

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          
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
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* <TouchableOpacity style={styles.loginButton} onPress={handleLogin}> */}
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Principal')}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.signUpText}>Regístrate</Text>
          </Text>
        </View>
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
    marginBottom: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#968ce4',
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
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
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  signUpText: {
    color: '#968ce4',
    fontWeight: '600',
  },
});

export default LoginScreen;