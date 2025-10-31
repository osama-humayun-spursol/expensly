export function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
  } catch (e) {
    // Fallback
    return `PKR ${amount.toFixed(2)}`;
  }
}
