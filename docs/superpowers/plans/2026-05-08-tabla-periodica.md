# Tabla Periódica Interactiva — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el componente React de tabla periódica en una SPA Vite completa con mapa de calor, calculadora de masa molar, comparador de elementos y quiz, desplegada en Vercel via GitHub.

**Architecture:** SPA Vite + React 18. Toda la UI vive en `src/PeriodicTable.jsx`. Funciones puras (parser de fórmulas, interpolación de color, normalización de texto) en `src/utils.js` para testabilidad. Sin backend ni routing. Deploy automático en Vercel desde GitHub.

**Tech Stack:** React 18, Vite 5, Vitest (unit tests), GitHub MCP (repo), Vercel (deploy)

---

## Estructura de Archivos

```
quimica/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── utils.js           ← funciones puras (parseFormula, heatColor, normalizeText)
│   ├── utils.test.js      ← tests vitest
│   └── PeriodicTable.jsx  ← componente principal completo
└── docs/
    └── superpowers/
        ├── specs/2026-05-08-tabla-periodica-design.md
        └── plans/2026-05-08-tabla-periodica.md
```

---

### Task 1: Scaffold del proyecto Vite

**Files:**
- Create: `index.html`
- Create: `package.json`
- Create: `vite.config.js`
- Create: `src/main.jsx`

- [ ] **Step 1: Crear package.json**

```json
{
  "name": "tabla-periodica",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Crear index.html**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tabla Periódica Interactiva</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Crear vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Crear src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import PeriodicTable from './PeriodicTable'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PeriodicTable />
  </React.StrictMode>
)
```

- [ ] **Step 5: Instalar dependencias y verificar que arranca**

```bash
npm install
npm run dev
```

Esperado: servidor en `http://localhost:5173` (pantalla en blanco, sin errores en consola — PeriodicTable.jsx aún no existe).

- [ ] **Step 6: Commit**

```bash
git init
git add index.html package.json vite.config.js src/main.jsx
git commit -m "feat: scaffold proyecto Vite + React"
```

---

### Task 2: Funciones utilitarias y tests

**Files:**
- Create: `src/utils.js`
- Create: `src/utils.test.js`

- [ ] **Step 1: Crear src/utils.js**

```js
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
```

- [ ] **Step 2: Crear src/utils.test.js**

```js
import { describe, it, expect } from 'vitest'
import { heatColor, parseFormula, normalizeText } from './utils.js'

// ── heatColor ──────────────────────────────────────────────────────────────

describe('heatColor', () => {
  it('devuelve null para valor null', () => {
    expect(heatColor(null, 0, 10)).toBeNull()
  })

  it('devuelve null cuando min === max', () => {
    expect(heatColor(5, 5, 5)).toBeNull()
  })

  it('valor mínimo → color azul', () => {
    const c = heatColor(0, 0, 10)
    expect(c).not.toBeNull()
    expect(c.color).toBe('rgb(59,130,246)')
  })

  it('valor máximo → color rojo', () => {
    const c = heatColor(10, 0, 10)
    expect(c).not.toBeNull()
    expect(c.color).toBe('rgb(239,68,68)')
  })

  it('valor intermedio → color ámbar', () => {
    const c = heatColor(5, 0, 10)
    expect(c).not.toBeNull()
    expect(c.color).toBe('rgb(245,158,11)')
  })

  it('retorna propiedades color, bg y border', () => {
    const c = heatColor(3, 0, 10)
    expect(c).toHaveProperty('color')
    expect(c).toHaveProperty('bg')
    expect(c).toHaveProperty('border')
  })
})

// ── parseFormula ───────────────────────────────────────────────────────────

describe('parseFormula', () => {
  it('fórmula vacía → error', () => {
    expect(parseFormula('').ok).toBe(false)
    expect(parseFormula('  ').ok).toBe(false)
  })

  it('H2O → {H:2, O:1}', () => {
    const r = parseFormula('H2O')
    expect(r.ok).toBe(true)
    expect(r.counts).toEqual({ H: 2, O: 1 })
  })

  it('NaCl → {Na:1, Cl:1}', () => {
    const r = parseFormula('NaCl')
    expect(r.ok).toBe(true)
    expect(r.counts).toEqual({ Na: 1, Cl: 1 })
  })

  it('C6H12O6 → {C:6, H:12, O:6}', () => {
    const r = parseFormula('C6H12O6')
    expect(r.ok).toBe(true)
    expect(r.counts).toEqual({ C: 6, H: 12, O: 6 })
  })

  it('Ca(OH)2 → {Ca:1, O:2, H:2}', () => {
    const r = parseFormula('Ca(OH)2')
    expect(r.ok).toBe(true)
    expect(r.counts).toEqual({ Ca: 1, O: 2, H: 2 })
  })

  it('Al2(SO4)3 → {Al:2, S:3, O:12}', () => {
    const r = parseFormula('Al2(SO4)3')
    expect(r.ok).toBe(true)
    expect(r.counts).toEqual({ Al: 2, S: 3, O: 12 })
  })

  it('símbolo inválido no rompe el parser', () => {
    const r = parseFormula('X2O')
    expect(r.ok).toBe(true) // el parser acepta cualquier símbolo; la validación es responsabilidad del caller
  })

  it('paréntesis sin cerrar → error', () => {
    const r = parseFormula('Ca(OH2')
    expect(r.ok).toBe(false)
  })
})

// ── normalizeText ──────────────────────────────────────────────────────────

describe('normalizeText', () => {
  it('elimina tildes', () => {
    expect(normalizeText('Hidrógeno')).toBe('hidrogeno')
  })

  it('convierte a minúsculas', () => {
    expect(normalizeText('HIERRO')).toBe('hierro')
  })

  it('elimina espacios extremos', () => {
    expect(normalizeText('  Oro  ')).toBe('oro')
  })

  it('Nitrógeno → nitrogeno', () => {
    expect(normalizeText('Nitrógeno')).toBe('nitrogeno')
  })
})
```

- [ ] **Step 3: Ejecutar tests**

```bash
npm test
```

Esperado: 18 tests pasando, 0 fallando.

- [ ] **Step 4: Commit**

```bash
git add src/utils.js src/utils.test.js
git commit -m "feat: funciones utilitarias con tests (heatColor, parseFormula, normalizeText)"
```

---

### Task 3: Componente base PeriodicTable

**Files:**
- Create: `src/PeriodicTable.jsx`

- [ ] **Step 1: Crear src/PeriodicTable.jsx con el código original**

