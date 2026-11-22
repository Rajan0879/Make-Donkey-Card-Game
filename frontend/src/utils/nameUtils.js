/**
 * Formats a player name to at most maxChars (default: 5 characters)
 * for clean, compact mobile game tables.
 * @param {string} name 
 * @param {number} maxChars 
 * @returns {string}
 */
export function formatPlayerName(name, maxChars = 5) {
  if (!name) return 'Playr';
  const str = String(name).trim();
  if (str.length <= maxChars) return str;
  return str.slice(0, maxChars);
}

