export const formatQuantity = (quantity: number | null | undefined, unit: string): string => {
  if (quantity === undefined || quantity === null || isNaN(Number(quantity))) {
    return `0 ${unit || ''}`.trim();
  }
  const num = Number(quantity);
  const formattedNumber = Number.isInteger(num)
    ? num.toString()
    : num.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${formattedNumber} ${unit || ''}`.trim();
};

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'R$ 0,00';
  }
  return Number(amount).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
