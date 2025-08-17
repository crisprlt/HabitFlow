// hooks/useGitHubLogin.js - Hook personalizado para autenticación con GitHub
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useGitHubAuth } from '../services/GitHubAuth';
import api from '../services/api';

export const useGitHubLogin = (navigation) => {
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  
  const { 
    isLoading: isGitHubAuthLoading, 
    user: gitHubUser, 
    isAuthenticated, 
    signInWithGitHub,
    forceNewAuth,
    request: gitHubRequest 
  } = useGitHubAuth();

  // Combinar estados de carga
  const combinedLoading = isGitHubLoading || isGitHubAuthLoading;

  // Efecto para manejar autenticación exitosa con GitHub
  useEffect(() => {
    if (isAuthenticated && gitHubUser && !isGitHubLoading) {
      handleGitHubAuthSuccess(gitHubUser);
    }
  }, [isAuthenticated, gitHubUser, isGitHubLoading]);

  const handleGitHubAuthSuccess = async (userData) => {
    setIsGitHubLoading(true);
    
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
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (!gitHubRequest) {
      Alert.alert('Error', 'GitHub OAuth no está configurado correctamente');
      return;
    }

    try {
      setIsGitHubLoading(true);
      await signInWithGitHub();
      // No seteamos setIsGitHubLoading(false) aquí porque lo maneja handleGitHubAuthSuccess
    } catch (error) {
      console.error('Error iniciando sesión con GitHub:', error);
      Alert.alert('Error', 'Error al iniciar sesión con GitHub');
      setIsGitHubLoading(false);
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
              setIsGitHubLoading(true);
              await forceNewAuth();
              // No seteamos setIsGitHubLoading(false) aquí porque lo maneja el flujo normal
            } catch (error) {
              console.error('Error en nueva autenticación:', error);
              Alert.alert('Error', 'Error al iniciar nueva sesión');
              setIsGitHubLoading(false);
            }
          }
        }
      ]
    );
  };

  return {
    isGitHubLoading: combinedLoading,
    handleGitHubLogin,
    handleForceNewGitHubAuth
  };
};