# Diseño: Tabla Periódica Interactiva Mejorada

**Fecha:** 2026-05-08  
**Stack:** Vite + React SPA  
**Deploy:** Vercel  
**Audiencia:** Estudiantes y profesionales de química  
**Idiomas:** Español / Inglés (toggle global)

---

## 1. Estructura del Proyecto

```
quimica/
├── index.html
├── package.json          (react, react-dom, vite)
├── vite.config.js
└── src/
    ├── main.jsx
    └── PeriodicTable.jsx  ← toda la lógica en un archivo
```

Sin dependencias externas más allá de React y Vite. Todo el estado y la lógica viven en `PeriodicTable.jsx` para mantener portabilidad y simplicidad de deploy.

---

## 2. Datos Nuevos por Elemento

A los 118 elementos existentes se agregan 4 campos nuevos:

| Campo        | Tipo            | Descripción                                      | Ejemplo (H)      |
|--------------|-----------------|--------------------------------------------------|------------------|
| `electroneg` | `number\|null`  | Electronegatividad de Pauling                    | `2.20`           |
| `radius`     | `number\|null`  | Radio atómico empírico en pm                     | `53`             |
| `ionization` | `number\|null`  | Primera energía de ionización en kJ/mol          | `1312`           |
| `oxidation`  | `string[]\|null`| Estados de oxidación comunes                     | `["+1", "-1"]`   |

`null` se usa cuando el dato no está disponible (ej. gases nobles sin electronegatividad, elementos sintéticos sin radio medido).

---

## 3. Organización de la UI: 4 Pestañas

```
┌─────────────────────────────────────────────────────────┐
│  🧪 Tabla Periódica Interactiva          [ES] [EN]       │
├─────────────┬───────────────┬────────────┬──────────────┤
│  🔬 Tabla   │ ⚗️ Calculadora │ 🔍 Comparar │    📝 Quiz   │
└─────────────┴───────────────┴────────────┴──────────────┘
```

El toggle de idioma ES/EN se mantiene siempre visible en el header, afecta todas las pestañas.

---

## 4. Pestaña 🔬 Tabla

### 4.1 Controles
- **Búsqueda:** por nombre, símbolo o número atómico
- **Filtro por categoría:** botones de colores (igual que el original)
- **Selector de mapa de calor:** dropdown con opciones:
  - Categoría (default, comportamiento actual)
  - Electronegatividad
  - Radio atómico
  - Energía de ionización
  - Punto de fusión
  - Masa atómica

### 4.2 Mapa de Calor
- Al seleccionar una propiedad distinta de "Categoría", los elementos se colorean con gradiente **azul → amarillo → rojo** (valores bajos → altos)
- Elementos sin dato: gris neutro
- Leyenda debajo del selector: barra de gradiente con valor mínimo y máximo
- Cálculo del gradiente: `t = (valor - min) / (max - min)` interpolado en 3 stops de color

### 4.3 Panel de Detalle (hover/clic)
Muestra al hacer hover o clic en un elemento. Añade a las propiedades existentes:
- **Electronegatividad** como stat
- **Radio atómico** como stat
- **Energía de ionización** como stat
- **Estados de oxidación** como badges de color por signo (+/-)

---

## 5. Pestaña ⚗️ Calculadora de Masa Molar

### 5.1 Input
- Campo de texto libre para fórmulas químicas
- Acepta: `H2O`, `NaCl`, `C6H12O6`, `Ca(OH)2`, `Al2(SO4)3`
- Parser recursivo que maneja paréntesis anidados y coeficientes

### 5.2 Parser de Fórmulas
```
parseFormula(formula):
  - Normalizar: quitar espacios, reemplazar [] por ()
  - Parsear recursivamente:
    - Si encuentra '(': parsear grupo interno, multiplicar por coeficiente
    - Si encuentra letra mayúscula: leer símbolo + coeficiente
  - Devuelve: { ok: bool, counts: {símbolo: cantidad}, error?: string }
```

