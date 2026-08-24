export function formatValue(value: number | undefined) {
  if (value === undefined || value === null) {
    return 'Sem dado';
  }

  return new Intl.NumberFormat('pt-BR').format(value);
}
