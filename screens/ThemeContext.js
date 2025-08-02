import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crear el contexto
const ThemeContext = createContext();

// Hook personalizado para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

// Proveedor del contexto
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'system', 'light', 'dark'

  // Determinar si está en modo oscuro
  const isDarkMode = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  // Cargar preferencia de tema al iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.log('Error cargando tema:', error);
    }
  };

  const saveThemePreference = async (theme) => {
    try {
      await AsyncStorage.setItem('app_theme', theme);
      setThemeMode(theme);
    } catch (error) {
      console.log('Error guardando tema:', error);
    }
  };

  // Definir colores según el tema
  const colors = {
    // Colores de fondo
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    surface: isDarkMode ? '#2d2d2d' : '#ffffff',
    surfaceVariant: isDarkMode ? '#3d3d3d' : '#f5f5f5',
    
    // Colores de texto
    text: isDarkMode ? '#ffffff' : '#333333',
    textSecondary: isDarkMode ? '#b0b0b0' : '#666666',
    textTertiary: isDarkMode ? '#808080' : '#999999',
    
    // Colores principales
    primary: '#968ce4',
    primaryVariant: isDarkMode ? '#7b6fd1' : '#968ce4',
    
    // Colores de tarjetas
    card: isDarkMode ? '#2d2d2d' : '#ffffff',
    cardCompleted: isDarkMode ? '#3d2d4d' : '#f3f0ff',
    
    // Colores de bordes
    border: isDarkMode ? '#404040' : '#f0f0f0',
    borderLight: isDarkMode ? '#404040' : '#e0e0e0',
    
    // Colores de inputs
    input: isDarkMode ? '#3d3d3d' : '#ffffff',
    inputBorder: isDarkMode ? '#555' : '#e0e0e0',
    placeholder: isDarkMode ? '#808080' : '#999999',
    
    // Colores específicos
    iconContainer: isDarkMode ? '#404040' : '#f8f9fa',
    
    // Colores de modal
    modalOverlay: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    modalBackground: isDarkMode ? '#2d2d2d' : '#ffffff',
    
    // Colores de estado
    success: '#4ecdc4',
    warning: '#ffd93d',
    error: '#ff6b6b',
    info: '#54a0ff',
    
    // Colores específicos para TodoScreen
    taskItemBackground: isDarkMode ? '#333333' : '#ffffff',
    completedTaskBackground: isDarkMode ? '#2a2a2a' : '#f8f9fa',
    priorityHigh: '#ff4757',
    priorityMedium: '#ffa502',
    priorityLow: '#2ed573',
  };

  const value = {
    themeMode,
    isDarkMode,
    colors,
    setTheme: saveThemePreference,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};