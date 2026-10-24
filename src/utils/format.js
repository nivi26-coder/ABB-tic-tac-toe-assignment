export const formatPosition = (row, col) => `Row ${row + 1}, Column ${col + 1}`;

export const twoDigits = (n) => String(n).padStart(2, '0');
