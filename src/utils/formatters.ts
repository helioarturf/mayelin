/**
 * Utilitários de formatação e regras de negócio para a Creche Mayelin
 */

/**
 * Garante que o nome de qualquer utilizadora cadastrada ou identificada como Educadora
 * possua o prefixo carinhoso e respeitoso "Tia" (conforme tradição e pedagogia de creche).
 *
 * Exemplos:
 *  "Clara Marques" -> "Tia Clara Marques"
 *  "Tia Teresa Melo" -> "Tia Teresa Melo"
 *  "tia sofia" -> "Tia Sofia"
 */
export function formatEducatorName(name: string): string {
  if (!name || !name.trim()) return 'Tia';
  const trimmed = name.trim();

  // Se já começar com "tia" (case-insensitive)
  if (/^tia\s+/i.test(trimmed)) {
    return trimmed.replace(/^tia\s+/i, 'Tia ');
  }

  // Se começar apenas com "tia" sem espaço
  if (/^tia$/i.test(trimmed)) {
    return 'Tia';
  }

  // Se começar por "Profa." ou "Prof." ou "Dra." específico de educadora, normalizar para "Tia"
  if (/^(profa\.?|prof\.?|educadora)\s+/i.test(trimmed)) {
    return trimmed.replace(/^(profa\.?|prof\.?|educadora)\s+/i, 'Tia ');
  }

  return `Tia ${trimmed}`;
}

/**
 * Verifica se um papel ou perfil corresponde a Educadora de creche
 */
export function isEducatorRole(role: string): boolean {
  const normalized = role.toLowerCase();
  return (
    normalized === 'educador' ||
    normalized === 'educadora' ||
    normalized === 'professor' ||
    normalized === 'professora' ||
    normalized.includes('educadora') ||
    normalized.includes('tia')
  );
}
