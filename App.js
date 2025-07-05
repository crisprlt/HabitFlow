import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './screens/LoginScreen';
import PrincipalScreen from './screens/PrincipalScreen';
import AddHabitScreen from './screens/AddHabitScreen'; 
import HabitCalendarScreen from './screens/HabitCalendarScreen';
import TodoScreen from './screens/TodoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Principal" component={PrincipalScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddHabit" component={AddHabitScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HabitCalendar" component={HabitCalendarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Todo" component={TodoScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