Copiar el código original del usuario. El archivo debe exportar `default function PeriodicTable()` e importar `React, { useState, useMemo }` desde `'react'`. No se modifica nada del original en este paso — solo se establece la base funcional.

```jsx
import React, { useState, useMemo } from "react";

const ELEMENTS = [
  { n: 1, s: "H", name: { en: "Hydrogen", es: "Hidrógeno" }, mass: 1.008, cat: "nonmetal", row: 1, col: 1, config: "1s¹", phase: { en: "Gas", es: "Gas" }, melt: -259.16, boil: -252.87, discovered: 1766, discoverer: "Henry Cavendish", desc: { en: "The lightest and most abundant element in the universe. Forms water with oxygen.", es: "El elemento más ligero y abundante del universo. Forma agua con el oxígeno." } },
  // ... (todos los 118 elementos del código original)
];

// CATEGORIES, T, PeriodicTable y Stat tal cual están en el código original
```

- [ ] **Step 2: Verificar en el navegador**

```bash
npm run dev
```

Abrir `http://localhost:5173`. Verificar: tabla periódica visible, hover muestra detalles, búsqueda funciona, filtros funcionan, toggle ES/EN funciona.

- [ ] **Step 3: Commit**

```bash
git add src/PeriodicTable.jsx
git commit -m "feat: componente PeriodicTable base (código original)"
```

---

### Task 4: Datos ampliados — 4 propiedades nuevas por elemento

**Files:**
- Modify: `src/PeriodicTable.jsx` — agregar `electroneg`, `radius`, `ionization`, `oxidation` a cada elemento

- [ ] **Step 1: Agregar las 4 propiedades nuevas a los 118 elementos**

En el array `ELEMENTS` de `src/PeriodicTable.jsx`, añadir al final de cada objeto (antes del `desc`) las propiedades `electroneg`, `radius`, `ionization` y `oxidation` usando la siguiente tabla de referencia completa:

```js
// Referencia: n → [electroneg, radius(pm), ionization(kJ/mol), oxidation]
// null = dato no disponible o no aplicable
const DATA = {
  1:   [2.20, 53,  1312, ["+1","-1"]],
  2:   [null, 31,  2372, ["0"]],
  3:   [0.98, 167, 520,  ["+1"]],
  4:   [1.57, 112, 899,  ["+2"]],
  5:   [2.04, 87,  801,  ["+3"]],
  6:   [2.55, 67,  1086, ["-4","+2","+4"]],
  7:   [3.04, 56,  1402, ["-3","+3","+5"]],
  8:   [3.44, 48,  1314, ["-2","-1"]],
  9:   [3.98, 42,  1681, ["-1"]],
  10:  [null, 38,  2081, ["0"]],
  11:  [0.93, 190, 496,  ["+1"]],
  12:  [1.31, 145, 738,  ["+2"]],
  13:  [1.61, 118, 578,  ["+3"]],
  14:  [1.90, 111, 786,  ["-4","+4"]],
  15:  [2.19, 98,  1012, ["-3","+3","+5"]],
  16:  [2.58, 88,  1000, ["-2","+4","+6"]],
  17:  [3.16, 79,  1251, ["-1","+1","+3","+5","+7"]],
  18:  [null, 71,  1521, ["0"]],
  19:  [0.82, 243, 419,  ["+1"]],
  20:  [1.00, 194, 590,  ["+2"]],
  21:  [1.36, 184, 633,  ["+3"]],
  22:  [1.54, 176, 659,  ["+2","+3","+4"]],
  23:  [1.63, 171, 651,  ["+2","+3","+4","+5"]],
  24:  [1.66, 166, 653,  ["+2","+3","+6"]],
  25:  [1.55, 161, 717,  ["+2","+3","+4","+7"]],
  26:  [1.83, 156, 762,  ["+2","+3"]],
  27:  [1.88, 152, 760,  ["+2","+3"]],
  28:  [1.91, 149, 737,  ["+2"]],
  29:  [1.90, 145, 745,  ["+1","+2"]],
  30:  [1.65, 142, 906,  ["+2"]],
  31:  [1.81, 136, 579,  ["+3"]],
  32:  [2.01, 125, 762,  ["+2","+4"]],
  33:  [2.18, 114, 947,  ["-3","+3","+5"]],
  34:  [2.55, 103, 941,  ["-2","+4","+6"]],
  35:  [2.96, 94,  1140, ["-1","+1","+3","+5"]],
  36:  [null, 88,  1351, ["0"]],
  37:  [0.82, 265, 403,  ["+1"]],
  38:  [0.95, 219, 550,  ["+2"]],
  39:  [1.22, 212, 600,  ["+3"]],
  40:  [1.33, 206, 640,  ["+4"]],
  41:  [1.60, 198, 652,  ["+3","+5"]],
  42:  [2.16, 190, 684,  ["+4","+6"]],
  43:  [1.90, 183, 702,  ["+4","+7"]],
  44:  [2.20, 178, 711,  ["+3","+4"]],
  45:  [2.28, 173, 720,  ["+3"]],
  46:  [2.20, 169, 805,  ["+2","+4"]],
  47:  [1.93, 165, 731,  ["+1"]],
  48:  [1.69, 161, 868,  ["+2"]],
  49:  [1.78, 156, 558,  ["+3"]],
  50:  [1.96, 145, 709,  ["+2","+4"]],
  51:  [2.05, 133, 834,  ["-3","+3","+5"]],
  52:  [2.10, 123, 869,  ["-2","+4","+6"]],
  53:  [2.66, 115, 1008, ["-1","+1","+5","+7"]],
  54:  [2.60, 108, 1170, ["0","+2","+4"]],
  55:  [0.79, 298, 376,  ["+1"]],
  56:  [0.89, 253, 503,  ["+2"]],
  57:  [1.10, 240, 538,  ["+3"]],
  58:  [1.12, 235, 534,  ["+3","+4"]],
  59:  [1.13, 239, 527,  ["+3","+4"]],
  60:  [1.14, 229, 533,  ["+3"]],
  61:  [1.13, 236, 540,  ["+3"]],
  62:  [1.17, 229, 545,  ["+2","+3"]],
  63:  [1.20, 233, 547,  ["+2","+3"]],
  64:  [1.20, 237, 593,  ["+3"]],
  65:  [1.10, 221, 566,  ["+3","+4"]],
  66:  [1.22, 229, 573,  ["+3"]],
  67:  [1.23, 216, 581,  ["+3"]],
  68:  [1.24, 235, 589,  ["+3"]],
  69:  [1.25, 227, 597,  ["+3"]],
  70:  [1.10, 242, 603,  ["+2","+3"]],
  71:  [1.27, 221, 524,  ["+3"]],
  72:  [1.30, 208, 659,  ["+4"]],
  73:  [1.50, 200, 761,  ["+5"]],
  74:  [2.36, 193, 770,  ["+4","+6"]],
  75:  [1.90, 188, 760,  ["+4","+7"]],
  76:  [2.20, 185, 840,  ["+4"]],
  77:  [2.20, 180, 880,  ["+3","+4"]],
  78:  [2.28, 177, 870,  ["+2","+4"]],
  79:  [2.54, 174, 890,  ["+1","+3"]],
  80:  [2.00, 171, 1007, ["+1","+2"]],
  81:  [1.62, 156, 589,  ["+1","+3"]],
  82:  [2.33, 154, 716,  ["+2","+4"]],
  83:  [2.02, 143, 703,  ["+3","+5"]],
  84:  [2.00, 135, 812,  ["+2","+4"]],
  85:  [2.20, 127, 890,  ["-1","+1"]],
  86:  [null, 120, 1037, ["0"]],
  87:  [0.70, 270, 393,  ["+1"]],
  88:  [0.90, 233, 509,  ["+2"]],
  89:  [1.10, 260, 499,  ["+3"]],
  90:  [1.30, 237, 587,  ["+4"]],
  91:  [1.50, 243, 568,  ["+5"]],
  92:  [1.38, 240, 598,  ["+3","+4","+5","+6"]],
  93:  [1.36, 221, 605,  ["+3","+4","+5","+6"]],
  94:  [1.28, 243, 585,  ["+3","+4","+5","+6"]],
  95:  [1.13, 244, 578,  ["+3"]],
  96:  [1.28, 245, 581,  ["+3"]],
  97:  [1.30, 244, 601,  ["+3","+4"]],
  98:  [1.30, 245, 608,  ["+3"]],
  99:  [1.30, 245, 619,  ["+3"]],
  100: [1.30, 245, 627,  ["+3"]],
  101: [1.30, 246, 635,  ["+2","+3"]],
  102: [1.30, 246, 642,  ["+2","+3"]],
  103: [null, 246, 479,  ["+3"]],
  104: [null, null, null, null],
  105: [null, null, null, null],
  106: [null, null, null, null],
  107: [null, null, null, null],
  108: [null, null, null, null],
  109: [null, null, null, null],
  110: [null, null, null, null],
  111: [null, null, null, null],
  112: [null, null, null, null],
  113: [null, null, null, null],
  114: [null, null, null, null],
  115: [null, null, null, null],
  116: [null, null, null, null],
  117: [null, null, null, null],
  118: [null, null, null, null],
}
```

