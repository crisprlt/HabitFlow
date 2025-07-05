import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Dimensions
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
  BarChart3
} from 'lucide-react-native';

const SCALE = 1.2;
const { width } = Dimensions.get('window');

const PerfilScreen = ({ navigation }) => {
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

  const StatCard = ({ icon: Icon, title, value, color = '#968ce4' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Icon size={20 * SCALE} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, showArrow = true, color = '#333' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
          <Icon size={20 * SCALE} color={color} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <ArrowLeft 
          size={16 * SCALE} 
          color="#999" 
          style={{ transform: [{ rotate: '180deg' }] }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <ArrowLeft size={20 * SCALE} color="#968ce4" />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Perfil</Text>
        <TouchableOpacity 
          onPress={() => setShowEditModal(true)}
          style={styles.editButton}
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
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40 * SCALE} color="#968ce4" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16 * SCALE} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.nombre} {userData.apellido}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
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
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon={User}
              title="Información Personal"
              subtitle="Edita tu perfil y datos"
              onPress={() => setShowEditModal(true)}
              color="#968ce4"
            />
            <MenuItem
              icon={Mail}
              title="Cambiar Email"
              subtitle={userData.email}
              onPress={() => Alert.alert('Info', 'Funcionalidad próximamente')}
              color="#45b7d1"
            />
            <MenuItem
              icon={Shield}
              title="Cambiar Contraseña"
              subtitle="Actualiza tu contraseña"
              onPress={() => Alert.alert('Info', 'Funcionalidad próximamente')}
              color="#4ecdc4"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.menuContainer}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon={HelpCircle}
              title="Ayuda y Soporte"
              subtitle="Preguntas frecuentes"
              onPress={() => Alert.alert('Info', 'Funcionalidad próximamente')}
              color="#96ceb4"
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
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

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.nombre}
                onChangeText={(value) => setEditData(prev => ({ ...prev, nombre: value }))}
                placeholder="Nombre"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Apellido</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.apellido}
                onChangeText={(value) => setEditData(prev => ({ ...prev, apellido: value }))}
                placeholder="Apellido"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.email}
                onChangeText={(value) => setEditData(prev => ({ ...prev, email: value }))}
                placeholder="Email"
                placeholderTextColor="#999"
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
  editButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: '#f3f0ff',
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
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    borderRadius: 40 * SCALE,
    backgroundColor: '#f3f0ff',
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
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
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
    backgroundColor: '#f8f9fa',
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
    color: '#333',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
});

export default PerfilScreen;