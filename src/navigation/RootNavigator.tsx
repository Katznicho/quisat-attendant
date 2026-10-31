import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import CardLookupScreen from '../screens/CardLookupScreen';
import CardManageScreen from '../screens/CardManageScreen';
import CardTopupScreen from '../screens/CardTopupScreen';
import ChangePinScreen from '../screens/ChangePinScreen';
import FloatStatementScreen from '../screens/FloatStatementScreen';
import HomeScreen from '../screens/HomeScreen';
import SaleAmountScreen from '../screens/SaleAmountScreen';
import SaleDetailScreen from '../screens/SaleDetailScreen';
import SalePinScreen from '../screens/SalePinScreen';
import SaleReceiptScreen from '../screens/SaleReceiptScreen';
import SalesScreen from '../screens/SalesScreen';
import SetCardPinScreen from '../screens/SetCardPinScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpRequestScreen from '../screens/auth/OtpRequestScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';
import { colors } from '../theme';
import type { AppStackParamList, AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

const screenOptions = {
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '700' as const, color: colors.text },
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
};

export default function RootNavigator() {
  const { attendant, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      {attendant ? (
        <AppStack.Navigator screenOptions={screenOptions}>
          <AppStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <AppStack.Screen
            name="CardLookup"
            component={CardLookupScreen}
            options={({ route }) => ({
              title: { sale: 'Make sale', activate: 'Activate card', manage: 'Card services' }[route.params.purpose],
            })}
          />
          <AppStack.Screen name="SaleAmount" component={SaleAmountScreen} options={{ title: 'Amount' }} />
          <AppStack.Screen name="SalePin" component={SalePinScreen} options={{ title: 'Student PIN', headerBackVisible: true }} />
          <AppStack.Screen name="SaleReceipt" component={SaleReceiptScreen} options={{ title: 'Receipt', headerBackVisible: false, gestureEnabled: false }} />
          <AppStack.Screen
            name="SetCardPin"
            component={SetCardPinScreen}
            options={({ route }) => ({ title: route.params.mode === 'activate' ? 'Activate card' : 'Reset card PIN' })}
          />
          <AppStack.Screen name="CardManage" component={CardManageScreen} options={{ title: 'Card' }} />
          <AppStack.Screen name="CardTopup" component={CardTopupScreen} options={{ title: 'Top up card' }} />
          <AppStack.Screen name="Sales" component={SalesScreen} options={{ title: 'Sales' }} />
          <AppStack.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: 'Sale' }} />
          <AppStack.Screen name="FloatStatement" component={FloatStatementScreen} options={{ title: 'Float statement' }} />
          <AppStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <AppStack.Screen name="ChangePin" component={ChangePinScreen} options={{ title: 'Change PIN' }} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={screenOptions}>
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <AuthStack.Screen
            name="OtpRequest"
            component={OtpRequestScreen}
            options={({ route }) => ({ title: route.params.mode === 'setup' ? 'Set up account' : 'Forgot PIN' })}
          />
          <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: 'Enter one-time PIN' }} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