Para cada elemento en ELEMENTS, añadir las propiedades usando la tabla. Ejemplo para H (n=1):

```js
// Antes:
{ n: 1, s: "H", ..., discovered: 1766, discoverer: "Henry Cavendish", desc: {...} }

// Después:
{ n: 1, s: "H", ..., discovered: 1766, discoverer: "Henry Cavendish",
  electroneg: 2.20, radius: 53, ionization: 1312, oxidation: ["+1","-1"],
  desc: {...} }
```

- [ ] **Step 2: Agregar también PROPERTY_MODES y labels en T**

Añadir después de `CATEGORIES`:

```js
const PROPERTY_MODES = {
  category:    { label: { en: "Category",          es: "Categoría" },         prop: null },
  electroneg:  { label: { en: "Electronegativity", es: "Electronegatividad" }, prop: "electroneg",  unit: "Pauling" },
  radius:      { label: { en: "Atomic Radius",      es: "Radio Atómico" },     prop: "radius",      unit: "pm" },
  ionization:  { label: { en: "Ionization Energy",  es: "Energía de Ioniz." }, prop: "ionization",  unit: "kJ/mol" },
  melt:        { label: { en: "Melting Point",       es: "Punto de Fusión" },   prop: "melt",        unit: "°C" },
  mass:        { label: { en: "Atomic Mass",         es: "Masa Atómica" },      prop: "mass",        unit: "u" },
};
```

Añadir en el objeto `T` (en ambos idiomas `en` y `es`):

```js
// en T.en agregar:
electroneg:   "Electronegativity",
radius:       "Atomic radius",
ionization:   "Ionization energy",
oxidation:    "Oxidation states",
visualize:    "Visualize by",
noData:       "No data",
// tabs:
tabTable:     "🔬 Table",
tabCalc:      "⚗️ Calculator",
tabCompare:   "🔍 Compare",
tabQuiz:      "📝 Quiz",

// en T.es agregar:
electroneg:   "Electronegatividad",
radius:       "Radio atómico",
ionization:   "Energía de ionización",
oxidation:    "Estados de oxidación",
visualize:    "Visualizar por",
noData:       "Sin dato",
// tabs:
tabTable:     "🔬 Tabla",
tabCalc:      "⚗️ Calculadora",
tabCompare:   "🔍 Comparar",
tabQuiz:      "📝 Quiz",
```

- [ ] **Step 3: Verificar que la app sigue funcionando**

```bash
npm run dev
```

Abrir `http://localhost:5173`. La tabla debe seguir funcionando igual (los nuevos campos no afectan el render todavía).

- [ ] **Step 4: Commit**

```bash
git add src/PeriodicTable.jsx
git commit -m "feat: datos ampliados (electroneg, radio, ionización, oxidación) en 118 elementos"
```

---

### Task 5: Navegación por pestañas

**Files:**
- Modify: `src/PeriodicTable.jsx`

- [ ] **Step 1: Agregar estado `activeTab` al componente**

En `PeriodicTable()`, después de `const [lang, setLang] = useState("es")`:

```jsx
const [activeTab, setActiveTab] = useState("table"); // "table"|"calculator"|"compare"|"quiz"
```

- [ ] **Step 2: Reemplazar el header actual con header + barra de pestañas**

Inmediatamente después del `<header>` existente (antes del div de búsqueda), añadir:

