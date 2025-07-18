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
  Clipboard
} from 'react-native';
import {
  Plus,
  Calendar,
  TrendingUp,
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
  Check,
} from 'lucide-react-native';

const SCALE = 1.2;

const PrincipalScreen = ({ navigation }) => {
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

  // Función para eliminar una nota
  const deleteNote = (noteId) => {
    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => setNotes(prev => prev.filter(note => note.id !== noteId))
        }
      ]
    );
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
      style={styles.container}
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
            <Text style={styles.title}>HabitFlow</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddHabit')}
            >
              <Plus size={20 * SCALE} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progreso de Hoy</Text>
            <Text style={styles.progressValue}>{completionPercentage}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedHabits} de {totalHabits} hábitos completados
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon={Target} label="Racha" value="7 días" />
          <StatCard icon={Calendar} label="Esta semana" value="85%" />
        </View>

        {/* Habits */}
        <Text style={styles.sectionTitle}>Hábitos</Text>
        {habits.map(habit => {
          const Icon = habit.icon;
          const progress = (habit.current / habit.target) * 100;

          return (
            <View
              key={habit.id}
              style={[
                styles.habitCard,
                habit.completed && styles.habitCardCompleted
              ]}
            >
              <View style={styles.habitHeader}>
                <TouchableOpacity onPress={() => toggleHabit(habit.id)}>
                  {habit.completed ? (
                    <CheckCircle2 size={24 * SCALE} color="#968ce4" />
                  ) : (
                    <Circle size={24 * SCALE} color="#ccc" />
                  )}
                </TouchableOpacity>
                <View style={styles.habitContent}>
                  <View style={styles.habitTopRow}>
                    <View style={styles.iconContainer}>
                      <Icon size={16 * SCALE} color={habit.completed ? "#968ce4" : "#555"} />
                    </View>
                    <Text style={[
                      styles.habitName,
                      habit.completed && styles.habitNameCompleted
                    ]}>
                      {habit.name}
                    </Text>
                  </View>

                  <View style={styles.habitDetails}>
                    <Text style={styles.category}>{habit.category}</Text>
                    <View style={styles.streakRow}>
                      <Flame size={12 * SCALE} color="orange" />
                      <Text style={styles.streakText}>{habit.streak}</Text>
                    </View>
                    {habit.target > 1 && (
                      <Text style={styles.progressNumber}>{habit.current}/{habit.target}</Text>
                    )}
                  </View>

                  {habit.target > 1 && (
                    <View style={styles.habitProgressBarBackground}>
                      <View
                        style={[
                          styles.habitProgressBarFill,
                          { width: `${progress}%`, backgroundColor: habit.completed ? '#968ce4' : '#ccc' }
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
            <Text style={styles.sectionTitle}>Notas</Text>
            <PenTool size={18 * SCALE} color="#968ce4" />
          </View>
          
          {/* Input para nueva nota */}
          <View style={styles.newNoteContainer}>
            <TextInput
              style={styles.noteInput}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Escribe una nota..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={2}
            />
            <TouchableOpacity 
              style={[styles.addNoteButton, !newNote.trim() && styles.addNoteButtonDisabled]}
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
                <Text style={styles.emptyNotesText}>No hay notas aún</Text>
                <Text style={styles.emptyNotesSubtext}>Agrega tu primera nota para empezar</Text>
              </View>
            ) : (
              notes.map(note => (
                <TouchableOpacity 
                  key={note.id} 
                  style={styles.noteCard}
                >
                  <View style={styles.noteContent}>
                    <Text style={styles.noteText}>{note.text}</Text>
                    <Text style={styles.noteTimestamp}>{note.timestamp}</Text>
                  </View>
                  <View style={styles.noteActions}>
                    <TouchableOpacity 
                      style={styles.noteActionButton}
                      onPress={() => copyNote(note)}
                    >
                      <Copy size={16 * SCALE} color="#968ce4" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.noteActionButton}
                      onPress={() => openEditModal(note)}
                    >
                      <Edit3 size={16 * SCALE} color="#968ce4" />
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
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Nota</Text>
              <TouchableOpacity onPress={cancelEdit}>
                <X size={24 * SCALE} color="#999" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.editInput}
              value={editNoteText}
              onChangeText={setEditNoteText}
              placeholder="Edita tu nota..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
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
      <View style={styles.bottomNav}>
        <NavItem icon={Target} label="Hábitos" active />
        <NavItem
          icon={Calendar}
          label="Calendario"
          onPress={() => navigation.navigate('HabitCalendar')}
        />
        <NavItem 
          icon={Clock} 
          label="To do"
          onPress={() => navigation.navigate('Todo')}
        />
        <NavItem 
          icon={User} 
          label="Perfil"
          onPress={() => navigation.navigate('Perfil')}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <View style={styles.statCard}>
    <Icon size={20 * SCALE} color="#968ce4" />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const NavItem = ({ icon: Icon, label, active, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <View style={[styles.navIcon, active && { backgroundColor: '#968ce4' }]}>
      <Icon size={16 * SCALE} color={active ? '#fff' : '#888'} />
    </View>
    <Text style={[styles.navText, active && { color: '#968ce4' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#968ce4',
  },
  date: {
    fontSize: 14 * SCALE,
    color: '#888',
    textTransform: 'capitalize',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    backgroundColor: '#ede9fe',
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8 * SCALE,
  },
  addButton: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    backgroundColor: '#968ce4',
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: '#f3f0ff',
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
    color: '#968ce4',
  },
  progressBarBackground: {
    height: 10 * SCALE,
    backgroundColor: '#fff',
    borderRadius: 10 * SCALE,
    overflow: 'hidden',
    marginBottom: 8 * SCALE,
  },
  progressBarFill: {
    height: 10 * SCALE,
    backgroundColor: '#968ce4',
  },
  progressText: {
    fontSize: 12 * SCALE,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 12 * SCALE,
    marginHorizontal: 4 * SCALE,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3 * SCALE,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10 * SCALE,
    color: '#666',
  },
  statValue: {
    fontSize: 14 * SCALE,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16 * SCALE,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8 * SCALE,
  },
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
    marginBottom: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  habitCardCompleted: {
    backgroundColor: '#f6f5ff',
    borderColor: '#e0e0ff',
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
    backgroundColor: '#eee',
    padding: 4 * SCALE,
    borderRadius: 6 * SCALE,
    marginRight: 6 * SCALE,
  },
  habitName: {
    fontSize: 14 * SCALE,
    fontWeight: '500',
    color: '#333',
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  habitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12 * SCALE,
    color: '#666',
    backgroundColor: '#eee',
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
    color: '#444',
  },
  progressNumber: {
    fontSize: 12 * SCALE,
    color: '#666',
  },
  habitProgressBarBackground: {
    height: 6 * SCALE,
    backgroundColor: '#ddd',
    borderRadius: 3 * SCALE,
    marginTop: 4 * SCALE,
    overflow: 'hidden',
  },
  habitProgressBarFill: {
    height: 6 * SCALE,
    borderRadius: 3 * SCALE,
  },
  // Estilos para la sección de notas
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
    backgroundColor: '#f8f9fa',
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8 * SCALE,
    padding: 12 * SCALE,
    fontSize: 14 * SCALE,
    color: '#333',
    minHeight: 44 * SCALE,
    maxHeight: 100 * SCALE,
    marginRight: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlignVertical: 'top',
  },
  addNoteButton: {
    width: 36 * SCALE,
    height: 36 * SCALE,
    backgroundColor: '#968ce4',
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNoteButtonDisabled: {
    backgroundColor: '#ccc',
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
    color: '#666',
    fontWeight: '500',
    marginBottom: 4 * SCALE,
  },
  emptyNotesSubtext: {
    fontSize: 14 * SCALE,
    color: '#999',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12 * SCALE,
    padding: 12 * SCALE,
    marginBottom: 8 * SCALE,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    fontSize: 14 * SCALE,
    color: '#333',
    lineHeight: 20 * SCALE,
    marginBottom: 4 * SCALE,
  },
  noteTimestamp: {
    fontSize: 11 * SCALE,
    color: '#999',
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
  deleteNoteButton: {
    width: 28 * SCALE,
    height: 28 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8 * SCALE,
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20 * SCALE,
  },
  modalContent: {
    backgroundColor: '#fff',
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
  },
  modalTitle: {
    fontSize: 18 * SCALE,
    fontWeight: 'bold',
    color: '#333',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    fontSize: 16 * SCALE,
    color: '#333',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 12 * SCALE,
    padding: 16 * SCALE,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16 * SCALE,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#968ce4',
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
    borderColor: '#ddd',
    backgroundColor: '#fff',
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
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2 * SCALE,
  },
  navText: {
    fontSize: 10 * SCALE,
    color: '#888',
  },
});

export default PrincipalScreen;