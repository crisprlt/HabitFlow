// services/GitHubAuth.js - FIXED NAVIGATION ISSUE
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Github } from 'lucide-react-native';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_URL;
console.log('API_BASE_URL:', API_BASE_URL);

// Configuración OAuth de GitHub
const GITHUB_CLIENT_ID = 'Ov23liy6c6sRX5zYCac7';

// Configurar el redirect URI para Expo Go
const redirectUri = 'exp://192.168.1.4:8081'
console.log('Redirect URI:', redirectUri);

// Configuración de endpoints
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  userInfoEndpoint: 'https://api.github.com/user',
  revocationEndpoint: 'https://github.com/settings/connections/applications/' + GITHUB_CLIENT_ID,
};

WebBrowser.maybeCompleteAuthSession();

// Servicio de autenticación con GitHub (sin cambios)
class GitHubAuthService {
  static async clearBrowserSession() {
    try {
      await WebBrowser.clearWebBrowserDataAsync({
        dataTypes: WebBrowser.ClearDataType.ALL,
      });
      console.log('Sesión del navegador limpiada');
    } catch (error) {
      console.log('No se pudo limpiar la sesión del navegador:', error);
    }
  }

  static async exchangeCodeForToken(code, codeVerifier) {
    try {
      console.log('🔍 PKCE DEBUG - Intercambiando código por token...');
      console.log('🔍 PKCE DEBUG - Code presente:', !!code);
      console.log('🔍 PKCE DEBUG - CodeVerifier presente:', !!codeVerifier);
      console.log('🔍 PKCE DEBUG - CodeVerifier length:', codeVerifier?.length);
      
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL no está configurado');
      }

      if (!codeVerifier) {
        throw new Error('Code verifier es requerido para PKCE');
      }

      if (codeVerifier.length < 43 || codeVerifier.length > 128) {
        console.warn('⚠️ Code verifier length fuera del rango esperado:', codeVerifier.length);
        console.warn('⚠️ RFC 7636 requiere entre 43-128 caracteres');
      }

      const url = `${API_BASE_URL}/api/github/auth`;
      const requestBody = {
        code: code,
        code_verifier: codeVerifier,
        debug_info: {
          code_verifier_length: codeVerifier.length,
          timestamp: Date.now(),
        }
      };

      console.log('🔍 PKCE DEBUG - URL del endpoint:', url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('✅ Respuesta recibida - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from backend:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.log('No se pudo parsear el error como JSON');
        }
        
        if (errorData.error === 'invalid_grant' || response.status === 400) {
          throw new Error(
            `Error PKCE: ${errorData.error_description || 'Code verifier inválido'}. Intenta cerrar la app completamente y volver a intentar.`
          );
        }
        
        throw new Error(
          `Backend auth request failed: ${response.status} - ${
            errorData.error || errorData.message || errorText || response.statusText
          }`
        );
      }

      const responseData = await response.json();
      console.log('✅ Response from backend:', responseData);
      
      if (!responseData.success) {
        throw new Error(`Backend Error: ${responseData.error || 'Error desconocido'}`);
      }
      
      if (!responseData.access_token) {
        throw new Error('No se recibió access_token en la respuesta del backend');
      }

      // Guardar tokens de forma segura
      await SecureStore.setItemAsync('github_access_token', responseData.access_token);
      
      if (responseData.token) {
        await SecureStore.setItemAsync('app_jwt_token', responseData.token);
      }
      
      if (responseData.user) {
        await SecureStore.setItemAsync('github_user_data', JSON.stringify(responseData.user));
      }
      
      return {
        access_token: responseData.access_token,
        token: responseData.token,
        user: responseData.user,
        ...responseData
      };
      
    } catch (error) {
      console.error('❌ Error completo intercambiando código por token:', error);
      
      if (error.name === 'TypeError') {
        if (error.message.includes('fetch')) {
          throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet y que el backend esté funcionando.');
        }
        if (error.message.includes('Network request failed')) {
          throw new Error('Error de red: No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.');
        }
      }
      
      if (error.message.includes('API_BASE_URL')) {
        throw new Error('Configuración de API incompleta. Verifica que API_BASE_URL esté configurado.');
      }
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Timeout: El servidor tardó demasiado en responder. Verifica que el backend esté funcionando.');
      }
      
