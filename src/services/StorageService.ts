import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingList } from '../types/shopping';
import { BaseResource, RecipeSheet } from '../types/recipe';

const LISTS_STORAGE_KEY = '@listafacil:listas';
const RESOURCES_STORAGE_KEY = '@listafacil:resources';
const RECIPES_STORAGE_KEY = '@listafacil:recipes';

export class StorageService {
  /**
   * Obtém todas as listas salvas no AsyncStorage
   */
  static async getLists(): Promise<ShoppingList[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (!jsonValue) return [];
      return JSON.parse(jsonValue) as ShoppingList[];
    } catch (error) {
      console.error('Erro ao ler listas do AsyncStorage:', error);
      return [];
    }
  }

  /**
   * Salva o array completo de listas no AsyncStorage
   */
  static async saveLists(lists: ShoppingList[]): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(lists);
      await AsyncStorage.setItem(LISTS_STORAGE_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Erro ao salvar listas no AsyncStorage:', error);
      return false;
    }
  }

  /**
   * Obtém os ingredientes e embalagens salvos
   */
  static async getResources(): Promise<BaseResource[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(RESOURCES_STORAGE_KEY);
      if (!jsonValue) return [];
      return JSON.parse(jsonValue) as BaseResource[];
    } catch (error) {
      console.error('Erro ao ler recursos do AsyncStorage:', error);
      return [];
    }
  }

  /**
   * Salva ingredientes e embalagens
   */
  static async saveResources(resources: BaseResource[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
      return true;
    } catch (error) {
      console.error('Erro ao salvar recursos no AsyncStorage:', error);
      return false;
    }
  }

  /**
   * Obtém todas as fichas técnicas salvas
   */
  static async getRecipes(): Promise<RecipeSheet[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
      if (!jsonValue) return [];
      return JSON.parse(jsonValue) as RecipeSheet[];
    } catch (error) {
      console.error('Erro ao ler receitas do AsyncStorage:', error);
      return [];
    }
  }

  /**
   * Salva todas as fichas técnicas
   */
  static async saveRecipes(recipes: RecipeSheet[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
      return true;
    } catch (error) {
      console.error('Erro ao salvar receitas no AsyncStorage:', error);
      return false;
    }
  }
}
