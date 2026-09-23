/**
 * Utility functions for date formatting across the application.
 * Enforces DD/MM/YYYY or DD.MM.YYYY format.
 */

export function formatDateOnly(dateStr?: string | null, delimiter: '.' | '/' = '.'): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // Extract YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}${delimiter}${month}${delimiter}${year}`;
  }

  // Extract DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
  const dmMatch = trimmed.match(/^(\d{2})[./-](\d{2})[./-](\d{4})/);
  if (dmMatch) {
    const [, day, month, year] = dmMatch;
    return `${day}${delimiter}${month}${delimiter}${year}`;
  }

  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}${delimiter}${month}${delimiter}${year}`;
    }
  } catch {
    // Ignore fallback
  }

  return trimmed;
}

export function formatDateToDDMMYYYY(dateStr?: string | null): string {
  if (!dateStr) return '';

  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // Already DD/MM/YYYY (with optional time)
  if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) {
    return trimmed;
  }

  // Handle YYYY-MM-DD or YYYY-MM-DD HH:mm
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/);
  if (isoMatch) {
    const [, year, month, day, rest] = isoMatch;
    return `${day}/${month}/${year}${rest}`;
  }

  // Handle DD.MM.YYYY
  const dotMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})(.*)$/);
  if (dotMatch) {
    const [, day, month, year, rest] = dotMatch;
    return `${day}/${month}/${year}${rest}`;
  }

  // Try parsing with Date object as fallback
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {
    // Return original if parsing fails
  }

  return trimmed;
}

export function parseDDMMYYYYToISO(dateStr?: string | null): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // If DD/MM/YYYY
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}
