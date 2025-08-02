import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import * as Localization from 'expo-localization';

// Obtener el idioma del dispositivo usando Expo Localization
const getDeviceLanguage = () => {
  try {
    // Usar Expo Localization que es más confiable
    const deviceLanguage = Localization.locale || 'en-US';
    
    // Extraer solo el código de idioma (ej: 'es' de 'es-MX')
    const languageCode = deviceLanguage.split('-')[0].toLowerCase();
    
    // Solo soportamos español e inglés
    return ['es', 'en'].includes(languageCode) ? languageCode : 'en';
  } catch (error) {
    console.log('Error detecting device language:', error);
    return 'en'; // Fallback a inglés
  }
};

// Textos de la aplicación
const translations = {
  es: {
    // Header
    myProfile: 'Mi Perfil',
    
    // Profile Info
    level: 'Nivel',
    beginner: 'Principiante',
    
    // Stats
    completedHabits: 'Hábitos Completados',
    currentStreak: 'Racha Actual',
    memberSince: 'Miembro desde',
    generalProgress: 'Progreso General',
    days: 'días',
    
    // Menu Sections
    account: 'Cuenta',
    preferences: 'Preferencias',
    
    // Menu Items
    personalInfo: 'Información Personal',
    editProfileData: 'Edita tu perfil y datos',
    changePassword: 'Cambiar Contraseña',
    updatePassword: 'Actualiza tu contraseña',
    appTheme: 'Tema de la aplicación',
    appLanguage: 'Idioma de la aplicación',
    notifications: 'Notificaciones',
    configureReminders: 'Configura recordatorios',
    settings: 'Configuración',
    appSettings: 'Ajustes de la aplicación',
    logout: 'Cerrar Sesión',
    
    // Theme options
    followSystem: 'Seguir sistema',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    useDeviceTheme: 'Usar el tema del dispositivo',
    alwaysLight: 'Usar siempre tema claro',
    alwaysDark: 'Usar siempre tema oscuro',
    
    // Language options
    followSystemLang: 'Seguir sistema',
    spanish: 'Español',
    english: 'Inglés',
    useDeviceLanguage: 'Usar el idioma del dispositivo',
    alwaysSpanish: 'Usar siempre español',
    alwaysEnglish: 'Usar siempre inglés',
    
    // Modals
    selectTheme: 'Seleccionar Tema',
    selectLanguage: 'Seleccionar Idioma',
    editProfile: 'Editar Perfil',
    cancel: 'Cancelar',
    saveChanges: 'Guardar Cambios',
    
    // Form fields
    name: 'Nombre',
    lastName: 'Apellido',
    email: 'Email',
    
    // Alerts
    logoutConfirm: '¿Estás seguro que deseas cerrar sesión?',
    success: 'Éxito',
    profileUpdated: 'Perfil actualizado correctamente',
    languageUpdated: 'Idioma actualizado correctamente',
    info: 'Info',
    comingSoon: 'Funcionalidad próximamente',
    
    // Months for date formatting
    months: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
  },
  en: {
    // Header
    myProfile: 'My Profile',
    
    // Profile Info
    level: 'Level',
    beginner: 'Beginner',
    
    // Stats
    completedHabits: 'Completed Habits',
    currentStreak: 'Current Streak',
    memberSince: 'Member Since',
    generalProgress: 'General Progress',
    days: 'days',
    
    // Menu Sections
    account: 'Account',
    preferences: 'Preferences',
    
    // Menu Items
    personalInfo: 'Personal Information',
    editProfileData: 'Edit your profile and data',
    changePassword: 'Change Password',
    updatePassword: 'Update your password',
    appTheme: 'App Theme',
    appLanguage: 'App Language',
    notifications: 'Notifications',
    configureReminders: 'Configure reminders',
    settings: 'Settings',
    appSettings: 'App settings',
    logout: 'Log Out',
    
    // Theme options
    followSystem: 'Follow System',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    useDeviceTheme: 'Use device theme',
    alwaysLight: 'Always use light theme',
    alwaysDark: 'Always use dark theme',
    
    // Language options
    followSystemLang: 'Follow System',
    spanish: 'Spanish',
    english: 'English',
    useDeviceLanguage: 'Use device language',
    alwaysSpanish: 'Always use Spanish',
    alwaysEnglish: 'Always use English',
    
    // Modals
    selectTheme: 'Select Theme',
    selectLanguage: 'Select Language',
    editProfile: 'Edit Profile',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    
    // Form fields
    name: 'Name',
    lastName: 'Last Name',
    email: 'Email',
    
    // Alerts
    logoutConfirm: 'Are you sure you want to log out?',
    success: 'Success',
    profileUpdated: 'Profile updated successfully',
    languageUpdated: 'Language updated successfully',
    info: 'Info',
    comingSoon: 'Feature coming soon',
    
    // Months for date formatting
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [languageMode, setLanguageMode] = useState('system'); // 'system', 'es', 'en'
  const [currentLanguage, setCurrentLanguage] = useState('es');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('languagePreference');
      if (savedLanguage) {
        setLanguageMode(savedLanguage);
        if (savedLanguage === 'system') {
          const deviceLang = getDeviceLanguage();
          setCurrentLanguage(deviceLang);
        } else {
          setCurrentLanguage(savedLanguage);
        }
      } else {
        // Primera vez, usar idioma del sistema
        const deviceLang = getDeviceLanguage();
        setLanguageMode('system');
        setCurrentLanguage(deviceLang);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
      // Fallback al idioma del dispositivo
      const deviceLang = getDeviceLanguage();
      setCurrentLanguage(deviceLang);
    }
  };

  const setLanguage = async (language) => {
    try {
      await AsyncStorage.setItem('languagePreference', language);
      setLanguageMode(language);
      
      if (language === 'system') {
        const deviceLang = getDeviceLanguage();
        setCurrentLanguage(deviceLang);
      } else {
        setCurrentLanguage(language);
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
  };

  const formatDate = (dateString) => {
    // Asumiendo formato "15 de Enero, 2024" o "January 15, 2024"
    if (currentLanguage === 'es') {
      return dateString; // Mantener formato español si ya está en español
    } else {
      // Convertir a formato inglés si es necesario
      // Esta es una implementación básica, podrías mejorarla según tus necesidades
      return dateString;
    }
  };

  return (
    <LanguageContext.Provider value={{
      languageMode,
      currentLanguage,
      setLanguage,
      t,
      formatDate,
      translations: translations[currentLanguage]
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};