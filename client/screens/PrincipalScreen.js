import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import {
  Plus,
  Calendar,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Edit3,
  X,
  User,
  Check,
  Copy,
  // Iconos dinámicos para hábitos
  Droplets,
  Activity,
  BookOpen,
  Brain,
  PenTool,
  Heart,
  Coffee,
  Moon,
  Sun,
  Utensils,
  Music,
  Camera,
  Smartphone,
  Home,
  Car,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Pill,
  Star,
  Zap,
  TrendingUp,
  Smile,
  ShoppingCart,
  Book,
  Palette,
  Gamepad2,
  Headphones,
  Monitor,
  TreePine,
  Plane,
  DollarSign,
  MessageCircle
} from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store'; // ✅ Agregar import

const SCALE = 1.2;

// Mapeo de iconos para renderizar dinámicamente
const iconMap = {
  'Ejercicio': Activity,
  'Cardio': Heart,
  'Fuerza': Dumbbell,
  'Agua': Droplets,
  'Medicina': Pill,
  'Sueño': Moon,
  'Mental': Brain,
  'Progreso': TrendingUp,
  'Lectura': BookOpen,
  'Estudio': GraduationCap,
  'Escritura': PenTool,
  'Libros': Book,
  'Cursos': Monitor,
  'Aprendizaje': Brain,
  'Trabajo': Briefcase,
  'Objetivos': Target,
  'Tiempo': Clock,
  'Finanzas': DollarSign,
  'Casa': Home,
  'Cocina': Utensils,
  'Café': Coffee,
  'Compras': ShoppingCart,
  'Transporte': Car,
  'Mañana': Sun,
  'Felicidad': Smile,
  'Música': Music,
  'Fotografía': Camera,
  'Juegos': Gamepad2,
  'Social': MessageCircle,
  'Podcast': Headphones,
  'Arte': Palette,
  'Favorito': Star,
  'Energía': Zap,
  'Naturaleza': TreePine,
  'Viaje': Plane,
  'Digital': Smartphone
};

