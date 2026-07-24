import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseResource, RecipeSheet, RecipeItem } from '../../types/recipe';

interface RecipesState {
  resources: BaseResource[];
  recipes: RecipeSheet[];
  loading: boolean;
}

const initialState: RecipesState = {
  resources: [],
  recipes: [],
  loading: true,
};

export const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipesData: (state, action: PayloadAction<{ resources: BaseResource[]; recipes: RecipeSheet[] }>) => {
      state.resources = action.payload.resources;
      state.recipes = action.payload.recipes;
      state.loading = false;
    },
    // Gestão de Recursos (Ingredientes / Embalagens)
    addResource: (state, action: PayloadAction<Omit<BaseResource, 'id' | 'dataCriacao'>>) => {
      const now = new Date().toISOString();
      const newResource: BaseResource = {
        ...action.payload,
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        dataCriacao: now,
      };
      state.resources.push(newResource);
    },
    updateResource: (state, action: PayloadAction<BaseResource>) => {
      const index = state.resources.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.resources[index] = {
          ...action.payload,
          dataCriacao: state.resources[index].dataCriacao || new Date().toISOString(),
        };
      }
    },
    deleteResource: (state, action: PayloadAction<string>) => {
      state.resources = state.resources.filter(r => r.id !== action.payload);
    },
    // Gestão de Fichas Técnicas (Receitas)
    addRecipe: (state, action: PayloadAction<{ nomeProduto: string; rendimentoUnidades?: number }>) => {
      const now = new Date().toISOString();
      const newRecipe: RecipeSheet = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        nomeProduto: action.payload.nomeProduto.trim(),
        rendimentoUnidades: action.payload.rendimentoUnidades || 1,
        percentualCustosInvisiveis: 30,
        percentualMargemLucroEmpresa: 20,
        percentualLucroSalario: 40,
        percentualTaxasVenda: 0,
        itens: [],
        dataCriacao: now,
        dataAtualizacao: now,
      };
      state.recipes.unshift(newRecipe);
    },
    updateRecipeSettings: (state, action: PayloadAction<{
      recipeId: string;
      nomeProduto?: string;
      rendimentoUnidades?: number;
      percentualCustosInvisiveis?: number;
      percentualMargemLucroEmpresa?: number;
      percentualLucroSalario?: number;
      percentualTaxasVenda?: number;
    }>) => {
      const recipe = state.recipes.find(r => r.id === action.payload.recipeId);
      if (recipe) {
        if (action.payload.nomeProduto !== undefined) recipe.nomeProduto = action.payload.nomeProduto.trim();
        if (action.payload.rendimentoUnidades !== undefined) recipe.rendimentoUnidades = action.payload.rendimentoUnidades;
        if (action.payload.percentualCustosInvisiveis !== undefined) recipe.percentualCustosInvisiveis = action.payload.percentualCustosInvisiveis;
        if (action.payload.percentualMargemLucroEmpresa !== undefined) recipe.percentualMargemLucroEmpresa = action.payload.percentualMargemLucroEmpresa;
        if (action.payload.percentualLucroSalario !== undefined) recipe.percentualLucroSalario = action.payload.percentualLucroSalario;
        if (action.payload.percentualTaxasVenda !== undefined) recipe.percentualTaxasVenda = action.payload.percentualTaxasVenda;
        recipe.dataAtualizacao = new Date().toISOString();
      }
    },
    deleteRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(r => r.id !== action.payload);
    },
    addItemToRecipe: (state, action: PayloadAction<{ recipeId: string; item: Omit<RecipeItem, 'id'> }>) => {
      const recipe = state.recipes.find(r => r.id === action.payload.recipeId);
      if (recipe) {
        const newItem: RecipeItem = {
          ...action.payload.item,
          id: `recitem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        };
        recipe.itens.push(newItem);
        recipe.dataAtualizacao = new Date().toISOString();
      }
    },
    updateRecipeItem: (state, action: PayloadAction<{ recipeId: string; item: RecipeItem }>) => {
      const recipe = state.recipes.find(r => r.id === action.payload.recipeId);
      if (recipe) {
        const index = recipe.itens.findIndex(i => i.id === action.payload.item.id);
        if (index !== -1) {
          recipe.itens[index] = action.payload.item;
          recipe.dataAtualizacao = new Date().toISOString();
        }
      }
    },
    removeItemFromRecipe: (state, action: PayloadAction<{ recipeId: string; itemId: string }>) => {
      const recipe = state.recipes.find(r => r.id === action.payload.recipeId);
      if (recipe) {
        recipe.itens = recipe.itens.filter(i => i.id !== action.payload.itemId);
        recipe.dataAtualizacao = new Date().toISOString();
      }
    },
  },
});

export const {
  setRecipesData,
  addResource,
  updateResource,
  deleteResource,
  addRecipe,
  updateRecipeSettings,
  deleteRecipe,
  addItemToRecipe,
  updateRecipeItem,
  removeItemFromRecipe,
} = recipesSlice.actions;

export default recipesSlice.reducer;