### 5.3 Output
- **Masa molar total** en g/mol (4 decimales)
- **Tabla de desglose:**
  - Columnas: Elemento | Símbolo | Átomos | Masa (u) | Masa total | % en masa
- **Manejo de errores:** mensaje claro si símbolo desconocido o fórmula inválida

---

## 6. Pestaña 🔍 Comparar Elementos

### 6.1 Selección
- Dos buscadores (uno por elemento) con autocompletado por nombre o símbolo
- Botón de intercambio (↔) entre los dos elementos

### 6.2 Tabla Comparativa
Propiedades mostradas lado a lado:

| Propiedad | Elemento A | Elemento B |
|---|---|---|
| Número atómico | | |
| Masa atómica | | |
| Categoría | | |
| Fase (STP) | | |
| Config. electrónica | | |
| Electronegatividad | | |
| Radio atómico (pm) | | |
| E. ionización (kJ/mol) | | |
| Punto de fusión (°C) | | |
| Punto de ebullición (°C) | | |
| Estados de oxidación | | |
| Descubierto | | |

### 6.3 Resaltado Visual
- El valor **mayor** se resalta en verde para propiedades numéricas
- El valor **menor** se resalta en rojo/apagado
- Propiedades no numéricas (categoría, config.) sin resaltado

---

## 7. Pestaña 📝 Quiz

### 7.1 Modos
| Modo | Pista mostrada | Respuesta esperada |
|---|---|---|
| Símbolo → Nombre | `Fe` | "Hierro" o "Iron" |
| Nombre → Símbolo | `Oro` / `Gold` | "Au" |
| Propiedad → Elemento | Electroneg., fase, categoría | símbolo o nombre |

### 7.2 Mecánica
- Respuesta libre con texto
- Validación flexible: ignora mayúsculas, tildes/acentos opcionales
- Retroalimentación inmediata: ✓ correcto (verde) / ✗ incorrecto (rojo + respuesta correcta)
- Contador de racha actual y puntaje total de la sesión
- Botón "Siguiente" (o automático tras 1.5s en correcto)
- Elementos aleatorios sin repetición hasta completar el ciclo
- El idioma del quiz sigue el toggle ES/EN global

### 7.3 Estado
```
quizState: {
  mode: "symbol" | "name" | "property",
  current: Element,
  answer: string,
  result: "idle" | "correct" | "wrong",
  streak: number,
  score: number,
  seen: Set<number>  // números atómicos ya vistos
}
```

---

## 8. Estado Global del Componente

```javascript
// Tabla
const [selected, setSelected]           // elemento pinado por clic
const [hovered, setHovered]             // elemento en hover
const [search, setSearch]               // texto de búsqueda
const [filter, setFilter]               // categoría filtrada
const [propertyMode, setPropertyMode]   // modo del mapa de calor

// Navegación
const [activeTab, setActiveTab]         // "table" | "calculator" | "compare" | "quiz"
const [lang, setLang]                   // "es" | "en"

// Calculadora
const [formula, setFormula]             // texto de la fórmula
const [calcResult, setCalcResult]       // resultado parseado o null

// Comparar
const [compareA, setCompareA]           // Element | null
const [compareB, setCompareB]           // Element | null

// Quiz
const [quizMode, setQuizMode]
const [quizState, setQuizState]
```

---

## 9. Optimizaciones de Código

Respecto al código original:
- Usar `useMemo` para el set de matches de búsqueda (ya existe, mantener)
- Usar `useMemo` para los rangos min/max del mapa de calor
- Usar `useCallback` para handlers de eventos frecuentes (hover, click en elementos)
- El parser de fórmulas es una función pura fuera del componente (sin hooks)

---

## 10. Deploy en Vercel

- `vite.config.js` estándar, sin configuración especial
- Vercel detecta automáticamente proyectos Vite
- Build command: `npm run build` (genera `dist/`)
- Output dir: `dist`
- Sin variables de entorno necesarias
