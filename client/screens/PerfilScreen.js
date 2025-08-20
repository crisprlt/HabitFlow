import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  User,
  Mail,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit3,
  Camera,
  Settings,
  Star,
  Award,
  Target,
  Calendar,
  BarChart3,
  Moon,
  Sun,
  Smartphone,
  X,
  Globe
} from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext'; // Importar el contexto de idioma
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

const SCALE = 1.2;
const { width } = Dimensions.get('window');

const PerfilScreen = ({ navigation }) => {
  const { themeMode, colors, setTheme } = useTheme();
  const { languageMode, currentLanguage, setLanguage, t } = useLanguage(); // Usar el contexto de idioma
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false); // Estado para modal de idioma
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({
    id_usuario: null,
    nombre: '',
    apellido: '',
    correo: '',
    fechaRegistro: '',
    habitosCompletados: 127,
    racha: 15
  });

  const [editData, setEditData] = useState({
    nombre: '',
    apellido: '',
    email: ''
  });

  // Cargar userId del SecureStore y luego los datos del usuario
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('user_id');
        console.log('✅ PerfilScreen - User ID obtenido del storage:', storedUserId);
        
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.log('❌ No se encontró user_id en SecureStore');
          Alert.alert(
            t('info'), // Usar traducción
            'Por favor, inicia sesión nuevamente',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Login')
              }
            ]
          );
        }
      } catch (error) {
        console.error('❌ Error obteniendo userId del storage:', error);
        Alert.alert('Error', 'Error al obtener información de usuario');
      }
    };

    getUserId();
  }, []);

  // Cargar datos del usuario cuando se obtenga el userId
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  // Función para cargar datos del usuario
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (!userId) {
        console.log('❌ No hay userId disponible');
        return;
      }

      console.log('🔄 Cargando datos del usuario con ID:', userId);

      const response = await api.get(`/api/users/profile/${parseInt(userId)}`)
      console.log('✅ Respuesta del servidor:', response.data);

      if (response.data.success) {
        const user = response.data.data.user;
        setUserData({
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          fechaRegistro: new Date().toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          habitosCompletados: userData.habitosCompletados,
          racha: userData.racha
        });

        setEditData({
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.correo
        });

        console.log('✅ Datos del usuario cargados correctamente');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'), // Usar traducción
      t('logoutConfirm'), // Usar traducción
      [
        {
          text: t('cancel'), // Usar traducción
          style: 'cancel'
        },
        {
          text: t('logout'), // Usar traducción
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpiar datos almacenados en SecureStore
              await SecureStore.deleteItemAsync('user_id');
              await SecureStore.deleteItemAsync('user_email');
              await SecureStore.deleteItemAsync('user_name');
              
              console.log('✅ Datos de usuario eliminados del SecureStore');
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
              });
            } catch (error) {
              console.error('❌ Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Validaciones
      if (!editData.nombre.trim() || !editData.apellido.trim() || !editData.email.trim()) {
        Alert.alert('Error', 'Todos los campos son obligatorios');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        Alert.alert('Error', 'Por favor ingresa un email válido');
        return;
      }

      const response = await api.put('/api/users/change-profile', {
        userId: parseInt(userId),
        name: editData.nombre.trim(),
        lastName: editData.apellido.trim(),
        email: editData.email.trim()
      });

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        
        setUserData(prev => ({
          ...prev,
          nombre: updatedUser.nombre,
          apellido: updatedUser.apellido,
          correo: updatedUser.correo
        }));

        // Actualizar SecureStore
        await SecureStore.setItemAsync('user_email', updatedUser.correo);
        await SecureStore.setItemAsync('user_name', `${updatedUser.nombre} ${updatedUser.apellido}`);

        setShowEditModal(false);
        Alert.alert(t('success'), t('profileUpdated')); // Usar traducción
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.correo
    });
    setShowEditModal(false);
  };

  const saveThemePreference = async (theme) => {
    await setTheme(theme);
    setShowThemeModal(false);
  };

  // Función para guardar la preferencia de idioma
  const saveLanguagePreference = async (language) => {
    try {
      await setLanguage(language);
      setShowLanguageModal(false);
      Alert.alert(t('success'), t('languageUpdated')); // Usar traducción
    } catch (error) {
      console.error('Error saving language preference:', error);
      Alert.alert('Error', 'No se pudo cambiar el idioma');
    }
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') return Smartphone;
    return themeMode === 'dark' ? Moon : Sun;
  };

  const getThemeText = () => {
    if (themeMode === 'system') return t('followSystem');
    return themeMode === 'dark' ? t('darkMode') : t('lightMode');
  };

  // Funciones para obtener el icono y texto del idioma
  const getLanguageIcon = () => {
    return Globe; // Siempre usamos el icono de globo
  };

  const getLanguageText = () => {
    if (languageMode === 'system') return t('followSystemLang');
    return languageMode === 'es' ? t('spanish') : t('english');
  };

  const StatCard = ({ icon: Icon, title, value, color = '#968ce4' }) => (
    <View style={[styles.statCard, { 
      borderLeftColor: color,
      backgroundColor: colors.card,
      shadowColor: colors.text,
    }]}>
      <View style={[styles.statIconContainer, { backgroundColor: colors.iconContainer }]}>
        <Icon size={20 * SCALE} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, showArrow = true, color = '#333', rightComponent }) => (
    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
          <Icon size={20 * SCALE} color={color} />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && (
        <ArrowLeft 
          size={16 * SCALE} 
          color={colors.textSecondary} 
          style={{ transform: [{ rotate: '180deg' }] }}
        />
      ))}
    </TouchableOpacity>
  );

  const ThemeOption = ({ icon: Icon, title, subtitle, isSelected, onPress }) => (
    <TouchableOpacity 
      style={[
        styles.themeOption, 
        { 
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.themeOptionLeft}>
        <View style={[styles.themeIcon, { backgroundColor: colors.surfaceVariant }]}>
          <Icon size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.themeTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.themeSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  // Componente para las opciones de idioma (similar a ThemeOption)
  const LanguageOption = ({ icon: Icon, title, subtitle, isSelected, onPress }) => (
    <TouchableOpacity 
      style={[
        styles.themeOption, 
        { 
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.themeOptionLeft}>
        <View style={[styles.themeIcon, { backgroundColor: colors.surfaceVariant }]}>
          <Icon size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.themeTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.themeSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
        >
          <ArrowLeft size={20 * SCALE} color="#968ce4" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('myProfile')}</Text>
        <TouchableOpacity 
          onPress={() => setShowEditModal(true)}
          style={[styles.editButton, { backgroundColor: colors.cardCompleted }]}
        >
          <Edit3 size={20 * SCALE} color="#968ce4" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.cardCompleted }]}>
              <User size={40 * SCALE} color="#968ce4" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16 * SCALE} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {userData.nombre} {userData.apellido}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {userData.correo}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('account')}</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={User}
              title={t('personalInfo')}
              subtitle={t('editProfileData')}
              onPress={() => setShowEditModal(true)}
              color="#968ce4"
            />
            <MenuItem
              icon={Shield}
              title={t('changePassword')}
              subtitle={t('updatePassword')}
              onPress={() => navigation.navigate('ChangePassword')}
              color="#4ecdc4"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('preferences')}</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={getThemeIcon()}
              title={t('appTheme')}
              subtitle={getThemeText()}
              onPress={() => setShowThemeModal(true)}
              color={themeMode === 'system' ? "#6c5ce7" : (themeMode === 'dark' ? "#ffd93d" : "#ff9f43")}
            />
            {/* Nuevo item para cambio de idioma */}
            <MenuItem
              icon={getLanguageIcon()}
              title={t('appLanguage')}
              subtitle={getLanguageText()}
              onPress={() => setShowLanguageModal(true)}
              color="#74b9ff"
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={LogOut}
              title={t('logout')}
              onPress={handleLogout}
              showArrow={false}
              color="#ff6b6b"
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de selección de tema */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectTheme')}</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <X size={24 * SCALE} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.themeModalBody}>
              <ThemeOption
                icon={Smartphone}
                title={t('followSystem')}
                subtitle={t('useDeviceTheme')}
                isSelected={themeMode === 'system'}
                onPress={() => saveThemePreference('system')}
              />
              
              <ThemeOption
                icon={Sun}
                title={t('lightMode')}
                subtitle={t('alwaysLight')}
                isSelected={themeMode === 'light'}
                onPress={() => saveThemePreference('light')}
              />
              
              <ThemeOption
                icon={Moon}
                title={t('darkMode')}
                subtitle={t('alwaysDark')}
                isSelected={themeMode === 'dark'}
                onPress={() => saveThemePreference('dark')}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de selección de idioma */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24 * SCALE} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.themeModalBody}>
              <LanguageOption
                icon={Smartphone}
                title={t('followSystemLang')}
                subtitle={t('useDeviceLanguage')}
                isSelected={languageMode === 'system'}
                onPress={() => saveLanguagePreference('system')}
              />
              
              <LanguageOption
                icon={Globe}
                title={t('spanish')}
                subtitle={t('alwaysSpanish')}
                isSelected={languageMode === 'es'}
                onPress={() => saveLanguagePreference('es')}
              />
              
              <LanguageOption
                icon={Globe}
                title={t('english')}
                subtitle={t('alwaysEnglish')}
                isSelected={languageMode === 'en'}
                onPress={() => saveLanguagePreference('en')}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('editProfile')}</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text style={[styles.cancelText, { color: colors.primary }]}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('name')}</Text>
              <TextInput
                style={[styles.modalInput, { 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.input,
                  color: colors.text
                }]}
                value={editData.nombre}
                onChangeText={(value) => setEditData(prev => ({ ...prev, nombre: value }))}
                placeholder={t('name')}
                placeholderTextColor={colors.placeholder}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('lastName')}</Text>
              <TextInput
                style={[styles.modalInput, { 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.input,
                  color: colors.text
                }]}
                value={editData.apellido}
                onChangeText={(value) => setEditData(prev => ({ ...prev, apellido: value }))}
                placeholder={t('lastName')}
                placeholderTextColor={colors.placeholder}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('email')}</Text>
              <TextInput
                style={[styles.modalInput, { 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.input,
                  color: colors.text
                }]}
                value={editData.email}
                onChangeText={(value) => setEditData(prev => ({ ...prev, email: value }))}
                placeholder={t('email')}
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { 
                  backgroundColor: colors.primary,
                  opacity: saving ? 0.7 : 1
                }
              ]} 
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 50 * SCALE,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    borderRadius: 40 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28 * SCALE,
    height: 28 * SCALE,
    borderRadius: 14 * SCALE,
    backgroundColor: '#968ce4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 12,
    color: '#968ce4',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 32,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20 * SCALE,
  },
  modalContent: {
    borderRadius: 16 * SCALE,
    padding: 20 * SCALE,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 * SCALE,
    paddingBottom: 16 * SCALE,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalBody: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  themeModalBody: {
    paddingVertical: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeSubtitle: {
    fontSize: 12,
  },
  selectedIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});

export default PerfilScreen;