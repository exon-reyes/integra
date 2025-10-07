/**
 * Retorna el último momento del día (23:59:59.999) para una fecha dada.
 * @param date - Fecha base para calcular el fin del día. Si no se proporciona, se utiliza la fecha actual.
 * @returns Nueva fecha con la hora ajustada al último momento del día.
 */
export function obtenerFinDia(date: Date): Date {
  const endOfDay = new Date(date.getTime()); // Crear una nueva instancia con la misma fecha
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

// Función para formatear fecha en formato ISO string
export function fechaISOString(date: Date = new Date()): string {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${
    pad(date.getMonth() + 1)}-${
    pad(date.getDate())}T${
    pad(date.getHours())}:${
    pad(date.getMinutes())}:${
    pad(date.getSeconds())}`;
}

