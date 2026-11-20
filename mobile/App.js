import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TechniciansScreen from './src/screens/TechniciansScreen';
import TechnicianDetailScreen from './src/screens/TechnicianDetailScreen';
import CreateJobScreen from './src/screens/CreateJobScreen';
import MyJobsScreen from './src/screens/MyJobsScreen';
import JobDetailScreen from './src/screens/JobDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BecomeTechnicianScreen from './src/screens/BecomeTechnicianScreen';
import ClientTabs from './src/navigation/ClientTabs';
import TechnicianTabs from './src/navigation/TechnicianTabs'; 
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token, loading,mode } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          <>
            <Stack.Screen
              name="MainTabs"   //esto era home
              component={mode === 'tecnico' ? TechnicianTabs : ClientTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Technicians"
              component={TechniciansScreen}
              options={{ title: 'Técnicos cerca de ti' }}
            />
            <Stack.Screen
              name="TechnicianDetail"
              component={TechnicianDetailScreen}
              options={{ title: 'Perfil del técnico' }}
            />
            <Stack.Screen
              name="CreateJob"
              component={CreateJobScreen}
              options={{ title: 'Solicitar servicio' }}
            />
            <Stack.Screen
              name="MyJobs"
              component={MyJobsScreen}
              options={{ title: 'Mis trabajos' }}
            />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={{ title: 'Detalle del trabajo' }}
            />
            <Stack.Screen
              name="BecomeTechnician"
              component={BecomeTechnicianScreen}
              options={{ title: 'Convertirme en técnico' }}
            />
            <Stack.Screen 
              name="ChangePassword" 
              component={ChangePasswordScreen} 
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: 'Chat' }}
            />
          </>
        ) : (
          <>
          <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Registro' }}
            />
            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}