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
  Switch,
  useColorScheme
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
  X
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCALE = 1.2;
const { width } = Dimensions.get('window');

const PerfilScreen = ({ navigation }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'system', 'light', 'dark'
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [userData, setUserData] = useState({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@email.com',
    fechaRegistro: '15 de Enero, 2024',
    habitosCompletados: 127,
    racha: 15,
    nivel: 'Principiante'
  });

  const [editData, setEditData] = useState({
    nombre: userData.nombre,
    apellido: userData.apellido,
    email: userData.email
  });

  // Determinar si está en modo oscuro
  const isDarkMode = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  // Cargar preferencia de tema al iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('perfilScreen_theme');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.log('Error cargando tema:', error);
    }
  };

  const saveThemePreference = async (theme) => {
    try {
      await AsyncStorage.setItem('perfilScreen_theme', theme);
      setThemeMode(theme);
      setShowThemeModal(false);
    } catch (error) {
      console.log('Error guardando tema:', error);
    }
  };

  // Definir colores según el tema
  const colors = {
    // Colores de fondo
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    surface: isDarkMode ? '#2d2d2d' : '#ffffff',
    surfaceVariant: isDarkMode ? '#3d3d3d' : '#f5f5f5',
    
    // Colores de texto
    text: isDarkMode ? '#ffffff' : '#333333',
    textSecondary: isDarkMode ? '#b0b0b0' : '#666666',
    textTertiary: isDarkMode ? '#808080' : '#999999',
    
    // Colores principales
    primary: '#968ce4',
    primaryVariant: isDarkMode ? '#7b6fd1' : '#968ce4',
    
    // Colores de tarjetas
    card: isDarkMode ? '#2d2d2d' : '#ffffff',
    cardCompleted: isDarkMode ? '#3d2d4d' : '#f3f0ff',
    
    // Colores de bordes
    border: isDarkMode ? '#404040' : '#f0f0f0',
    borderLight: isDarkMode ? '#404040' : '#e0e0e0',
    
    // Colores de inputs
    input: isDarkMode ? '#3d3d3d' : '#ffffff',
    inputBorder: isDarkMode ? '#555' : '#e0e0e0',
    placeholder: isDarkMode ? '#808080' : '#999999',
    
    // Colores específicos
    iconContainer: isDarkMode ? '#404040' : '#f8f9fa',
    
    // Colores de modal
    modalOverlay: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    modalBackground: isDarkMode ? '#2d2d2d' : '#ffffff',
    
    // Colores de estado
    success: '#4ecdc4',
    warning: '#ffd93d',
    error: '#ff6b6b',
    info: '#54a0ff',
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            // Aquí puedes agregar lógica para limpiar datos de sesión
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }]
            });
          }
        }
      ]
    );
  };

  const handleSaveProfile = () => {
    setUserData(prev => ({
      ...prev,
      nombre: editData.nombre,
      apellido: editData.apellido,
      email: editData.email
    }));
    setShowEditModal(false);
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') return Smartphone;
    return themeMode === 'dark' ? Moon : Sun;
  };

  const getThemeText = () => {
    if (themeMode === 'system') return 'Seguir sistema';
    return themeMode === 'dark' ? 'Modo oscuro' : 'Modo claro';
  };

  const StatCard = ({ icon: Icon, title, value, color = '#968ce4' }) => (
    <View style={[styles.statCard, { 
      borderLeftColor: color,
      backgroundColor: colors.card,
      shadowColor: isDarkMode ? '#000' : '#000',
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
        <Text style={[styles.title, { color: colors.text }]}>Mi Perfil</Text>
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
            <Text style={[styles.userName, { color: colors.text }]}>{userData.nombre} {userData.apellido}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userData.email}</Text>
            <Text style={styles.userLevel}>Nivel: {userData.nivel}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon={Target}
            title="Hábitos Completados"
            value={userData.habitosCompletados}
            color="#4ecdc4"
          />
          <StatCard 
            icon={Award}
            title="Racha Actual"
            value={`${userData.racha} días`}
            color="#ff6b6b"
          />
          <StatCard 
            icon={Calendar}
            title="Miembro desde"
            value={userData.fechaRegistro}
            color="#968ce4"
          />
          <StatCard 
            icon={BarChart3}
            title="Progreso General"
            value="78%"
            color="#45b7d1"
          />
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cuenta</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={User}
              title="Información Personal"
              subtitle="Edita tu perfil y datos"
              onPress={() => setShowEditModal(true)}
              color="#968ce4"
            />
            <MenuItem
              icon={Shield}
              title="Cambiar Contraseña"
              subtitle="Actualiza tu contraseña"
              onPress={() => navigation.navigate('ChangePassword')}
              color="#4ecdc4"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferencias</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={getThemeIcon()}
              title="Tema de la aplicación"
              subtitle={getThemeText()}
              onPress={() => setShowThemeModal(true)}
              color={themeMode === 'system' ? "#6c5ce7" : (themeMode === 'dark' ? "#ffd93d" : "#ff9f43")}
            />
            <MenuItem
              icon={Bell}
              title="Notificaciones"
              subtitle="Configura recordatorios"
              onPress={() => Alert.alert('Info', 'Funcionalidad próximamente')}
              color="#ff9f43"
            />
            <MenuItem
              icon={Settings}
              title="Configuración"
              subtitle="Ajustes de la aplicación"
              onPress={() => Alert.alert('Info', 'Funcionalidad próximamente')}
              color="#666"
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={LogOut}
              title="Cerrar Sesión"
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Tema</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <X size={24 * SCALE} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.themeModalBody}>
              <ThemeOption
                icon={Smartphone}
                title="Seguir sistema"
                subtitle="Usar el tema del dispositivo"
                isSelected={themeMode === 'system'}
                onPress={() => saveThemePreference('system')}
              />
              
              <ThemeOption
                icon={Sun}
                title="Modo claro"
                subtitle="Usar siempre tema claro"
                isSelected={themeMode === 'light'}
                onPress={() => saveThemePreference('light')}
              />
              
              <ThemeOption
                icon={Moon}
                title="Modo oscuro"
                subtitle="Usar siempre tema oscuro"
                isSelected={themeMode === 'dark'}
                onPress={() => saveThemePreference('dark')}
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre</Text>
              <TextInput
                style={[styles.modalInput, { 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.input,
                  color: colors.text
                }]}
                value={editData.nombre}
                onChangeText={(value) => setEditData(prev => ({ ...prev, nombre: value }))}
                placeholder="Nombre"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Apellido</Text>
              <TextInput
                style={[styles.modalInput, { 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.input,
                  color: colors.text
                }]}
                value={editData.apellido}
                onChangeText={(value) => setEditData(prev => ({ ...prev, apellido: value }))}
                placeholder="Apellido"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.modalInput, { 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.input,
                  color: colors.text
                }]}
                value={editData.email}
                onChangeText={(value) => setEditData(prev => ({ ...prev, email: value }))}
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  // Modal Styles
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
    color: '#968ce4',
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
    backgroundColor: '#968ce4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos del modal de tema
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