```jsx
{/* Barra de pestañas */}
<div style={{ display: "flex", gap: "2px", marginBottom: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "4px" }}>
  {[
    { id: "table",      label: t.tabTable },
    { id: "calculator", label: t.tabCalc },
    { id: "compare",    label: t.tabCompare },
    { id: "quiz",       label: t.tabQuiz },
  ].map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      style={{
        flex: 1,
        padding: "8px 12px",
        background: activeTab === tab.id ? "rgba(96,165,250,0.2)" : "transparent",
        border: activeTab === tab.id ? "1px solid rgba(96,165,250,0.4)" : "1px solid transparent",
        borderRadius: "7px",
        color: activeTab === tab.id ? "#fff" : "#94a3b8",
        fontSize: "13px",
        fontWeight: activeTab === tab.id ? "600" : "400",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      {tab.label}
    </button>
  ))}
</div>
```

- [ ] **Step 3: Envolver el contenido de la tabla en `{activeTab === "table" && ...}`**

Rodear con condicional: el bloque de búsqueda + filtros + heatmap + tabla periódica + panel de detalle solo se renderiza cuando `activeTab === "table"`.

- [ ] **Step 4: Agregar placeholders para las otras pestañas**

Después del bloque de la tabla, añadir:

```jsx
{activeTab === "calculator" && (
  <div style={{ color: "#94a3b8", padding: "40px", textAlign: "center" }}>
    Calculadora — próximamente
  </div>
)}

{activeTab === "compare" && (
  <div style={{ color: "#94a3b8", padding: "40px", textAlign: "center" }}>
    Comparar — próximamente
  </div>
)}

{activeTab === "quiz" && (
  <div style={{ color: "#94a3b8", padding: "40px", textAlign: "center" }}>
    Quiz — próximamente
  </div>
)}
```

- [ ] **Step 5: Verificar en el navegador**

Las 4 pestañas deben ser clicables. La pestaña activa tiene fondo azul semitransparente. Las otras 3 muestran el placeholder.

- [ ] **Step 6: Commit**

```bash
git add src/PeriodicTable.jsx
git commit -m "feat: navegación por 4 pestañas (tabla, calculadora, comparar, quiz)"
```

---

### Task 6: Mapa de calor

**Files:**
- Modify: `src/PeriodicTable.jsx`

- [ ] **Step 1: Agregar estado `propertyMode` y el import de `heatColor`**

Al inicio del archivo, añadir el import:

```jsx
import { heatColor } from './utils.js';
```

En el componente, después de `const [filter, setFilter] = useState(null)`:

```jsx
const [propertyMode, setPropertyMode] = useState("category");
```

- [ ] **Step 2: Calcular los rangos min/max con useMemo**

Añadir después de la declaración de `matches`:

```jsx
const heatRange = useMemo(() => {
  const mode = PROPERTY_MODES[propertyMode];
  if (!mode.prop) return null;
  const values = ELEMENTS.map(e => e[mode.prop]).filter(v => v !== null && v !== undefined);
  return { min: Math.min(...values), max: Math.max(...values) };
}, [propertyMode]);
```

- [ ] **Step 3: Añadir el selector de mapa de calor en la pestaña Tabla**

Dentro del bloque `{activeTab === "table" && ...}`, justo antes del grid de la tabla periódica, añadir:

```jsx
{/* Selector de mapa de calor */}
<div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center", flexWrap: "wrap" }}>
  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{t.visualize}:</span>
  {Object.entries(PROPERTY_MODES).map(([key, mode]) => (
    <button
      key={key}
      onClick={() => setPropertyMode(key)}
      style={{
        padding: "4px 10px",
        fontSize: "12px",
        background: propertyMode === key ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${propertyMode === key ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "6px",
        color: propertyMode === key ? "#93c5fd" : "#94a3b8",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      {mode.label[lang]}
      {mode.unit && <span style={{ opacity: 0.6, marginLeft: "4px" }}>({mode.unit})</span>}
    </button>
  ))}
</div>

{/* Leyenda del mapa de calor */}
{heatRange && propertyMode !== "category" && (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "11px", color: "#94a3b8" }}>
    <span>{heatRange.min}</span>
    <div style={{
      flex: 1,
      maxWidth: "200px",
      height: "8px",
      borderRadius: "4px",
      background: "linear-gradient(to right, rgb(59,130,246), rgb(245,158,11), rgb(239,68,68))",
    }} />
    <span>{heatRange.max} {PROPERTY_MODES[propertyMode].unit}</span>
  </div>
)}
```

- [ ] **Step 4: Actualizar la lógica de color de los elementos en el grid**

En el `ELEMENTS.map(el => ...)` que renderiza los botones de la tabla, reemplazar la lógica de color:

```jsx
// Calcular colores según el modo
const heat = propertyMode !== "category" && heatRange
  ? heatColor(el[PROPERTY_MODES[propertyMode].prop], heatRange.min, heatRange.max)
  : null;

const cat = CATEGORIES[el.cat];
const elBg     = heat ? heat.bg     : (isMatch ? cat.bg     : "rgba(255,255,255,0.02)");
const elBorder = heat ? (isMatch ? heat.border : "rgba(255,255,255,0.05)") : (isSelected ? cat.color : (isMatch ? cat.border : "rgba(255,255,255,0.05)"));
const elColor  = heat ? heat.color  : (isMatch ? "#fff" : "#52525b");
```

Luego usar `elBg`, `elBorder`, `elColor` en el `style` del botón en lugar de las referencias directas a `cat.bg`, `cat.border`.

- [ ] **Step 5: Verificar en el navegador**

Al hacer clic en "Electronegatividad", los elementos deben cambiar de color: F y O rojos (alta electroneg.), metales alcalinos azules (baja electroneg.), gases nobles en gris. La leyenda muestra el rango 0.70–3.98 Pauling.

- [ ] **Step 6: Commit**

```bash
git add src/PeriodicTable.jsx
git commit -m "feat: mapa de calor con 6 propiedades (electroneg, radio, ionización, fusión, masa)"
```

---

### Task 7: Panel de detalle ampliado

**Files:**
- Modify: `src/PeriodicTable.jsx`

- [ ] **Step 1: Añadir las nuevas propiedades al grid de stats del panel de detalle**

Localizar el bloque `<div style={{ display: "grid", gridTemplateColumns: ...` del panel de detalle. Agregar los nuevos `<Stat>` junto a los existentes:

```jsx
<Stat label={t.electroneg} value={display.electroneg !== null ? `${display.electroneg} (Pauling)` : t.unknown} />
<Stat label={t.radius}     value={display.radius     !== null ? `${display.radius} pm`            : t.unknown} />
<Stat label={t.ionization} value={display.ionization !== null ? `${display.ionization} kJ/mol`    : t.unknown} />
```

