// services/BiometricAuth.js
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';

class BiometricAuthService {
  static async checkBiometricSupport() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      if (!hasHardware) {
        return {
          isSupported: false,
          reason: 'Este dispositivo no tiene hardware biométrico'
        };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!isEnrolled) {
        return {
          isSupported: false,
          reason: 'No hay datos biométricos registrados en este dispositivo'
        };
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return {
        isSupported: true,
        supportedTypes,
        hasHardware,
        isEnrolled
      };
    } catch (error) {
      console.error('Error verificando soporte biométrico:', error);
      return {
        isSupported: false,
        reason: 'Error al verificar capacidades biométricas'
      };
    }
  }

  static getBiometricTypeText(supportedTypes) {
    if (!supportedTypes || supportedTypes.length === 0) {
      return 'autenticación biométrica';
    }

    const types = [];
    
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      types.push('huella dactilar');
    }
    
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      types.push(Platform.OS === 'ios' ? 'Face ID' : 'reconocimiento facial');
    }
    
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      types.push('iris');
    }

    return types.length > 0 ? types.join(' o ') : 'autenticación biométrica';
  }

  static async isBiometricEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Error verificando si biométrico está habilitado:', error);
      return false;
    }
  }

  static async enableBiometric() {
    try {
      const support = await this.checkBiometricSupport();
      
      if (!support.isSupported) {
        throw new Error(support.reason);
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad para habilitar la autenticación biométrica',
        subtitle: 'Usa tu biometría para confirmar',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await SecureStore.setItemAsync('biometric_enabled', 'true');
        console.log('✅ Autenticación biométrica habilitada');
        return { success: true };
      } else {
        console.log('❌ Autenticación biométrica fallida:', result.error);
        return { 
          success: false, 
          reason: result.error || 'Autenticación fallida' 
        };
      }
    } catch (error) {
      console.error('Error habilitando autenticación biométrica:', error);
      return { 
        success: false, 
        reason: error.message || 'Error al habilitar autenticación biométrica' 
      };
    }
  }

  static async disableBiometric() {
    try {
      await SecureStore.deleteItemAsync('biometric_enabled');
      console.log('✅ Autenticación biométrica deshabilitada');
      return { success: true };
    } catch (error) {
      console.error('Error deshabilitando autenticación biométrica:', error);
      return { 
        success: false, 
        reason: 'Error al deshabilitar autenticación biométrica' 
      };
    }
  }

  static async authenticateWithBiometric() {
    try {
      const isEnabled = await this.isBiometricEnabled();
      
      if (!isEnabled) {
        return { 
          success: false, 
          reason: 'Autenticación biométrica no está habilitada' 
        };
      }

      const support = await this.checkBiometricSupport();
      
      if (!support.isSupported) {
        return { 
          success: false, 
          reason: support.reason 
        };
      }

      const biometricType = this.getBiometricTypeText(support.supportedTypes);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad',
        subtitle: `Usa tu ${biometricType} para continuar`,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });

      if (result.success) {
        console.log('✅ Autenticación biométrica exitosa');
        return { success: true };
      } else {
        console.log('❌ Autenticación biométrica fallida:', result.error);
        
        let reason = 'Autenticación fallida';
        
        if (result.error === 'UserCancel') {
          reason = 'Autenticación cancelada por el usuario';
        } else if (result.error === 'UserFallback') {
          reason = 'Usuario eligió usar contraseña';
        } else if (result.error === 'SystemCancel') {
          reason = 'Autenticación cancelada por el sistema';
        } else if (result.error === 'BiometricUnavailable') {
          reason = 'Autenticación biométrica no disponible';
        } else if (result.error === 'AuthenticationFailed') {
          reason = 'No se pudo verificar tu identidad';
        }
        
        return { 
          success: false, 
          reason,
          error: result.error 
        };
      }
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      return { 
        success: false, 
        reason: 'Error al realizar autenticación biométrica' 
      };
    }
  }

  static async checkUserHasStoredSession() {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      return !!userId;
    } catch (error) {
      console.error('Error verificando sesión almacenada:', error);
      return false;
    }
  }

  static async shouldShowBiometricPrompt() {
    try {
      const hasSession = await this.checkUserHasStoredSession();
      const isBiometricEnabled = await this.isBiometricEnabled();
      const support = await this.checkBiometricSupport();
      
      return hasSession && !isBiometricEnabled && support.isSupported;
    } catch (error) {
      console.error('Error verificando si mostrar prompt biométrico:', error);
      return false;
    }
  }

  static async promptToEnableBiometric() {
    try {
      const support = await this.checkBiometricSupport();
      
      if (!support.isSupported) {
        return { success: false, reason: support.reason };
      }

      const biometricType = this.getBiometricTypeText(support.supportedTypes);

      return new Promise((resolve) => {
        Alert.alert(
          'Habilitar Autenticación Biométrica',
          `¿Te gustaría usar tu ${biometricType} para iniciar sesión más rápidamente en el futuro?`,
          [
            {
              text: 'Ahora no',
              style: 'cancel',
              onPress: () => resolve({ success: false, cancelled: true })
            },
            {
              text: 'Habilitar',
              onPress: async () => {
                const result = await this.enableBiometric();
                resolve(result);
              }
            }
          ]
        );
      });
    } catch (error) {
      console.error('Error en prompt para habilitar biométrico:', error);
      return { 
        success: false, 
        reason: 'Error al mostrar prompt biométrico' 
      };
    }
  }

  static async quickBiometricLogin() {
    try {
      const hasSession = await this.checkUserHasStoredSession();
      if (!hasSession) {
        return { 
          success: false, 
          reason: 'No hay sesión guardada' 
        };
      }

      const isBiometricEnabled = await this.isBiometricEnabled();
      if (!isBiometricEnabled) {
        return { 
          success: false, 
          reason: 'Autenticación biométrica no está habilitada' 
        };
      }

      const authResult = await this.authenticateWithBiometric();
      
      if (authResult.success) {
        const userId = await SecureStore.getItemAsync('user_id');
        const githubUserData = await SecureStore.getItemAsync('github_user_data');
        
        let userData = null;
        if (githubUserData) {
          try {
            userData = JSON.parse(githubUserData);
          } catch (error) {
            console.warn('Error parseando datos de usuario de GitHub:', error);
          }
        }

        return {
          success: true,
          userId,
          userData
        };
      } else {
        return authResult;
      }
    } catch (error) {
      console.error('Error en login biométrico rápido:', error);
      return { 
        success: false, 
        reason: 'Error al realizar login biométrico' 
      };
    }
  }
}

export default BiometricAuthService;