      throw error;
    }
  }

  // ... resto de métodos sin cambios (getUserInfo, revokeToken, etc.)
  static async getUserInfo(accessToken) {
    try {
      const storedUserData = await SecureStore.getItemAsync('github_user_data');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          console.log('Usando datos de usuario guardados del backend');
          return userData;
        } catch (parseError) {
          console.warn('Error parseando datos de usuario guardados:', parseError);
        }
      }

      console.log('Obteniendo información del usuario de GitHub API...');
      const userResponse = await fetch(discovery.userInfoEndpoint, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/json',
          'User-Agent': 'YourApp/1.0',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Error obteniendo información del usuario de GitHub');
      }

      const userData = await userResponse.json();
      
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/json',
          'User-Agent': 'YourApp/1.0',
        },
      });

      let emails = [];
      if (emailResponse.ok) {
        emails = await emailResponse.json();
      }

      const fullUserData = {
        ...userData,
        emails: emails,
      };

      await SecureStore.setItemAsync('github_user_data', JSON.stringify(fullUserData));

      return fullUserData;
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
      throw error;
    }
  }

  static async revokeToken(accessToken) {
    try {
      console.log('Revocando token...');
      
      if (API_BASE_URL) {
        try {
          await fetch(`${API_BASE_URL}/api/github/revoke`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await this.getStoredAppToken()}`,
            },
            body: JSON.stringify({
              access_token: accessToken
            })
          });
          console.log('Token revocado a través del backend');
        } catch (error) {
          console.warn('No se pudo revocar el token a través del backend:', error);
        }
      }
      
      console.log('Limpiando tokens locales');
      
    } catch (error) {
      console.error('Error revocando token:', error);
    }
  }

  static async getStoredToken() {
    try {
      return await SecureStore.getItemAsync('github_access_token');
    } catch (error) {
      console.error('Error obteniendo token guardado:', error);
      return null;
    }
  }

  static async getStoredAppToken() {
    try {
      return await SecureStore.getItemAsync('app_jwt_token');
    } catch (error) {
      console.error('Error obteniendo JWT token de la app:', error);
      return null;
    }
  }

  static async clearStoredToken() {
    try {
      await SecureStore.deleteItemAsync('github_access_token');
      await SecureStore.deleteItemAsync('app_jwt_token');
      await SecureStore.deleteItemAsync('github_user_data');
    } catch (error) {
      console.error('Error limpiando tokens:', error);
    }
  }

  static async validateToken(token) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error validando token:', error);
      return false;
    }
  }

  static async checkBackendStatus() {
    try {
      console.log('🔍 Verificando estado del backend...');
      
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL no está configurado');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/api/github/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend status check failed: ${response.status} - ${response.statusText}`);
      }

      const status = await response.json();
      console.log('✅ Backend GitHub status:', status);
      
      return status;
    } catch (error) {
      console.error('❌ Error checking backend status:', error);
      
      if (error.name === 'AbortError') {
        console.error('Backend status check timeout');
      }
      
      throw error;
    }
  }

  static async testBackendConnectivity() {
    try {
      console.log('🌐 Probando conectividad básica del backend...');
      
      if (!API_BASE_URL) {
        console.error('❌ API_BASE_URL no configurado:', API_BASE_URL);
        return false;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log('✅ Conectividad básica OK - Status:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Error de conectividad básica:', error.message);
      return false;
    }
  }

  static async completeLogout() {
    try {
      const token = await this.getStoredToken();
      
      if (token) {
        await this.revokeToken(token);
        await this.clearStoredToken();
      }
      
      await this.clearBrowserSession();
      
      console.log('Logout completo realizado');
    } catch (error) {
      console.error('Error en logout completo:', error);
    }
  }
}