const PrincipalScreen = ({ navigation }) => {
  const { colors } = useTheme();

  // Estados principales
  const [habits, setHabits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({
    total_habitos: 0,
    habitos_completados: 0,
    porcentaje_completado: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [userId, setUserId] = useState(null); // ✅ Estado para userId

  // Estados para modal de edición de notas
  const [editingNote, setEditingNote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNoteText, setEditNoteText] = useState('');

  // ✅ Obtener userId del SecureStore al cargar el componente
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('user_id');
        console.log('✅ PrincipalScreen - User ID obtenido del storage:', storedUserId);
        
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.log('❌ No se encontró user_id en SecureStore');
          Alert.alert(
            'Sesión expirada',
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

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    if (!userId) {
      console.log('No hay userId disponible para cargar datos');
      return;
    }

    try {
      console.log('🔄 Cargando datos del dashboard para userId:', userId);
      const response = await api.get(`/api/tracking/dashboard/${userId}`);
      
      if (response.data.success) {
        const { habits: habitsData, notes: notesData, stats: statsData } = response.data.data;
        
        console.log('✅ Datos cargados:', {
          habits: habitsData?.length || 0,
          notes: notesData?.length || 0,
          stats: statsData
        });
        
        setHabits(habitsData || []);
        setNotes(notesData || []);
        setStats(statsData || { total_habitos: 0, habitos_completados: 0, porcentaje_completado: 0 });
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      
      // Si el error es de autenticación, redirigir al login
      if (error.response?.status === 401) {
        Alert.alert(
          'Sesión expirada',
          'Por favor, inicia sesión nuevamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Cargar datos cuando se obtenga el userId y cuando la pantalla recibe foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 PrincipalScreen recibió foco - userId:', userId);
      if (userId) {
        loadDashboardData();
      }
    }, [userId])
  );

  // Función para refrescar datos
  const onRefresh = () => {
    if (!userId) return;
    setRefreshing(true);
    loadDashboardData();
  };

  // Marcar/desmarcar hábito
  const toggleHabit = async (habit) => {
    if (!userId) return;

    try {
      const newCompleted = !habit.completed;
      
      // Actualizar UI optimísticamente
      setHabits(prev => prev.map(h => 
        h.id_habito === habit.id_habito 
          ? { ...h, completed: newCompleted, current: newCompleted ? h.target : 0 }
          : h
      ));

      // Actualizar en el backend
      const response = await api.post('/api/tracking/habits/toggle', {
        habitId: habit.id_habito,
        userId: userId,
        completed: newCompleted,
        valor: newCompleted ? habit.target : 0
      });

      if (response.data.success) {
        // Recargar datos completos para asegurar sincronización
        await loadDashboardData();
        console.log('Hábito actualizado correctamente');
      } else {
        throw new Error('Respuesta no exitosa del servidor');
      }
    } catch (error) {
      console.error('Error actualizando hábito:', error);
      
      // Revertir cambio optimista
      setHabits(prev => prev.map(h => 
        h.id_habito === habit.id_habito 
          ? { ...h, completed: habit.completed, current: habit.current }
          : h
      ));
      
      Alert.alert('Error', 'No se pudo actualizar el hábito. Intenta de nuevo.');
    }
  };

  // Agregar nueva nota
  const addNote = async () => {
    if (!newNote.trim() || !userId) return;

    try {
      const response = await api.post('/api/tracking/notes', {
        userId: userId,
        texto: newNote.trim()
      });

      if (response.data.success) {
        setNotes(prev => [response.data.data.note, ...prev]);
        setNewNote('');
        Alert.alert('¡Éxito!', 'Nota agregada correctamente');
      }
    } catch (error) {
      console.error('Error creando nota:', error);
      Alert.alert('Error', 'No se pudo crear la nota');
    }
  };

  // Función para copiar nota al portapapeles
  const copyNote = async (note) => {
    try {
      await Clipboard.setString(note.texto);
      Alert.alert('¡Copiado!', 'La nota ha sido copiada al portapapeles');
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar la nota');
    }
  };

  // Abrir modal de edición
  const openEditModal = (note) => {
    setEditingNote(note);
    setEditNoteText(note.texto);
    setShowEditModal(true);
  };

  // Guardar nota editada
  const saveEditedNote = async () => {
    if (!editNoteText.trim() || !userId) {
      Alert.alert('Error', 'La nota no puede estar vacía');
      return;
    }

    try {
      const response = await api.put(`/api/tracking/notes/${editingNote.id_nota}`, {
        texto: editNoteText.trim(),
        userId: userId
      });

      if (response.data.success) {
        setNotes(prev => prev.map(note => 
          note.id_nota === editingNote.id_nota 
            ? { ...note, texto: editNoteText.trim(), fecha_modificacion: new Date().toISOString() }
            : note
        ));
        
        setShowEditModal(false);
        setEditingNote(null);
        setEditNoteText('');
        Alert.alert('¡Guardado!', 'La nota ha sido actualizada');
      }
    } catch (error) {
      console.error('Error actualizando nota:', error);
      Alert.alert('Error', 'No se pudo actualizar la nota');
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingNote(null);
    setEditNoteText('');
  };

  // Función para obtener el icono correcto
  const getHabitIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Target;
    return IconComponent;
  };

  // Formatear fecha
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // ✅ Mostrar loading mientras se obtiene el userId o se cargan los datos
  if (isLoading || !userId) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {!userId ? 'Verificando sesión...' : 'Cargando hábitos...'}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.primary }]}>HabitFlow</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{today}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddHabit', { 
              onHabitCreated: loadDashboardData 
            })}
          >
            <Plus size={20 * SCALE} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.cardCompleted }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Progreso de Hoy</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>
              {Math.round(stats.porcentaje_completado || 0)}%
            </Text>
          </View>
          <View style={[styles.progressBarBackground, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[
              styles.progressBarFill, 
              { 
                backgroundColor: colors.primary, 
                width: `${Math.round(stats.porcentaje_completado || 0)}%` 
              }
            ]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {stats.habitos_completados || 0} de {stats.total_habitos || 0} hábitos completados
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon={Target} label="Total" value={`${stats.total_habitos || 0}`} colors={colors} />
          <StatCard icon={Calendar} label="Completados" value={`${stats.habitos_completados || 0}`} colors={colors} />
        </View>

        {/* Habits */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hábitos</Text>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No tienes hábitos aún
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
              Agrega tu primer hábito para comenzar
            </Text>
          </View>
        ) : (
          habits.map(habit => {
            const Icon = getHabitIcon(habit.icono);

            return (
              <View
                key={habit.id_habito}
                style={[
                  styles.habitCard,
                  { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  },
                  habit.completed && { 
                    backgroundColor: colors.cardCompleted, 
                    borderColor: colors.border 
                  }
                ]}
              >
                <View style={styles.habitHeader}>
                  <TouchableOpacity onPress={() => toggleHabit(habit)}>
                    {habit.completed ? (
                      <CheckCircle2 size={24 * SCALE} color={colors.primary} />
                    ) : (
                      <Circle size={24 * SCALE} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.habitContent}>
                    <View style={styles.habitTopRow}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
                        <Icon size={16 * SCALE} color={habit.completed ? colors.primary : colors.textSecondary} />
                      </View>
                      <Text style={[
                        styles.habitName,
                        { color: colors.text },
                        habit.completed && { color: colors.textSecondary, textDecorationLine: 'line-through' }
                      ]}>
                        {habit.nombre}
                      </Text>
                    </View>

                    <View style={styles.habitDetails}>
                      <Text style={[styles.category, { 
                        color: colors.textSecondary, 
                        backgroundColor: colors.surfaceVariant 
                      }]}>
                        {habit.categoria}
                      </Text>
                      <View style={styles.streakRow}>
                        <Flame size={12 * SCALE} color={colors.warning} />
                        <Text style={[styles.streakText, { color: colors.text }]}>{habit.streak || 0}</Text>
                      </View>
                      {habit.target > 1 && (
                        <Text style={[styles.progressNumber, { color: colors.textSecondary }]}>
                          {habit.current}/{habit.target} {habit.target_unit}
                        </Text>
                      )}
                      <TouchableOpacity 
                        style={styles.editHabitButton}
                        onPress={() => navigation.navigate('AddHabit', { 
                          habitToEdit: habit,
                          onHabitUpdated: loadDashboardData 
                        })}
                      >
                        <Edit3 size={14 * SCALE} color={colors.primary} />
                      </TouchableOpacity>
                    </View>

                    {/* ❌ ELIMINADO: Barra de progreso para hábitos con target > 1 */}
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Sección de Notas */}
        <View style={styles.notesSection}>
          <View style={styles.notesSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notas</Text>
            <PenTool size={18 * SCALE} color={colors.primary} />
          </View>
          
          {/* Input para nueva nota */}
          <View style={[styles.newNoteContainer, { backgroundColor: colors.surfaceVariant }]}>
            <TextInput
              style={[styles.noteInput, { 
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Escribe una nota..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={2}
            />
            <TouchableOpacity 
              style={[
                styles.addNoteButton, 
                { backgroundColor: colors.primary },
                !newNote.trim() && { backgroundColor: colors.textTertiary }
              ]}
              onPress={addNote}
              disabled={!newNote.trim()}
            >
              <Plus size={20 * SCALE} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Lista de notas */}
          <View style={styles.notesContainer}>
            {notes.length === 0 ? (
              <View style={styles.emptyNotesContainer}>
                <Text style={[styles.emptyNotesText, { color: colors.textSecondary }]}>No hay notas aún</Text>
                <Text style={[styles.emptyNotesSubtext, { color: colors.textTertiary }]}>Agrega tu primera nota para empezar</Text>
              </View>
            ) : (
              notes.map(note => (
                <View 
                  key={note.id_nota} 
                  style={[styles.noteCard, { 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }]}
                >
                  <View style={styles.noteContent}>
                    <Text style={[styles.noteText, { color: colors.text }]}>{note.texto}</Text>
                    <Text style={[styles.noteTimestamp, { color: colors.textTertiary }]}>
                      {formatTimestamp(note.fecha_modificacion || note.fecha_creacion)}
                    </Text>
                  </View>
                  <View style={styles.noteActions}>
                    <TouchableOpacity 
                      style={styles.noteActionButton}
                      onPress={() => copyNote(note)}
                    >
                      <Copy size={16 * SCALE} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.noteActionButton}
                      onPress={() => openEditModal(note)}
                    >
                      <Edit3 size={16 * SCALE} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 120 * SCALE }} />
      </ScrollView>

      {/* Modal de edición */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
      >
        <KeyboardAvoidingView 
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Nota</Text>
              <TouchableOpacity onPress={cancelEdit}>
                <X size={24 * SCALE} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.editInput, { 
                borderColor: colors.border,
                backgroundColor: colors.input,
                color: colors.text
              }]}
              value={editNoteText}
              onChangeText={setEditNoteText}
              placeholder="Edita tu nota..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={6}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: colors.surfaceVariant }]}
                onPress={cancelEdit}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={saveEditedNote}
              >
                <Check size={18 * SCALE} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { 
        backgroundColor: colors.surface,
        borderTopColor: colors.border
      }]}>
        <NavItem icon={Target} label="Hábitos" active colors={colors} />
        <NavItem
          icon={Calendar}
          label="Calendario"
          onPress={() => navigation.navigate('HabitCalendar')} // ✅ Ya no necesita pasar userId
          colors={colors}
        />
        <NavItem 
          icon={Clock} 
          label="To do"
          onPress={() => navigation.navigate('Todo')}
          colors={colors}
        />
        <NavItem 
          icon={User} 
          label="Perfil"
          onPress={() => navigation.navigate('Perfil')}
          colors={colors}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const StatCard = ({ icon: Icon, label, value, colors }) => (
  <View style={[styles.statCard, { 
    backgroundColor: colors.card,
    shadowColor: colors.text
  }]}>
    <Icon size={20 * SCALE} color={colors.primary} />
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const NavItem = ({ icon: Icon, label, active, onPress, colors }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <View style={[
      styles.navIcon, 
      { backgroundColor: active ? colors.primary : colors.surfaceVariant }
    ]}>
      <Icon size={16 * SCALE} color={active ? '#fff' : colors.textSecondary} />
    </View>
    <Text style={[
      styles.navText, 
      { color: active ? colors.primary : colors.textSecondary }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16 * SCALE,
    fontSize: 16 * SCALE,
  },
  scrollContainer: {
    padding: 16 * SCALE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50 * SCALE,
    marginBottom: 20 * SCALE,
  },
  title: {
    fontSize: 24 * SCALE,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14 * SCALE,
    textTransform: 'capitalize',
  },
  addButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    borderRadius: 16 * SCALE,
    padding: 16 * SCALE,
    marginBottom: 16 * SCALE,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10 * SCALE,
  },
  progressTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
  },
  progressValue: {
    fontSize: 20 * SCALE,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 10 * SCALE,
    borderRadius: 10 * SCALE,
    overflow: 'hidden',
    marginBottom: 8 * SCALE,
  },
  progressBarFill: {
    height: 10 * SCALE,
  },
  progressText: {
    fontSize: 12 * SCALE,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20 * SCALE,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12 * SCALE,
    borderRadius: 12 * SCALE,
    marginHorizontal: 4 * SCALE,
    shadowOpacity: 0.05,
    shadowRadius: 3 * SCALE,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10 * SCALE,
  },
  statValue: {
    fontSize: 14 * SCALE,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    marginBottom: 8 * SCALE,
  },
  emptyState: {
    padding: 32 * SCALE,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16 * SCALE,
    fontWeight: '500',
    marginBottom: 4 * SCALE,
  },
  emptyStateSubtext: {
    fontSize: 14 * SCALE,
  },
  habitCard: {
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
    marginBottom: 12 * SCALE,
    borderWidth: 1,
  },
  habitHeader: {
    flexDirection: 'row',
  },
  habitContent: {
    marginLeft: 12 * SCALE,
    flex: 1,
  },
  habitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4 * SCALE,
  },
  iconContainer: {
    padding: 4 * SCALE,
    borderRadius: 6 * SCALE,
    marginRight: 6 * SCALE,
  },
  habitName: {
    fontSize: 14 * SCALE,
    fontWeight: '500',
    flex: 1,
  },
  habitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12 * SCALE,
    paddingHorizontal: 6 * SCALE,
    paddingVertical: 2 * SCALE,
    borderRadius: 10 * SCALE,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 12 * SCALE,
    marginLeft: 4 * SCALE,
  },
  progressNumber: {
    fontSize: 12 * SCALE,
  },
  editHabitButton: {
    width: 28 * SCALE,
    height: 28 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14 * SCALE,
  },
  // ❌ ELIMINADOS: Estilos de la barra de progreso de hábitos
  // habitProgressBarBackground y habitProgressBarFill ya no se usan
  notesSection: {
    marginTop: 20 * SCALE,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12 * SCALE,
  },
  newNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16 * SCALE,
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
  },
  noteInput: {
    flex: 1,
    borderRadius: 8 * SCALE,
    padding: 12 * SCALE,
    fontSize: 14 * SCALE,
    minHeight: 44 * SCALE,
    maxHeight: 100 * SCALE,
    marginRight: 8 * SCALE,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  addNoteButton: {
    width: 36 * SCALE,
    height: 36 * SCALE,
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    marginBottom: 16 * SCALE,
  },
  emptyNotesContainer: {
    padding: 32 * SCALE,
    alignItems: 'center',
  },
  emptyNotesText: {
    fontSize: 16 * SCALE,
    fontWeight: '500',
    marginBottom: 4 * SCALE,
  },
  emptyNotesSubtext: {
    fontSize: 14 * SCALE,
  },
  noteCard: {
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
    marginBottom: 8 * SCALE,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    fontSize: 14 * SCALE,
    lineHeight: 20 * SCALE,
    marginBottom: 4 * SCALE,
  },
  noteTimestamp: {
    fontSize: 11 * SCALE,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8 * SCALE,
  },
  noteActionButton: {
    width: 32 * SCALE,
    height: 32 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4 * SCALE,
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
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    fontSize: 16 * SCALE,
    minHeight: 150 * SCALE,
    maxHeight: 250 * SCALE,
    textAlignVertical: 'top',
    marginBottom: 20 * SCALE,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12 * SCALE,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16 * SCALE,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8 * SCALE,
  },
  saveButtonText: {
    fontSize: 16 * SCALE,
    color: '#fff',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: 10 * SCALE,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 32 * SCALE,
    height: 32 * SCALE,
    borderRadius: 16 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2 * SCALE,
  },
  navText: {
    fontSize: 10 * SCALE,
  },
});

export default PrincipalScreen;