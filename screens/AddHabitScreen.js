import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert
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
    Zap
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const SCALE = 1.2;

const AddHabitScreen = ({ navigation }) => {
    const [habitName, setHabitName] = useState('');
    const [habitDescription, setHabitDescription] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [targetValue, setTargetValue] = useState('1');
    const [frequency, setFrequency] = useState('Diario');
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Lista de iconos disponibles
    const icons = [
        { icon: Droplets, name: 'Droplets' },
        { icon: Activity, name: 'Activity' },
        { icon: BookOpen, name: 'BookOpen' },
        { icon: Brain, name: 'Brain' },
        { icon: PenTool, name: 'PenTool' },
        { icon: Heart, name: 'Heart' },
        { icon: Coffee, name: 'Coffee' },
        { icon: Moon, name: 'Moon' },
        { icon: Sun, name: 'Sun' },
        { icon: Utensils, name: 'Utensils' },
        { icon: Music, name: 'Music' },
        { icon: Camera, name: 'Camera' },
        { icon: Home, name: 'Home' },
        { icon: Car, name: 'Car' },
        { icon: Briefcase, name: 'Briefcase' },
        { icon: GraduationCap, name: 'GraduationCap' },
        { icon: Dumbbell, name: 'Dumbbell' },
        { icon: Pill, name: 'Pill' },
        { icon: Clock, name: 'Clock' },
        { icon: Target, name: 'Target' },
        { icon: Star, name: 'Star' },
        { icon: Zap, name: 'Zap' }
    ];

    // Categorías disponibles
    const categories = [
        'Salud',
        'Fitness',
        'Educación',
        'Bienestar',
        'Personal',
        'Trabajo',
        'Hogar',
        'Social'
    ];

    // Frecuencias disponibles
    const frequencies = ['Diario', 'Semanal', 'Mensual'];

    const handleSaveHabit = () => {
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

        const newHabit = {
            id: Date.now(),
            name: habitName.trim(),
            description: habitDescription.trim(),
            emoji: selectedEmoji,
            icon: selectedIcon,
            category: selectedCategory,
            target: parseInt(targetValue) || 1,
            frequency: frequency,
            reminderTime: reminderTime.toTimeString().slice(0, 5), // solo "HH:MM"
            completed: false,
            streak: 0,
            current: 0
        };
        // Aquí normalmente guardarías el hábito en tu estado global o base de datos
        console.log('Nuevo hábito:', newHabit);

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
                <TouchableOpacity onPress={handleSaveHabit} style={styles.saveButton}>
                    <Check size={24 * SCALE} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Nombre del hábito */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hábito</Text>
                    <TextInput
                        style={styles.input}
                        value={habitName}
                        onChangeText={setHabitName}
                        placeholder="Hábito"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Descripción */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={habitDescription}
                        onChangeText={setHabitDescription}
                        placeholder="Descripción de tu hábito"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Icono */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Icono</Text>
                    <View style={styles.iconGrid}>
                        {icons.map((iconItem, index) => {
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

                {/* Categoría */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categoría</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map((category, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category && styles.selectedCategory
                                ]}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category && styles.selectedCategoryText
                                    ]}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Meta/Objetivo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Meta Diaria</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.numberInput]}
                            value={targetValue}
                            onChangeText={setTargetValue}
                            placeholder="1"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                        <Text style={styles.unitText}>veces por día</Text>
                    </View>
                </View>

                {/* Frecuencia */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frecuencia</Text>
                    <View style={styles.frequencyContainer}>
                        {frequencies.map((freq, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.frequencyButton,
                                    frequency === freq && styles.selectedFrequency
                                ]}
                                onPress={() => setFrequency(freq)}
                            >
                                <Text
                                    style={[
                                        styles.frequencyText,
                                        frequency === freq && styles.selectedFrequencyText
                                    ]}
                                >
                                    {freq}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recordatorio (Hora) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hora de Recordatorio</Text>
                    <TouchableOpacity
                        style={styles.timePickerButton}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={styles.timeText}>
                            {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableOpacity>
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

                <View style={{ height: 40 * SCALE }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingLeft: 8 * SCALE,
        paddingRight: 8 * SCALE,
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
    section: {
        marginBottom: 24 * SCALE,
    },
    sectionTitle: {
        fontSize: 16 * SCALE,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12 * SCALE,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
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
    emojiButton: {
        width: 60 * SCALE,
        height: 60 * SCALE,
        borderRadius: 25 * SCALE,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12 * SCALE,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedEmoji: {
        backgroundColor: '#968ce4',
        borderColor: '#968ce4',
    },
    emojiText: {
        fontSize: 24 * SCALE,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12 * SCALE,
    },
    iconButton: {
        width: 50 * SCALE,
        height: 50 * SCALE,
        borderRadius: 25 * SCALE,
        backgroundColor: '#f3f0ff',
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
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    numberInput: {
        width: 80 * SCALE,
        textAlign: 'center',
        marginRight: 12 * SCALE,
    },
    unitText: {
        fontSize: 16 * SCALE,
        color: '#666',
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 8 * SCALE,
    },
    frequencyButton: {
        flex: 1,
        paddingVertical: 12 * SCALE,
        borderRadius: 12 * SCALE,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
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
    timePickerButton: {
        padding: 12 * SCALE,
        borderRadius: 12 * SCALE,
        backgroundColor: '#f3f0ff',
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 16 * SCALE,
        color: '#333',
    },
});

export default AddHabitScreen;