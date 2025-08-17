import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Switch,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    Dimensions
} from 'react-native';
import {
    ArrowLeft,
    Check,
    Plus,
    Minus,
    Clock,
    Bell,
    Edit3,
    Trash2,
    X,
    // Iconos para hábitos
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
    Target,
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from './ThemeContext';
import api from '../services/api';

const SCALE = 1.2;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AddHabitScreen = ({ navigation, route }) => {
    const { colors } = useTheme();
    
    // Estados para el teclado
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
    // Determinar si estamos editando o creando
    const habitToEdit = route.params?.habitToEdit;
    const isEditing = !!habitToEdit;

    // Estados básicos del hábito
    const [habitName, setHabitName] = useState(habitToEdit?.nombre || '');
    const [habitDescription, setHabitDescription] = useState(habitToEdit?.descripcion || '');
    const [selectedIcon, setSelectedIcon] = useState(habitToEdit?.icono || '');
    const [selectedCategory, setSelectedCategory] = useState(habitToEdit?.categoria || '');
    const [targetValue, setTargetValue] = useState(habitToEdit?.target?.toString() || '1');
    const [targetUnit, setTargetUnit] = useState(habitToEdit?.target_unit || 'veces');
    const [frequency, setFrequency] = useState(habitToEdit?.frecuencia || 'Diario');
    const [reminderEnabled, setReminderEnabled] = useState(habitToEdit?.recordatorio_activo || false);
    const [reminderTime, setReminderTime] = useState(() => {
        if (habitToEdit?.hora_recordatorio) {
            const [hours, minutes] = habitToEdit.hora_recordatorio.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return date;
        }
        return new Date();
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [notes, setNotes] = useState(habitToEdit?.notas || '');

    // Estados para datos del backend
    const [categories, setCategories] = useState([]);
    const [frequencies, setFrequencies] = useState([]);
    const [units, setUnits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Estados para modales de mantenimiento
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showFrequencyModal, setShowFrequencyModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editItemName, setEditItemName] = useState('');

    // Listeners para el teclado
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            setIsKeyboardVisible(true);
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    // Función para cerrar el teclado
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    // Iconos organizados eficientemente
    const iconCategories = {
        'Salud y Fitness': [
            { icon: Activity, name: 'Ejercicio' },
            { icon: Heart, name: 'Cardio' },
            { icon: Dumbbell, name: 'Fuerza' },
            { icon: Droplets, name: 'Agua' },
            { icon: Pill, name: 'Medicina' },
            { icon: Moon, name: 'Sueño' },
            { icon: Brain, name: 'Mental' },
            { icon: TrendingUp, name: 'Progreso' }
        ],
        'Educación': [
            { icon: BookOpen, name: 'Lectura' },
            { icon: GraduationCap, name: 'Estudio' },
            { icon: PenTool, name: 'Escritura' },
            { icon: Book, name: 'Libros' },
            { icon: Monitor, name: 'Cursos' },
            { icon: Brain, name: 'Aprendizaje' }
        ],
        'Trabajo': [
            { icon: Briefcase, name: 'Trabajo' },
            { icon: Target, name: 'Objetivos' },
            { icon: Clock, name: 'Tiempo' },
            { icon: DollarSign, name: 'Finanzas' }
        ],
        'Estilo de Vida': [
            { icon: Home, name: 'Casa' },
            { icon: Utensils, name: 'Cocina' },
            { icon: Coffee, name: 'Café' },
            { icon: ShoppingCart, name: 'Compras' },
            { icon: Car, name: 'Transporte' },
            { icon: Sun, name: 'Mañana' },
            { icon: Smile, name: 'Felicidad' }
        ],
        'Entretenimiento': [
            { icon: Music, name: 'Música' },
            { icon: Camera, name: 'Fotografía' },
            { icon: Gamepad2, name: 'Juegos' },
            { icon: MessageCircle, name: 'Social' },
            { icon: Headphones, name: 'Podcast' },
            { icon: Palette, name: 'Arte' },
            { icon: Star, name: 'Favorito' },
            { icon: Zap, name: 'Energía' },
            { icon: TreePine, name: 'Naturaleza' },
            { icon: Plane, name: 'Viaje' },
            { icon: Smartphone, name: 'Digital' }
        ]
    };

    // Obtener datos del backend al cargar
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [categoriesRes, frequenciesRes, unitsRes] = await Promise.all([
                api.get('/api/habit/categories'),
                api.get('/api/habit/frequencies'),
                api.get('/api/habit/units')
            ]);

            setCategories(categoriesRes.data.data.categories || []);
            setFrequencies(frequenciesRes.data.data.frequencies || []);
            setUnits(unitsRes.data.data.units || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
        }
    };

    // Crear nuevo elemento (categoría, frecuencia o unidad)
    const createNewItem = async (type, name) => {
        if (!name.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = `/api/habit/${type}`;
            const response = await api.post(endpoint, { descripcion: name.trim() });

            if (response.data.success) {
                await loadInitialData();
                
                if (type === 'categories') setSelectedCategory(name.trim());
                else if (type === 'frequencies') setFrequency(name.trim());
                else if (type === 'units') setTargetUnit(name.trim());

                setNewItemName('');
                closeAllModals();
                Alert.alert('Éxito', `${type.slice(0, -1)} creado exitosamente`);
            }
        } catch (error) {
            console.error(`Error creando ${type}:`, error);
            const message = error.response?.data?.message || `Error al crear ${type}`;
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    // Editar elemento existente
    const editItem = async (type, id, newName) => {
        if (!newName.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = `/api/habit/${type}/${id}`;
            const response = await api.put(endpoint, { descripcion: newName.trim() });

            if (response.data.success) {
                await loadInitialData();
                setEditingItem(null);
                setEditItemName('');
                Alert.alert('Éxito', 'Elemento actualizado exitosamente');
            }
        } catch (error) {
            console.error(`Error editando ${type}:`, error);
            const message = error.response?.data?.message || `Error al editar ${type}`;
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    // Iniciar edición de elemento
    const startEditItem = (item) => {
        setEditingItem(item);
        setEditItemName(item.descripcion);
    };

    // Cancelar edición
    const cancelEditItem = () => {
        setEditingItem(null);
        setEditItemName('');
    };

    // Eliminar elemento
    const deleteItem = async (type, id) => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que quieres eliminar este elemento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/api/habit/${type}/${id}`);
                            await loadInitialData();
                            Alert.alert('Éxito', 'Elemento eliminado');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el elemento');
                        }
                    }
                }
            ]
        );
    };

    // Eliminar hábito
    const deleteHabit = async () => {
        Alert.alert(
            'Eliminar Hábito',
            '¿Estás seguro de que quieres eliminar este hábito? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            const response = await api.delete(`/api/habit/delete/${habitToEdit.id_habito}`);
                            
                            if (response.data.success) {
                                Alert.alert('¡Eliminado!', 'El hábito ha sido eliminado correctamente', [
                                    { text: 'OK', onPress: () => navigation.goBack() }
                                ]);
                            }
                        } catch (error) {
                            console.error('Error eliminando hábito:', error);
                            Alert.alert('Error', 'No se pudo eliminar el hábito');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const closeAllModals = () => {
        setShowCategoryModal(false);
        setShowFrequencyModal(false);
        setShowUnitModal(false);
        setNewItemName('');
        setEditingItem(null);
        setEditItemName('');
    };

    const adjustTargetValue = (increment) => {
        const currentValue = parseInt(targetValue) || 1;
        const newValue = Math.max(1, currentValue + increment);
        setTargetValue(newValue.toString());
    };

    const validateAndSave = async () => {
        // Validaciones
        if (!habitName.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para el hábito');
            return;
        }

        if (!selectedIcon) {
            Alert.alert('Error', 'Por favor selecciona un icono');
            return;
        }

        if (!selectedCategory) {
            Alert.alert('Error', 'Por favor selecciona una categoría');
            return;
        }

        setIsLoading(true);

        try {
            const habitData = {
                userId: 1,
                name: habitName.trim(),
                description: habitDescription.trim(),
                notes: notes.trim(),
                icon: selectedIcon,
                category: selectedCategory,
                target: parseInt(targetValue) || 1,
                targetUnit: targetUnit,
                frequency: frequency,
                reminderEnabled: reminderEnabled,
                reminderTime: reminderEnabled ? reminderTime.toTimeString().slice(0, 5) : null
            };

            let response;
            if (isEditing) {
                response = await api.put(`/api/habit/update/${habitToEdit.id_habito}`, habitData);
            } else {
                response = await api.post('/api/habit/create', habitData);
            }

            if (response.data.success) {
                const message = isEditing ? 'Hábito actualizado correctamente' : 'Hábito creado correctamente';
                Alert.alert('¡Éxito!', message, [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error('Error guardando hábito:', error);
            const message = error.response?.data?.message || 'Error al guardar el hábito';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    // Modal para mantenimiento de elementos con diseño mejorado y más grande
    const renderMaintenanceModal = (title, items, type, showModal, setShowModal) => (
        <Modal
            visible={showModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowModal(false)}
        >
            <KeyboardAvoidingView 
                style={styles.modalOverlay} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                                {/* Header del modal */}
                                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                                        Gestionar {title}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => setShowModal(false)}
                                        style={[styles.closeButton, { backgroundColor: colors.surfaceVariant }]}
                                        activeOpacity={0.7}
                                    >
                                        <X size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Sección para agregar nuevo elemento */}
                                <View style={[styles.addNewSection, { borderBottomColor: colors.border }]}>
                                    <Text style={[styles.addNewTitle, { color: colors.textSecondary }]}>
                                        Agregar nuevo {title.toLowerCase().slice(0, -1)}
                                    </Text>
                                    <View style={styles.addNewInput}>
                                        <TextInput
                                            style={[styles.modalInput, { 
                                                borderColor: colors.border,
                                                backgroundColor: colors.input,
                                                color: colors.text,
                                                flex: 1
                                            }]}
                                            value={newItemName}
                                            onChangeText={setNewItemName}
                                            placeholder={`Nombre del ${title.toLowerCase().slice(0, -1)}`}
                                            placeholderTextColor={colors.placeholder}
                                            returnKeyType="done"
                                            onSubmitEditing={() => createNewItem(type, newItemName)}
                                        />
                                        <TouchableOpacity
                                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                                            onPress={() => createNewItem(type, newItemName)}
                                            disabled={isLoading}
                                            activeOpacity={0.7}
                                        >
                                            <Plus size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Lista de elementos existentes */}
                                <View style={styles.itemsListContainer}>
                                    <Text style={[styles.itemsListTitle, { color: colors.textSecondary }]}>
                                        {title} existentes
                                    </Text>
                                    
                                    {items.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                                                No hay {title.toLowerCase()} disponibles
                                            </Text>
                                        </View>
                                    ) : (
                                        <FlatList
                                            data={items}
                                            keyExtractor={(item) => item.id_categoria || item.id_frecuencia || item.id_unidad_medida}
                                            renderItem={({ item, index }) => {
                                                const itemId = item.id_categoria || item.id_frecuencia || item.id_unidad_medida;
                                                const isEditingThisItem = editingItem && (editingItem.id_categoria === itemId || editingItem.id_frecuencia === itemId || editingItem.id_unidad_medida === itemId);
                                                
                                                return (
                                                    <View style={[
                                                        styles.itemRow, 
                                                        { 
                                                            borderBottomColor: colors.border,
                                                            backgroundColor: index % 2 === 0 ? colors.background + '50' : 'transparent'
                                                        }
                                                    ]}>
                                                        {isEditingThisItem ? (
                                                            <View style={styles.editingRow}>
                                                                <TextInput
                                                                    style={[styles.editInput, {
                                                                        borderColor: colors.border,
                                                                        backgroundColor: colors.input,
                                                                        color: colors.text,
                                                                        flex: 1
                                                                    }]}
                                                                    value={editItemName}
                                                                    onChangeText={setEditItemName}
                                                                    placeholder="Nuevo nombre"
                                                                    placeholderTextColor={colors.placeholder}
                                                                    autoFocus
                                                                    returnKeyType="done"
                                                                    onSubmitEditing={() => editItem(type, itemId, editItemName)}
                                                                />
                                                                <View style={styles.editActions}>
                                                                    <TouchableOpacity
                                                                        style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}
                                                                        onPress={cancelEditItem}
                                                                        activeOpacity={0.7}
                                                                    >
                                                                        <X size={18} color={colors.textSecondary} />
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                                                                        onPress={() => editItem(type, itemId, editItemName)}
                                                                        activeOpacity={0.7}
                                                                    >
                                                                        <Check size={18} color={colors.primary} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        ) : (
                                                            <>
                                                                <View style={styles.itemInfo}>
                                                                    <Text style={[styles.itemText, { color: colors.text }]}>
                                                                        {item.descripcion}
                                                                    </Text>
                                                                </View>
                                                                <View style={styles.itemActions}>
                                                                    <TouchableOpacity
                                                                        style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
                                                                        onPress={() => startEditItem(item)}
                                                                        activeOpacity={0.7}
                                                                    >
                                                                        <Edit3 size={18} color={colors.primary} />
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
                                                                        onPress={() => deleteItem(type, itemId)}
                                                                        activeOpacity={0.7}
                                                                    >
                                                                        <Trash2 size={18} color={colors.error} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </>
                                                        )}
                                                    </View>
                                                );
                                            }}
                                            style={styles.itemsList}
                                            keyboardShouldPersistTaps="handled"
                                            showsVerticalScrollIndicator={true}
                                            contentContainerStyle={styles.itemsListContent}
                                            bounces={true}
                                            scrollEventThrottle={16}
                                            removeClippedSubviews={false}
                                        />
                                    )}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
                        >
                            <ArrowLeft size={24 * SCALE} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {isEditing ? 'Editar Hábito' : 'Nuevo Hábito'}
                        </Text>
                        <View style={styles.headerActions}>
                            {isEditing && (
                                <TouchableOpacity 
                                    onPress={deleteHabit} 
                                    style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]}
                                    disabled={isLoading}
                                >
                                    <Trash2 size={20 * SCALE} color={colors.error} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity 
                                onPress={validateAndSave} 
                                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                disabled={isLoading}
                            >
                                <Check size={24 * SCALE} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView 
                        contentContainerStyle={[
                            styles.scrollContainer,
                            { paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 20 }
                        ]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Información Básica */}
                        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Información Básica</Text>
                            
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Nombre del Hábito *</Text>
                                <TextInput
                                    style={[styles.input, { 
                                        borderColor: colors.border,
                                        backgroundColor: colors.input,
                                        color: colors.text 
                                    }]}
                                    value={habitName}
                                    onChangeText={setHabitName}
                                    placeholder="Ej: Leer 30 minutos"
                                    placeholderTextColor={colors.placeholder}
                                    returnKeyType="next"
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Descripción</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { 
                                        borderColor: colors.border,
                                        backgroundColor: colors.input,
                                        color: colors.text 
                                    }]}
                                    value={habitDescription}
                                    onChangeText={setHabitDescription}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Describe tu hábito..."
                                    placeholderTextColor={colors.placeholder}
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* Iconos organizados por categorías */}
                        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Icono *</Text>
                            
                            {Object.entries(iconCategories).map(([categoryName, categoryIcons]) => (
                                <View key={categoryName} style={styles.iconCategorySection}>
                                    <Text style={[styles.iconCategoryTitle, { color: colors.primary }]}>{categoryName}</Text>
                                    <View style={styles.iconGrid}>
                                        {categoryIcons.map((iconItem, index) => {
                                            const IconComponent = iconItem.icon;
                                            const isSelected = selectedIcon === iconItem.name;
                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.iconButton,
                                                        { 
                                                            backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                                                            borderColor: isSelected ? colors.primary : colors.border
                                                        }
                                                    ]}
                                                    onPress={() => setSelectedIcon(iconItem.name)}
                                                    activeOpacity={0.7}
                                                >
                                                    <IconComponent
                                                        size={20 * SCALE}
                                                        color={isSelected ? '#fff' : colors.primary}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Categoría con mantenimiento */}
                        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            <View style={styles.cardHeaderWithAction}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Categoría *</Text>
                                <TouchableOpacity
                                    style={[styles.manageButton, { backgroundColor: colors.primary + '20' }]}
                                    onPress={() => setShowCategoryModal(true)}
                                    activeOpacity={0.7}
                                >
                                    <Edit3 size={16} color={colors.primary} />
                                    <Text style={[styles.manageButtonText, { color: colors.primary }]}>Gestionar</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.categoryGrid}>
                                {categories.map((category) => {
                                    const isSelected = selectedCategory === category.descripcion;
                                    return (
                                        <TouchableOpacity
                                            key={category.id_categoria}
                                            style={[
                                                styles.categoryButton,
                                                {
                                                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                                                    borderColor: isSelected ? colors.primary : colors.border
                                                }
                                            ]}
                                            onPress={() => setSelectedCategory(category.descripcion)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.categoryText,
                                                { color: isSelected ? '#fff' : colors.textSecondary }
                                            ]}>
                                                {category.descripcion}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>

                        {/* Meta y Objetivos con mantenimiento de unidades */}
                        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Meta y Objetivos</Text>
                            
                            <View style={styles.targetContainer}>
                                <TouchableOpacity 
                                    style={[styles.adjustButton, { backgroundColor: colors.cardCompleted }]}
                                    onPress={() => adjustTargetValue(-1)}
                                    activeOpacity={0.7}
                                >
                                    <Minus size={20 * SCALE} color={colors.primary} />
                                </TouchableOpacity>
                                
                                <TextInput
                                    style={[styles.input, styles.numberInput, { 
                                        borderColor: colors.border,
                                        backgroundColor: colors.input,
                                        color: colors.text 
                                    }]}
                                    value={targetValue}
                                    onChangeText={setTargetValue}
                                    placeholder="1"
                                    placeholderTextColor={colors.placeholder}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                />
                                
                                <TouchableOpacity 
                                    style={[styles.adjustButton, { backgroundColor: colors.cardCompleted }]}
                                    onPress={() => adjustTargetValue(1)}
                                    activeOpacity={0.7}
                                >
                                    <Plus size={20 * SCALE} color={colors.primary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.cardHeaderWithAction}>
                                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Unidad de Medida</Text>
                                    <TouchableOpacity
                                        style={[styles.manageButton, { backgroundColor: colors.primary + '20' }]}
                                        onPress={() => setShowUnitModal(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Edit3 size={14} color={colors.primary} />
                                        <Text style={[styles.manageButtonText, { color: colors.primary, fontSize: 12 }]}>Gestionar</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitsScroll}>
                                    {units.map((unit) => {
                                        const isSelected = targetUnit === unit.descripcion;
                                        return (
                                            <TouchableOpacity
                                                key={unit.id_unidad_medida}
                                                style={[
                                                    styles.unitButton,
                                                    {
                                                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                                                        borderColor: isSelected ? colors.primary : colors.border
                                                    }
                                                ]}
                                                onPress={() => setTargetUnit(unit.descripcion)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.unitText,
                                                    { color: isSelected ? '#fff' : colors.textSecondary }
                                                ]}>
                                                    {unit.descripcion}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Frecuencia con mantenimiento */}
                        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            <View style={styles.cardHeaderWithAction}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Frecuencia *</Text>
                                <TouchableOpacity
                                    style={[styles.manageButton, { backgroundColor: colors.primary + '20' }]}
                                    onPress={() => setShowFrequencyModal(true)}
                                    activeOpacity={0.7}
                                >
                                    <Edit3 size={16} color={colors.primary} />
                                    <Text style={[styles.manageButtonText, { color: colors.primary }]}>Gestionar</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.frequencyGrid}>
                                {frequencies.map((freq) => {
                                    const isSelected = frequency === freq.descripcion;
                                    return (
                                        <TouchableOpacity
                                            key={freq.id_frecuencia}
                                            style={[
                                                styles.frequencyButton,
                                                {
                                                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                                                    borderColor: isSelected ? colors.primary : colors.border
                                                }
                                            ]}
                                            onPress={() => setFrequency(freq.descripcion)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.frequencyText,
                                                { color: isSelected ? '#fff' : colors.textSecondary }
                                            ]}>
                                                {freq.descripcion}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>

                        {/* Configuración de Recordatorio */}
                        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Recordatorios</Text>
                            
                            <View style={styles.reminderToggle}>
                                <View style={styles.reminderInfo}>
                                    <Bell size={20 * SCALE} color={colors.primary} />
                                    <Text style={[styles.reminderText, { color: colors.text }]}>Activar recordatorios</Text>
                                </View>
                                <Switch
                                    value={reminderEnabled}
                                    onValueChange={setReminderEnabled}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                    thumbColor={reminderEnabled ? '#fff' : colors.surfaceVariant}
                                />
                            </View>

                            {reminderEnabled && (
                                <TouchableOpacity
                                    style={[styles.timePickerButton, { 
                                        backgroundColor: colors.cardCompleted,
                                        borderColor: colors.border 
                                    }]}
                                    onPress={() => setShowTimePicker(true)}
                                    activeOpacity={0.7}
                                >
                                    <Clock size={20 * SCALE} color={colors.primary} />
                                    <Text style={[styles.timeText, { color: colors.text }]}>
                                        {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    mode="time"
                                    value={reminderTime}
                                    is24Hour={true}
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowTimePicker(false);
                                        if (selectedDate) setReminderTime(selectedDate);
                                    }}
                                />
                            )}
                        </View>

                        {/* Notas Adicionales */}
                        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Notas Adicionales</Text>
                            
                            <View style={styles.section}>
                                <TextInput
                                    style={[styles.input, styles.textArea, { 
                                        borderColor: colors.border,
                                        backgroundColor: colors.input,
                                        color: colors.text 
                                    }]}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Notas sobre este hábito..."
                                    placeholderTextColor={colors.placeholder}
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* Espacio adicional para evitar que el teclado tape el contenido */}
                        <View style={{ height: 40 * SCALE }} />
                    </ScrollView>

                    {/* Modales de mantenimiento */}
                    {renderMaintenanceModal('Categorías', categories, 'categories', showCategoryModal, setShowCategoryModal)}
                    {renderMaintenanceModal('Frecuencias', frequencies, 'frequencies', showFrequencyModal, setShowFrequencyModal)}
                    {renderMaintenanceModal('Unidades', units, 'units', showUnitModal, setShowUnitModal)}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16 * SCALE,
        paddingTop: 50 * SCALE,
        paddingBottom: 20 * SCALE
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
        flex: 1,
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8 * SCALE,
    },
    deleteButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContainer: {
        padding: 16 * SCALE,
    },
    card: {
        borderRadius: 16 * SCALE,
        padding: 16 * SCALE,
        marginBottom: 16 * SCALE,
        shadowOpacity: 0.05,
        shadowRadius: 10 * SCALE,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18 * SCALE,
        fontWeight: 'bold',
        marginBottom: 16 * SCALE,
    },
    cardHeaderWithAction: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16 * SCALE,
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12 * SCALE,
        paddingVertical: 6 * SCALE,
        borderRadius: 20 * SCALE,
    },
    manageButtonText: {
        fontSize: 12 * SCALE,
        fontWeight: '600',
        marginLeft: 4 * SCALE,
    },
    section: {
        marginBottom: 16 * SCALE,
    },
    sectionTitle: {
        fontSize: 14 * SCALE,
        fontWeight: '600',
        marginBottom: 8 * SCALE,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12 * SCALE,
        padding: 12 * SCALE,
        fontSize: 16 * SCALE,
    },
    textArea: {
        height: 80 * SCALE,
        textAlignVertical: 'top',
    },
    iconCategorySection: {
        marginBottom: 20 * SCALE,
    },
    iconCategoryTitle: {
        fontSize: 14 * SCALE,
        fontWeight: '600',
        marginBottom: 8 * SCALE,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8 * SCALE,
    },
    iconButton: {
        width: 45 * SCALE,
        height: 45 * SCALE,
        borderRadius: 12 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8 * SCALE,
    },
    categoryButton: {
        paddingHorizontal: 16 * SCALE,
        paddingVertical: 8 * SCALE,
        borderRadius: 20 * SCALE,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 14 * SCALE,
    },
    targetContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16 * SCALE,
    },
    adjustButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 12 * SCALE,
    },
    numberInput: {
        width: 80 * SCALE,
        textAlign: 'center',
    },
    unitsScroll: {
        marginBottom: 8 * SCALE,
    },
    unitButton: {
        paddingHorizontal: 12 * SCALE,
        paddingVertical: 6 * SCALE,
        borderRadius: 16 * SCALE,
        borderWidth: 1,
        marginRight: 8 * SCALE,
    },
    unitText: {
        fontSize: 12 * SCALE,
    },
    frequencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8 * SCALE,
    },
    frequencyButton: {
        paddingHorizontal: 16 * SCALE,
        paddingVertical: 8 * SCALE,
        borderRadius: 20 * SCALE,
        borderWidth: 1,
        minWidth: '30%',
        alignItems: 'center',
    },
    frequencyText: {
        fontSize: 14 * SCALE,
    },
    reminderToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12 * SCALE,
    },
    reminderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reminderText: {
        fontSize: 16 * SCALE,
        marginLeft: 8 * SCALE,
    },
    timePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12 * SCALE,
        borderRadius: 12 * SCALE,
        borderWidth: 1,
    },
    timeText: {
        fontSize: 16 * SCALE,
        marginLeft: 8 * SCALE,
    },
    
    // Estilos mejorados para modales más grandes y funcionales
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20 * SCALE,
    },
    modalContainer: {
        width: SCREEN_WIDTH * 0.92,
        maxWidth: 500 * SCALE,
        maxHeight: SCREEN_HEIGHT * 0.85,
        minHeight: SCREEN_HEIGHT * 0.6,
        borderRadius: 24 * SCALE,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24 * SCALE,
        paddingTop: 24 * SCALE,
        paddingBottom: 20 * SCALE,
        borderBottomWidth: 1.5,
    },
    modalTitle: {
        fontSize: 22 * SCALE,
        fontWeight: 'bold',
        flex: 1,
    },
    closeButton: {
        width: 36 * SCALE,
        height: 36 * SCALE,
        borderRadius: 18 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addNewSection: {
        paddingHorizontal: 24 * SCALE,
        paddingVertical: 20 * SCALE,
        borderBottomWidth: 1,
    },
    addNewTitle: {
        fontSize: 16 * SCALE,
        fontWeight: '600',
        marginBottom: 12 * SCALE,
    },
    addNewInput: {
        flexDirection: 'row',
        gap: 12 * SCALE,
        alignItems: 'stretch',
    },
    modalInput: {
        borderWidth: 1.5,
        borderRadius: 14 * SCALE,
        paddingHorizontal: 16 * SCALE,
        paddingVertical: 14 * SCALE,
        fontSize: 16 * SCALE,
        minHeight: 52 * SCALE,
    },
    addButton: {
        width: 52 * SCALE,
        height: 52 * SCALE,
        borderRadius: 26 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    itemsListContainer: {
        flex: 1,
        paddingHorizontal: 24 * SCALE,
        paddingTop: 16 * SCALE,
        paddingBottom: 24 * SCALE,
    },
    itemsListTitle: {
        fontSize: 16 * SCALE,
        fontWeight: '600',
        marginBottom: 16 * SCALE,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40 * SCALE,
    },
    emptyStateText: {
        fontSize: 16 * SCALE,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    itemsList: {
        flex: 1,
        paddingHorizontal: 4 * SCALE,
    },
    itemsListContent: {
        paddingBottom: 20 * SCALE,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18 * SCALE,
        paddingHorizontal: 16 * SCALE,
        borderBottomWidth: 1,
        borderRadius: 12 * SCALE,
        marginBottom: 4 * SCALE,
        marginHorizontal: 2 * SCALE,
    },
    itemInfo: {
        flex: 1,
        marginRight: 12 * SCALE,
    },
    itemText: {
        fontSize: 16 * SCALE,
        fontWeight: '500',
    },
    itemActions: {
        flexDirection: 'row',
        gap: 10 * SCALE,
    },
    actionButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12 * SCALE,
    },
    editInput: {
        borderWidth: 1.5,
        borderRadius: 12 * SCALE,
        paddingHorizontal: 14 * SCALE,
        paddingVertical: 12 * SCALE,
        fontSize: 16 * SCALE,
        minHeight: 44 * SCALE,
    },
    editActions: {
        flexDirection: 'row',
        gap: 8 * SCALE,
    },
});

export default AddHabitScreen;