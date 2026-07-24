import { configureStore } from '@reduxjs/toolkit';
import listsReducer from './slices/listsSlice';
import recipesReducer from './slices/recipesSlice';
import { StorageService } from '../services/StorageService';

export const store = configureStore({
  reducer: {
    lists: listsReducer,
    recipes: recipesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Sincroniza automaticamente as alterações com o AsyncStorage
let previousListsState = store.getState().lists.lists;
let previousResourcesState = store.getState().recipes.resources;
let previousRecipesState = store.getState().recipes.recipes;

store.subscribe(() => {
  const currentListsState = store.getState().lists.lists;
  if (previousListsState !== currentListsState) {
    previousListsState = currentListsState;
    StorageService.saveLists(currentListsState);
  }

  const currentResourcesState = store.getState().recipes.resources;
  if (previousResourcesState !== currentResourcesState) {
    previousResourcesState = currentResourcesState;
    StorageService.saveResources(currentResourcesState);
  }

  const currentRecipesState = store.getState().recipes.recipes;
  if (previousRecipesState !== currentRecipesState) {
    previousRecipesState = currentRecipesState;
    StorageService.saveRecipes(currentRecipesState);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
