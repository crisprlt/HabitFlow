import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
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
  PenTool
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

  const toggleHabit = (habitId) => {
    setHabits(prev =>
      prev.map(habit =>
        habit.id === habitId
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>HabitFlow</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.streakIcon}>
              <Flame size={20 * SCALE} color="#968ce4" />
            </View>
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
          <StatCard icon={TrendingUp} label="Tendencia" value="+12%" />
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
        <View style={{ height: 80 * SCALE }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem icon={Target} label="Hábitos" active />
       <NavItem
      icon={Calendar}
      label="Calendario"
      onPress={() => navigation.navigate('HabitCalendar')}
      />
        <NavItem icon={Clock} 
        label="To do"
        onPress={() => navigation.navigate('Todo')}
         />
      </View>
    </View>
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