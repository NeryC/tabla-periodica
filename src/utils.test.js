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

  it('símbolo desconocido no rompe el parser', () => {
    const r = parseFormula('X2O')
    expect(r.ok).toBe(true)
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
