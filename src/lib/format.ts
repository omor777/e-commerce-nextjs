export function formatPrice(value: string | number) {
  // Format the number with commas (e.g., 1,500)
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0, // Remove decimals for BDT
  }).format(Number(value));

  // Prepend the Taka symbol
  return `৳ ${formattedNumber}`;
}
