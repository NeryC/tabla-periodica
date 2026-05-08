/**
 * Interpola un valor numérico en un gradiente azul → ámbar → rojo.
 * @param {number|null} value  Valor de la propiedad del elemento
 * @param {number} min         Mínimo del rango
 * @param {number} max         Máximo del rango
 * @returns {{ color, bg, border }|null}  null si no hay dato
 */
export function heatColor(value, min, max) {
  if (value === null || value === undefined || min === max) return null;
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // 3 stops: azul #3b82f6 → ámbar #f59e0b → rojo #ef4444
  const stops = [
    [59, 130, 246],
    [245, 158, 11],
    [239, 68, 68],
  ];
  const seg = Math.floor(t * 2);
  const frac = t * 2 - seg;
  const a = stops[Math.min(seg, 2)];
  const b = stops[Math.min(seg + 1, 2)];
  const r = Math.round(a[0] + (b[0] - a[0]) * frac);
  const g = Math.round(a[1] + (b[1] - a[1]) * frac);
  const bl = Math.round(a[2] + (b[2] - a[2]) * frac);
  return {
    color: `rgb(${r},${g},${bl})`,
    bg: `rgba(${r},${g},${bl},0.2)`,
    border: `rgba(${r},${g},${bl},0.5)`,
  };
}

/**
 * Parsea una fórmula química y devuelve el conteo de átomos por símbolo.
 * Soporta paréntesis anidados: Ca(OH)2, Al2(SO4)3, [Cu(NH3)4]SO4
 */
export function parseFormula(formula) {
  const f = formula.trim().replace(/\s/g, '').replace(/\[/g, '(').replace(/\]/g, ')');
  if (!f) return { ok: false, error: 'Fórmula vacía' };

  function parse(s, pos) {
    const counts = {};
    while (pos < s.length && s[pos] !== ')') {
      if (s[pos] === '(') {
        const [sub, end] = parse(s, pos + 1);
        if (end >= s.length || s[end] !== ')') throw new Error('Paréntesis sin cerrar');
        pos = end + 1;
        let numStr = '';
        while (pos < s.length && /\d/.test(s[pos])) numStr += s[pos++];
        const n = numStr ? parseInt(numStr, 10) : 1;
        for (const [sym, c] of Object.entries(sub)) counts[sym] = (counts[sym] || 0) + c * n;
      } else if (/[A-Z]/.test(s[pos])) {
        let sym = s[pos++];
        while (pos < s.length && /[a-z]/.test(s[pos])) sym += s[pos++];
        let numStr = '';
        while (pos < s.length && /\d/.test(s[pos])) numStr += s[pos++];
        const n = numStr ? parseInt(numStr, 10) : 1;
        counts[sym] = (counts[sym] || 0) + n;
      } else {
        throw new Error(`Carácter inesperado: "${s[pos]}"`);
      }
    }
    return [counts, pos];
  }

  try {
    const [counts, end] = parse(f, 0);
    if (end !== f.length) throw new Error('Paréntesis sin cerrar');
    return { ok: true, counts };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Normaliza texto para comparación flexible en el quiz.
 * Elimina acentos y convierte a minúsculas.
 */
export function normalizeText(text) {
  return text
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
