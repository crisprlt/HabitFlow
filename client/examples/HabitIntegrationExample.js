// Ejemplo de cómo integrar el servicio de hábitos en AddHabitScreen
import React, { useState, useEffect } from 'react';
import HabitService from '../services/habitService';

// Ejemplo de uso en AddHabitScreen
const HabitIntegrationExample = () => {
  const [categories, setCategories] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías, frecuencias y metas disponibles
      const [categoriesData, frequenciesData, metasData] = await Promise.all([
        HabitService.getCategories(token),
        HabitService.getFrequencies(token),
        HabitService.getMetas(token)
      ]);

      setCategories(categoriesData.data.categories);
      setFrequencies(frequenciesData.data.frequencies);
      setMetas(metasData.data.metas);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las opciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (habitData) => {
    try {
      setLoading(true);
      
      // Preparar los datos según tu estructura de BD
      const habitPayload = {
        userId: habitData.userId,
        name: habitData.name,
        description: habitData.description,
        icono: habitData.selectedIcon, // Solo la referencia del icono
        idCategoria: habitData.selectedCategory,
        idFrecuencia: habitData.selectedFrequency,
        idMeta: habitData.selectedMeta,
        notas: habitData.notes,
        recordatorioActivo: habitData.reminderEnabled,
        horaRecordatorio: habitData.reminderTime
      };

      const response = await HabitService.createHabit(habitPayload, token);
      
      if (response.success) {
        Alert.alert('¡Éxito!', 'Hábito creado correctamente');
        // Navegar de vuelta o limpiar formulario
      }
      
    } catch (error) {
      console.error('Error creando hábito:', error);
      Alert.alert('Error', error.message || 'Error al crear el hábito');
    } finally {
      setLoading(false);
    }
  };

  // Ejemplo de renderizado de opciones
  const renderCategoryOptions = () => {
    return categories.map(category => (
      <option key={category.id_categoria} value={category.id_categoria}>
        {category.descripcion}
      </option>
    ));
  };

  const renderFrequencyOptions = () => {
    return frequencies.map(frequency => (
      <option key={frequency.id_frecuencia} value={frequency.id_frecuencia}>
        {frequency.descripcion}
      </option>
    ));
  };

  const renderMetaOptions = () => {
    return metas.map(meta => (
      <option key={meta.id_meta} value={meta.id_meta}>
        {meta.cantidad} {meta.unidad_medida}
      </option>
    ));
  };

  return (
    <View>
      {/* Aquí irían tus campos de formulario */}
      <Text>Ejemplo de integración con el servicio de hábitos</Text>
      
      {/* Selector de categoría */}
      <Picker
        selectedValue={selectedCategory}
        onValueChange={setSelectedCategory}
      >
        <Picker.Item label="Selecciona una categoría" value="" />
        {renderCategoryOptions()}
      </Picker>

      {/* Selector de frecuencia */}
      <Picker
        selectedValue={selectedFrequency}
        onValueChange={setSelectedFrequency}
      >
        <Picker.Item label="Selecciona una frecuencia" value="" />
        {renderFrequencyOptions()}
      </Picker>

      {/* Selector de meta */}
      <Picker
        selectedValue={selectedMeta}
        onValueChange={setSelectedMeta}
      >
        <Picker.Item label="Selecciona una meta" value="" />
        {renderMetaOptions()}
      </Picker>

      {/* Botón para crear hábito */}
      <TouchableOpacity 
        onPress={() => handleCreateHabit(habitData)}
        disabled={loading}
      >
        <Text>{loading ? 'Creando...' : 'Crear Hábito'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HabitIntegrationExample;
