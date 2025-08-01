import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions
} from 'react-native';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    CheckCircle,
    Circle,
    Target
} from 'lucide-react-native';

const SCALE = 1.2;
const { width } = Dimensions.get('window');

const HabitCalendarScreen = ({ navigation, route }) => {
    const { habit } = route.params || {};
    
    const [viewMode, setViewMode] = useState('semanal'); // 'semanal' o 'mensual'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [habitData, setHabitData] = useState({});

    // Datos de ejemplo - normalmente vendrían de tu estado global o base de datos
    const [mockHabits] = useState([
        {
            id: 1,
            name: 'Beber agua',
            icon: 'Droplets',
            category: 'Salud',
            target: 8,
            frequency: 'Diario',
            color: '#968ce4'
        }
    ]);

    const [selectedHabit, setSelectedHabit] = useState(habit || mockHabits[0]);

    // Mock data para progreso de hábitos
    useEffect(() => {
        generateMockData();
    }, [currentDate, selectedHabit]);

    const generateMockData = () => {
        const data = {};
        const today = new Date();
        const startDate = new Date(currentDate);
        
        if (viewMode === 'semanal') {
            startDate.setDate(startDate.getDate() - startDate.getDay());
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateKey = date.toISOString().split('T')[0];
                
                // Solo generar datos para fechas pasadas y hoy
                if (date <= today) {
                    data[dateKey] = {
                        completed: Math.random() > 0.3,
                        value: Math.floor(Math.random() * (selectedHabit.target + 2)),
                        target: selectedHabit.target
                    };
                }
            }
        } else {
            // Mensual
            const year = startDate.getFullYear();
            const month = startDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month, i);
                const dateKey = date.toISOString().split('T')[0];
                
                if (date <= today) {
                    data[dateKey] = {
                        completed: Math.random() > 0.3,
                        value: Math.floor(Math.random() * (selectedHabit.target + 2)),
                        target: selectedHabit.target
                    };
                }
            }
        }
        
        setHabitData(data);
    };

    const getDaysInWeek = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        let current = new Date(startDate);
        
        while (current <= lastDay || days.length % 7 !== 0) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return days;
    };

    const navigatePeriod = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'semanal') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setCurrentDate(newDate);
    };

    const getDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getDayProgress = (date) => {
        const dateKey = getDateKey(date);
        return habitData[dateKey] || null;
    };

    const getProgressColor = (progress) => {
        if (!progress) return '#f5f5f5';
        
        const percentage = Math.min(progress.value / progress.target, 1);
        if (percentage >= 1) return selectedHabit.color;
        if (percentage >= 0.5) return selectedHabit.color + '80';
        if (percentage > 0) return selectedHabit.color + '40';
        return '#ffebee';
    };

    const formatPeriod = () => {
        if (viewMode === 'semanal') {
            const days = getDaysInWeek();
            const start = days[0];
            const end = days[6];
            
            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('es', { month: 'long', year: 'numeric' })}`;
            } else {
                return `${start.toLocaleDateString('es', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            }
        } else {
            return currentDate.toLocaleDateString('es', { month: 'long', year: 'numeric' });
        }
    };

    const renderWeeklyCalendar = () => {
        const days = getDaysInWeek();
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        return (
            <View style={styles.weeklyContainer}>
                <View style={styles.weekHeader}>
                    {dayNames.map((dayName, index) => (
                        <Text key={index} style={styles.dayHeader}>{dayName}</Text>
                    ))}
                </View>
                <View style={styles.weekDays}>
                    {days.map((day, index) => {
                        const progress = getDayProgress(day);
                        const isToday = day.toDateString() === new Date().toDateString();
                        const isFuture = day > new Date();
                        
                        return (
                            <View key={index} style={styles.dayCell}>
                                <Text style={[
                                    styles.dayNumber,
                                    isToday && styles.todayText,
                                    isFuture && styles.futureText
                                ]}>
                                    {day.getDate()}
                                </Text>
                                <View style={[
                                    styles.progressCircle,
                                    { backgroundColor: getProgressColor(progress) },
                                    isToday && styles.todayCircle
                                ]}>
                                    {progress && progress.completed && (
                                        <CheckCircle size={12 * SCALE} color="#fff" />
                                    )}
                                    {progress && !progress.completed && progress.value > 0 && (
                                        <Text style={styles.progressText}>
                                            {progress.value}/{progress.target}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderMonthlyCalendar = () => {
        const days = getDaysInMonth();
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const weeks = [];
        
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }
        
        return (
            <View style={styles.monthlyContainer}>
                <View style={styles.monthHeader}>
                    {dayNames.map((dayName, index) => (
                        <Text key={index} style={styles.dayHeader}>{dayName}</Text>
                    ))}
                </View>
                {weeks.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {week.map((day, dayIndex) => {
                            const progress = getDayProgress(day);
                            const isToday = day.toDateString() === new Date().toDateString();
                            const isFuture = day > new Date();
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            
                            return (
                                <View key={dayIndex} style={styles.monthDayCell}>
                                    <Text style={[
                                        styles.monthDayNumber,
                                        isToday && styles.todayText,
                                        isFuture && styles.futureText,
                                        !isCurrentMonth && styles.otherMonthText
                                    ]}>
                                        {day.getDate()}
                                    </Text>
                                    <View style={[
                                        styles.monthProgressDot,
                                        { backgroundColor: getProgressColor(progress) },
                                        isToday && styles.todayDot
                                    ]}>
                                        {progress && progress.completed && (
                                            <View style={styles.completedDot} />
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24 * SCALE} color="#968ce4" />
                </TouchableOpacity>
                <Text style={styles.title}>Calendario</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Selector de hábito */}
                <View style={styles.habitSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {mockHabits.map((habit) => (
                            <TouchableOpacity
                                key={habit.id}
                                style={[
                                    styles.habitChip,
                                    { backgroundColor: habit.color + '20' },
                                    selectedHabit.id === habit.id && { backgroundColor: habit.color }
                                ]}
                                onPress={() => setSelectedHabit(habit)}
                            >
                                <Text style={[
                                    styles.habitChipText,
                                    { color: habit.color },
                                    selectedHabit.id === habit.id && { color: '#fff' }
                                ]}>
                                    {habit.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Controles de vista */}
                <View style={styles.viewControls}>
                    <View style={styles.viewToggle}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                viewMode === 'semanal' && styles.activeToggle
                            ]}
                            onPress={() => setViewMode('semanal')}
                        >
                            <Text style={[
                                styles.toggleText,
                                viewMode === 'semanal' && styles.activeToggleText
                            ]}>
                                Semanal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                viewMode === 'mensual' && styles.activeToggle
                            ]}
                            onPress={() => setViewMode('mensual')}
                        >
                            <Text style={[
                                styles.toggleText,
                                viewMode === 'mensual' && styles.activeToggleText
                            ]}>
                                Mensual
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Navegación de período */}
                <View style={styles.periodNavigation}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => navigatePeriod(-1)}
                    >
                        <ChevronLeft size={24 * SCALE} color="#968ce4" />
                    </TouchableOpacity>
                    
                    <Text style={styles.periodText}>{formatPeriod()}</Text>
                    
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => navigatePeriod(1)}
                    >
                        <ChevronRight size={24 * SCALE} color="#968ce4" />
                    </TouchableOpacity>
                </View>

                {/* Calendario */}
                <View style={styles.calendarContainer}>
                    {viewMode === 'semanal' ? renderWeeklyCalendar() : renderMonthlyCalendar()}
                </View>

                {/* Estadísticas */}
                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Estadísticas del período</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Target size={20 * SCALE} color={selectedHabit.color} />
                            <Text style={styles.statValue}>
                                {Object.values(habitData).filter(d => d.completed).length}
                            </Text>
                            <Text style={styles.statLabel}>Días completados</Text>
                        </View>
                        <View style={styles.statCard}>
                            <CalendarIcon size={20 * SCALE} color={selectedHabit.color} />
                            <Text style={styles.statValue}>
                                {Math.round((Object.values(habitData).filter(d => d.completed).length / 
                                Object.keys(habitData).length) * 100) || 0}%
                            </Text>
                            <Text style={styles.statLabel}>Porcentaje</Text>
                        </View>
                        <View style={styles.statCard}>
                            <CheckCircle size={20 * SCALE} color={selectedHabit.color} />
                            <Text style={styles.statValue}>
                                {Object.values(habitData).reduce((sum, d) => sum + (d.value || 0), 0)}
                            </Text>
                            <Text style={styles.statLabel}>Total realizado</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16 * SCALE,
        paddingTop: 50 * SCALE,
        paddingBottom: 20 * SCALE,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
        fontSize: 20 * SCALE,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40 * SCALE,
    },
    content: {
        flex: 1,
        padding: 16 * SCALE,
    },
    habitSelector: {
        marginBottom: 20 * SCALE,
    },
    habitChip: {
        paddingHorizontal: 16 * SCALE,
        paddingVertical: 8 * SCALE,
        borderRadius: 20 * SCALE,
        marginRight: 8 * SCALE,
    },
    habitChipText: {
        fontSize: 14 * SCALE,
        fontWeight: '500',
    },
    viewControls: {
        alignItems: 'center',
        marginBottom: 20 * SCALE,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 25 * SCALE,
        padding: 4 * SCALE,
    },
    toggleButton: {
        paddingHorizontal: 20 * SCALE,
        paddingVertical: 8 * SCALE,
        borderRadius: 20 * SCALE,
    },
    activeToggle: {
        backgroundColor: '#968ce4',
    },
    toggleText: {
        fontSize: 14 * SCALE,
        color: '#666',
    },
    activeToggleText: {
        color: '#fff',
        fontWeight: '500',
    },
    periodNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20 * SCALE,
    },
    navButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        backgroundColor: '#f3f0ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    periodText: {
        fontSize: 16 * SCALE,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 12 * SCALE,
        padding: 16 * SCALE,
        marginBottom: 20 * SCALE,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    // Estilos para vista semanal
    weeklyContainer: {
        flex: 1,
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16 * SCALE,
    },
    dayHeader: {
        fontSize: 12 * SCALE,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
        width: (width - 64 * SCALE) / 7,
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    dayCell: {
        alignItems: 'center',
        width: (width - 64 * SCALE) / 7,
        paddingHorizontal: 2 * SCALE,
    },
    dayNumber: {
        fontSize: 14 * SCALE,
        color: '#333',
        marginBottom: 8 * SCALE,
        fontWeight: '500',
    },
    progressCircle: {
        width: 28 * SCALE,
        height: 28 * SCALE,
        borderRadius: 14 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    todayCircle: {
        borderColor: '#968ce4',
    },
    progressText: {
        fontSize: 8 * SCALE,
        color: '#333',
        fontWeight: 'bold',
    },
    // Estilos para vista mensual
    monthlyContainer: {
        flex: 1,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12 * SCALE,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8 * SCALE,
    },
    monthDayCell: {
        alignItems: 'center',
        width: (width - 64 * SCALE) / 7,
        paddingVertical: 4 * SCALE,
    },
    monthDayNumber: {
        fontSize: 12 * SCALE,
        color: '#333',
        marginBottom: 4 * SCALE,
    },
    monthProgressDot: {
        width: 8 * SCALE,
        height: 8 * SCALE,
        borderRadius: 4 * SCALE,
    },
    completedDot: {
        width: 4 * SCALE,
        height: 4 * SCALE,
        borderRadius: 2 * SCALE,
        backgroundColor: '#fff',
    },
    todayDot: {
        borderWidth: 1,
        borderColor: '#968ce4',
    },
    // Estilos comunes
    todayText: {
        color: '#968ce4',
        fontWeight: 'bold',
    },
    futureText: {
        color: '#ccc',
    },
    otherMonthText: {
        color: '#ddd',
    },
    // Estadísticas
    statsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12 * SCALE,
        padding: 16 * SCALE,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statsTitle: {
        fontSize: 16 * SCALE,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16 * SCALE,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 12 * SCALE,
        backgroundColor: '#f8f9fa',
        borderRadius: 8 * SCALE,
        marginHorizontal: 4 * SCALE,
    },
    statValue: {
        fontSize: 18 * SCALE,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 4 * SCALE,
    },
    statLabel: {
        fontSize: 12 * SCALE,
        color: '#666',
        textAlign: 'center',
    },
});

export default HabitCalendarScreen;