- [ ] **Step 2: Añadir los estados de oxidación como badges**

Justo después del grid de stats, añadir:

```jsx
{display.oxidation && (
  <div style={{ marginTop: "10px" }}>
    <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
      {t.oxidation}
    </div>
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {display.oxidation.map(ox => (
        <span
          key={ox}
          style={{
            padding: "2px 8px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "600",
            background: ox.startsWith("+") ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${ox.startsWith("+") ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
            color: ox.startsWith("+") ? "#86efac" : "#fca5a5",
          }}
        >
          {ox}
        </span>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Verificar en el navegador**

Al hacer hover en cualquier elemento, el panel debe mostrar 10 stats (los 7 originales + electroneg, radio, ionización) y debajo los badges de estados de oxidación en verde (positivos) y rojo (negativos).

- [ ] **Step 4: Commit**

```bash
git add src/PeriodicTable.jsx
git commit -m "feat: panel de detalle ampliado con electroneg, radio, ionización y estados de oxidación"
```

---

### Task 8: Pestaña Calculadora de Masa Molar

**Files:**
- Modify: `src/PeriodicTable.jsx`

- [ ] **Step 1: Agregar imports y estado**

Añadir al import de utils:

```jsx
import { heatColor, parseFormula } from './utils.js';
```

En el componente, añadir estado:

```jsx
const [formula, setFormula] = useState("");
```

- [ ] **Step 2: Crear el mapa símbolo → elemento**

Añadir como constante fuera del componente (después de `ELEMENTS`):

```js
const ELEMENT_BY_SYMBOL = Object.fromEntries(ELEMENTS.map(e => [e.s, e]));
```

- [ ] **Step 3: Calcular resultado de la calculadora con useMemo**

En el componente, añadir:

```jsx
const calcResult = useMemo(() => {
  if (!formula.trim()) return null;
  const parsed = parseFormula(formula);
  if (!parsed.ok) return { error: parsed.error };

  const rows = [];
  let total = 0;
  for (const [sym, count] of Object.entries(parsed.counts)) {
    const el = ELEMENT_BY_SYMBOL[sym];
    if (!el) return { error: lang === "es" ? `Símbolo desconocido: ${sym}` : `Unknown symbol: ${sym}` };
    const subtotal = el.mass * count;
    total += subtotal;
    rows.push({ sym, name: el.name[lang], count, massPerAtom: el.mass, subtotal });
  }
  // agregar % en masa
  return {
    total,
    rows: rows.map(r => ({ ...r, pct: ((r.subtotal / total) * 100).toFixed(2) })),
  };
}, [formula, lang]);
```

- [ ] **Step 4: Añadir traducciones para la calculadora en T**

En `T.en` agregar:

```js
calcTitle:     "Molar Mass Calculator",
calcPlaceholder: "Enter formula (e.g. H2O, Ca(OH)2)",
calcMolarMass: "Molar mass",
calcElement:   "Element",
calcAtoms:     "Atoms",
calcMassPerAtom: "Mass/atom (u)",
calcSubtotal:  "Subtotal (u)",
calcPct:       "% by mass",
calcError:     "Invalid formula",
```

En `T.es` agregar:

```js
calcTitle:     "Calculadora de Masa Molar",
calcPlaceholder: "Ingresa fórmula (ej. H2O, Ca(OH)2)",
calcMolarMass: "Masa molar",
calcElement:   "Elemento",
calcAtoms:     "Átomos",
calcMassPerAtom: "Masa/átomo (u)",
calcSubtotal:  "Subtotal (u)",
calcPct:       "% en masa",
calcError:     "Fórmula inválida",
```

- [ ] **Step 5: Reemplazar el placeholder de la pestaña Calculadora**

Reemplazar `{activeTab === "calculator" && <div>...próximamente</div>}` con:

```jsx
{activeTab === "calculator" && (
  <div style={{ maxWidth: "700px" }}>
    <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", marginBottom: "20px" }}>
      {t.calcTitle}
    </h2>

    <input
      type="text"
      placeholder={t.calcPlaceholder}
      value={formula}
      onChange={e => setFormula(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 16px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "8px",
        color: "#f1f5f9",
        fontSize: "18px",
        fontFamily: "monospace",
        outline: "none",
        marginBottom: "20px",
        boxSizing: "border-box",
      }}
    />

    {calcResult?.error && (
      <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", marginBottom: "16px" }}>
        {calcResult.error}
      </div>
    )}

    {calcResult && !calcResult.error && (
      <>
        <div style={{ fontSize: "28px", fontWeight: "700", color: "#60a5fa", marginBottom: "20px" }}>
          {calcResult.total.toFixed(4)} <span style={{ fontSize: "16px", color: "#94a3b8" }}>g/mol</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              {[t.calcElement, t.calcAtoms, t.calcMassPerAtom, t.calcSubtotal, t.calcPct].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calcResult.rows.map(row => (
              <tr key={row.sym} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "10px 12px", color: "#f1f5f9", fontWeight: "600" }}>
                  {row.sym} <span style={{ color: "#94a3b8", fontWeight: "400" }}>— {row.name}</span>
                </td>
                <td style={{ padding: "10px 12px", color: "#e2e8f0", textAlign: "center" }}>{row.count}</td>
                <td style={{ padding: "10px 12px", color: "#e2e8f0" }}>{row.massPerAtom.toFixed(4)}</td>
                <td style={{ padding: "10px 12px", color: "#e2e8f0" }}>{row.subtotal.toFixed(4)}</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: `${parseFloat(row.pct)}%`, maxWidth: "60px", height: "4px", borderRadius: "2px", background: "#60a5fa" }} />
                    <span style={{ color: "#93c5fd" }}>{row.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </div>
)}
```

- [ ] **Step 6: Verificar en el navegador**

En la pestaña Calculadora, ingresar `H2O` → debe mostrar `18.0150 g/mol` con desglose (H: 2 átomos, O: 1 átomo). Ingresar `Ca(OH)2` → `74.0932 g/mol`. Ingresar `XYZ` → mensaje de error "Símbolo desconocido: Xy".

- [ ] **Step 7: Commit**

```bash
git add src/PeriodicTable.jsx
git commit -m "feat: calculadora de masa molar con desglose y porcentajes en masa"
```

---

### Task 9: Pestaña Comparar Elementos

**Files:**
- Modify: `src/PeriodicTable.jsx`

- [ ] **Step 1: Agregar estado para la comparación**

En el componente:

```jsx
const [compareA, setCompareA] = useState(null); // Element | null
const [compareB, setCompareB] = useState(null); // Element | null
const [compareSearchA, setCompareSearchA] = useState("");
const [compareSearchB, setCompareSearchB] = useState("");
```

- [ ] **Step 2: Añadir traducciones para Comparar**

En `T.en`:

```js
compareTitle:     "Compare Elements",
compareSelect:    "Select an element…",
compareSwap:      "↔ Swap",
compareClear:     "Clear",
compareHigher:    "Higher",
compareLower:     "Lower",
compareNA:        "N/A",
```

En `T.es`:

```js
compareTitle:     "Comparar Elementos",
compareSelect:    "Seleccionar elemento…",
compareSwap:      "↔ Intercambiar",
compareClear:     "Limpiar",
compareHigher:    "Mayor",
compareLower:     "Menor",
compareNA:        "N/D",
```

- [ ] **Step 3: Añadir función helper para buscar elementos**

Fuera del componente:

```js
function searchElements(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ELEMENTS.filter(e =>
    e.s.toLowerCase().startsWith(q) ||
    e.name.es.toLowerCase().includes(q) ||
    e.name.en.toLowerCase().includes(q) ||
    String(e.n) === q
  ).slice(0, 8);
}
```

- [ ] **Step 4: Reemplazar el placeholder de la pestaña Comparar**

```jsx
{activeTab === "compare" && (
  <div>
    <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", marginBottom: "20px" }}>
      {t.compareTitle}
    </h2>

    {/* Selectores */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "start", marginBottom: "24px" }}>
      <ElementPicker
        label="A"
        value={compareA}
        search={compareSearchA}
        onSearch={setCompareSearchA}
        onSelect={el => { setCompareA(el); setCompareSearchA(""); }}
        onClear={() => setCompareA(null)}
        lang={lang}
        t={t}
      />

      <button
        onClick={() => { const tmp = compareA; setCompareA(compareB); setCompareB(tmp); }}
        disabled={!compareA || !compareB}
        style={{
          marginTop: "28px",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "8px",
          color: compareA && compareB ? "#e2e8f0" : "#4b5563",
          cursor: compareA && compareB ? "pointer" : "default",
          fontFamily: "inherit",
          fontSize: "13px",
        }}
      >
        {t.compareSwap}
      </button>

      <ElementPicker
        label="B"
        value={compareB}
        search={compareSearchB}
        onSearch={setCompareSearchB}
        onSelect={el => { setCompareB(el); setCompareSearchB(""); }}
        onClear={() => setCompareB(null)}
        lang={lang}
        t={t}
      />
    </div>

    {/* Tabla comparativa */}
    {compareA && compareB && (
      <CompareTable a={compareA} b={compareB} lang={lang} t={t} />
    )}

    {(!compareA || !compareB) && (
      <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
        {t.compareSelect}
      </div>
    )}
  </div>
)}
```

- [ ] **Step 5: Crear el subcomponente `ElementPicker`**

Añadir fuera del componente principal, al final del archivo:

```jsx
function ElementPicker({ label, value, search, onSearch, onSelect, onClear, lang, t }) {
  const results = searchElements(search);
  return (
    <div>
      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
        {lang === "es" ? `Elemento ${label}` : `Element ${label}`}
      </div>
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: `${CATEGORIES[value.cat].bg}`, border: `1px solid ${CATEGORIES[value.cat].border}`, borderRadius: "8px" }}>
          <span style={{ fontSize: "24px", fontWeight: "700", color: "#fff" }}>{value.s}</span>
          <span style={{ color: "#cbd5e1" }}>{value.name[lang]}</span>
          <button onClick={onClear} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}>×</button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder={t.compareSelect}
            value={search}
            onChange={e => onSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: "14px",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {results.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", marginTop: "4px", zIndex: 10, overflow: "hidden" }}>
              {results.map(el => (
                <button
                  key={el.n}
                  onClick={() => onSelect(el)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "8px 14px", background: "none", border: "none", color: "#f1f5f9", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseOut={e => e.currentTarget.style.background = "none"}
                >
                  <span style={{ fontSize: "18px", fontWeight: "700", minWidth: "28px", color: CATEGORIES[el.cat].color }}>{el.s}</span>
                  <span style={{ fontSize: "13px" }}>{el.name[lang]}</span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "#64748b" }}>#{el.n}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Crear el subcomponente `CompareTable`**

Añadir al final del archivo:

```jsx
function CompareTable({ a, b, lang, t }) {
  const rows = [
    { label: lang === "es" ? "Número atómico" : "Atomic number",    va: a.n,           vb: b.n,           numeric: true },
    { label: lang === "es" ? "Masa atómica (u)" : "Atomic mass (u)", va: a.mass,        vb: b.mass,        numeric: true },
    { label: lang === "es" ? "Categoría" : "Category",              va: CATEGORIES[a.cat].label[lang], vb: CATEGORIES[b.cat].label[lang], numeric: false },
    { label: lang === "es" ? "Fase (STP)" : "Phase (STP)",          va: a.phase[lang], vb: b.phase[lang], numeric: false },
    { label: lang === "es" ? "Config. electrónica" : "Electron config.", va: a.config,  vb: b.config,      numeric: false },
    { label: lang === "es" ? "Electronegatividad" : "Electronegativity", va: a.electroneg, vb: b.electroneg, numeric: true },
    { label: lang === "es" ? "Radio atómico (pm)" : "Atomic radius (pm)", va: a.radius, vb: b.radius,     numeric: true },
    { label: lang === "es" ? "E. ionización (kJ/mol)" : "Ioniz. energy (kJ/mol)", va: a.ionization, vb: b.ionization, numeric: true },
    { label: lang === "es" ? "Fusión (°C)" : "Melting (°C)",         va: a.melt,        vb: b.melt,        numeric: true },
    { label: lang === "es" ? "Ebullición (°C)" : "Boiling (°C)",     va: a.boil,        vb: b.boil,        numeric: true },
    { label: lang === "es" ? "Estados de oxidación" : "Oxidation states", va: a.oxidation ? a.oxidation.join(", ") : "—", vb: b.oxidation ? b.oxidation.join(", ") : "—", numeric: false },
    { label: lang === "es" ? "Descubierto" : "Discovered",           va: a.discovered < 0 ? `~${Math.abs(a.discovered)} a.C.` : a.discovered, vb: b.discovered < 0 ? `~${Math.abs(b.discovered)} a.C.` : b.discovered, numeric: false },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8", width: "35%" }}>
              {lang === "es" ? "Propiedad" : "Property"}
            </th>
            {[a, b].map(el => (
              <th key={el.n} style={{ padding: "10px 14px", textAlign: "center", color: CATEGORIES[el.cat].color }}>
                {el.s} — {el.name[lang]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const aNum = parseFloat(row.va);
            const bNum = parseFloat(row.vb);
            const aHigher = row.numeric && !isNaN(aNum) && !isNaN(bNum) && aNum > bNum;
            const bHigher = row.numeric && !isNaN(aNum) && !isNaN(bNum) && bNum > aNum;
            const highlight = (higher) => higher
              ? { color: "#86efac", fontWeight: "600" }
              : { color: "#94a3b8" };
            const na = (v) => (v === null || v === undefined) ? "—" : v;
            return (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{row.label}</td>
                <td style={{ padding: "10px 14px", textAlign: "center", ...highlight(aHigher) }}>{na(row.va)}</td>
                <td style={{ padding: "10px 14px", textAlign: "center", ...highlight(bHigher) }}>{na(row.vb)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 7: Verificar en el navegador**

En la pestaña Comparar, buscar "Fe" y "Cu". Deben aparecer en los selectores A y B. La tabla debe mostrar todas las propiedades con los valores mayores resaltados en verde.

- [ ] **Step 8: Commit**

```bash
git add src/PeriodicTable.jsx
git commit -m "feat: pestaña comparar elementos con tabla interactiva"
```

---

### Task 10: Pestaña Quiz

**Files:**
- Modify: `src/PeriodicTable.jsx`

- [ ] **Step 1: Agregar import de normalizeText y estado del quiz**

Actualizar el import:

```jsx
import { heatColor, parseFormula, normalizeText } from './utils.js';
```

En el componente, añadir estados:

```jsx
const [quizMode, setQuizMode] = useState("symbolToName"); // "symbolToName"|"nameToSymbol"|"propertyToElement"
const [quizCurrent, setQuizCurrent] = useState(null);     // Element | null
const [quizAnswer, setQuizAnswer]   = useState("");
const [quizResult, setQuizResult]   = useState("idle");   // "idle"|"correct"|"wrong"
const [quizStreak, setQuizStreak]   = useState(0);
const [quizScore, setQuizScore]     = useState(0);
const [quizSeen, setQuizSeen]       = useState(new Set());
```

- [ ] **Step 2: Añadir traducciones del quiz**

En `T.en`:

```js
quizTitle:      "Study Quiz",
quizMode1:      "Symbol → Name",
quizMode2:      "Name → Symbol",
quizMode3:      "Property → Element",
quizAnswer:     "Your answer…",
quizCheck:      "Check",
quizNext:       "Next →",
quizStreak:     "Streak",
quizScore:      "Score",
quizCorrect:    "Correct!",
quizWrong:      "Wrong. Answer:",
quizGuess:      "Identify this element:",
quizHint:       "Hint",
```

En `T.es`:

```js
quizTitle:      "Quiz de Estudio",
quizMode1:      "Símbolo → Nombre",
quizMode2:      "Nombre → Símbolo",
quizMode3:      "Propiedad → Elemento",
quizAnswer:     "Tu respuesta…",
quizCheck:      "Verificar",
quizNext:       "Siguiente →",
quizStreak:     "Racha",
quizScore:      "Puntuación",
quizCorrect:    "¡Correcto!",
quizWrong:      "Incorrecto. Respuesta:",
quizGuess:      "Identifica este elemento:",
quizHint:       "Pista",
```

- [ ] **Step 3: Añadir función para obtener elemento aleatorio sin repetición**

Fuera del componente:

```js
function pickRandom(seen, total) {
  const remaining = Array.from({ length: total }, (_, i) => i + 1).filter(n => !seen.has(n));
  if (remaining.length === 0) return null; // completó todos
  return ELEMENTS.find(e => e.n === remaining[Math.floor(Math.random() * remaining.length)]);
}
```

- [ ] **Step 4: Añadir función para validar respuesta del quiz**

Fuera del componente:

```js
function checkQuizAnswer(mode, current, answer, lang) {
  const norm = normalizeText(answer);
  if (norm === "") return false;
  if (mode === "symbolToName") {
    return norm === normalizeText(current.name.es) || norm === normalizeText(current.name.en);
  }
  if (mode === "nameToSymbol") {
    return norm === normalizeText(current.s);
  }
  if (mode === "propertyToElement") {
    return norm === normalizeText(current.s) || norm === normalizeText(current.name[lang]) || norm === normalizeText(current.name[lang === "es" ? "en" : "es"]);
  }
  return false;
}
```

- [ ] **Step 5: Añadir función para construir la pregunta del quiz**

Fuera del componente:

```js
function buildQuizQuestion(mode, element, lang) {
  if (mode === "symbolToName") return element.s;
  if (mode === "nameToSymbol") return element.name[lang];
  if (mode === "propertyToElement") {
    const hints = [];
    if (element.electroneg !== null) hints.push(`EN: ${element.electroneg}`);
    hints.push(element.phase[lang]);
    hints.push(CATEGORIES[element.cat].label[lang]);
    if (element.melt !== null) hints.push(`${lang === "es" ? "Fusión" : "Melting"}: ${element.melt}°C`);
    return hints.join(" · ");
  }
  return "";
}
```

- [ ] **Step 6: Reemplazar el placeholder de la pestaña Quiz**

```jsx
{activeTab === "quiz" && (() => {
  const startQuiz = () => {
    const el = pickRandom(quizSeen, 118);
    if (el) { setQuizCurrent(el); setQuizAnswer(""); setQuizResult("idle"); }
    else { setQuizSeen(new Set()); const el2 = pickRandom(new Set(), 118); setQuizCurrent(el2); setQuizAnswer(""); setQuizResult("idle"); }
  };

  const handleCheck = () => {
    if (!quizCurrent || quizResult !== "idle") return;
    const correct = checkQuizAnswer(quizMode, quizCurrent, quizAnswer, lang);
    setQuizResult(correct ? "correct" : "wrong");
    if (correct) { setQuizStreak(s => s + 1); setQuizScore(s => s + 1); setQuizSeen(s => new Set([...s, quizCurrent.n])); }
    else { setQuizStreak(0); }
  };

  const handleNext = () => {
    const el = pickRandom(quizSeen, 118);
    if (!el) {
      const empty = new Set();
      setQuizSeen(empty);
      setQuizCurrent(pickRandom(empty, 118));
    } else {
      setQuizCurrent(el);
    }
    setQuizAnswer("");
    setQuizResult("idle");
  };

  return (
    <div style={{ maxWidth: "520px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", margin: 0 }}>{t.quizTitle}</h2>
        <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
          <span style={{ color: "#94a3b8" }}>{t.quizStreak}: <strong style={{ color: "#f59e0b" }}>{quizStreak}</strong></span>
          <span style={{ color: "#94a3b8" }}>{t.quizScore}: <strong style={{ color: "#60a5fa" }}>{quizScore}</strong></span>
        </div>
      </div>

      {/* Selector de modo */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "3px" }}>
        {[["symbolToName", t.quizMode1], ["nameToSymbol", t.quizMode2], ["propertyToElement", t.quizMode3]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setQuizMode(id); setQuizCurrent(null); setQuizAnswer(""); setQuizResult("idle"); }}
            style={{
              flex: 1,
              padding: "6px 8px",
              fontSize: "11px",
              background: quizMode === id ? "rgba(96,165,250,0.2)" : "transparent",
              border: `1px solid ${quizMode === id ? "rgba(96,165,250,0.4)" : "transparent"}`,
              borderRadius: "6px",
              color: quizMode === id ? "#93c5fd" : "#64748b",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tarjeta de pregunta */}
      {!quizCurrent ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <button
            onClick={startQuiz}
            style={{
              padding: "12px 32px",
              background: "rgba(96,165,250,0.2)",
              border: "1px solid rgba(96,165,250,0.4)",
              borderRadius: "8px",
              color: "#93c5fd",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {lang === "es" ? "Comenzar Quiz" : "Start Quiz"}
          </button>
        </div>
      ) : (
        <>
          <div style={{
            padding: "32px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "16px",
          }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              {t.quizGuess}
            </div>
            <div style={{ fontSize: quizMode === "propertyToElement" ? "18px" : "52px", fontWeight: "700", color: "#f1f5f9", lineHeight: 1.2 }}>
              {buildQuizQuestion(quizMode, quizCurrent, lang)}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="text"
              placeholder={t.quizAnswer}
              value={quizAnswer}
              onChange={e => setQuizAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") quizResult === "idle" ? handleCheck() : handleNext(); }}
              disabled={quizResult !== "idle"}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${quizResult === "correct" ? "rgba(34,197,94,0.5)" : quizResult === "wrong" ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "16px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            {quizResult === "idle" ? (
              <button
                onClick={handleCheck}
                style={{ padding: "10px 18px", background: "rgba(96,165,250,0.2)", border: "1px solid rgba(96,165,250,0.4)", borderRadius: "8px", color: "#93c5fd", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: "600" }}
              >
                {t.quizCheck}
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{ padding: "10px 18px", background: "rgba(96,165,250,0.2)", border: "1px solid rgba(96,165,250,0.4)", borderRadius: "8px", color: "#93c5fd", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: "600" }}
              >
                {t.quizNext}
              </button>
            )}
          </div>

          {quizResult !== "idle" && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "8px",
              background: quizResult === "correct" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${quizResult === "correct" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: quizResult === "correct" ? "#86efac" : "#fca5a5",
              fontSize: "14px",
            }}>
              {quizResult === "correct"
                ? t.quizCorrect
                : `${t.quizWrong} ${quizMode === "nameToSymbol" ? quizCurrent.s : quizCurrent.name[lang]}`
              }
            </div>
          )}
        </>
      )}
    </div>
  );
})()}
```

- [ ] **Step 7: Verificar en el navegador**

En la pestaña Quiz:
- Modo "Símbolo → Nombre": aparece un símbolo (ej. "Fe"), ingresar "Hierro" → correcto; ingresar "hierro" → correcto; ingresar "iron" → correcto; ingresar "xyz" → incorrecto con respuesta correcta.
- La racha aumenta con respuestas correctas y se reinicia en incorrectas.
- El botón Siguiente avanza al próximo elemento.

- [ ] **Step 8: Commit**

```bash
git add src/PeriodicTable.jsx
git commit -m "feat: quiz con 3 modos, racha y puntuación"
```

---

### Task 11: GitHub y Vercel

**Files:** ningún archivo nuevo

- [ ] **Step 1: Crear repositorio en GitHub**

Usar el GitHub MCP tool (`mcp__github__create_repository`) con:
- `name`: `tabla-periodica`
- `description`: `Tabla periódica interactiva con mapa de calor, calculadora de masa molar, comparador y quiz — React + Vite`
- `private`: false
- `auto_init`: false

- [ ] **Step 2: Agregar remote y hacer push**

```bash
git remote add origin https://github.com/<tu-usuario>/tabla-periodica.git
git branch -M main
git push -u origin main
```

Reemplazar `<tu-usuario>` con el nombre de usuario de GitHub obtenido del step anterior.

- [ ] **Step 3: Verificar el push**

```bash
git log --oneline -8
```

Esperado: 8 commits visibles (uno por tarea implementada).

- [ ] **Step 4: Conectar con Vercel**

Ir a [vercel.com/new](https://vercel.com/new), importar el repositorio `tabla-periodica`. Vercel detecta automáticamente Vite. Configuración por defecto:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Hacer clic en **Deploy**. El sitio estará disponible en `https://tabla-periodica-<hash>.vercel.app`.

- [ ] **Step 5: Commit final con URL de Vercel**

Una vez obtenida la URL de Vercel, crear un archivo `.vercel-url.txt` con la URL y hacer commit:

```bash
echo "https://tabla-periodica.vercel.app" > .vercel-url.txt
git add .vercel-url.txt
git commit -m "docs: URL de deploy en Vercel"
git push
```

---

## Resumen de Commits Esperados

```
feat: scaffold proyecto Vite + React
feat: funciones utilitarias con tests (heatColor, parseFormula, normalizeText)
feat: componente PeriodicTable base (código original)
feat: datos ampliados (electroneg, radio, ionización, oxidación) en 118 elementos
feat: navegación por 4 pestañas (tabla, calculadora, comparar, quiz)
feat: mapa de calor con 6 propiedades (electroneg, radio, ionización, fusión, masa)
feat: panel de detalle ampliado con electroneg, radio, ionización y estados de oxidación
feat: calculadora de masa molar con desglose y porcentajes en masa
feat: pestaña comparar elementos con tabla interactiva
feat: quiz con 3 modos, racha y puntuación
docs: URL de deploy en Vercel
```
