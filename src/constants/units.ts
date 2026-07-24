import { UnitType } from '../types/shopping';

export interface UnitOption {
  label: string;
  value: UnitType;
}

export const UNIT_OPTIONS: UnitOption[] = [
  { label: 'Unidade (un)', value: 'un' },
  { label: 'Quilograma (kg)', value: 'kg' },
  { label: 'Grama (g)', value: 'g' },
  { label: 'Pacote', value: 'pacote' },
  { label: 'Caixa', value: 'caixa' },
  { label: 'Litro (L)', value: 'litro' },
  { label: 'Mililitro (ml)', value: 'ml' }
];
