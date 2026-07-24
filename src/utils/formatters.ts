export const formatQuantity = (quantity: number, unit: string): string => {
  const formattedNumber = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${formattedNumber} ${unit}`;
};

export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'R$ 0,00';
  }
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
