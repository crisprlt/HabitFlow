import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    CheckCircle,
    Circle,
    Target,
    TrendingUp
} from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store'; // ✅ Agregar import

const SCALE = 1.2;
const { width } = Dimensions.get('window');

const HabitCalendarScreen = ({ navigation, route }) => {
    const { colors } = useTheme();
    const { habit } = route.params || {}; // ✅ Solo obtener habit, no userId
    
    const [viewMode, setViewMode] = useState('semanal');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [habitData, setHabitData] = useState({});
    const [userHabits, setUserHabits] = useState([]);
    const [selectedHabit, setSelectedHabit] = useState(habit || null);
    const [stats, setStats] = useState(null);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null); // ✅ Estado para userId

    // ✅ Obtener userId del SecureStore al cargar el componente
    useEffect(() => {
        const getUserId = async () => {
            try {
                const storedUserId = await SecureStore.getItemAsync('user_id');
                console.log('✅ User ID obtenido del storage:', storedUserId);
                
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    console.log('❌ No se encontró user_id en SecureStore');
                    setError('No se encontró sesión de usuario');
                    setLoading(false);
                }
            } catch (error) {
                console.error('❌ Error obteniendo userId del storage:', error);
                setError('Error al obtener información de usuario');
                setLoading(false);
            }
        };

        getUserId();
    }, []);

    // Cargar hábitos del usuario cuando se obtenga el userId
    useEffect(() => {
        console.log('useEffect inicial - userId:', userId);
        if (userId) {
            loadUserHabits();
        } else {
            console.log('No hay userId disponible');
        }
    }, [userId]);

    // Cargar datos cuando cambie el hábito seleccionado, fecha o modo de vista
    useEffect(() => {
        if (selectedHabit) {
            loadHabitData();
        }
    }, [selectedHabit, currentDate, viewMode]);

    const loadUserHabits = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Cargando hábitos para userId:', userId);
            
            const response = await api.get(`/api/calendar/habits/user/${userId}`);
            console.log('Respuesta de hábitos:', response.data);
            
            if (response.data.success) {
                // Normalizar los datos
                const normalizedHabits = response.data.data.map(habit => ({
                    ...habit,
                    target: parseInt(habit.target) || 1 // Convertir target a número
                }));
                
                console.log('Hábitos normalizados:', normalizedHabits);
                setUserHabits(normalizedHabits);
                
                // Si no hay hábito seleccionado, seleccionar el primero
                if (!selectedHabit && normalizedHabits.length > 0) {
                    console.log('Seleccionando primer hábito:', normalizedHabits[0]);
                    setSelectedHabit(normalizedHabits[0]);
                }
            } else {
                console.log('Error en respuesta:', response.data);
                setError('Error al cargar hábitos');
            }
        } catch (err) {
            console.error('Error cargando hábitos:', err);
            setError('Error de conexión al cargar hábitos');
        } finally {
            setLoading(false);
        }
    };

    const loadHabitData = async () => {
        if (!selectedHabit) {
            console.log('No hay hábito seleccionado');
            return;
        }

        try {
            setLoading(true);
            console.log('Cargando datos para hábito:', selectedHabit.id_habito);
            const { startDate, endDate } = getDateRange();
            console.log('Rango de fechas:', { startDate, endDate });

            // Cargar datos del calendario
            const calendarResponse = await api.get(
                `/api/calendar/habits/calendar/${selectedHabit.id_habito}`,
                {
                    params: {
                        startDate: startDate,
                        endDate: endDate
                    }
                }
            );

            console.log('Respuesta calendario:', calendarResponse.data);
            if (calendarResponse.data.success) {
                setHabitData(calendarResponse.data.data);
            }

            // Cargar estadísticas
            const statsResponse = await api.get(
                `/api/calendar/habits/stats/${selectedHabit.id_habito}`,
                {
                    params: {
                        startDate: startDate,
                        endDate: endDate
                    }
                }
            );

            console.log('Respuesta stats:', statsResponse.data);
            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

            // Cargar racha
            const streakResponse = await api.get(
                `/api/calendar/habits/streak/${selectedHabit.id_habito}`
            );

            console.log('Respuesta racha:', streakResponse.data);
            if (streakResponse.data.success) {
                setStreak(streakResponse.data.data.rachaActual);
            }

        } catch (err) {
            console.error('Error cargando datos del hábito:', err);
            setError('Error al cargar datos del hábito');
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = () => {
        if (viewMode === 'semanal') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            
            return {
                startDate: startOfWeek.toISOString().split('T')[0],
                endDate: endOfWeek.toISOString().split('T')[0]
            };
        } else {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);
            
            return {
                startDate: startOfMonth.toISOString().split('T')[0],
                endDate: endOfMonth.toISOString().split('T')[0]
            };
        }
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
        if (!progress) return colors.surfaceVariant;
        
        const percentage = Math.min(progress.value / progress.target, 1);
        if (percentage >= 1) return selectedHabit.color;
        if (percentage >= 0.5) return selectedHabit.color + '80';
        if (percentage > 0) return selectedHabit.color + '40';
        return colors.error + '20';
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

    const handleHabitChange = (habit) => {
        setSelectedHabit(habit);
        setHabitData({});
        setStats(null);
        setStreak(0);
    };

    const renderWeeklyCalendar = () => {
        const days = getDaysInWeek();
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        return (
            <View style={styles.weeklyContainer}>
                <View style={styles.weekHeader}>
                    {dayNames.map((dayName, index) => (
                        <Text key={index} style={[styles.dayHeader, { color: colors.textSecondary }]}>
                            {dayName}
                        </Text>
                    ))}
                </View>
                <View style={styles.weekDays}>
                    {days.map((day, index) => {
                        const progress = getDayProgress(day);
                        const isToday = day.toDateString() === new Date().toDateString();
                        const isFuture = day > new Date();
                        
                        return (
                            <View
                                key={index}
                                style={styles.dayCell}
                            >
                                <Text style={[
                                    styles.dayNumber,
                                    { color: colors.text },
                                    isToday && { color: colors.primary },
                                    isFuture && { color: colors.textTertiary }
                                ]}>
                                    {day.getDate()}
                                </Text>
                                <View style={[
                                    styles.progressCircle,
                                    { backgroundColor: getProgressColor(progress) },
                                    isToday && { borderColor: colors.primary }
                                ]}>
                                    {progress && progress.completed && (
                                        <CheckCircle size={12 * SCALE} color="#fff" />
                                    )}
                                    {progress && !progress.completed && progress.value > 0 && (
                                        <Text style={[styles.progressText, { color: colors.text }]}>
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
                        <Text key={index} style={[styles.dayHeader, { color: colors.textSecondary }]}>
                            {dayName}
                        </Text>
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
                                <View
                                    key={dayIndex}
                                    style={styles.monthDayCell}
                                >
                                    <Text style={[
                                        styles.monthDayNumber,
                                        { color: colors.text },
                                        isToday && { color: colors.primary },
                                        isFuture && { color: colors.textTertiary },
                                        !isCurrentMonth && { color: colors.textTertiary }
                                    ]}>
                                        {day.getDate()}
                                    </Text>
                                    <View style={[
                                        styles.monthProgressDot,
                                        { backgroundColor: getProgressColor(progress) },
                                        isToday && { borderColor: colors.primary }
                                    ]}>
                                        {progress && progress.completed && (
                                            <View style={[styles.completedDot, { backgroundColor: colors.surface }]} />
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

    if (loading && userHabits.length === 0) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>Cargando hábitos...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary }]}
                    onPress={loadUserHabits}
                >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (userHabits.length === 0 && !loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No tienes hábitos creados
                </Text>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.goBack()} // ✅ Cambiar a goBack en lugar de navigate
                >
                    <Text style={styles.createButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
                >
                    <ArrowLeft size={24 * SCALE} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Calendario</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Selector de hábito */}
                <View style={styles.habitSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {userHabits.map((habit) => (
                            <TouchableOpacity
                                key={habit.id_habito}
                                style={[
                                    styles.habitChip,
                                    { backgroundColor: habit.color + '20' },
                                    selectedHabit?.id_habito === habit.id_habito && { backgroundColor: habit.color }
                                ]}
                                onPress={() => handleHabitChange(habit)}
                            >
                                <Text style={[
                                    styles.habitChipText,
                                    { color: habit.color },
                                    selectedHabit?.id_habito === habit.id_habito && { color: '#fff' }
                                ]}>
                                    {habit.nombre}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {selectedHabit && (
                    <>
                        {/* Controles de vista */}
                        <View style={styles.viewControls}>
                            <View style={[styles.viewToggle, { backgroundColor: colors.surfaceVariant }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleButton,
                                        viewMode === 'semanal' && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => setViewMode('semanal')}
                                >
                                    <Text style={[
                                        styles.toggleText,
                                        { color: colors.textSecondary },
                                        viewMode === 'semanal' && { color: '#fff', fontWeight: '500' }
                                    ]}>
                                        Semanal
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleButton,
                                        viewMode === 'mensual' && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => setViewMode('mensual')}
                                >
                                    <Text style={[
                                        styles.toggleText,
                                        { color: colors.textSecondary },
                                        viewMode === 'mensual' && { color: '#fff', fontWeight: '500' }
                                    ]}>
                                        Mensual
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Navegación de período */}
                        <View style={styles.periodNavigation}>
                            <TouchableOpacity
                                style={[styles.navButton, { backgroundColor: colors.cardCompleted }]}
                                onPress={() => navigatePeriod(-1)}
                            >
                                <ChevronLeft size={24 * SCALE} color={colors.primary} />
                            </TouchableOpacity>
                            
                            <Text style={[styles.periodText, { color: colors.text }]}>
                                {formatPeriod()}
                            </Text>
                            
                            <TouchableOpacity
                                style={[styles.navButton, { backgroundColor: colors.cardCompleted }]}
                                onPress={() => navigatePeriod(1)}
                            >
                                <ChevronRight size={24 * SCALE} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Calendario */}
                        <View style={[styles.calendarContainer, { 
                            backgroundColor: colors.card,
                            shadowColor: colors.text 
                        }]}>
                            {loading ? (
                                <View style={styles.calendarLoading}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : (
                                viewMode === 'semanal' ? renderWeeklyCalendar() : renderMonthlyCalendar()
                            )}
                        </View>

                        {/* Estadísticas */}
                        <View style={[styles.statsContainer, { 
                            backgroundColor: colors.card,
                            shadowColor: colors.text 
                        }]}>
                            <Text style={[styles.statsTitle, { color: colors.text }]}>
                                Estadísticas del período
                            </Text>
                            {loading ? (
                                <View style={styles.statsLoading}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : (
                                <View style={styles.statsGrid}>
                                    <View style={[styles.statCard, { backgroundColor: colors.surfaceVariant }]}>
                                        <Target size={20 * SCALE} color={selectedHabit.color} />
                                        <Text style={[styles.statValue, { color: colors.text }]}>
                                            {stats?.diasCompletados || 0}
                                        </Text>
                                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                            Días completados
                                        </Text>
                                    </View>
                                    <View style={[styles.statCard, { backgroundColor: colors.surfaceVariant }]}>
                                        <CalendarIcon size={20 * SCALE} color={selectedHabit.color} />
                                        <Text style={[styles.statValue, { color: colors.text }]}>
                                            {stats?.porcentaje || 0}%
                                        </Text>
                                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                            Porcentaje
                                        </Text>
                                    </View>
                                    <View style={[styles.statCard, { backgroundColor: colors.surfaceVariant }]}>
                                        <TrendingUp size={20 * SCALE} color={selectedHabit.color} />
                                        <Text style={[styles.statValue, { color: colors.text }]}>
                                            {streak}
                                        </Text>
                                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                            Racha actual
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </>
                )}

                <View style={{ height: 20 * SCALE }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16 * SCALE,
        paddingTop: 50 * SCALE,
        paddingBottom: 20 * SCALE,
    },
    backButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20 * SCALE,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40 * SCALE,
    },
    content: {
        flex: 1,
        padding: 16 * SCALE,
    },
    loadingText: {
        marginTop: 10 * SCALE,
        fontSize: 16 * SCALE,
    },
    errorText: {
        fontSize: 16 * SCALE,
        textAlign: 'center',
        marginBottom: 20 * SCALE,
    },
    retryButton: {
        paddingHorizontal: 20 * SCALE,
        paddingVertical: 10 * SCALE,
        borderRadius: 8 * SCALE,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16 * SCALE,
        fontWeight: '500',
    },
    emptyText: {
        fontSize: 16 * SCALE,
        textAlign: 'center',
        marginBottom: 20 * SCALE,
    },
    createButton: {
        paddingHorizontal: 20 * SCALE,
        paddingVertical: 10 * SCALE,
        borderRadius: 8 * SCALE,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16 * SCALE,
        fontWeight: '500',
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
        borderRadius: 25 * SCALE,
        padding: 4 * SCALE,
    },
    toggleButton: {
        paddingHorizontal: 20 * SCALE,
        paddingVertical: 8 * SCALE,
        borderRadius: 20 * SCALE,
    },
    toggleText: {
        fontSize: 14 * SCALE,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    periodText: {
        fontSize: 16 * SCALE,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    calendarContainer: {
        borderRadius: 12 * SCALE,
        padding: 16 * SCALE,
        marginBottom: 20 * SCALE,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    calendarLoading: {
        paddingVertical: 20 * SCALE,
        alignItems: 'center',
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
    progressText: {
        fontSize: 8 * SCALE,
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
    },
    // Estadísticas
    statsContainer: {
        borderRadius: 12 * SCALE,
        padding: 16 * SCALE,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statsLoading: {
        paddingVertical: 20 * SCALE,
        alignItems: 'center',
    },
    statsTitle: {
        fontSize: 16 * SCALE,
        fontWeight: 'bold',
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
        borderRadius: 8 * SCALE,
        marginHorizontal: 4 * SCALE,
    },
    statValue: {
        fontSize: 18 * SCALE,
        fontWeight: 'bold',
        marginVertical: 4 * SCALE,
    },
    statLabel: {
        fontSize: 12 * SCALE,
        textAlign: 'center',
    },
});

export default HabitCalendarScreen;