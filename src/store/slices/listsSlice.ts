import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShoppingList, ShoppingItem } from '../../types/shopping';

interface ListsState {
  lists: ShoppingList[];
  loading: boolean;
  searchQuery: string;
}

const initialState: ListsState = {
  lists: [],
  loading: true,
  searchQuery: '',
};

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    setLists: (state, action: PayloadAction<ShoppingList[]>) => {
      state.lists = action.payload;
      state.loading = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addList: (state, action: PayloadAction<string>) => {
      const now = new Date().toISOString();
      const newList: ShoppingList = {
        id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        nome: action.payload.trim(),
        dataCriacao: now,
        dataAtualizacao: now,
        favorito: false,
        itens: []
      };
      state.lists.unshift(newList);
    },
    renameList: (state, action: PayloadAction<{ id: string; newName: string }>) => {
      const list = state.lists.find(l => l.id === action.payload.id);
      if (list) {
        list.nome = action.payload.newName.trim();
        list.dataAtualizacao = new Date().toISOString();
      }
    },
    deleteList: (state, action: PayloadAction<string>) => {
      state.lists = state.lists.filter(l => l.id !== action.payload);
    },
    duplicateList: (state, action: PayloadAction<string>) => {
      const target = state.lists.find(l => l.id === action.payload);
      if (target) {
        const now = new Date().toISOString();
        const duplicated: ShoppingList = {
          ...target,
          id: `list_${Date.now()}_dup`,
          nome: `${target.nome} (Cópia)`,
          dataCriacao: now,
          dataAtualizacao: now,
          itens: target.itens.map(item => ({
            ...item,
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
          }))
        };
        state.lists.unshift(duplicated);
      }
    },
    toggleFavoriteList: (state, action: PayloadAction<string>) => {
      const list = state.lists.find(l => l.id === action.payload);
      if (list) {
        list.favorito = !list.favorito;
      }
    },
    addItemToList: (state, action: PayloadAction<{ listId: string; item: Omit<ShoppingItem, 'id' | 'comprado'> }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        const newItem: ShoppingItem = {
          ...action.payload.item,
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          comprado: false
        };
        list.itens.push(newItem);
        list.dataAtualizacao = new Date().toISOString();
      }
    },
    updateItemInList: (state, action: PayloadAction<{ listId: string; item: ShoppingItem }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        const index = list.itens.findIndex(i => i.id === action.payload.item.id);
        if (index !== -1) {
          list.itens[index] = action.payload.item;
          list.dataAtualizacao = new Date().toISOString();
        }
      }
    },
    toggleItemBought: (state, action: PayloadAction<{ listId: string; itemId: string }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        const item = list.itens.find(i => i.id === action.payload.itemId);
        if (item) {
          item.comprado = !item.comprado;
          list.dataAtualizacao = new Date().toISOString();
        }
      }
    },
    deleteItemFromList: (state, action: PayloadAction<{ listId: string; itemId: string }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        list.itens = list.itens.filter(i => i.id !== action.payload.itemId);
        list.dataAtualizacao = new Date().toISOString();
      }
    },
    deleteMultipleItemsFromList: (state, action: PayloadAction<{ listId: string; itemIds: string[] }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        const setIds = new Set(action.payload.itemIds);
        list.itens = list.itens.filter(i => !setIds.has(i.id));
        list.dataAtualizacao = new Date().toISOString();
      }
    },
    clearBoughtItemsFromList: (state, action: PayloadAction<string>) => {
      const list = state.lists.find(l => l.id === action.payload);
      if (list) {
        list.itens = list.itens.filter(i => !i.comprado);
        list.dataAtualizacao = new Date().toISOString();
      }
    },
    replaceList: (state, action: PayloadAction<ShoppingList>) => {
      const index = state.lists.findIndex(l => l.nome.toLowerCase() === action.payload.nome.toLowerCase());
      if (index !== -1) {
        state.lists[index] = action.payload;
      } else {
        state.lists.unshift(action.payload);
      }
    },
    importNewList: (state, action: PayloadAction<{ list: ShoppingList; duplicateName?: boolean }>) => {
      const { list, duplicateName } = action.payload;
      const importedList: ShoppingList = {
        ...list,
        id: `list_${Date.now()}_imp`,
        nome: duplicateName ? `${list.nome} (Importada)` : list.nome,
        dataAtualizacao: new Date().toISOString()
      };
      state.lists.unshift(importedList);
    }
  }
});

export const {
  setLists,
  setSearchQuery,
  addList,
  renameList,
  deleteList,
  duplicateList,
  toggleFavoriteList,
  addItemToList,
  updateItemInList,
  toggleItemBought,
  deleteItemFromList,
  deleteMultipleItemsFromList,
  clearBoughtItemsFromList,
  replaceList,
  importNewList
} = listsSlice.actions;

export default listsSlice.reducer;
