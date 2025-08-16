import React, { useState } from 'react';
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
  Droplets,
  Activity,
  BookOpen,
  Brain,
  PenTool,
  Edit3,
  X,
  User,
  Copy,
  Check
} from 'lucide-react-native';
import { useTheme } from './ThemeContext'; // Importar el hook del contexto

const SCALE = 1.2;

const PrincipalScreen = ({ navigation }) => {
  const { colors } = useTheme(); // Solo necesitamos los colores

  const [habits, setHabits] = useState([
    {
      id: 1,
      name: "Beber 8 vasos de agua",
      icon: Droplets,
      completed: true,
      streak: 7,
      target: 8,
      current: 8,
      category: "Salud"
    },
    {
      id: 2,
      name: "Ejercicio matutino",
      icon: Activity,
      completed: true,
      streak: 12,
      target: 30,
      current: 30,
      category: "Fitness"
    },
    {
      id: 3,
      name: "Leer 20 páginas",
      icon: BookOpen,
      completed: false,
      streak: 5,
      target: 20,
      current: 12,
      category: "Educación"
    },
    {
      id: 4,
      name: "Meditar",
      icon: Brain,
      completed: false,
      streak: 3,
      target: 10,
      current: 0,
      category: "Bienestar"
    }
  ]);

  // Estado para las notas
  const [notes, setNotes] = useState([
    {
      id: 1,
      text: "Recordar beber más agua después del ejercicio",
      timestamp: new Date().toLocaleString()
    },
    {
      id: 2,
      text: "Añadir meditación de 5 minutos antes de dormir",
      timestamp: new Date().toLocaleString()
    }
  ]);
  
  const [newNote, setNewNote] = useState('');
  
  // Estados para edición de notas
  const [editingNote, setEditingNote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNoteText, setEditNoteText] = useState('');

  const toggleHabit = (habitId) => {
    setHabits(prev =>
      prev.map(habit =>
        habit.id === habitId
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  // Función para agregar una nueva nota
  const addNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote.trim(),
        timestamp: new Date().toLocaleString()
      };
      setNotes(prev => [note, ...prev]);
      setNewNote('');
    }
  };

  // Función para copiar nota al portapapeles
  const copyNote = async (note) => {
    try {
      await Clipboard.setString(note.text);
      Alert.alert('¡Copiado!', 'La nota ha sido copiada al portapapeles');
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar la nota');
    }
  };

  // Función para abrir modal de edición
  const openEditModal = (note) => {
    setEditingNote(note);
    setEditNoteText(note.text);
    setShowEditModal(true);
  };

  // Función para guardar nota editada
  const saveEditedNote = () => {
    if (!editNoteText.trim()) {
      Alert.alert('Error', 'La nota no puede estar vacía');
      return;
    }

    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { ...note, text: editNoteText.trim(), timestamp: new Date().toLocaleString() }
        : note
    ));

    setShowEditModal(false);
    setEditingNote(null);
    setEditNoteText('');
    Alert.alert('¡Guardado!', 'La nota ha sido actualizada');
  };

  // Función para cancelar edición
  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingNote(null);
    setEditNoteText('');
  };

  const completedHabits = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const completionPercentage = Math.round((completedHabits / totalHabits) * 100);

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.primary }]}>HabitFlow</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{today}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <Plus size={20 * SCALE} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.cardCompleted }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Progreso de Hoy</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{completionPercentage}%</Text>
          </View>
          <View style={[styles.progressBarBackground, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${completionPercentage}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {completedHabits} de {totalHabits} hábitos completados
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon={Target} label="Racha" value="7 días" colors={colors} />
          <StatCard icon={Calendar} label="Esta semana" value="85%" colors={colors} />
        </View>

        {/* Habits */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hábitos</Text>
        {habits.map(habit => {
          const Icon = habit.icon;
          const progress = (habit.current / habit.target) * 100;

          return (
            <View
              key={habit.id}
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
                <TouchableOpacity onPress={() => toggleHabit(habit.id)}>
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
                      {habit.name}
                    </Text>
                  </View>

                  <View style={styles.habitDetails}>
                    <Text style={[styles.category, { 
                      color: colors.textSecondary, 
                      backgroundColor: colors.surfaceVariant 
                    }]}>
                      {habit.category}
                    </Text>
                    <View style={styles.streakRow}>
                      <Flame size={12 * SCALE} color={colors.warning} />
                      <Text style={[styles.streakText, { color: colors.text }]}>{habit.streak}</Text>
                    </View>
                    {habit.target > 1 && (
                      <Text style={[styles.progressNumber, { color: colors.textSecondary }]}>{habit.current}/{habit.target}</Text>
                    )}
                  </View>

                  {habit.target > 1 && (
                    <View style={[styles.habitProgressBarBackground, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.habitProgressBarFill,
                          { 
                            width: `${progress}%`, 
                            backgroundColor: habit.completed ? colors.primary : colors.textTertiary 
                          }
                        ]}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

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
                <TouchableOpacity 
                  key={note.id} 
                  style={[styles.noteCard, { 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }]}
                >
                  <View style={styles.noteContent}>
                    <Text style={[styles.noteText, { color: colors.text }]}>{note.text}</Text>
                    <Text style={[styles.noteTimestamp, { color: colors.textTertiary }]}>{note.timestamp}</Text>
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
                </TouchableOpacity>
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
          onPress={() => navigation.navigate('HabitCalendar')}
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
  habitProgressBarBackground: {
    height: 6 * SCALE,
    borderRadius: 3 * SCALE,
    marginTop: 4 * SCALE,
    overflow: 'hidden',
  },
  habitProgressBarFill: {
    height: 6 * SCALE,
    borderRadius: 3 * SCALE,
  },
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