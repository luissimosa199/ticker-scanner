export function parseNumberString(numberString: string): number {
  const cleanedString = numberString.replace(/[^0-9,-]+/g, '');
  const parsedNumber = parseFloat(
    cleanedString.replace(',', '.').replace(/,/g, ''),
  );
  return parsedNumber || 0;
}
