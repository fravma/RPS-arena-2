// Jeton du joueur, gardé par onglet (sessionStorage) : un onglet = un joueur, et recharger garde la partie.
const k = (code: string) => `rps:${code.toUpperCase()}`;

export function saveToken(code: string, token: string) {
  try { sessionStorage.setItem(k(code), token); } catch { /* navigation privée stricte : sans effet */ }
}

export function readToken(code: string): string | null {
  try { return sessionStorage.getItem(k(code)); } catch { return null; }
}

export function clearToken(code: string) {
  try { sessionStorage.removeItem(k(code)); } catch { /* sans effet */ }
}
