import React, { useState, useEffect } from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, BottomNavigation } from 'react-native-paper';
import { RootStackParamList } from './types';
import { CustomLightTheme, CustomDarkTheme } from '../constants/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { ListDetailsScreen } from '../screens/ListDetailsScreen';
import { ResourcesScreen } from '../screens/ResourcesScreen';
import { RecipesScreen } from '../screens/RecipesScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { StorageService } from '../services/StorageService';
import { setRecipesData } from '../store/slices/recipesSlice';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Componente de navegação por abas principais (Home / Fichas Técnicas / Cadastro)
const MainTabsComponent: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'lists', title: 'Listas', focusedIcon: 'cart', unfocusedIcon: 'cart-outline' },
    { key: 'recipes', title: 'Fichas Técnicas', focusedIcon: 'chef-hat', unfocusedIcon: 'chef-hat' },
    { key: 'resources', title: 'Ingredientes', focusedIcon: 'package-variant', unfocusedIcon: 'package-variant-closed' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    lists: () => <HomeScreen navigation={navigation} route={{ key: 'home', name: 'Home' }} />,
    recipes: () => <RecipesScreen navigation={navigation} />,
    resources: () => <ResourcesScreen />,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ elevation: 4 }}
    />
  );
};

export const AppNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;
  const dispatch = useAppDispatch();

  // Carrega os dados de receitas e ingredientes armazenados no boot
  useEffect(() => {
    async function loadData() {
      const storedResources = await StorageService.getResources();
      const storedRecipes = await StorageService.getRecipes();
      dispatch(setRecipesData({ resources: storedResources, recipes: storedRecipes }));
    }
    loadData();
  }, [dispatch]);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabsComponent} />
          <Stack.Screen name="ListDetails" component={ListDetailsScreen} />
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};
