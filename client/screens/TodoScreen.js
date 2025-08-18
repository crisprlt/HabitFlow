import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import {
    Plus,
    MoreVertical,
    Check,
    Circle,
    Edit3,
    Trash2,
    FolderPlus,
    ListTodo,
    X,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

const SCALE = 1.2;
const { height: screenHeight } = Dimensions.get('window');

const TodoScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [userId, setUserId] = useState(null); // ✅ Estado para userId
    
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [showNewAreaModal, setShowNewAreaModal] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaEmoji, setNewAreaEmoji] = useState('📝');
    const [newAreaColor, setNewAreaColor] = useState('#968ce4');
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('media');
    const [editingArea, setEditingArea] = useState(null);
    
    // Estados para edición de tareas
    const [editingTask, setEditingTask] = useState(null);
    const [editTaskText, setEditTaskText] = useState('');

    const availableColors = [
        '#968ce4', '#ff6b6b', '#4ecdc4', '#45b7d1', 
        '#96ceb4', '#ffd93d', '#ff9ff3', '#54a0ff',
        '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84'
    ];

    const emojis = [
        '📝', '💼', '🏠', '💪', '🎯', '📚', '🎨', '🍳',
        '🚗', '💰', '🎵', '📱', '🌱', '⭐', '🔥', '🎉'
    ];

    const priorities = [
        { value: 'alta', label: 'Alta', color: colors.priorityHigh || '#ff4757' },
        { value: 'media', label: 'Media', color: colors.priorityMedium || '#ffa502' },
        { value: 'baja', label: 'Baja', color: colors.priorityLow || '#2ed573' }
    ];

    // =============================
    // API FUNCTIONS
    // =============================

    const loadAreasAndTasks = async () => {
        if (!userId) return; // ✅ No cargar si no hay userId
        
        try {
            setLoading(true);
            const response = await api.get(`/api/other/todo/${userId}`);
            setAreas(response.data);
        } catch (error) {
            console.error('Error cargando áreas:', error);
            Alert.alert('Error', 'No se pudieron cargar las áreas');
        } finally {
            setLoading(false);
        }
    };

    const createNewArea = async () => {
        if (!newAreaName.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para el área');
            return;
        }

        if (!userId) {
            Alert.alert('Error', 'Usuario no identificado');
            return;
        }

        try {
            const response = await api.post(`/api/other/todo/${userId}/areas`, {
                name: newAreaName.trim(),
                emoji: newAreaEmoji,
                color: newAreaColor
            });

            // Agregar el área a la lista con tasks vacío
            const newAreaWithTasks = { ...response.data, tasks: [] };
            setAreas([...areas, newAreaWithTasks]);
            
            setNewAreaName('');
            setNewAreaEmoji('📝');
            setNewAreaColor('#968ce4');
            setShowNewAreaModal(false);
        } catch (error) {
            console.error('Error creando área:', error);
            Alert.alert('Error', 'No se pudo crear el área');
        }
    };

    const addTaskToArea = async () => {
        if (!newTaskText.trim()) {
            Alert.alert('Error', 'Por favor ingresa el texto de la tarea');
            return;
        }

        try {
            const response = await api.post(`/api/other/todo/${userId}/areas/${selectedArea.id}/tasks`, {
                text: newTaskText.trim(),
                priority: newTaskPriority
            });

            // Actualizar la lista de áreas con la nueva tarea
            setAreas(areas.map(area => 
                area.id === selectedArea.id 
                    ? { ...area, tasks: [...area.tasks, response.data] }
                    : area
            ));

            setNewTaskText('');
            setNewTaskPriority('media');
            setShowNewTaskModal(false);
            setSelectedArea(null);
        } catch (error) {
            console.error('Error creando tarea:', error);
            Alert.alert('Error', 'No se pudo crear la tarea');
        }
    };

    const toggleTask = async (areaId, taskId) => {
        try {
            const response = await api.patch(`/api/other/todo/${userId}/areas/${areaId}/tasks/${taskId}/toggle`);
            
            setAreas(areas.map(area => 
                area.id === areaId 
                    ? {
                        ...area, 
                        tasks: area.tasks.map(task => 
                            task.id === taskId 
                                ? response.data
                                : task
                        )
                    }
                    : area
            ));
        } catch (error) {
            console.error('Error cambiando estado de tarea:', error);
            Alert.alert('Error', 'No se pudo cambiar el estado de la tarea');
        }
    };

    const deleteTask = async (areaId, taskId) => {
        try {
            await api.delete(`/api/other/todo/${userId}/areas/${areaId}/tasks/${taskId}`);
            
            setAreas(areas.map(area => 
                area.id === areaId 
                    ? { ...area, tasks: area.tasks.filter(task => task.id !== taskId) }
                    : area
            ));
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            Alert.alert('Error', 'No se pudo eliminar la tarea');
        }
    };

    const deleteArea = (areaId) => {
        Alert.alert(
            'Eliminar área',
            '¿Estás seguro de que quieres eliminar esta área y todas sus tareas?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/api/other/todo/${userId}/areas/${areaId}`);
                            setAreas(areas.filter(area => area.id !== areaId));
                        } catch (error) {
                            console.error('Error eliminando área:', error);
                            Alert.alert('Error', 'No se pudo eliminar el área');
                        }
                    }
                }
            ]
        );
    };

    // Funciones para edición de tareas
    const startEditingTask = (areaId, task) => {
        setEditingTask({ areaId, taskId: task.id });
        setEditTaskText(task.text);
    };

    const saveTaskEdit = async () => {
        if (!editTaskText.trim()) {
            Alert.alert('Error', 'La tarea no puede estar vacía');
            return;
        }

        try {
            const response = await api.put(`/api/other/todo/${userId}/areas/${editingTask.areaId}/tasks/${editingTask.taskId}`, {
                text: editTaskText.trim()
            });

            setAreas(areas.map(area => 
                area.id === editingTask.areaId 
                    ? {
                        ...area, 
                        tasks: area.tasks.map(task => 
                            task.id === editingTask.taskId 
                                ? response.data
                                : task
                        )
                    }
                    : area
            ));

            setEditingTask(null);
            setEditTaskText('');
        } catch (error) {
            console.error('Error actualizando tarea:', error);
            Alert.alert('Error', 'No se pudo actualizar la tarea');
        }
    };

    const cancelTaskEdit = () => {
        setEditingTask(null);
        setEditTaskText('');
    };

    // =============================
    // UTILITY FUNCTIONS
    // =============================

    const getAreaStats = (area) => {
        const total = area.tasks.length;
        const completed = area.tasks.filter(task => task.completed).length;
        return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAreasAndTasks();
        setRefreshing(false);
    };

    // =============================
    // EFFECTS
    // =============================

    // ✅ Obtener userId del SecureStore al cargar el componente
    useEffect(() => {
        const getUserId = async () => {
            try {
                const storedUserId = await SecureStore.getItemAsync('user_id');
                console.log('✅ TodoScreen - User ID obtenido del storage:', storedUserId);
                
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

    // Cargar datos cuando se obtiene el userId
    useEffect(() => {
        if (userId) {
            loadAreasAndTasks();
        }
    }, [userId]);

    // =============================
    // RENDER FUNCTIONS
    // =============================

    const renderTaskItem = (task, area, isCompleted = false) => {
        const isEditing = editingTask && 
                         editingTask.areaId === area.id && 
                         editingTask.taskId === task.id;

        if (isEditing) {
            return (
                <View key={task.id} style={[
                    styles.taskItem, 
                    styles.editingTaskItem,
                    { backgroundColor: colors.surfaceVariant }
                ]}>
                    <TouchableOpacity 
                        style={styles.taskCheckbox}
                        onPress={() => toggleTask(area.id, task.id)}
                    >
                        {task.completed ? (
                            <CheckCircle2 size={16 * SCALE} color={area.color} />
                        ) : (
                            <Circle size={16 * SCALE} color={area.color} />
                        )}
                    </TouchableOpacity>
                    
                    <TextInput
                        style={[styles.editTaskInput, {
                            backgroundColor: colors.input,
                            borderColor: colors.primary,
                            color: colors.text
                        }]}
                        value={editTaskText}
                        onChangeText={setEditTaskText}
                        autoFocus
                        multiline
                        onBlur={saveTaskEdit}
                        onSubmitEditing={saveTaskEdit}
                        returnKeyType="done"
                        blurOnSubmit={true}
                        placeholderTextColor={colors.placeholder}
                    />
                    
                    <TouchableOpacity 
                        style={styles.saveTaskButton}
                        onPress={saveTaskEdit}
                    >
                        <Check size={16 * SCALE} color={colors.success} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.cancelTaskButton}
                        onPress={cancelTaskEdit}
                    >
                        <X size={16 * SCALE} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View key={task.id} style={[
                styles.taskItem, 
                { borderBottomColor: colors.border },
                isCompleted && styles.completedTask
            ]}>
                <TouchableOpacity 
                    style={styles.taskCheckbox}
                    onPress={() => toggleTask(area.id, task.id)}
                >
                    {task.completed ? (
                        <CheckCircle2 size={16 * SCALE} color={area.color} />
                    ) : (
                        <Circle size={16 * SCALE} color={area.color} />
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.taskTextContainer}
                    onPress={() => startEditingTask(area.id, task)}
                >
                    <Text style={[
                        styles.taskText, 
                        { color: colors.text },
                        isCompleted && { ...styles.completedTaskText, color: colors.textSecondary }
                    ]}>
                        {task.text}
                    </Text>
                </TouchableOpacity>
                
                <View style={[
                    styles.priorityDot,
                    { backgroundColor: priorities.find(p => p.value === task.priority)?.color }
                ]} />
                
                <TouchableOpacity 
                    style={styles.deleteTaskButton}
                    onPress={() => deleteTask(area.id, task.id)}
                >
                    <X size={14 * SCALE} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
        );
    };

    const renderAreaCard = (area) => {
        const stats = getAreaStats(area);
        const incompleteTasks = area.tasks.filter(task => !task.completed);
        const completedTasks = area.tasks.filter(task => task.completed);

        return (
            <View key={area.id} style={[
                styles.areaCard, 
                { 
                    backgroundColor: colors.card,
                    borderLeftColor: area.color,
                    shadowColor: colors.text
                }
            ]}>
                {/* Header del área */}
                <View style={styles.areaHeader}>
                    <View style={styles.areaInfo}>
                        <Text style={styles.areaEmoji}>{area.emoji}</Text>
                        <View style={styles.areaTitleContainer}>
                            <Text style={[styles.areaTitle, { color: colors.text }]}>{area.name}</Text>
                            <Text style={[styles.areaStats, { color: colors.textSecondary }]}>
                                {stats.completed}/{stats.total} tareas • {Math.round(stats.percentage)}%
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.areaMenuButton}
                        onPress={() => deleteArea(area.id)}
                    >
                        <Trash2 size={16 * SCALE} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Barra de progreso */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { 
                                    width: `${stats.percentage}%`,
                                    backgroundColor: area.color 
                                }
                            ]} 
                        />
                    </View>
                </View>

                {/* Lista de tareas incompletas */}
                {incompleteTasks.map(task => renderTaskItem(task, area, false))}

                {/* Tareas completadas (colapsables) */}
                {completedTasks.length > 0 && (
                    <View style={[styles.completedSection, { borderTopColor: colors.border }]}>
                        <Text style={[styles.completedSectionTitle, { color: colors.textSecondary }]}>
                            Completadas ({completedTasks.length})
                        </Text>
                        {completedTasks.slice(0, 3).map(task => renderTaskItem(task, area, true))}
                        {completedTasks.length > 3 && (
                            <Text style={[styles.moreTasksText, { color: colors.textSecondary }]}>
                                +{completedTasks.length - 3} más...
                            </Text>
                        )}
                    </View>
                )}

                {/* Botón agregar tarea */}
                <TouchableOpacity 
                    style={[styles.addTaskButton, { borderColor: area.color }]}
                    onPress={() => {
                        setSelectedArea(area);
                        setShowNewTaskModal(true);
                    }}
                >
                    <Plus size={16 * SCALE} color={area.color} />
                    <Text style={[styles.addTaskText, { color: area.color }]}>
                        Agregar tarea
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading || !userId) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                    {!userId ? 'Verificando sesión...' : 'Cargando áreas...'}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { 
                backgroundColor: colors.surface,
                borderBottomColor: colors.border
            }]}>
                <TouchableOpacity 
                    style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24 * SCALE} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Mis Áreas</Text>
                <TouchableOpacity 
                    style={[styles.addAreaButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowNewAreaModal(true)}
                >
                    <FolderPlus size={24 * SCALE} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Lista de áreas */}
            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
            >
                {areas.map(area => renderAreaCard(area))}
                
                {areas.length === 0 && (
                    <View style={styles.emptyState}>
                        <ListTodo size={48 * SCALE} color={colors.textTertiary} />
                        <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>
                            No hay áreas creadas
                        </Text>
                        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                            Crea tu primera área para organizar tus tareas
                        </Text>
                    </View>
                )}

                <View style={{ height: 80 * SCALE }} />
            </ScrollView>

            {/* Modal Nueva Área */}
            <Modal
                visible={showNewAreaModal}
                transparent={true}
                animationType="slide"
            >
                <KeyboardAvoidingView 
                    style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Nueva Área</Text>
                            <TouchableOpacity onPress={() => setShowNewAreaModal(false)}>
                                <X size={24 * SCALE} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            style={styles.modalScrollView}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre del área</Text>
                            <TextInput
                                style={[styles.modalInput, {
                                    borderColor: colors.border,
                                    backgroundColor: colors.input,
                                    color: colors.text
                                }]}
                                value={newAreaName}
                                onChangeText={setNewAreaName}
                                placeholder="Ej: Trabajo, Personal, Estudios..."
                                placeholderTextColor={colors.placeholder}
                                returnKeyType="done"
                            />

                            <Text style={[styles.inputLabel, { color: colors.text }]}>Emoji</Text>
                            <ScrollView horizontal style={styles.emojiContainer} showsHorizontalScrollIndicator={false}>
                                {emojis.map((emoji, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.emojiButton,
                                            { backgroundColor: colors.surfaceVariant },
                                            newAreaEmoji === emoji && { 
                                                backgroundColor: colors.primary,
                                                borderColor: colors.primary 
                                            }
                                        ]}
                                        onPress={() => setNewAreaEmoji(emoji)}
                                    >
                                        <Text style={styles.emojiText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={[styles.inputLabel, { color: colors.text }]}>Color</Text>
                            <View style={styles.colorContainer}>
                                {availableColors.map((color, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.colorButton,
                                            { backgroundColor: color },
                                            newAreaColor === color && { 
                                                borderColor: colors.text,
                                                borderWidth: 3 
                                            }
                                        ]}
                                        onPress={() => setNewAreaColor(color)}
                                    />
                                ))}
                            </View>
                        </ScrollView>

                        <View style={[styles.modalButtons, { borderTopColor: colors.border }]}>
                            <TouchableOpacity 
                                style={[styles.cancelButton, { backgroundColor: colors.surfaceVariant }]}
                                onPress={() => setShowNewAreaModal(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.createButton, { backgroundColor: newAreaColor }]}
                                onPress={createNewArea}
                            >
                                <Text style={styles.createButtonText}>Crear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Modal Nueva Tarea */}
            <Modal
                visible={showNewTaskModal}
                transparent={true}
                animationType="slide"
            >
                <KeyboardAvoidingView 
                    style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                Nueva Tarea - {selectedArea?.name}
                            </Text>
                            <TouchableOpacity onPress={() => setShowNewTaskModal(false)}>
                                <X size={24 * SCALE} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            style={styles.modalScrollView}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Descripción de la tarea</Text>
                            <TextInput
                                style={[styles.modalInput, styles.multilineInput, {
                                    borderColor: colors.border,
                                    backgroundColor: colors.input,
                                    color: colors.text
                                }]}
                                value={newTaskText}
                                onChangeText={setNewTaskText}
                                placeholder="¿Qué necesitas hacer?"
                                placeholderTextColor={colors.placeholder}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                returnKeyType="done"
                                blurOnSubmit={true}
                            />

                            <Text style={[styles.inputLabel, { color: colors.text }]}>Prioridad</Text>
                            <View style={styles.priorityContainer}>
                                {priorities.map((priority) => (
                                    <TouchableOpacity
                                        key={priority.value}
                                        style={[
                                            styles.priorityButton,
                                            { borderColor: priority.color },
                                            newTaskPriority === priority.value && 
                                            { backgroundColor: priority.color }
                                        ]}
                                        onPress={() => setNewTaskPriority(priority.value)}
                                    >
                                        <Text style={[
                                            styles.priorityText,
                                            { color: priority.color },
                                            newTaskPriority === priority.value && 
                                            { color: '#fff' }
                                        ]}>
                                            {priority.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={[styles.modalButtons, { borderTopColor: colors.border }]}>
                            <TouchableOpacity 
                                style={[styles.cancelButton, { backgroundColor: colors.surfaceVariant }]}
                                onPress={() => setShowNewTaskModal(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.createButton, { backgroundColor: selectedArea?.color }]}
                                onPress={addTaskToArea}
                            >
                                <Text style={styles.createButtonText}>Agregar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16 * SCALE,
        fontSize: 16 * SCALE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20 * SCALE,
        paddingTop: 50 * SCALE,
        paddingBottom: 20 * SCALE,
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
        fontSize: 24 * SCALE,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10 * SCALE,
    },
    addAreaButton: {
        width: 44 * SCALE,
        height: 44 * SCALE,
        borderRadius: 22 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 16 * SCALE,
    },
    areaCard: {
        borderRadius: 12 * SCALE,
        padding: 16 * SCALE,
        marginBottom: 16 * SCALE,
        borderLeftWidth: 4,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    areaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12 * SCALE,
    },
    areaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    areaEmoji: {
        fontSize: 24 * SCALE,
        marginRight: 12 * SCALE,
    },
    areaTitleContainer: {
        flex: 1,
    },
    areaTitle: {
        fontSize: 18 * SCALE,
        fontWeight: 'bold',
    },
    areaStats: {
        fontSize: 12 * SCALE,
        marginTop: 2 * SCALE,
    },
    areaMenuButton: {
        padding: 8 * SCALE,
    },
    progressBarContainer: {
        marginBottom: 16 * SCALE,
    },
    progressBarBackground: {
        height: 4 * SCALE,
        borderRadius: 2 * SCALE,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2 * SCALE,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8 * SCALE,
        borderBottomWidth: 1,
    },
    editingTaskItem: {
        borderRadius: 8 * SCALE,
        marginVertical: 2 * SCALE,
        paddingHorizontal: 8 * SCALE,
    },
    taskCheckbox: {
        marginRight: 12 * SCALE,
        padding: 4 * SCALE,
    },
    taskTextContainer: {
        flex: 1,
    },
    taskText: {
        fontSize: 14 * SCALE,
    },
    editTaskInput: {
        flex: 1,
        fontSize: 14 * SCALE,
        borderRadius: 6 * SCALE,
        paddingHorizontal: 8 * SCALE,
        paddingVertical: 6 * SCALE,
        marginRight: 8 * SCALE,
        borderWidth: 1,
        minHeight: 32 * SCALE,
    },
    saveTaskButton: {
        padding: 6 * SCALE,
        marginRight: 4 * SCALE,
    },
    cancelTaskButton: {
        padding: 6 * SCALE,
    },
    priorityDot: {
        width: 8 * SCALE,
        height: 8 * SCALE,
        borderRadius: 4 * SCALE,
        marginHorizontal: 8 * SCALE,
    },
    deleteTaskButton: {
        padding: 4 * SCALE,
    },
    completedSection: {
        marginTop: 12 * SCALE,
        paddingTop: 12 * SCALE,
        borderTopWidth: 1,
    },
    completedSectionTitle: {
        fontSize: 12 * SCALE,
        fontWeight: '500',
        marginBottom: 8 * SCALE,
    },
    completedTask: {
        opacity: 0.6,
    },
    completedTaskText: {
        textDecorationLine: 'line-through',
    },
    moreTasksText: {
        fontSize: 12 * SCALE,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8 * SCALE,
    },
    addTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12 * SCALE,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8 * SCALE,
        marginTop: 12 * SCALE,
    },
    addTaskText: {
        fontSize: 14 * SCALE,
        fontWeight: '500',
        marginLeft: 8 * SCALE,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80 * SCALE,
    },
    emptyStateTitle: {
        fontSize: 18 * SCALE,
        fontWeight: 'bold',
        marginTop: 16 * SCALE,
    },
    emptyStateText: {
        fontSize: 14 * SCALE,
        textAlign: 'center',
        marginTop: 8 * SCALE,
    },
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20 * SCALE,
        borderTopRightRadius: 20 * SCALE,
        paddingHorizontal: 20 * SCALE,
        paddingTop: 20 * SCALE,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20 * SCALE,
        maxHeight: screenHeight * 0.9,
        minHeight: screenHeight * 0.6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20 * SCALE,
        paddingBottom: 10 * SCALE,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18 * SCALE,
        fontWeight: 'bold',
        flex: 1,
    },
    modalScrollView: {
        flex: 1,
        marginBottom: 20 * SCALE,
    },
    inputLabel: {
        fontSize: 14 * SCALE,
        fontWeight: '500',
        marginBottom: 8 * SCALE,
        marginTop: 16 * SCALE,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 8 * SCALE,
        padding: 12 * SCALE,
        fontSize: 16 * SCALE,
        minHeight: 44 * SCALE,
    },
    multilineInput: {
        minHeight: 80 * SCALE,
        maxHeight: 120 * SCALE,
    },
    emojiContainer: {
        maxHeight: 60 * SCALE,
        marginBottom: 10 * SCALE,
    },
    emojiButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8 * SCALE,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    emojiText: {
        fontSize: 20 * SCALE,
    },
    colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8 * SCALE,
        marginBottom: 10 * SCALE,
    },
    colorButton: {
        width: 36 * SCALE,
        height: 36 * SCALE,
        borderRadius: 18 * SCALE,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: 8 * SCALE,
        marginBottom: 10 * SCALE,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 10 * SCALE,
        borderWidth: 1,
        borderRadius: 8 * SCALE,
        alignItems: 'center',
        minHeight: 40 * SCALE,
        justifyContent: 'center',
    },
    priorityText: {
        fontSize: 14 * SCALE,
        fontWeight: '500',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12 * SCALE,
        paddingTop: 10 * SCALE,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12 * SCALE,
        borderRadius: 8 * SCALE,
        alignItems: 'center',
        minHeight: 44 * SCALE,
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16 * SCALE,
        fontWeight: '500',
    },
    createButton: {
        flex: 1,
        paddingVertical: 12 * SCALE,
        borderRadius: 8 * SCALE,
        alignItems: 'center',
        minHeight: 44 * SCALE,
        justifyContent: 'center',
    },
    createButtonText: {
        fontSize: 16 * SCALE,
        color: '#fff',
        fontWeight: '500',
    },
});

export default TodoScreen;