// ✅ HOOK CORREGIDO - Simplificado y arreglado
export const useGitHubAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shouldCheckExistingAuth, setShouldCheckExistingAuth] = useState(false);
  
  // ✅ NUEVO: Callback para manejar éxito de autenticación
  const [onAuthSuccess, setOnAuthSuccess] = useState(null);

  const authConfig = React.useMemo(() => ({
    clientId: GITHUB_CLIENT_ID,
    scopes: ['user:email', 'read:user'],
    redirectUri,
    additionalParameters: {
      allow_signup: 'true',
    },
    usePKCE: true,
    codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
  }), []);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    authConfig,
    discovery
  );

  // Logging PKCE info (solo una vez)
  useEffect(() => {
    if (request?.codeVerifier && request?.codeChallenge) {
      console.log('🔍 PKCE REQUEST DEBUG:');
      console.log('🔍 codeVerifier length:', request?.codeVerifier?.length);
      console.log('🔍 codeChallenge length:', request?.codeChallenge?.length);
    }
  }, [request?.codeVerifier]);

  // ✅ MANEJO SIMPLIFICADO DE RESPUESTA DE AUTH
  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthResponse(response);
    } else if (response?.type === 'error') {
      setIsLoading(false);
      console.error('❌ Error en OAuth:', response.error);
      Alert.alert(
        'Error de Autenticación', 
        `Error: ${response.error?.description || response.error?.message || response.error || 'Error desconocido'}`
      );
    } else if (response?.type === 'cancel') {
      setIsLoading(false);
      console.log('Autenticación cancelada por el usuario');
    }
  }, [response]);

  useEffect(() => {
    if (shouldCheckExistingAuth) {
      checkExistingAuth();
      setShouldCheckExistingAuth(false);
    }
  }, [shouldCheckExistingAuth]);

  // ✅ FUNCIÓN SIMPLIFICADA PARA MANEJAR RESPUESTA
  const handleAuthResponse = async (authResponse) => {
    setIsLoading(true);
    try {
      console.log('🔍 HANDLING AUTH RESPONSE...');
      
      const { code } = authResponse.params;
      
      if (!code) {
        throw new Error('No se recibió código de autorización');
      }
      
      const codeVerifier = request?.codeVerifier;
      
      if (!codeVerifier) {
        throw new Error('❌ No se pudo obtener el code_verifier. Cierra la app completamente y vuelve a intentar.');
      }
      
      console.log('✅ Procesando código de autorización con backend');
      
      // Intercambiar código por token
      const authData = await GitHubAuthService.exchangeCodeForToken(code, codeVerifier);
      
      console.log('✅ Autenticación exitosa, procesando usuario...');
      
      let userData;
      if (authData.user) {
        userData = authData.user;
      } else {
        userData = await GitHubAuthService.getUserInfo(authData.access_token);
      }
      
      // ✅ GUARDAR ID DE USUARIO INMEDIATAMENTE
      if (userData.id_usuario) {
        await SecureStore.setItemAsync('user_id', userData.id_usuario.toString());
        console.log('✅ User ID guardado:', userData.id_usuario);
      }
      
      // Actualizar estado
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('✅ Estado actualizado - Usuario autenticado:', userData.login || userData.name);
      
      // ✅ EJECUTAR CALLBACK DE ÉXITO INMEDIATAMENTE
      if (onAuthSuccess && typeof onAuthSuccess === 'function') {
        console.log('✅ Ejecutando callback de éxito...');
        onAuthSuccess(userData);
      }
      
      return authData;
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      Alert.alert('Error', `Error al procesar la autenticación: ${error.message}`);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingAuth = async () => {
    console.log('Verificando autenticación existente...');
    setIsLoading(true);
    try {
      const githubToken = await GitHubAuthService.getStoredToken();
      
      if (githubToken) {
        console.log('Tokens encontrados, validando...');
        
        const isValid = await GitHubAuthService.validateToken(githubToken);
        
        if (isValid) {
          console.log('Token de GitHub válido, obteniendo datos del usuario...');
          const userData = await GitHubAuthService.getUserInfo(githubToken);
          
          if (userData && (userData.id || userData.login)) {
            setUser(userData);
            setIsAuthenticated(true);
            console.log('Autenticación existente restaurada para:', userData.login || userData.name);
          } else {
            console.log('Datos de usuario inválidos, limpiando tokens');
            await GitHubAuthService.clearStoredToken();
          }
        } else {
          console.log('Token de GitHub inválido, limpiando...');
          await GitHubAuthService.clearStoredToken();
        }
      } else {
        console.log('No se encontraron tokens almacenados');
      }
    } catch (error) {
      console.error('Error verificando autenticación existente:', error);
      await GitHubAuthService.clearStoredToken();
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNCIÓN PRINCIPAL CORREGIDA
  const signInWithGitHub = async (successCallback) => {
    if (!request) {
      Alert.alert('Error', 'GitHub OAuth no está disponible. Reinicia la app.');
      return;
    }
    
    console.log('🚀 Iniciando autenticación con GitHub CON PKCE...');
    
    // ✅ ESTABLECER CALLBACK DE ÉXITO
    setOnAuthSuccess(() => successCallback);
    
    setIsLoading(true);
    
    try {
      console.log('Probando conectividad del backend...');
      const isBackendReachable = await GitHubAuthService.testBackendConnectivity();
      
      if (!isBackendReachable) {
        throw new Error('No se puede conectar al backend. Verifica que el servidor esté ejecutándose.');
      }
      
      // Limpieza antes de nueva auth
      await GitHubAuthService.clearBrowserSession();
      await GitHubAuthService.clearStoredToken();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔥 Iniciando prompt OAuth...');
      await promptAsync({
        showInRecents: false,
        preferEphemeralSession: true,
      });
      
    } catch (error) {
      console.error('❌ Error iniciando autenticación:', error);
      setIsLoading(false);
      Alert.alert('Error', `Error al iniciar autenticación con GitHub: ${error.message}`);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      await GitHubAuthService.completeLogout();
      
      setUser(null);
      setIsAuthenticated(false);
      setOnAuthSuccess(null); // ✅ Limpiar callback
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      Alert.alert('Error', 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const forceNewAuth = async (successCallback) => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Forzando nueva autenticación...');
      
      await GitHubAuthService.completeLogout();
      
      setUser(null);
      setIsAuthenticated(false);
      setOnAuthSuccess(null); // ✅ Limpiar callback anterior
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await signInWithGitHub(successCallback); // ✅ Pasar callback
    } catch (error) {
      console.error('Error en nueva autenticación forzada:', error);
      Alert.alert('Error', 'Error al reiniciar autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const checkForExistingAuth = () => {
    setShouldCheckExistingAuth(true);
  };

  return {
    isLoading,
    user,
    isAuthenticated,
    signInWithGitHub, // ✅ Ahora acepta callback
    signOut,
    forceNewAuth, // ✅ Ahora acepta callback
    checkForExistingAuth,
    request,
  };
};

// Componente de botón para GitHub (sin cambios)
export const GitHubButton = ({ onPress, onForceNewAuth, isLoading = false, colors }) => {
  return (
    <View>
      <TouchableOpacity
        style={[styles.githubButton, { 
          backgroundColor: colors?.github || '#24292e',
          opacity: isLoading ? 0.7 : 1 
        }]}
        onPress={onPress}
        disabled={isLoading}
      >
        <View style={styles.githubButtonContent}>
          <Github size={20} color="#FFFFFF" />
          <Text style={styles.githubButtonText}>
            {isLoading ? 'Conectando...' : 'Continuar con GitHub'}
          </Text>
        </View>
      </TouchableOpacity>
      
      {__DEV__ && onForceNewAuth && (
        <TouchableOpacity
          style={[styles.debugButton, { 
            borderColor: colors?.github || '#24292e',
            opacity: isLoading ? 0.7 : 1 
          }]}
          onPress={onForceNewAuth}
          disabled={isLoading}
        >
          <Text style={[styles.debugButtonText, { color: colors?.github || '#24292e' }]}>
            Nueva Sesión (Debug)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  githubButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  githubButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  githubButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default GitHubAuthService;