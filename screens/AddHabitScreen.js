import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Switch
} from 'react-native';
import {
    ArrowLeft,
    Check,
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
    Clock,
    Target,
    Star,
    Zap,
    Plus,
    Minus,
    Calendar,
    Bell,
    Repeat,
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

const SCALE = 1.2;

const AddHabitScreen = ({ navigation }) => {
    const [habitName, setHabitName] = useState('');
    const [habitDescription, setHabitDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [targetValue, setTargetValue] = useState('1');
    const [targetUnit, setTargetUnit] = useState('veces');
    const [frequency, setFrequency] = useState('Diario');
    const [customFrequency, setCustomFrequency] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [difficulty, setDifficulty] = useState('Medio');
    const [priority, setPriority] = useState('Media');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');

    // Lista expandida de iconos organizados por categorías
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
        'Educación y Desarrollo': [
            { icon: BookOpen, name: 'Lectura' },
            { icon: GraduationCap, name: 'Estudio' },
            { icon: PenTool, name: 'Escritura' },
            { icon: Book, name: 'Libros' },
            { icon: Monitor, name: 'Cursos' },
            { icon: Brain, name: 'Aprendizaje' }
        ],
        'Trabajo y Productividad': [
            { icon: Briefcase, name: 'Trabajo' },
            { icon: Target, name: 'Objetivos' },
            { icon: Clock, name: 'Tiempo' },
            { icon: Calendar, name: 'Planificación' },
            { icon: DollarSign, name: 'Finanzas' }
        ],
        'Lifestyle y Hogar': [
            { icon: Home, name: 'Casa' },
            { icon: Utensils, name: 'Cocina' },
            { icon: Coffee, name: 'Café' },
            { icon: ShoppingCart, name: 'Compras' },
            { icon: Car, name: 'Transporte' }
        ],
        'Entretenimiento y Social': [
            { icon: Music, name: 'Música' },
            { icon: Camera, name: 'Fotografía' },
            { icon: Gamepad2, name: 'Juegos' },
            { icon: MessageCircle, name: 'Social' },
            { icon: Headphones, name: 'Podcast' },
            { icon: Palette, name: 'Arte' }
        ],
        'Otros': [
            { icon: Sun, name: 'Mañana' },
            { icon: Star, name: 'Favorito' },
            { icon: Zap, name: 'Energía' },
            { icon: Smile, name: 'Felicidad' },
            { icon: TreePine, name: 'Naturaleza' },
            { icon: Plane, name: 'Viaje' },
            { icon: Smartphone, name: 'Digital' }
        ]
    };

    // Categorías predefinidas con opción de agregar personalizadas
    const predefinedCategories = [
        'Salud', 'Fitness', 'Educación', 'Bienestar', 'Personal', 
        'Trabajo', 'Hogar', 'Social', 'Finanzas', 'Creatividad'
    ];

    // Unidades personalizables para metas
    const targetUnits = [
        'veces', 'minutos', 'horas', 'páginas', 'ejercicios', 
        'vasos', 'km', 'pasos', 'tareas', 'días', 'sesiones'
    ];

    // Frecuencias más flexibles
    const frequencies = [
        'Diario', 'Semanal', 'Mensual', 'Lunes a Viernes', 
        'Fines de semana', 'Personalizada'
    ];

    // Niveles de dificultad
    const difficultyLevels = ['Fácil', 'Medio', 'Difícil'];

    // Niveles de prioridad
    const priorityLevels = ['Baja', 'Media', 'Alta'];

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const adjustTargetValue = (increment) => {
        const currentValue = parseInt(targetValue) || 1;
        const newValue = Math.max(1, currentValue + increment);
        setTargetValue(newValue.toString());
    };

    const validateAndSave = () => {
        // Validaciones más completas
        if (!habitName.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para el hábito');
            return;
        }

        if (!selectedIcon) {
            Alert.alert('Error', 'Por favor selecciona un icono');
            return;
        }

        const finalCategory = selectedCategory === 'Personalizada' ? customCategory : selectedCategory;
        if (!finalCategory) {
            Alert.alert('Error', 'Por favor selecciona o crea una categoría');
            return;
        }

        const finalFrequency = frequency === 'Personalizada' ? customFrequency : frequency;
        if (!finalFrequency) {
            Alert.alert('Error', 'Por favor especifica la frecuencia');
            return;
        }

        const newHabit = {
            id: Date.now(),
            name: habitName.trim(),
            description: habitDescription.trim(),
            icon: selectedIcon,
            category: finalCategory,
            target: parseInt(targetValue) || 1,
            targetUnit: targetUnit,
            frequency: finalFrequency,
            difficulty: difficulty,
            priority: priority,
            reminderEnabled: reminderEnabled,
            reminderTime: reminderEnabled ? reminderTime.toTimeString().slice(0, 5) : null,
            notes: notes.trim(),
            tags: tags,
            completed: false,
            streak: 0,
            current: 0,
            createdAt: new Date().toISOString(),
            lastCompleted: null
        };

        console.log('Nuevo hábito mejorado:', newHabit);
        Alert.alert('¡Éxito!', 'Hábito creado correctamente', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24 * SCALE} color="#968ce4" />
                </TouchableOpacity>
                <Text style={styles.title}>Nuevo Hábito</Text>
                <TouchableOpacity onPress={validateAndSave} style={styles.saveButton}>
                    <Check size={24 * SCALE} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Información Básica */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Información Básica</Text>
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Nombre del Hábito *</Text>
                        <TextInput
                            style={styles.input}
                            value={habitName}
                            onChangeText={setHabitName}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Descripción</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={habitDescription}
                            onChangeText={setHabitDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notas Adicionales</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={2}
                        />
                    </View>
                </View>

                {/* Iconos organizados por categorías */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Icono *</Text>
                    
                    {Object.entries(iconCategories).map(([categoryName, categoryIcons]) => (
                        <View key={categoryName} style={styles.iconCategorySection}>
                            <Text style={styles.iconCategoryTitle}>{categoryName}</Text>
                            <View style={styles.iconGrid}>
                                {categoryIcons.map((iconItem, index) => {
                                    const IconComponent = iconItem.icon;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.iconButton,
                                                selectedIcon === iconItem.icon && styles.selectedIcon
                                            ]}
                                            onPress={() => setSelectedIcon(iconItem.icon)}
                                        >
                                            <IconComponent
                                                size={20 * SCALE}
                                                color={selectedIcon === iconItem.icon ? '#fff' : '#968ce4'}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Categoría con opción personalizada */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Categoría *</Text>
                    
                    <View style={styles.categoryGrid}>
                        {predefinedCategories.map((category, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category && styles.selectedCategory
                                ]}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === category && styles.selectedCategoryText
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        
                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                selectedCategory === 'Personalizada' && styles.selectedCategory
                            ]}
                            onPress={() => setSelectedCategory('Personalizada')}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === 'Personalizada' && styles.selectedCategoryText
                            ]}>
                                + Personalizada
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {selectedCategory === 'Personalizada' && (
                        <View style={styles.customInputContainer}>
                            <TextInput
                                style={styles.input}
                                value={customCategory}
                                onChangeText={setCustomCategory}
                                placeholder="Nombre de la nueva categoría"
                                placeholderTextColor="#999"
                            />
                        </View>
                    )}
                </View>

                {/* Meta/Objetivo mejorado */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Meta y Objetivos</Text>
                    
                    <View style={styles.targetContainer}>
                        <TouchableOpacity 
                            style={styles.adjustButton}
                            onPress={() => adjustTargetValue(-1)}
                        >
                            <Minus size={20 * SCALE} color="#968ce4" />
                        </TouchableOpacity>
                        
                        <TextInput
                            style={[styles.input, styles.numberInput]}
                            value={targetValue}
                            onChangeText={setTargetValue}
                            placeholder="1"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                        
                        <TouchableOpacity 
                            style={styles.adjustButton}
                            onPress={() => adjustTargetValue(1)}
                        >
                            <Plus size={20 * SCALE} color="#968ce4" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Unidad de Medida</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitsScroll}>
                            {targetUnits.map((unit, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.unitButton,
                                        targetUnit === unit && styles.selectedUnit
                                    ]}
                                    onPress={() => setTargetUnit(unit)}
                                >
                                    <Text style={[
                                        styles.unitText,
                                        targetUnit === unit && styles.selectedUnitText
                                    ]}>
                                        {unit}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Frecuencia mejorada */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Frecuencia *</Text>
                    
                    <View style={styles.frequencyGrid}>
                        {frequencies.map((freq, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.frequencyButton,
                                    frequency === freq && styles.selectedFrequency
                                ]}
                                onPress={() => setFrequency(freq)}
                            >
                                <Text style={[
                                    styles.frequencyText,
                                    frequency === freq && styles.selectedFrequencyText
                                ]}>
                                    {freq}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {frequency === 'Personalizada' && (
                        <View style={styles.customInputContainer}>
                            <TextInput
                                style={styles.input}
                                value={customFrequency}
                                onChangeText={setCustomFrequency}
                            />
                        </View>
                    )}
                </View>

                {/* Configuración de Recordatorio */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recordatorios</Text>
                    
                    <View style={styles.reminderToggle}>
                        <View style={styles.reminderInfo}>
                            <Bell size={20 * SCALE} color="#968ce4" />
                            <Text style={styles.reminderText}>Activar recordatorios</Text>
                        </View>
                        <Switch
                            value={reminderEnabled}
                            onValueChange={setReminderEnabled}
                            trackColor={{ false: '#ddd', true: '#968ce4' }}
                            thumbColor={reminderEnabled ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    {reminderEnabled && (
                        <TouchableOpacity
                            style={styles.timePickerButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Clock size={20 * SCALE} color="#968ce4" />
                            <Text style={styles.timeText}>
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

                {/* Configuración Avanzada */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Configuración Avanzada</Text>
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dificultad</Text>
                        <View style={styles.levelContainer}>
                            {difficultyLevels.map((level, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.levelButton,
                                        difficulty === level && styles.selectedLevel,
                                        { backgroundColor: level === 'Fácil' ? '#e8f5e8' : level === 'Medio' ? '#fff4e6' : '#ffe6e6' }
                                    ]}
                                    onPress={() => setDifficulty(level)}
                                >
                                    <Text style={[
                                        styles.levelText,
                                        difficulty === level && styles.selectedLevelText
                                    ]}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Prioridad</Text>
                        <View style={styles.levelContainer}>
                            {priorityLevels.map((level, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.levelButton,
                                        priority === level && styles.selectedLevel,
                                        { backgroundColor: level === 'Baja' ? '#f0f0f0' : level === 'Media' ? '#fff4e6' : '#ffe6e6' }
                                    ]}
                                    onPress={() => setPriority(level)}
                                >
                                    <Text style={[
                                        styles.levelText,
                                        priority === level && styles.selectedLevelText
                                    ]}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 * SCALE }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16 * SCALE,
        paddingTop: 50 * SCALE,
        paddingBottom: 20 * SCALE,
        backgroundColor: '#fff',
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
    saveButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        backgroundColor: '#968ce4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContainer: {
        padding: 16 * SCALE,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16 * SCALE,
        padding: 16 * SCALE,
        marginBottom: 16 * SCALE,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10 * SCALE,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18 * SCALE,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16 * SCALE,
    },
    section: {
        marginBottom: 16 * SCALE,
    },
    sectionTitle: {
        fontSize: 14 * SCALE,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8 * SCALE,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12 * SCALE,
        padding: 12 * SCALE,
        fontSize: 16 * SCALE,
        color: '#333',
        backgroundColor: '#fff',
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
        color: '#968ce4',
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
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedIcon: {
        backgroundColor: '#968ce4',
        borderColor: '#968ce4',
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
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedCategory: {
        backgroundColor: '#968ce4',
        borderColor: '#968ce4',
    },
    categoryText: {
        fontSize: 14 * SCALE,
        color: '#666',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    customInputContainer: {
        marginTop: 12 * SCALE,
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
        backgroundColor: '#f3f0ff',
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
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginRight: 8 * SCALE,
    },
    selectedUnit: {
        backgroundColor: '#968ce4',
        borderColor: '#968ce4',
    },
    unitText: {
        fontSize: 12 * SCALE,
        color: '#666',
    },
    selectedUnitText: {
        color: '#fff',
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
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minWidth: '30%',
        alignItems: 'center',
    },
    selectedFrequency: {
        backgroundColor: '#968ce4',
        borderColor: '#968ce4',
    },
    frequencyText: {
        fontSize: 14 * SCALE,
        color: '#666',
    },
    selectedFrequencyText: {
        color: '#fff',
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
        color: '#333',
        marginLeft: 8 * SCALE,
    },
    timePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12 * SCALE,
        borderRadius: 12 * SCALE,
        backgroundColor: '#f3f0ff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    timeText: {
        fontSize: 16 * SCALE,
        color: '#333',
        marginLeft: 8 * SCALE,
    },
    levelContainer: {
        flexDirection: 'row',
        gap: 8 * SCALE,
    },
    levelButton: {
        flex: 1,
        paddingVertical: 8 * SCALE,
        borderRadius: 12 * SCALE,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedLevel: {
        borderColor: '#968ce4',
        borderWidth: 2,
    },
    levelText: {
        fontSize: 14 * SCALE,
        color: '#666',
    },
    selectedLevelText: {
        color: '#968ce4',
        fontWeight: 'bold',
    },
    tagInputContainer: {
        flexDirection: 'row',
        gap: 8 * SCALE,
        marginBottom: 12 * SCALE,
    },
    addTagButton: {
        width: 40 * SCALE,
        height: 40 * SCALE,
        borderRadius: 20 * SCALE,
        backgroundColor: '#968ce4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8 * SCALE,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#968ce4',
        borderRadius: 16 * SCALE,
        paddingHorizontal: 12 * SCALE,
        paddingVertical: 6 * SCALE,
    },
    tagText: {
        fontSize: 12 * SCALE,
        color: '#fff',
        marginRight: 4 * SCALE,
    },
    tagRemove: {
        fontSize: 16 * SCALE,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AddHabitScreen;