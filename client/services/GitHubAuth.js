// services/GitHubAuth.js - Servicio unificado completo con limpieza de sesión
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { makeRedirectUri } from 'expo-auth-session';
import { Github } from 'lucide-react-native';

// Configuración OAuth de GitHub
const GITHUB_CLIENT_ID = 'Ov23liy6c6sRX5zYCac7';
const GITHUB_CLIENT_SECRET = 'ca242adfa3d3a028ac6f173d3b9c5499dae2eed7';

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

// Servicio de autenticación con GitHub
class GitHubAuthService {
  // Limpiar caché del navegador y cookies
  static async clearBrowserSession() {
    try {
      // Esto limpia las cookies y datos del navegador
      await WebBrowser.clearWebBrowserDataAsync({
        dataTypes: WebBrowser.ClearDataType.ALL,
      });
      
      console.log('Sesión del navegador limpiada');
    } catch (error) {
      console.log('No se pudo limpiar la sesión del navegador:', error);
    }
  }

  // Intercambiar código por token de acceso
static async exchangeCodeForToken(code) {
  try {
    const tokenResponse = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'YourApp/1.0', // GitHub requiere User-Agent
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    // Verificar que la respuesta sea exitosa
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Error response from GitHub:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText
      });
      throw new Error(`GitHub token request failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    console.log('Token response from GitHub:', tokenData); // Para debugging
    
    // Verificar diferentes posibles respuestas de error
    if (tokenData.error) {
      throw new Error(`GitHub OAuth Error: ${tokenData.error} - ${tokenData.error_description || ''}`);
    }
    
    if (tokenData.access_token) {
      // Guardar token de forma segura
      await SecureStore.setItemAsync('github_access_token', tokenData.access_token);
      
      // También guardar otros datos útiles si están presentes
      if (tokenData.refresh_token) {
        await SecureStore.setItemAsync('github_refresh_token', tokenData.refresh_token);
      }
      
      return tokenData;
    } else {
      throw new Error('No se recibió token de acceso en la respuesta: ' + JSON.stringify(tokenData));
    }
  } catch (error) {
    console.error('Error intercambiando código por token:', error);
    
    // Si es un error de red, proporcionar más información
    if (error.name === 'TypeError' && error.message.includes('Network')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    
    throw error;
  }
}

  // Obtener información del usuario
  static async getUserInfo(accessToken) {
    try {
      const userResponse = await fetch(discovery.userInfoEndpoint, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Error obteniendo información del usuario');
      }

      const userData = await userResponse.json();
      
      // También obtener emails
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      let emails = [];
      if (emailResponse.ok) {
        emails = await emailResponse.json();
      }

      return {
        ...userData,
        emails: emails,
      };
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
      throw error;
    }
  }

  // Revocar token en GitHub (cerrar sesión completa)
  static async revokeToken(accessToken) {
    try {
      const response = await fetch(`https://api.github.com/applications/${GITHUB_CLIENT_ID}/token`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`)}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken
        })
      });

      if (response.ok) {
        console.log('Token revocado exitosamente en GitHub');
      } else {
        console.log('No se pudo revocar el token en GitHub:', response.status);
      }
    } catch (error) {
      console.error('Error revocando token:', error);
    }
  }

  // Obtener token guardado
  static async getStoredToken() {
    try {
      return await SecureStore.getItemAsync('github_access_token');
    } catch (error) {
      console.error('Error obteniendo token guardado:', error);
      return null;
    }
  }

  // Limpiar token guardado
  static async clearStoredToken() {
    try {
      await SecureStore.deleteItemAsync('github_access_token');
    } catch (error) {
      console.error('Error limpiando token:', error);
    }
  }

  // Verificar si el token es válido
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

  // Logout completo (limpiar todo)
  static async completeLogout() {
    try {
      const token = await this.getStoredToken();
      
      if (token) {
        // Revocar token en GitHub
        await this.revokeToken(token);
        // Limpiar token local
        await this.clearStoredToken();
      }
      
      // Limpiar sesión del navegador
      await this.clearBrowserSession();
      
      console.log('Logout completo realizado');
    } catch (error) {
      console.error('Error en logout completo:', error);
    }
  }
}

