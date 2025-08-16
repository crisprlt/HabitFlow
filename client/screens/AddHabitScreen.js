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
import { useTheme } from './ThemeContext'; // ✅ Importar el hook del contexto

const SCALE = 1.2;

const AddHabitScreen = ({ navigation }) => {
    const { colors } = useTheme(); // ✅ Usar el contexto de tema

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

    // ✅ Función para obtener colores dinámicos basados en el tema
    const getDifficultyColor = (level, isSelected) => {
        const baseColors = {
            'Fácil': { bg: colors.success + '20', text: colors.success, selectedBg: colors.success + '40' },
            'Medio': { bg: colors.warning + '20', text: colors.warning, selectedBg: colors.warning + '40' },
            'Difícil': { bg: colors.error + '20', text: colors.error, selectedBg: colors.error + '40' }
        };
        
        return {
            backgroundColor: isSelected ? baseColors[level].selectedBg : baseColors[level].bg,
            borderColor: isSelected ? baseColors[level].text : colors.border,
            textColor: isSelected ? baseColors[level].text : colors.textSecondary
        };
    };

    const getPriorityColor = (level, isSelected) => {
        const baseColors = {
            'Baja': { bg: colors.textTertiary + '20', text: colors.textSecondary, selectedBg: colors.textTertiary + '40' },
            'Media': { bg: colors.warning + '20', text: colors.warning, selectedBg: colors.warning + '40' },
            'Alta': { bg: colors.error + '20', text: colors.error, selectedBg: colors.error + '40' }
        };
        
        return {
            backgroundColor: isSelected ? baseColors[level].selectedBg : baseColors[level].bg,
            borderColor: isSelected ? baseColors[level].text : colors.border,
            textColor: isSelected ? baseColors[level].text : colors.textSecondary
        };
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { 
            }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={[styles.backButton, { backgroundColor: colors.cardCompleted }]}
                >
                    <ArrowLeft size={24 * SCALE} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Nuevo Hábito</Text>
                <TouchableOpacity 
                    onPress={validateAndSave} 
                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                >
                    <Check size={24 * SCALE} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Información Básica */}
                <View style={[styles.card, { 
                    backgroundColor: colors.surface,
                    shadowColor: colors.text 
                }]}>
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
                            placeholderTextColor={colors.placeholder}
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
                            placeholderTextColor={colors.placeholder}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notas Adicionales</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { 
                                borderColor: colors.border,
                                backgroundColor: colors.input,
                                color: colors.text 
                            }]}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={2}
                            placeholderTextColor={colors.placeholder}
                        />
                    </View>
                </View>

                {/* Iconos organizados por categorías */}
                <View style={[styles.card, { 
                    backgroundColor: colors.surface,
                    shadowColor: colors.text 
                }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Icono *</Text>
                    
                    {Object.entries(iconCategories).map(([categoryName, categoryIcons]) => (
                        <View key={categoryName} style={styles.iconCategorySection}>
                            <Text style={[styles.iconCategoryTitle, { color: colors.primary }]}>{categoryName}</Text>
                            <View style={styles.iconGrid}>
                                {categoryIcons.map((iconItem, index) => {
                                    const IconComponent = iconItem.icon;
                                    const isSelected = selectedIcon === iconItem.icon;
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
                                            onPress={() => setSelectedIcon(iconItem.icon)}
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

                {/* Categoría con opción personalizada */}
                <View style={[styles.card, { 
                    backgroundColor: colors.surface,
                    shadowColor: colors.text 
                }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Categoría *</Text>
                    
                    <View style={styles.categoryGrid}>
                        {predefinedCategories.map((category, index) => {
                            const isSelected = selectedCategory === category;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.categoryButton,
                                        {
                                            backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                                            borderColor: isSelected ? colors.primary : colors.border
                                        }
                                    ]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        { color: isSelected ? '#fff' : colors.textSecondary }
                                    ]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                        
                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                {
                                    backgroundColor: selectedCategory === 'Personalizada' ? colors.primary : colors.surfaceVariant,
                                    borderColor: selectedCategory === 'Personalizada' ? colors.primary : colors.border
                                }
                            ]}
                            onPress={() => setSelectedCategory('Personalizada')}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: selectedCategory === 'Personalizada' ? '#fff' : colors.textSecondary }
                            ]}>
                                + Personalizada
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {selectedCategory === 'Personalizada' && (
                        <View style={styles.customInputContainer}>
                            <TextInput
                                style={[styles.input, { 
                                    borderColor: colors.border,
                                    backgroundColor: colors.input,
                                    color: colors.text 
                                }]}
                                value={customCategory}
                                onChangeText={setCustomCategory}
                                placeholder="Nombre de la nueva categoría"
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>
                    )}
                </View>

                {/* Meta/Objetivo mejorado */}
                <View style={[styles.card, { 
                    backgroundColor: colors.surface,
                    shadowColor: colors.text 
                }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Meta y Objetivos</Text>
                    
                    <View style={styles.targetContainer}>
                        <TouchableOpacity 
                            style={[styles.adjustButton, { backgroundColor: colors.cardCompleted }]}
                            onPress={() => adjustTargetValue(-1)}
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
                        />
                        
                        <TouchableOpacity 
                            style={[styles.adjustButton, { backgroundColor: colors.cardCompleted }]}
                            onPress={() => adjustTargetValue(1)}
                        >
                            <Plus size={20 * SCALE} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Unidad de Medida</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitsScroll}>
                            {targetUnits.map((unit, index) => {
                                const isSelected = targetUnit === unit;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.unitButton,
                                            {
                                                backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                                                borderColor: isSelected ? colors.primary : colors.border
                                            }
                                        ]}
                                        onPress={() => setTargetUnit(unit)}
                                    >
                                        <Text style={[
                                            styles.unitText,
                                            { color: isSelected ? '#fff' : colors.textSecondary }
                                        ]}>
                                            {unit}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>
                </View>

                {/* Frecuencia mejorada */}
                <View style={[styles.card, { 
                    backgroundColor: colors.surface,
                    shadowColor: colors.text 
                }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Frecuencia *</Text>
                    
                    <View style={styles.frequencyGrid}>
                        {frequencies.map((freq, index) => {
                            const isSelected = frequency === freq;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.frequencyButton,
                                        {
                                            backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                                            borderColor: isSelected ? colors.primary : colors.border
                                        }
                                    ]}
                                    onPress={() => setFrequency(freq)}
                                >
                                    <Text style={[
                                        styles.frequencyText,
                                        { color: isSelected ? '#fff' : colors.textSecondary }
                                    ]}>
                                        {freq}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {frequency === 'Personalizada' && (
                        <View style={styles.customInputContainer}>
                            <TextInput
                                style={[styles.input, { 
                                    borderColor: colors.border,
                                    backgroundColor: colors.input,
                                    color: colors.text 
                                }]}
                                value={customFrequency}
                                onChangeText={setCustomFrequency}
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>
                    )}
                </View>

                {/* Configuración de Recordatorio */}
                <View style={[styles.card, { 
                    backgroundColor: colors.surface,
                    shadowColor: colors.text 
                }]}>
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

                {/* Configuración Avanzada */}
                <View style={[styles.card, { 
                    backgroundColor: colors.surface,
                    shadowColor: colors.text 
                }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Configuración Avanzada</Text>
                    
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Dificultad</Text>
                        <View style={styles.levelContainer}>
                            {difficultyLevels.map((level, index) => {
                                const isSelected = difficulty === level;
                                const colorConfig = getDifficultyColor(level, isSelected);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.levelButton,
                                            {
                                                backgroundColor: colorConfig.backgroundColor,
                                                borderColor: colorConfig.borderColor
                                            }
                                        ]}
                                        onPress={() => setDifficulty(level)}
                                    >
                                        <Text style={[
                                            styles.levelText,
                                            { 
                                                color: colorConfig.textColor,
                                                fontWeight: isSelected ? 'bold' : 'normal'
                                            }
                                        ]}>
                                            {level}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Prioridad</Text>
                        <View style={styles.levelContainer}>
                            {priorityLevels.map((level, index) => {
                                const isSelected = priority === level;
                                const colorConfig = getPriorityColor(level, isSelected);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.levelButton,
                                            {
                                                backgroundColor: colorConfig.backgroundColor,
                                                borderColor: colorConfig.borderColor
                                            }
                                        ]}
                                        onPress={() => setPriority(level)}
                                    >
                                        <Text style={[
                                            styles.levelText,
                                            { 
                                                color: colorConfig.textColor,
                                                fontWeight: isSelected ? 'bold' : 'normal'
                                            }
                                        ]}>
                                            {level}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
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
    },
    levelText: {
        fontSize: 14 * SCALE,
    },
});

export default AddHabitScreen;