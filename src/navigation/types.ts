import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  ListDetails: { listId: string; listName: string };
  Resources: undefined;
  Recipes: undefined;
  RecipeDetail: { recipeId: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type ListDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'ListDetails'>;
export type RecipeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;