// Hook personalizado para GitHub OAuth
export const useGitHubAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      scopes: ['user:email', 'read:user'],
      redirectUri,
      // Agregar un state único para cada solicitud
      state: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      // Forzar prompt para nuevas autenticaciones
      additionalParameters: {
        allow_signup: 'true',
      },
    },
    discovery
  );

  // Manejar respuesta de autenticación
  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthResponse(response);
    } else if (response?.type === 'error') {
      setIsLoading(false);
      console.error('Error en OAuth:', response.error);
      Alert.alert(
        'Error de Autenticación', 
        `Error: ${response.error?.description || response.error?.message || 'Error desconocido'}`
      );
    } else if (response?.type === 'cancel') {
      setIsLoading(false);
      console.log('Autenticación cancelada por el usuario');
    }
  }, [response]);

  // Verificar token existente al iniciar
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const handleAuthResponse = async (authResponse) => {
    setIsLoading(true);
    try {
      const { code } = authResponse.params;
      
      if (!code) {
        throw new Error('No se recibió código de autorización');
      }
      
      // Intercambiar código por token
      const tokenData = await GitHubAuthService.exchangeCodeForToken(code);
      
      // Obtener información del usuario
      const userData = await GitHubAuthService.getUserInfo(tokenData.access_token);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      Alert.alert('Éxito', `¡Bienvenido, ${userData.name || userData.login}!`);
      
      return userData;
    } catch (error) {
      console.error('Error en autenticación:', error);
      Alert.alert('Error', `Error al procesar la autenticación: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingAuth = async () => {
    setIsLoading(true);
    try {
      const token = await GitHubAuthService.getStoredToken();
      
      if (token) {
        const isValid = await GitHubAuthService.validateToken(token);
        
        if (isValid) {
          const userData = await GitHubAuthService.getUserInfo(token);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          await GitHubAuthService.clearStoredToken();
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación existente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    if (!request) {
      Alert.alert('Error', 'GitHub OAuth no está disponible');
      return;
    }
    
    setIsLoading(true);
    try {
      // Limpiar sesión del navegador antes de iniciar nueva autenticación
      await GitHubAuthService.clearBrowserSession();
      
      // Esperar un poco para asegurar que la limpieza se complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Iniciar el flujo de autenticación
      await promptAsync({
        // Opciones adicionales para forzar nueva sesión
        showInRecents: false,
        // En iOS, esto fuerza un nuevo contexto del navegador
        preferEphemeralSession: true,
      });
    } catch (error) {
      console.error('Error iniciando autenticación:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Error al iniciar autenticación con GitHub');
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Logout completo
      await GitHubAuthService.completeLogout();
      
      setUser(null);
      setIsAuthenticated(false);
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      Alert.alert('Error', 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para forzar limpieza y nueva autenticación
  const forceNewAuth = async () => {
    try {
      setIsLoading(true);
      
      // Logout completo primero
      await GitHubAuthService.completeLogout();
      
      // Resetear estado
      setUser(null);
      setIsAuthenticated(false);
      
      // Esperar un poco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Iniciar nueva autenticación
      await signInWithGitHub();
    } catch (error) {
      console.error('Error en nueva autenticación forzada:', error);
      Alert.alert('Error', 'Error al reiniciar autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    user,
    isAuthenticated,
    signInWithGitHub,
    signOut,
    forceNewAuth,
    request,
  };
};

// Componente de botón para GitHub
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
      
      {/* Botón adicional para forzar nueva sesión (útil para debugging) */}
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

// Exportar el servicio también para uso directo si es necesario
export default GitHubAuthService;