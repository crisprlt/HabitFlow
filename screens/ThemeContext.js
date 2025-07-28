// ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme(); // Hook nativo de React Native
  const [themeMode, setThemeMode] = useState('system'); // 'system', 'manual'
  const [manualTheme, setManualTheme] = useState(null); // Para override manual

  // Determinar el tema actual basado en la configuración
  const isDarkMode = (() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    if (themeMode === 'manual' && manualTheme !== null) {
      return manualTheme;
    }
    return systemColorScheme === 'dark'; // fallback
  })();

  // Cargar configuración guardada al inicializar
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Escuchar cambios en el tema del sistema
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('Sistema cambió a:', colorScheme);
      // Solo reaccionar si estamos en modo sistema
      if (themeMode === 'system') {
        // El estado se actualiza automáticamente por useColorScheme
      }
    });

    return () => subscription?.remove();
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      const savedManualTheme = await AsyncStorage.getItem('manualTheme');
      
      if (savedMode) {
        setThemeMode(savedMode);
      }
      if (savedManualTheme !== null) {
        setManualTheme(JSON.parse(savedManualTheme));
      }
    } catch (error) {
      console.log('Error cargando preferencia de tema:', error);
    }
  };

  const saveThemePreference = async (mode, manual = null) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      if (manual !== null) {
        await AsyncStorage.setItem('manualTheme', JSON.stringify(manual));
      }
    } catch (error) {
      console.log('Error guardando preferencia de tema:', error);
    }
  };

  // Cambiar a modo sistema (heredar del teléfono)
  const setSystemTheme = () => {
    setThemeMode('system');
    setManualTheme(null);
    saveThemePreference('system');
  };

  // Cambiar manualmente (override del sistema)
  const setManualThemeFunc = (isDark) => {
    setThemeMode('manual');
    setManualTheme(isDark);
    saveThemePreference('manual', isDark);
  };

  // Toggle simple (alterna entre claro y oscuro manual)
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setManualThemeFunc(newTheme);
  };

  // Definir los colores para cada tema
  const theme = {
    isDarkMode,
    themeMode, // 'system', 'manual'
    systemColorScheme, // El tema actual del sistema
    colors: {
      // Colores de fondo
      background: isDarkMode ? '#1a1a1a' : '#ffffff',
      surface: isDarkMode ? '#2d2d2d' : '#ffffff',
      surfaceVariant: isDarkMode ? '#3d3d3d' : '#f5f5f5',
      
      // Colores de texto
      text: isDarkMode ? '#ffffff' : '#333333',
      textSecondary: isDarkMode ? '#b0b0b0' : '#666666',
      textTertiary: isDarkMode ? '#808080' : '#999999',
      
      // Colores de elementos específicos
      primary: '#968ce4',
      primaryVariant: isDarkMode ? '#7b6fd1' : '#968ce4',
      
      // Colores de tarjetas y contenedores
      card: isDarkMode ? '#2d2d2d' : '#ffffff',
      cardCompleted: isDarkMode ? '#3d2d4d' : '#f6f5ff',
      
      // Colores de bordes
      border: isDarkMode ? '#404040' : '#ddd',
      borderLight: isDarkMode ? '#404040' : '#e0e0e0',
      borderCompleted: isDarkMode ? '#5d4d6d' : '#e0e0ff',
      
      // Colores de inputs
      input: isDarkMode ? '#3d3d3d' : '#ffffff',
      inputBorder: isDarkMode ? '#555' : '#e0e0e0',
      inputBackground: isDarkMode ? '#2d2d2d' : '#fafafa',
      placeholder: isDarkMode ? '#808080' : '#999999',
      
      // Colores de navegación
      bottomNavBg: isDarkMode ? '#2d2d2d' : '#ffffff',
      bottomNavBorder: isDarkMode ? '#404040' : '#ddd',
      navIcon: isDarkMode ? '#404040' : '#eee',
      navIconActive: '#968ce4',
      navText: isDarkMode ? '#b0b0b0' : '#888',
      navTextActive: '#968ce4',
      
      // Colores de elementos específicos
      progressBg: isDarkMode ? '#404040' : '#fff',
      progressFill: '#968ce4',
      categoryBg: isDarkMode ? '#404040' : '#eee',
      iconContainer: isDarkMode ? '#404040' : '#eee',
      
      // Colores de modal
      modalOverlay: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
      modalBackground: isDarkMode ? '#2d2d2d' : '#ffffff',
      
      // Colores de estado
      success: '#4ecdc4',
      warning: '#ffd93d',
      error: '#ff6b6b',
      info: '#54a0ff',
      
      // Colores específicos para tema
      streak: '#ff9500',
      water: '#4ecdc4',
      fitness: '#ff6b6b',
      education: '#45b7d1',
      wellness: '#96ceb4'
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      ...theme, 
      toggleTheme, 
      setSystemTheme, 
      setManualTheme: setManualThemeFunc 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};