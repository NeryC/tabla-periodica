import React, { useState, useMemo, useEffect } from "react";
import { heatColor, parseFormula, normalizeText } from './utils.js';

const ELEMENTS = [
  { n: 1, s: "H", name: { en: "Hydrogen", es: "Hidrógeno" }, mass: 1.008, cat: "nonmetal", row: 1, col: 1, config: "1s¹", phase: { en: "Gas", es: "Gas" }, melt: -259.16, boil: -252.87, discovered: 1766, discoverer: "Henry Cavendish", electroneg: 2.2, radius: 53, ionization: 1312, oxidation: ["+1","-1"], desc: { en: "The lightest and most abundant element in the universe. Forms water with oxygen.", es: "El elemento más ligero y abundante del universo. Forma agua con el oxígeno." } },
  { n: 2, s: "He", name: { en: "Helium", es: "Helio" }, mass: 4.0026, cat: "noble", row: 1, col: 18, config: "1s²", phase: { en: "Gas", es: "Gas" }, melt: -272.2, boil: -268.93, discovered: 1868, discoverer: "Pierre Janssen", electroneg: null, radius: 31, ionization: 2372, oxidation: ["0"], desc: { en: "Second most abundant element. Used in balloons and as a coolant for superconductors.", es: "Segundo elemento más abundante. Usado en globos y como refrigerante para superconductores." } },
  { n: 3, s: "Li", name: { en: "Lithium", es: "Litio" }, mass: 6.94, cat: "alkali", row: 2, col: 1, config: "[He] 2s¹", phase: { en: "Solid", es: "Sólido" }, melt: 180.5, boil: 1342, discovered: 1817, discoverer: "Johan August Arfwedson", electroneg: 0.98, radius: 167, ionization: 520, oxidation: ["+1"], desc: { en: "Lightest metal. Used in rechargeable batteries and mood-stabilizing medications.", es: "El metal más ligero. Usado en baterías recargables y medicamentos estabilizadores del ánimo." } },
  { n: 4, s: "Be", name: { en: "Beryllium", es: "Berilio" }, mass: 9.0122, cat: "alkaline", row: 2, col: 2, config: "[He] 2s²", phase: { en: "Solid", es: "Sólido" }, melt: 1287, boil: 2469, discovered: 1798, discoverer: "Louis-Nicolas Vauquelin", electroneg: 1.57, radius: 112, ionization: 899, oxidation: ["+2"], desc: { en: "Strong, lightweight metal used in aerospace and X-ray equipment windows.", es: "Metal fuerte y ligero usado en aeroespacial y ventanas de equipos de rayos X." } },
  { n: 5, s: "B", name: { en: "Boron", es: "Boro" }, mass: 10.81, cat: "metalloid", row: 2, col: 13, config: "[He] 2s² 2p¹", phase: { en: "Solid", es: "Sólido" }, melt: 2076, boil: 3927, discovered: 1808, discoverer: "Joseph Louis Gay-Lussac", electroneg: 2.04, radius: 87, ionization: 801, oxidation: ["+3"], desc: { en: "Metalloid used in glass, ceramics, and detergents (borax).", es: "Metaloide usado en vidrio, cerámica y detergentes (bórax)." } },
  { n: 6, s: "C", name: { en: "Carbon", es: "Carbono" }, mass: 12.011, cat: "nonmetal", row: 2, col: 14, config: "[He] 2s² 2p²", phase: { en: "Solid", es: "Sólido" }, melt: 3550, boil: 4027, discovered: -3750, discoverer: "Ancient", electroneg: 2.55, radius: 67, ionization: 1086, oxidation: ["-4","+2","+4"], desc: { en: "Foundation of all known life. Forms diamonds, graphite, and millions of organic compounds.", es: "Base de toda la vida conocida. Forma diamantes, grafito y millones de compuestos orgánicos." } },
  { n: 7, s: "N", name: { en: "Nitrogen", es: "Nitrógeno" }, mass: 14.007, cat: "nonmetal", row: 2, col: 15, config: "[He] 2s² 2p³", phase: { en: "Gas", es: "Gas" }, melt: -210, boil: -195.79, discovered: 1772, discoverer: "Daniel Rutherford", electroneg: 3.04, radius: 56, ionization: 1402, oxidation: ["-3","+3","+5"], desc: { en: "Makes up 78% of Earth's atmosphere. Essential for proteins and DNA.", es: "Constituye el 78% de la atmósfera terrestre. Esencial para proteínas y ADN." } },
  { n: 8, s: "O", name: { en: "Oxygen", es: "Oxígeno" }, mass: 15.999, cat: "nonmetal", row: 2, col: 16, config: "[He] 2s² 2p⁴", phase: { en: "Gas", es: "Gas" }, melt: -218.79, boil: -182.96, discovered: 1774, discoverer: "Carl Wilhelm Scheele", electroneg: 3.44, radius: 48, ionization: 1314, oxidation: ["-2","-1"], desc: { en: "Essential for respiration in most life forms. Highly reactive oxidizer.", es: "Esencial para la respiración en la mayoría de formas de vida. Oxidante altamente reactivo." } },
  { n: 9, s: "F", name: { en: "Fluorine", es: "Flúor" }, mass: 18.998, cat: "halogen", row: 2, col: 17, config: "[He] 2s² 2p⁵", phase: { en: "Gas", es: "Gas" }, melt: -219.67, boil: -188.11, discovered: 1886, discoverer: "Henri Moissan", electroneg: 3.98, radius: 42, ionization: 1681, oxidation: ["-1"], desc: { en: "Most reactive and electronegative element. Used in toothpaste and Teflon.", es: "El elemento más reactivo y electronegativo. Usado en pasta dental y Teflón." } },
  { n: 10, s: "Ne", name: { en: "Neon", es: "Neón" }, mass: 20.180, cat: "noble", row: 2, col: 18, config: "[He] 2s² 2p⁶", phase: { en: "Gas", es: "Gas" }, melt: -248.59, boil: -246.05, discovered: 1898, discoverer: "William Ramsay", electroneg: null, radius: 38, ionization: 2081, oxidation: ["0"], desc: { en: "Inert gas famous for its bright orange-red glow in advertising signs.", es: "Gas inerte famoso por su brillo naranja-rojo en letreros publicitarios." } },
  { n: 11, s: "Na", name: { en: "Sodium", es: "Sodio" }, mass: 22.990, cat: "alkali", row: 3, col: 1, config: "[Ne] 3s¹", phase: { en: "Solid", es: "Sólido" }, melt: 97.79, boil: 883, discovered: 1807, discoverer: "Humphry Davy", electroneg: 0.93, radius: 190, ionization: 496, oxidation: ["+1"], desc: { en: "Soft silvery metal. Essential electrolyte in biology; reacts violently with water.", es: "Metal blando y plateado. Electrolito esencial en biología; reacciona violentamente con el agua." } },
  { n: 12, s: "Mg", name: { en: "Magnesium", es: "Magnesio" }, mass: 24.305, cat: "alkaline", row: 3, col: 2, config: "[Ne] 3s²", phase: { en: "Solid", es: "Sólido" }, melt: 650, boil: 1090, discovered: 1808, discoverer: "Humphry Davy", electroneg: 1.31, radius: 145, ionization: 738, oxidation: ["+2"], desc: { en: "Lightweight structural metal. Burns with brilliant white flame; used in flares.", es: "Metal estructural ligero. Arde con llama blanca brillante; usado en bengalas." } },
  { n: 13, s: "Al", name: { en: "Aluminum", es: "Aluminio" }, mass: 26.982, cat: "post-transition", row: 3, col: 13, config: "[Ne] 3s² 3p¹", phase: { en: "Solid", es: "Sólido" }, melt: 660.32, boil: 2470, discovered: 1825, discoverer: "Hans Christian Ørsted", electroneg: 1.61, radius: 118, ionization: 578, oxidation: ["+3"], desc: { en: "Most abundant metal in Earth's crust. Lightweight and corrosion-resistant.", es: "El metal más abundante en la corteza terrestre. Ligero y resistente a la corrosión." } },
  { n: 14, s: "Si", name: { en: "Silicon", es: "Silicio" }, mass: 28.085, cat: "metalloid", row: 3, col: 14, config: "[Ne] 3s² 3p²", phase: { en: "Solid", es: "Sólido" }, melt: 1414, boil: 3265, discovered: 1824, discoverer: "Jöns Jacob Berzelius", electroneg: 1.9, radius: 111, ionization: 786, oxidation: ["-4","+4"], desc: { en: "Foundation of modern electronics and computer chips. Second most abundant element in Earth's crust.", es: "Base de la electrónica moderna y los chips. Segundo elemento más abundante en la corteza terrestre." } },
  { n: 15, s: "P", name: { en: "Phosphorus", es: "Fósforo" }, mass: 30.974, cat: "nonmetal", row: 3, col: 15, config: "[Ne] 3s² 3p³", phase: { en: "Solid", es: "Sólido" }, melt: 44.15, boil: 280.5, discovered: 1669, discoverer: "Hennig Brand", electroneg: 2.19, radius: 98, ionization: 1012, oxidation: ["-3","+3","+5"], desc: { en: "Essential for DNA, ATP, and bones. White phosphorus is highly flammable.", es: "Esencial para el ADN, ATP y huesos. El fósforo blanco es altamente inflamable." } },
  { n: 16, s: "S", name: { en: "Sulfur", es: "Azufre" }, mass: 32.06, cat: "nonmetal", row: 3, col: 16, config: "[Ne] 3s² 3p⁴", phase: { en: "Solid", es: "Sólido" }, melt: 115.21, boil: 444.61, discovered: -2000, discoverer: "Ancient", electroneg: 2.58, radius: 88, ionization: 1000, oxidation: ["-2","+4","+6"], desc: { en: "Yellow nonmetal known since antiquity. Found in proteins and used to make sulfuric acid.", es: "No metal amarillo conocido desde la antigüedad. Se encuentra en proteínas y se usa para hacer ácido sulfúrico." } },
  { n: 17, s: "Cl", name: { en: "Chlorine", es: "Cloro" }, mass: 35.45, cat: "halogen", row: 3, col: 17, config: "[Ne] 3s² 3p⁵", phase: { en: "Gas", es: "Gas" }, melt: -101.5, boil: -34.04, discovered: 1774, discoverer: "Carl Wilhelm Scheele", electroneg: 3.16, radius: 79, ionization: 1251, oxidation: ["-1","+1","+3","+5","+7"], desc: { en: "Greenish-yellow toxic gas. Used to disinfect water and make PVC.", es: "Gas tóxico amarillo-verdoso. Usado para desinfectar agua y fabricar PVC." } },
  { n: 18, s: "Ar", name: { en: "Argon", es: "Argón" }, mass: 39.948, cat: "noble", row: 3, col: 18, config: "[Ne] 3s² 3p⁶", phase: { en: "Gas", es: "Gas" }, melt: -189.34, boil: -185.85, discovered: 1894, discoverer: "Lord Rayleigh", electroneg: null, radius: 71, ionization: 1521, oxidation: ["0"], desc: { en: "Third most abundant gas in atmosphere. Used in welding and incandescent bulbs.", es: "Tercer gas más abundante en la atmósfera. Usado en soldadura y bombillas incandescentes." } },
  { n: 19, s: "K", name: { en: "Potassium", es: "Potasio" }, mass: 39.098, cat: "alkali", row: 4, col: 1, config: "[Ar] 4s¹", phase: { en: "Solid", es: "Sólido" }, melt: 63.5, boil: 759, discovered: 1807, discoverer: "Humphry Davy", electroneg: 0.82, radius: 243, ionization: 419, oxidation: ["+1"], desc: { en: "Essential electrolyte for nerve function. Reacts violently with water.", es: "Electrolito esencial para la función nerviosa. Reacciona violentamente con el agua." } },
  { n: 20, s: "Ca", name: { en: "Calcium", es: "Calcio" }, mass: 40.078, cat: "alkaline", row: 4, col: 2, config: "[Ar] 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 842, boil: 1484, discovered: 1808, discoverer: "Humphry Davy", electroneg: 1, radius: 194, ionization: 590, oxidation: ["+2"], desc: { en: "Critical for bones, teeth, and muscle contraction. Found in limestone.", es: "Crítico para huesos, dientes y contracción muscular. Se encuentra en la piedra caliza." } },
  { n: 21, s: "Sc", name: { en: "Scandium", es: "Escandio" }, mass: 44.956, cat: "transition", row: 4, col: 3, config: "[Ar] 3d¹ 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 1541, boil: 2836, discovered: 1879, discoverer: "Lars Fredrik Nilson", electroneg: 1.36, radius: 184, ionization: 633, oxidation: ["+3"], desc: { en: "Rare transition metal used in aerospace alloys and stadium lights.", es: "Metal de transición raro usado en aleaciones aeroespaciales y luces de estadio." } },
  { n: 22, s: "Ti", name: { en: "Titanium", es: "Titanio" }, mass: 47.867, cat: "transition", row: 4, col: 4, config: "[Ar] 3d² 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 1668, boil: 3287, discovered: 1791, discoverer: "William Gregor", electroneg: 1.54, radius: 176, ionization: 659, oxidation: ["+2","+3","+4"], desc: { en: "Strong, lightweight, corrosion-resistant. Used in aircraft and medical implants.", es: "Fuerte, ligero y resistente a la corrosión. Usado en aviones e implantes médicos." } },
  { n: 23, s: "V", name: { en: "Vanadium", es: "Vanadio" }, mass: 50.942, cat: "transition", row: 4, col: 5, config: "[Ar] 3d³ 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 1910, boil: 3407, discovered: 1801, discoverer: "Andrés Manuel del Río", electroneg: 1.63, radius: 171, ionization: 651, oxidation: ["+2","+3","+4","+5"], desc: { en: "Hard transition metal. Added to steel for strength in tools and engines.", es: "Metal de transición duro. Añadido al acero para dar resistencia a herramientas y motores." } },
  { n: 24, s: "Cr", name: { en: "Chromium", es: "Cromo" }, mass: 51.996, cat: "transition", row: 4, col: 6, config: "[Ar] 3d⁵ 4s¹", phase: { en: "Solid", es: "Sólido" }, melt: 1907, boil: 2671, discovered: 1797, discoverer: "Louis-Nicolas Vauquelin", electroneg: 1.66, radius: 166, ionization: 653, oxidation: ["+2","+3","+6"], desc: { en: "Lustrous metal. Provides corrosion resistance in stainless steel and chrome plating.", es: "Metal lustroso. Da resistencia a la corrosión al acero inoxidable y al cromado." } },
  { n: 25, s: "Mn", name: { en: "Manganese", es: "Manganeso" }, mass: 54.938, cat: "transition", row: 4, col: 7, config: "[Ar] 3d⁵ 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 1246, boil: 2061, discovered: 1774, discoverer: "Johan Gottlieb Gahn", electroneg: 1.55, radius: 161, ionization: 717, oxidation: ["+2","+3","+4","+7"], desc: { en: "Essential for steel production and biological enzymes.", es: "Esencial para la producción de acero y enzimas biológicas." } },
  { n: 26, s: "Fe", name: { en: "Iron", es: "Hierro" }, mass: 55.845, cat: "transition", row: 4, col: 8, config: "[Ar] 3d⁶ 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 1538, boil: 2862, discovered: -5000, discoverer: "Ancient", electroneg: 1.83, radius: 156, ionization: 762, oxidation: ["+2","+3"], desc: { en: "Most common element on Earth by mass. Carries oxygen in hemoglobin.", es: "Elemento más común en la Tierra por masa. Transporta oxígeno en la hemoglobina." } },
  { n: 27, s: "Co", name: { en: "Cobalt", es: "Cobalto" }, mass: 58.933, cat: "transition", row: 4, col: 9, config: "[Ar] 3d⁷ 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 1495, boil: 2927, discovered: 1735, discoverer: "Georg Brandt", electroneg: 1.88, radius: 152, ionization: 760, oxidation: ["+2","+3"], desc: { en: "Magnetic metal used in lithium-ion batteries and blue pigments.", es: "Metal magnético usado en baterías de iones de litio y pigmentos azules." } },
  { n: 28, s: "Ni", name: { en: "Nickel", es: "Níquel" }, mass: 58.693, cat: "transition", row: 4, col: 10, config: "[Ar] 3d⁸ 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 1455, boil: 2913, discovered: 1751, discoverer: "Axel Fredrik Cronstedt", electroneg: 1.91, radius: 149, ionization: 737, oxidation: ["+2"], desc: { en: "Corrosion-resistant metal. Used in coins, stainless steel, and rechargeable batteries.", es: "Metal resistente a la corrosión. Usado en monedas, acero inoxidable y baterías recargables." } },
  { n: 29, s: "Cu", name: { en: "Copper", es: "Cobre" }, mass: 63.546, cat: "transition", row: 4, col: 11, config: "[Ar] 3d¹⁰ 4s¹", phase: { en: "Solid", es: "Sólido" }, melt: 1084.62, boil: 2562, discovered: -9000, discoverer: "Ancient", electroneg: 1.9, radius: 145, ionization: 745, oxidation: ["+1","+2"], desc: { en: "Excellent conductor of heat and electricity. Used in wiring and plumbing.", es: "Excelente conductor de calor y electricidad. Usado en cableado y fontanería." } },
  { n: 30, s: "Zn", name: { en: "Zinc", es: "Zinc" }, mass: 65.38, cat: "transition", row: 4, col: 12, config: "[Ar] 3d¹⁰ 4s²", phase: { en: "Solid", es: "Sólido" }, melt: 419.53, boil: 907, discovered: 1746, discoverer: "Andreas Sigismund Marggraf", electroneg: 1.65, radius: 142, ionization: 906, oxidation: ["+2"], desc: { en: "Used to galvanize steel against corrosion. Essential trace mineral for immunity.", es: "Usado para galvanizar acero contra la corrosión. Mineral traza esencial para la inmunidad." } },
  { n: 31, s: "Ga", name: { en: "Gallium", es: "Galio" }, mass: 69.723, cat: "post-transition", row: 4, col: 13, config: "[Ar] 3d¹⁰ 4s² 4p¹", phase: { en: "Solid", es: "Sólido" }, melt: 29.76, boil: 2204, discovered: 1875, discoverer: "Paul-Émile Lecoq", electroneg: 1.81, radius: 136, ionization: 579, oxidation: ["+3"], desc: { en: "Melts in your hand. Used in semiconductors and LED technology.", es: "Se derrite en la mano. Usado en semiconductores y tecnología LED." } },
  { n: 32, s: "Ge", name: { en: "Germanium", es: "Germanio" }, mass: 72.630, cat: "metalloid", row: 4, col: 14, config: "[Ar] 3d¹⁰ 4s² 4p²", phase: { en: "Solid", es: "Sólido" }, melt: 938.25, boil: 2833, discovered: 1886, discoverer: "Clemens Winkler", electroneg: 2.01, radius: 125, ionization: 762, oxidation: ["+2","+4"], desc: { en: "Semiconductor used in fiber optics and infrared optics.", es: "Semiconductor usado en fibra óptica y óptica infrarroja." } },
  { n: 33, s: "As", name: { en: "Arsenic", es: "Arsénico" }, mass: 74.922, cat: "metalloid", row: 4, col: 15, config: "[Ar] 3d¹⁰ 4s² 4p³", phase: { en: "Solid", es: "Sólido" }, melt: 817, boil: 614, discovered: 1250, discoverer: "Albertus Magnus", electroneg: 2.18, radius: 114, ionization: 947, oxidation: ["-3","+3","+5"], desc: { en: "Notoriously toxic metalloid. Historically used as a poison; now in semiconductors.", es: "Metaloide notoriamente tóxico. Históricamente usado como veneno; ahora en semiconductores." } },
  { n: 34, s: "Se", name: { en: "Selenium", es: "Selenio" }, mass: 78.971, cat: "nonmetal", row: 4, col: 16, config: "[Ar] 3d¹⁰ 4s² 4p⁴", phase: { en: "Solid", es: "Sólido" }, melt: 221, boil: 685, discovered: 1817, discoverer: "Jöns Jacob Berzelius", electroneg: 2.55, radius: 103, ionization: 941, oxidation: ["-2","+4","+6"], desc: { en: "Photoconductor used in solar cells and photocopiers. Essential trace nutrient.", es: "Fotoconductor usado en células solares y fotocopiadoras. Nutriente traza esencial." } },
  { n: 35, s: "Br", name: { en: "Bromine", es: "Bromo" }, mass: 79.904, cat: "halogen", row: 4, col: 17, config: "[Ar] 3d¹⁰ 4s² 4p⁵", phase: { en: "Liquid", es: "Líquido" }, melt: -7.2, boil: 58.8, discovered: 1826, discoverer: "Antoine Jérôme Balard", electroneg: 2.96, radius: 94, ionization: 1140, oxidation: ["-1","+1","+3","+5"], desc: { en: "One of only two elements liquid at room temperature. Used in flame retardants.", es: "Uno de los dos únicos elementos líquidos a temperatura ambiente. Usado en retardantes de llama." } },
  { n: 36, s: "Kr", name: { en: "Krypton", es: "Kriptón" }, mass: 83.798, cat: "noble", row: 4, col: 18, config: "[Ar] 3d¹⁰ 4s² 4p⁶", phase: { en: "Gas", es: "Gas" }, melt: -157.37, boil: -153.42, discovered: 1898, discoverer: "William Ramsay", electroneg: null, radius: 88, ionization: 1351, oxidation: ["0"], desc: { en: "Noble gas used in high-performance lighting and lasers.", es: "Gas noble usado en iluminación de alto rendimiento y láseres." } },
  { n: 37, s: "Rb", name: { en: "Rubidium", es: "Rubidio" }, mass: 85.468, cat: "alkali", row: 5, col: 1, config: "[Kr] 5s¹", phase: { en: "Solid", es: "Sólido" }, melt: 39.31, boil: 688, discovered: 1861, discoverer: "Robert Bunsen", electroneg: 0.82, radius: 265, ionization: 403, oxidation: ["+1"], desc: { en: "Highly reactive alkali metal. Used in atomic clocks and specialty glass.", es: "Metal alcalino altamente reactivo. Usado en relojes atómicos y vidrios especiales." } },
  { n: 38, s: "Sr", name: { en: "Strontium", es: "Estroncio" }, mass: 87.62, cat: "alkaline", row: 5, col: 2, config: "[Kr] 5s²", phase: { en: "Solid", es: "Sólido" }, melt: 777, boil: 1377, discovered: 1790, discoverer: "Adair Crawford", electroneg: 0.95, radius: 219, ionization: 550, oxidation: ["+2"], desc: { en: "Burns with brilliant red flame. Used in fireworks and old CRT TVs.", es: "Arde con llama roja brillante. Usado en fuegos artificiales y antiguos televisores CRT." } },
  { n: 39, s: "Y", name: { en: "Yttrium", es: "Itrio" }, mass: 88.906, cat: "transition", row: 5, col: 3, config: "[Kr] 4d¹ 5s²", phase: { en: "Solid", es: "Sólido" }, melt: 1526, boil: 3336, discovered: 1794, discoverer: "Johan Gadolin", electroneg: 1.22, radius: 212, ionization: 600, oxidation: ["+3"], desc: { en: "Used in LED phosphors, superconductors, and cancer treatments.", es: "Usado en fósforos LED, superconductores y tratamientos contra el cáncer." } },
  { n: 40, s: "Zr", name: { en: "Zirconium", es: "Circonio" }, mass: 91.224, cat: "transition", row: 5, col: 4, config: "[Kr] 4d² 5s²", phase: { en: "Solid", es: "Sólido" }, melt: 1855, boil: 4409, discovered: 1789, discoverer: "Martin Heinrich Klaproth", electroneg: 1.33, radius: 206, ionization: 640, oxidation: ["+4"], desc: { en: "Corrosion-resistant metal used in nuclear reactors and dental crowns.", es: "Metal resistente a la corrosión usado en reactores nucleares y coronas dentales." } },
  { n: 41, s: "Nb", name: { en: "Niobium", es: "Niobio" }, mass: 92.906, cat: "transition", row: 5, col: 5, config: "[Kr] 4d⁴ 5s¹", phase: { en: "Solid", es: "Sólido" }, melt: 2477, boil: 4744, discovered: 1801, discoverer: "Charles Hatchett", electroneg: 1.6, radius: 198, ionization: 652, oxidation: ["+3","+5"], desc: { en: "Used in superconducting magnets for MRI machines and particle accelerators.", es: "Usado en imanes superconductores para resonancias magnéticas y aceleradores de partículas." } },
  { n: 42, s: "Mo", name: { en: "Molybdenum", es: "Molibdeno" }, mass: 95.95, cat: "transition", row: 5, col: 6, config: "[Kr] 4d⁵ 5s¹", phase: { en: "Solid", es: "Sólido" }, melt: 2623, boil: 4639, discovered: 1778, discoverer: "Carl Wilhelm Scheele", electroneg: 2.16, radius: 190, ionization: 684, oxidation: ["+4","+6"], desc: { en: "High-strength metal used in steel alloys for armor and aircraft.", es: "Metal de alta resistencia usado en aleaciones de acero para blindajes y aviones." } },
  { n: 43, s: "Tc", name: { en: "Technetium", es: "Tecnecio" }, mass: 98, cat: "transition", row: 5, col: 7, config: "[Kr] 4d⁵ 5s²", phase: { en: "Solid", es: "Sólido" }, melt: 2157, boil: 4265, discovered: 1937, discoverer: "Emilio Segrè", electroneg: 1.9, radius: 183, ionization: 702, oxidation: ["+4","+7"], desc: { en: "First artificially produced element. Used in medical imaging.", es: "Primer elemento producido artificialmente. Usado en imágenes médicas." } },
  { n: 44, s: "Ru", name: { en: "Ruthenium", es: "Rutenio" }, mass: 101.07, cat: "transition", row: 5, col: 8, config: "[Kr] 4d⁷ 5s¹", phase: { en: "Solid", es: "Sólido" }, melt: 2334, boil: 4150, discovered: 1844, discoverer: "Karl Ernst Claus", electroneg: 2.2, radius: 178, ionization: 711, oxidation: ["+3","+4"], desc: { en: "Rare platinum-group metal used in electronics and solar cells.", es: "Raro metal del grupo del platino usado en electrónica y células solares." } },
  { n: 45, s: "Rh", name: { en: "Rhodium", es: "Rodio" }, mass: 102.91, cat: "transition", row: 5, col: 9, config: "[Kr] 4d⁸ 5s¹", phase: { en: "Solid", es: "Sólido" }, melt: 1964, boil: 3695, discovered: 1803, discoverer: "William Hyde Wollaston", electroneg: 2.28, radius: 173, ionization: 720, oxidation: ["+3"], desc: { en: "Extremely rare and expensive. Used in catalytic converters.", es: "Extremadamente raro y caro. Usado en convertidores catalíticos." } },
  { n: 46, s: "Pd", name: { en: "Palladium", es: "Paladio" }, mass: 106.42, cat: "transition", row: 5, col: 10, config: "[Kr] 4d¹⁰", phase: { en: "Solid", es: "Sólido" }, melt: 1554.9, boil: 2963, discovered: 1803, discoverer: "William Hyde Wollaston", electroneg: 2.2, radius: 169, ionization: 805, oxidation: ["+2","+4"], desc: { en: "Used in catalytic converters and dental crowns. Absorbs hydrogen.", es: "Usado en convertidores catalíticos y coronas dentales. Absorbe hidrógeno." } },
  { n: 47, s: "Ag", name: { en: "Silver", es: "Plata" }, mass: 107.87, cat: "transition", row: 5, col: 11, config: "[Kr] 4d¹⁰ 5s¹", phase: { en: "Solid", es: "Sólido" }, melt: 961.78, boil: 2162, discovered: -3000, discoverer: "Ancient", electroneg: 1.93, radius: 165, ionization: 731, oxidation: ["+1"], desc: { en: "Best electrical and thermal conductor. Used in jewelry, photography, and electronics.", es: "Mejor conductor eléctrico y térmico. Usado en joyería, fotografía y electrónica." } },
  { n: 48, s: "Cd", name: { en: "Cadmium", es: "Cadmio" }, mass: 112.41, cat: "transition", row: 5, col: 12, config: "[Kr] 4d¹⁰ 5s²", phase: { en: "Solid", es: "Sólido" }, melt: 321.07, boil: 767, discovered: 1817, discoverer: "Friedrich Stromeyer", electroneg: 1.69, radius: 161, ionization: 868, oxidation: ["+2"], desc: { en: "Toxic heavy metal used in rechargeable NiCd batteries and pigments.", es: "Metal pesado tóxico usado en baterías recargables NiCd y pigmentos." } },
  { n: 49, s: "In", name: { en: "Indium", es: "Indio" }, mass: 114.82, cat: "post-transition", row: 5, col: 13, config: "[Kr] 4d¹⁰ 5s² 5p¹", phase: { en: "Solid", es: "Sólido" }, melt: 156.6, boil: 2072, discovered: 1863, discoverer: "Ferdinand Reich", electroneg: 1.78, radius: 156, ionization: 558, oxidation: ["+3"], desc: { en: "Soft metal used in touchscreens (indium tin oxide) and solders.", es: "Metal blando usado en pantallas táctiles (óxido de indio y estaño) y soldaduras." } },
  { n: 50, s: "Sn", name: { en: "Tin", es: "Estaño" }, mass: 118.71, cat: "post-transition", row: 5, col: 14, config: "[Kr] 4d¹⁰ 5s² 5p²", phase: { en: "Solid", es: "Sólido" }, melt: 231.93, boil: 2602, discovered: -3000, discoverer: "Ancient", electroneg: 1.96, radius: 145, ionization: 709, oxidation: ["+2","+4"], desc: { en: "Combined with copper to make bronze. Used in solders and cans.", es: "Combinado con cobre para hacer bronce. Usado en soldaduras y latas." } },
  { n: 51, s: "Sb", name: { en: "Antimony", es: "Antimonio" }, mass: 121.76, cat: "metalloid", row: 5, col: 15, config: "[Kr] 4d¹⁰ 5s² 5p³", phase: { en: "Solid", es: "Sólido" }, melt: 630.63, boil: 1587, discovered: -3000, discoverer: "Ancient", electroneg: 2.05, radius: 133, ionization: 834, oxidation: ["-3","+3","+5"], desc: { en: "Used in flame retardants, batteries, and ancient cosmetics (kohl).", es: "Usado en retardantes de llama, baterías y cosméticos antiguos (kohl)." } },
  { n: 52, s: "Te", name: { en: "Tellurium", es: "Telurio" }, mass: 127.60, cat: "metalloid", row: 5, col: 16, config: "[Kr] 4d¹⁰ 5s² 5p⁴", phase: { en: "Solid", es: "Sólido" }, melt: 449.51, boil: 988, discovered: 1782, discoverer: "Franz-Joseph Müller", electroneg: 2.1, radius: 123, ionization: 869, oxidation: ["-2","+4","+6"], desc: { en: "Rare metalloid used in solar panels and rewritable optical discs.", es: "Metaloide raro usado en paneles solares y discos ópticos regrabables." } },
  { n: 53, s: "I", name: { en: "Iodine", es: "Yodo" }, mass: 126.90, cat: "halogen", row: 5, col: 17, config: "[Kr] 4d¹⁰ 5s² 5p⁵", phase: { en: "Solid", es: "Sólido" }, melt: 113.7, boil: 184.3, discovered: 1811, discoverer: "Bernard Courtois", electroneg: 2.66, radius: 115, ionization: 1008, oxidation: ["-1","+1","+5","+7"], desc: { en: "Essential for thyroid function. Used as antiseptic and in photography.", es: "Esencial para la función tiroidea. Usado como antiséptico y en fotografía." } },
  { n: 54, s: "Xe", name: { en: "Xenon", es: "Xenón" }, mass: 131.29, cat: "noble", row: 5, col: 18, config: "[Kr] 4d¹⁰ 5s² 5p⁶", phase: { en: "Gas", es: "Gas" }, melt: -111.75, boil: -108.10, discovered: 1898, discoverer: "William Ramsay", electroneg: 2.6, radius: 108, ionization: 1170, oxidation: ["0","+2","+4"], desc: { en: "Used in high-intensity arc lamps, ion thrusters, and anesthesia.", es: "Usado en lámparas de arco de alta intensidad, propulsores iónicos y anestesia." } },
  { n: 55, s: "Cs", name: { en: "Cesium", es: "Cesio" }, mass: 132.91, cat: "alkali", row: 6, col: 1, config: "[Xe] 6s¹", phase: { en: "Solid", es: "Sólido" }, melt: 28.44, boil: 671, discovered: 1860, discoverer: "Robert Bunsen", electroneg: 0.79, radius: 298, ionization: 376, oxidation: ["+1"], desc: { en: "Used to define the second in atomic clocks. Most reactive metal.", es: "Usado para definir el segundo en relojes atómicos. Metal más reactivo." } },
  { n: 56, s: "Ba", name: { en: "Barium", es: "Bario" }, mass: 137.33, cat: "alkaline", row: 6, col: 2, config: "[Xe] 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 727, boil: 1845, discovered: 1808, discoverer: "Humphry Davy", electroneg: 0.89, radius: 253, ionization: 503, oxidation: ["+2"], desc: { en: "Used in medical X-ray imaging and green fireworks.", es: "Usado en imágenes médicas de rayos X y fuegos artificiales verdes." } },
  { n: 57, s: "La", name: { en: "Lanthanum", es: "Lantano" }, mass: 138.91, cat: "lanthanide", row: 9, col: 4, config: "[Xe] 5d¹ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 920, boil: 3464, discovered: 1839, discoverer: "Carl Gustaf Mosander", electroneg: 1.1, radius: 240, ionization: 538, oxidation: ["+3"], desc: { en: "First lanthanide. Used in camera lenses and rechargeable batteries.", es: "Primer lantánido. Usado en lentes de cámaras y baterías recargables." } },
  { n: 58, s: "Ce", name: { en: "Cerium", es: "Cerio" }, mass: 140.12, cat: "lanthanide", row: 9, col: 5, config: "[Xe] 4f¹ 5d¹ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 795, boil: 3443, discovered: 1803, discoverer: "Wilhelm Hisinger", electroneg: 1.12, radius: 235, ionization: 534, oxidation: ["+3","+4"], desc: { en: "Most abundant rare earth. Used in catalytic converters and lighter flints.", es: "Tierra rara más abundante. Usado en convertidores catalíticos y piedras de encendedor." } },
  { n: 59, s: "Pr", name: { en: "Praseodymium", es: "Praseodimio" }, mass: 140.91, cat: "lanthanide", row: 9, col: 6, config: "[Xe] 4f³ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 935, boil: 3520, discovered: 1885, discoverer: "Carl Auer von Welsbach", electroneg: 1.13, radius: 239, ionization: 527, oxidation: ["+3","+4"], desc: { en: "Used in strong permanent magnets and aircraft engines.", es: "Usado en imanes permanentes fuertes y motores de aviones." } },
  { n: 60, s: "Nd", name: { en: "Neodymium", es: "Neodimio" }, mass: 144.24, cat: "lanthanide", row: 9, col: 7, config: "[Xe] 4f⁴ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1024, boil: 3074, discovered: 1885, discoverer: "Carl Auer von Welsbach", electroneg: 1.14, radius: 229, ionization: 533, oxidation: ["+3"], desc: { en: "Used in the world's strongest permanent magnets, found in headphones and motors.", es: "Usado en los imanes permanentes más fuertes del mundo, presentes en auriculares y motores." } },
  { n: 61, s: "Pm", name: { en: "Promethium", es: "Prometio" }, mass: 145, cat: "lanthanide", row: 9, col: 8, config: "[Xe] 4f⁵ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1042, boil: 3000, discovered: 1945, discoverer: "Charles D. Coryell", electroneg: 1.13, radius: 236, ionization: 540, oxidation: ["+3"], desc: { en: "Only radioactive lanthanide. Used in nuclear batteries for spacecraft.", es: "Único lantánido radiactivo. Usado en baterías nucleares para naves espaciales." } },
  { n: 62, s: "Sm", name: { en: "Samarium", es: "Samario" }, mass: 150.36, cat: "lanthanide", row: 9, col: 9, config: "[Xe] 4f⁶ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1072, boil: 1794, discovered: 1879, discoverer: "Paul Émile Lecoq", electroneg: 1.17, radius: 229, ionization: 545, oxidation: ["+2","+3"], desc: { en: "Used in high-temperature magnets and cancer treatments.", es: "Usado en imanes de alta temperatura y tratamientos contra el cáncer." } },
  { n: 63, s: "Eu", name: { en: "Europium", es: "Europio" }, mass: 151.96, cat: "lanthanide", row: 9, col: 10, config: "[Xe] 4f⁷ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 822, boil: 1529, discovered: 1901, discoverer: "Eugène-Anatole Demarçay", electroneg: 1.2, radius: 233, ionization: 547, oxidation: ["+2","+3"], desc: { en: "Used as red phosphor in TVs and as anti-counterfeiting marker in euro banknotes.", es: "Usado como fósforo rojo en televisores y como marcador antifalsificación en billetes de euro." } },
  { n: 64, s: "Gd", name: { en: "Gadolinium", es: "Gadolinio" }, mass: 157.25, cat: "lanthanide", row: 9, col: 11, config: "[Xe] 4f⁷ 5d¹ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1313, boil: 3273, discovered: 1880, discoverer: "Jean Charles Galissard", electroneg: 1.2, radius: 237, ionization: 593, oxidation: ["+3"], desc: { en: "Strongly magnetic. Used as MRI contrast agent and in nuclear reactors.", es: "Fuertemente magnético. Usado como agente de contraste en resonancias y en reactores nucleares." } },
  { n: 65, s: "Tb", name: { en: "Terbium", es: "Terbio" }, mass: 158.93, cat: "lanthanide", row: 9, col: 12, config: "[Xe] 4f⁹ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1356, boil: 3230, discovered: 1843, discoverer: "Carl Gustaf Mosander", electroneg: 1.1, radius: 221, ionization: 566, oxidation: ["+3","+4"], desc: { en: "Used in green phosphors for displays and in solid-state devices.", es: "Usado en fósforos verdes para pantallas y en dispositivos de estado sólido." } },
  { n: 66, s: "Dy", name: { en: "Dysprosium", es: "Disprosio" }, mass: 162.50, cat: "lanthanide", row: 9, col: 13, config: "[Xe] 4f¹⁰ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1412, boil: 2567, discovered: 1886, discoverer: "Paul Émile Lecoq", electroneg: 1.22, radius: 229, ionization: 573, oxidation: ["+3"], desc: { en: "Used in neodymium magnets to maintain strength at high temperatures.", es: "Usado en imanes de neodimio para mantener la fuerza a altas temperaturas." } },
  { n: 67, s: "Ho", name: { en: "Holmium", es: "Holmio" }, mass: 164.93, cat: "lanthanide", row: 9, col: 14, config: "[Xe] 4f¹¹ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1474, boil: 2700, discovered: 1878, discoverer: "Marc Delafontaine", electroneg: 1.23, radius: 216, ionization: 581, oxidation: ["+3"], desc: { en: "Has the strongest magnetic field of any natural element.", es: "Tiene el campo magnético más fuerte de cualquier elemento natural." } },
  { n: 68, s: "Er", name: { en: "Erbium", es: "Erbio" }, mass: 167.26, cat: "lanthanide", row: 9, col: 15, config: "[Xe] 4f¹² 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1529, boil: 2868, discovered: 1843, discoverer: "Carl Gustaf Mosander", electroneg: 1.24, radius: 235, ionization: 589, oxidation: ["+3"], desc: { en: "Used in fiber optic communications and pink-tinted glass.", es: "Usado en comunicaciones de fibra óptica y vidrio teñido de rosa." } },
  { n: 69, s: "Tm", name: { en: "Thulium", es: "Tulio" }, mass: 168.93, cat: "lanthanide", row: 9, col: 16, config: "[Xe] 4f¹³ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1545, boil: 1950, discovered: 1879, discoverer: "Per Teodor Cleve", electroneg: 1.25, radius: 227, ionization: 597, oxidation: ["+3"], desc: { en: "One of the rarest lanthanides. Used in portable X-ray devices.", es: "Uno de los lantánidos más raros. Usado en dispositivos portátiles de rayos X." } },
  { n: 70, s: "Yb", name: { en: "Ytterbium", es: "Iterbio" }, mass: 173.05, cat: "lanthanide", row: 9, col: 17, config: "[Xe] 4f¹⁴ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 819, boil: 1196, discovered: 1878, discoverer: "Jean Charles Galissard", electroneg: 1.1, radius: 242, ionization: 603, oxidation: ["+2","+3"], desc: { en: "Used in atomic clocks and certain steel alloys.", es: "Usado en relojes atómicos y ciertas aleaciones de acero." } },
  { n: 71, s: "Lu", name: { en: "Lutetium", es: "Lutecio" }, mass: 174.97, cat: "lanthanide", row: 9, col: 18, config: "[Xe] 4f¹⁴ 5d¹ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 1663, boil: 3402, discovered: 1907, discoverer: "Georges Urbain", electroneg: 1.27, radius: 221, ionization: 524, oxidation: ["+3"], desc: { en: "Hardest and densest lanthanide. Used in petroleum refining catalysts.", es: "Lantánido más duro y denso. Usado en catalizadores de refinación de petróleo." } },
  { n: 72, s: "Hf", name: { en: "Hafnium", es: "Hafnio" }, mass: 178.49, cat: "transition", row: 6, col: 4, config: "[Xe] 4f¹⁴ 5d² 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 2233, boil: 4603, discovered: 1923, discoverer: "Dirk Coster", electroneg: 1.3, radius: 208, ionization: 659, oxidation: ["+4"], desc: { en: "Used in nuclear reactor control rods due to neutron absorption.", es: "Usado en barras de control de reactores nucleares por su absorción de neutrones." } },
  { n: 73, s: "Ta", name: { en: "Tantalum", es: "Tantalio" }, mass: 180.95, cat: "transition", row: 6, col: 5, config: "[Xe] 4f¹⁴ 5d³ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 3017, boil: 5458, discovered: 1802, discoverer: "Anders Gustaf Ekeberg", electroneg: 1.5, radius: 200, ionization: 761, oxidation: ["+5"], desc: { en: "Highly corrosion-resistant. Essential in capacitors for phones and electronics.", es: "Altamente resistente a la corrosión. Esencial en capacitores para teléfonos y electrónica." } },
  { n: 74, s: "W", name: { en: "Tungsten", es: "Tungsteno" }, mass: 183.84, cat: "transition", row: 6, col: 6, config: "[Xe] 4f¹⁴ 5d⁴ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 3422, boil: 5555, discovered: 1783, discoverer: "Juan José Elhuyar", electroneg: 2.36, radius: 193, ionization: 770, oxidation: ["+4","+6"], desc: { en: "Highest melting point of any metal. Used in light bulb filaments and armor-piercing rounds.", es: "Punto de fusión más alto de cualquier metal. Usado en filamentos de bombillas y munición perforante." } },
  { n: 75, s: "Re", name: { en: "Rhenium", es: "Renio" }, mass: 186.21, cat: "transition", row: 6, col: 7, config: "[Xe] 4f¹⁴ 5d⁵ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 3186, boil: 5596, discovered: 1925, discoverer: "Walter Noddack", electroneg: 1.9, radius: 188, ionization: 760, oxidation: ["+4","+7"], desc: { en: "One of the rarest elements. Used in jet engine alloys.", es: "Uno de los elementos más raros. Usado en aleaciones de motores a reacción." } },
  { n: 76, s: "Os", name: { en: "Osmium", es: "Osmio" }, mass: 190.23, cat: "transition", row: 6, col: 8, config: "[Xe] 4f¹⁴ 5d⁶ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 3033, boil: 5012, discovered: 1803, discoverer: "Smithson Tennant", electroneg: 2.2, radius: 185, ionization: 840, oxidation: ["+4"], desc: { en: "Densest naturally occurring element. Used in fountain pen tips.", es: "Elemento natural más denso. Usado en puntas de plumas estilográficas." } },
  { n: 77, s: "Ir", name: { en: "Iridium", es: "Iridio" }, mass: 192.22, cat: "transition", row: 6, col: 9, config: "[Xe] 4f¹⁴ 5d⁷ 6s²", phase: { en: "Solid", es: "Sólido" }, melt: 2466, boil: 4428, discovered: 1803, discoverer: "Smithson Tennant", electroneg: 2.2, radius: 180, ionization: 880, oxidation: ["+3","+4"], desc: { en: "Most corrosion-resistant metal. The K-T extinction layer is rich in iridium.", es: "Metal más resistente a la corrosión. La capa de extinción K-T es rica en iridio." } },
  { n: 78, s: "Pt", name: { en: "Platinum", es: "Platino" }, mass: 195.08, cat: "transition", row: 6, col: 10, config: "[Xe] 4f¹⁴ 5d⁹ 6s¹", phase: { en: "Solid", es: "Sólido" }, melt: 1768.3, boil: 3825, discovered: 1735, discoverer: "Antonio de Ulloa", electroneg: 2.28, radius: 177, ionization: 870, oxidation: ["+2","+4"], desc: { en: "Precious metal used in jewelry, catalytic converters, and chemotherapy drugs.", es: "Metal precioso usado en joyería, convertidores catalíticos y fármacos de quimioterapia." } },
  { n: 79, s: "Au", name: { en: "Gold", es: "Oro" }, mass: 196.97, cat: "transition", row: 6, col: 11, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", phase: { en: "Solid", es: "Sólido" }, melt: 1064.18, boil: 2856, discovered: -6000, discoverer: "Ancient", electroneg: 2.54, radius: 174, ionization: 890, oxidation: ["+1","+3"], desc: { en: "Highly malleable, lustrous, and corrosion-resistant. Symbol of wealth for millennia.", es: "Altamente maleable, lustroso y resistente a la corrosión. Símbolo de riqueza durante milenios." } },
  { n: 80, s: "Hg", name: { en: "Mercury", es: "Mercurio" }, mass: 200.59, cat: "transition", row: 6, col: 12, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", phase: { en: "Liquid", es: "Líquido" }, melt: -38.83, boil: 356.73, discovered: -1500, discoverer: "Ancient", electroneg: 2, radius: 171, ionization: 1007, oxidation: ["+1","+2"], desc: { en: "Only metal liquid at room temperature. Highly toxic; used in old thermometers.", es: "Único metal líquido a temperatura ambiente. Altamente tóxico; usado en termómetros antiguos." } },
  { n: 81, s: "Tl", name: { en: "Thallium", es: "Talio" }, mass: 204.38, cat: "post-transition", row: 6, col: 13, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", phase: { en: "Solid", es: "Sólido" }, melt: 304, boil: 1473, discovered: 1861, discoverer: "William Crookes", electroneg: 1.62, radius: 156, ionization: 589, oxidation: ["+1","+3"], desc: { en: "Highly toxic. Once used as rat poison; now in electronics and infrared optics.", es: "Altamente tóxico. Antes usado como veneno para ratas; ahora en electrónica y óptica infrarroja." } },
  { n: 82, s: "Pb", name: { en: "Lead", es: "Plomo" }, mass: 207.2, cat: "post-transition", row: 6, col: 14, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", phase: { en: "Solid", es: "Sólido" }, melt: 327.46, boil: 1749, discovered: -7000, discoverer: "Ancient", electroneg: 2.33, radius: 154, ionization: 716, oxidation: ["+2","+4"], desc: { en: "Dense, soft, toxic metal. Used in batteries, radiation shielding, and once in pipes.", es: "Metal denso, blando y tóxico. Usado en baterías, blindaje contra radiación y antes en tuberías." } },
  { n: 83, s: "Bi", name: { en: "Bismuth", es: "Bismuto" }, mass: 208.98, cat: "post-transition", row: 6, col: 15, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", phase: { en: "Solid", es: "Sólido" }, melt: 271.4, boil: 1564, discovered: 1753, discoverer: "Claude François Geoffroy", electroneg: 2.02, radius: 143, ionization: 703, oxidation: ["+3","+5"], desc: { en: "Forms beautiful iridescent crystals. Used in Pepto-Bismol and lead-free solders.", es: "Forma hermosos cristales iridiscentes. Usado en Pepto-Bismol y soldaduras sin plomo." } },
  { n: 84, s: "Po", name: { en: "Polonium", es: "Polonio" }, mass: 209, cat: "post-transition", row: 6, col: 16, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", phase: { en: "Solid", es: "Sólido" }, melt: 254, boil: 962, discovered: 1898, discoverer: "Marie & Pierre Curie", electroneg: 2, radius: 135, ionization: 812, oxidation: ["+2","+4"], desc: { en: "Highly radioactive. Discovered by Marie Curie and named after Poland.", es: "Altamente radiactivo. Descubierto por Marie Curie y nombrado en honor a Polonia." } },
  { n: 85, s: "At", name: { en: "Astatine", es: "Astato" }, mass: 210, cat: "halogen", row: 6, col: 17, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", phase: { en: "Solid", es: "Sólido" }, melt: 302, boil: 337, discovered: 1940, discoverer: "Dale R. Corson", electroneg: 2.2, radius: 127, ionization: 890, oxidation: ["-1","+1"], desc: { en: "Rarest naturally occurring element. Less than 30g exists on Earth at any time.", es: "Elemento natural más raro. Existen menos de 30g en la Tierra en cualquier momento." } },
  { n: 86, s: "Rn", name: { en: "Radon", es: "Radón" }, mass: 222, cat: "noble", row: 6, col: 18, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", phase: { en: "Gas", es: "Gas" }, melt: -71, boil: -61.7, discovered: 1900, discoverer: "Friedrich Ernst Dorn", electroneg: null, radius: 120, ionization: 1037, oxidation: ["0"], desc: { en: "Radioactive noble gas. Major cause of lung cancer when accumulated in homes.", es: "Gas noble radiactivo. Causa importante de cáncer de pulmón cuando se acumula en hogares." } },
  { n: 87, s: "Fr", name: { en: "Francium", es: "Francio" }, mass: 223, cat: "alkali", row: 7, col: 1, config: "[Rn] 7s¹", phase: { en: "Solid", es: "Sólido" }, melt: 27, boil: 677, discovered: 1939, discoverer: "Marguerite Perey", electroneg: 0.7, radius: 270, ionization: 393, oxidation: ["+1"], desc: { en: "Second rarest natural element. Extremely radioactive with very short half-life.", es: "Segundo elemento natural más raro. Extremadamente radiactivo con vida media muy corta." } },
  { n: 88, s: "Ra", name: { en: "Radium", es: "Radio" }, mass: 226, cat: "alkaline", row: 7, col: 2, config: "[Rn] 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 700, boil: 1737, discovered: 1898, discoverer: "Marie & Pierre Curie", electroneg: 0.9, radius: 233, ionization: 509, oxidation: ["+2"], desc: { en: "Glows blue-green. Once used in watch dials before its dangers were known.", es: "Brilla azul-verdoso. Antes usado en esferas de relojes antes de conocerse sus peligros." } },
  { n: 89, s: "Ac", name: { en: "Actinium", es: "Actinio" }, mass: 227, cat: "actinide", row: 10, col: 4, config: "[Rn] 6d¹ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 1050, boil: 3200, discovered: 1899, discoverer: "André-Louis Debierne", electroneg: 1.1, radius: 260, ionization: 499, oxidation: ["+3"], desc: { en: "Glows pale blue in the dark. Used in targeted alpha therapy for cancer.", es: "Brilla azul pálido en la oscuridad. Usado en terapia alfa dirigida contra el cáncer." } },
  { n: 90, s: "Th", name: { en: "Thorium", es: "Torio" }, mass: 232.04, cat: "actinide", row: 10, col: 5, config: "[Rn] 6d² 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 1750, boil: 4788, discovered: 1828, discoverer: "Jöns Jacob Berzelius", electroneg: 1.3, radius: 237, ionization: 587, oxidation: ["+4"], desc: { en: "Potential nuclear fuel of the future. Named after Thor, the Norse god.", es: "Potencial combustible nuclear del futuro. Nombrado en honor a Thor, el dios nórdico." } },
  { n: 91, s: "Pa", name: { en: "Protactinium", es: "Protactinio" }, mass: 231.04, cat: "actinide", row: 10, col: 6, config: "[Rn] 5f² 6d¹ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 1572, boil: 4000, discovered: 1913, discoverer: "Kazimierz Fajans", electroneg: 1.5, radius: 243, ionization: 568, oxidation: ["+5"], desc: { en: "One of the rarest and most expensive natural elements.", es: "Uno de los elementos naturales más raros y caros." } },
  { n: 92, s: "U", name: { en: "Uranium", es: "Uranio" }, mass: 238.03, cat: "actinide", row: 10, col: 7, config: "[Rn] 5f³ 6d¹ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 1132.2, boil: 4131, discovered: 1789, discoverer: "Martin Heinrich Klaproth", electroneg: 1.38, radius: 240, ionization: 598, oxidation: ["+3","+4","+5","+6"], desc: { en: "Primary nuclear fuel. Powers reactors and atomic weapons.", es: "Combustible nuclear principal. Alimenta reactores y armas atómicas." } },
  { n: 93, s: "Np", name: { en: "Neptunium", es: "Neptunio" }, mass: 237, cat: "actinide", row: 10, col: 8, config: "[Rn] 5f⁴ 6d¹ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 644, boil: 3902, discovered: 1940, discoverer: "Edwin McMillan", electroneg: 1.36, radius: 221, ionization: 605, oxidation: ["+3","+4","+5","+6"], desc: { en: "First synthetic transuranium element. Named after the planet Neptune.", es: "Primer elemento transuránico sintético. Nombrado por el planeta Neptuno." } },
  { n: 94, s: "Pu", name: { en: "Plutonium", es: "Plutonio" }, mass: 244, cat: "actinide", row: 10, col: 9, config: "[Rn] 5f⁶ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 639.4, boil: 3228, discovered: 1940, discoverer: "Glenn T. Seaborg", electroneg: 1.28, radius: 243, ionization: 585, oxidation: ["+3","+4","+5","+6"], desc: { en: "Used in nuclear weapons and as fuel in some reactors. Very toxic.", es: "Usado en armas nucleares y como combustible en algunos reactores. Muy tóxico." } },
  { n: 95, s: "Am", name: { en: "Americium", es: "Americio" }, mass: 243, cat: "actinide", row: 10, col: 10, config: "[Rn] 5f⁷ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 1176, boil: 2011, discovered: 1944, discoverer: "Glenn T. Seaborg", electroneg: 1.13, radius: 244, ionization: 578, oxidation: ["+3"], desc: { en: "Found in household smoke detectors. Synthesized during the Manhattan Project.", es: "Se encuentra en detectores de humo domésticos. Sintetizado durante el Proyecto Manhattan." } },
  { n: 96, s: "Cm", name: { en: "Curium", es: "Curio" }, mass: 247, cat: "actinide", row: 10, col: 11, config: "[Rn] 5f⁷ 6d¹ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 1345, boil: 3100, discovered: 1944, discoverer: "Glenn T. Seaborg", electroneg: 1.28, radius: 245, ionization: 581, oxidation: ["+3"], desc: { en: "Named after Marie and Pierre Curie. Used in pacemakers and Mars rovers.", es: "Nombrado en honor a Marie y Pierre Curie. Usado en marcapasos y rovers marcianos." } },
  { n: 97, s: "Bk", name: { en: "Berkelium", es: "Berkelio" }, mass: 247, cat: "actinide", row: 10, col: 12, config: "[Rn] 5f⁹ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 986, boil: 2627, discovered: 1949, discoverer: "Glenn T. Seaborg", electroneg: 1.3, radius: 244, ionization: 601, oxidation: ["+3","+4"], desc: { en: "Named after Berkeley, California where it was discovered.", es: "Nombrado por Berkeley, California, donde fue descubierto." } },
  { n: 98, s: "Cf", name: { en: "Californium", es: "Californio" }, mass: 251, cat: "actinide", row: 10, col: 13, config: "[Rn] 5f¹⁰ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 900, boil: 1470, discovered: 1950, discoverer: "Glenn T. Seaborg", electroneg: 1.3, radius: 245, ionization: 608, oxidation: ["+3"], desc: { en: "Powerful neutron emitter. Used to start nuclear reactors and find oil.", es: "Potente emisor de neutrones. Usado para iniciar reactores nucleares y encontrar petróleo." } },
  { n: 99, s: "Es", name: { en: "Einsteinium", es: "Einstenio" }, mass: 252, cat: "actinide", row: 10, col: 14, config: "[Rn] 5f¹¹ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 860, boil: 996, discovered: 1952, discoverer: "Albert Ghiorso", electroneg: 1.3, radius: 245, ionization: 619, oxidation: ["+3"], desc: { en: "Named after Albert Einstein. Discovered in fallout from first H-bomb test.", es: "Nombrado en honor a Albert Einstein. Descubierto en la lluvia radiactiva de la primera bomba H." } },
  { n: 100, s: "Fm", name: { en: "Fermium", es: "Fermio" }, mass: 257, cat: "actinide", row: 10, col: 15, config: "[Rn] 5f¹² 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 1527, boil: null, discovered: 1952, discoverer: "Albert Ghiorso", electroneg: 1.3, radius: 245, ionization: 627, oxidation: ["+3"], desc: { en: "Heaviest element formed by neutron bombardment. Named after Enrico Fermi.", es: "Elemento más pesado formado por bombardeo de neutrones. Nombrado por Enrico Fermi." } },
  { n: 101, s: "Md", name: { en: "Mendelevium", es: "Mendelevio" }, mass: 258, cat: "actinide", row: 10, col: 16, config: "[Rn] 5f¹³ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 827, boil: null, discovered: 1955, discoverer: "Albert Ghiorso", electroneg: 1.3, radius: 246, ionization: 635, oxidation: ["+2","+3"], desc: { en: "Named after Dmitri Mendeleev, creator of the periodic table.", es: "Nombrado en honor a Dmitri Mendeléyev, creador de la tabla periódica." } },
  { n: 102, s: "No", name: { en: "Nobelium", es: "Nobelio" }, mass: 259, cat: "actinide", row: 10, col: 17, config: "[Rn] 5f¹⁴ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: 827, boil: null, discovered: 1966, discoverer: "Georgy Flyorov", electroneg: 1.3, radius: 246, ionization: 642, oxidation: ["+2","+3"], desc: { en: "Named after Alfred Nobel, founder of the Nobel Prize.", es: "Nombrado en honor a Alfred Nobel, fundador del Premio Nobel." } },
  { n: 103, s: "Lr", name: { en: "Lawrencium", es: "Lawrencio" }, mass: 266, cat: "actinide", row: 10, col: 18, config: "[Rn] 5f¹⁴ 7s² 7p¹", phase: { en: "Solid", es: "Sólido" }, melt: 1627, boil: null, discovered: 1961, discoverer: "Albert Ghiorso", electroneg: null, radius: 246, ionization: 479, oxidation: ["+3"], desc: { en: "Last actinide. Named after Ernest Lawrence, inventor of the cyclotron.", es: "Último actínido. Nombrado por Ernest Lawrence, inventor del ciclotrón." } },
  { n: 104, s: "Rf", name: { en: "Rutherfordium", es: "Rutherfordio" }, mass: 267, cat: "transition", row: 7, col: 4, config: "[Rn] 5f¹⁴ 6d² 7s²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1964, discoverer: "JINR & LBNL", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "First transactinide element. Named after Ernest Rutherford.", es: "Primer elemento transactínido. Nombrado en honor a Ernest Rutherford." } },
  { n: 105, s: "Db", name: { en: "Dubnium", es: "Dubnio" }, mass: 268, cat: "transition", row: 7, col: 5, config: "[Rn] 5f¹⁴ 6d³ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1968, discoverer: "JINR & LBNL", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Dubna, Russia, home of the Joint Institute for Nuclear Research.", es: "Nombrado por Dubna, Rusia, sede del Instituto Conjunto de Investigación Nuclear." } },
  { n: 106, s: "Sg", name: { en: "Seaborgium", es: "Seaborgio" }, mass: 269, cat: "transition", row: 7, col: 6, config: "[Rn] 5f¹⁴ 6d⁴ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1974, discoverer: "Albert Ghiorso", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Glenn T. Seaborg, while he was still alive.", es: "Nombrado en honor a Glenn T. Seaborg, mientras aún vivía." } },
  { n: 107, s: "Bh", name: { en: "Bohrium", es: "Bohrio" }, mass: 270, cat: "transition", row: 7, col: 7, config: "[Rn] 5f¹⁴ 6d⁵ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1981, discoverer: "Peter Armbruster", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Niels Bohr, Danish physicist of quantum theory.", es: "Nombrado en honor a Niels Bohr, físico danés de la teoría cuántica." } },
  { n: 108, s: "Hs", name: { en: "Hassium", es: "Hasio" }, mass: 269, cat: "transition", row: 7, col: 8, config: "[Rn] 5f¹⁴ 6d⁶ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1984, discoverer: "Peter Armbruster", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Hesse, Germany. Extremely short half-life.", es: "Nombrado por Hesse, Alemania. Vida media extremadamente corta." } },
  { n: 109, s: "Mt", name: { en: "Meitnerium", es: "Meitnerio" }, mass: 278, cat: "transition", row: 7, col: 9, config: "[Rn] 5f¹⁴ 6d⁷ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1982, discoverer: "Peter Armbruster", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Lise Meitner, who co-discovered nuclear fission.", es: "Nombrado en honor a Lise Meitner, quien codescubrió la fisión nuclear." } },
  { n: 110, s: "Ds", name: { en: "Darmstadtium", es: "Darmstadtio" }, mass: 281, cat: "transition", row: 7, col: 10, config: "[Rn] 5f¹⁴ 6d⁸ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1994, discoverer: "Peter Armbruster", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Darmstadt, Germany, where it was synthesized.", es: "Nombrado por Darmstadt, Alemania, donde fue sintetizado." } },
  { n: 111, s: "Rg", name: { en: "Roentgenium", es: "Roentgenio" }, mass: 282, cat: "transition", row: 7, col: 11, config: "[Rn] 5f¹⁴ 6d⁹ 7s²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1994, discoverer: "Peter Armbruster", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Wilhelm Röntgen, who discovered X-rays.", es: "Nombrado en honor a Wilhelm Röntgen, quien descubrió los rayos X." } },
  { n: 112, s: "Cn", name: { en: "Copernicium", es: "Copernicio" }, mass: 285, cat: "transition", row: 7, col: 12, config: "[Rn] 5f¹⁴ 6d¹⁰ 7s²", phase: { en: "Gas", es: "Gas" }, melt: null, boil: null, discovered: 1996, discoverer: "Sigurd Hofmann", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after astronomer Nicolaus Copernicus. Predicted to be a gas.", es: "Nombrado en honor al astrónomo Nicolás Copérnico. Se predice que es un gas." } },
  { n: 113, s: "Nh", name: { en: "Nihonium", es: "Nihonio" }, mass: 286, cat: "post-transition", row: 7, col: 13, config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 2003, discoverer: "RIKEN", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "First element discovered in Asia. Nihon means 'Japan' in Japanese.", es: "Primer elemento descubierto en Asia. Nihon significa 'Japón' en japonés." } },
  { n: 114, s: "Fl", name: { en: "Flerovium", es: "Flerovio" }, mass: 289, cat: "post-transition", row: 7, col: 14, config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 1998, discoverer: "JINR", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Georgy Flyorov, Soviet nuclear physicist.", es: "Nombrado en honor a Georgy Flyorov, físico nuclear soviético." } },
  { n: 115, s: "Mc", name: { en: "Moscovium", es: "Moscovio" }, mass: 289, cat: "post-transition", row: 7, col: 15, config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 2003, discoverer: "JINR & LLNL", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Moscow Oblast, where Dubna is located.", es: "Nombrado por el Óblast de Moscú, donde se ubica Dubna." } },
  { n: 116, s: "Lv", name: { en: "Livermorium", es: "Livermorio" }, mass: 293, cat: "post-transition", row: 7, col: 16, config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 2000, discoverer: "JINR & LLNL", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Lawrence Livermore National Laboratory in California.", es: "Nombrado por el Laboratorio Nacional Lawrence Livermore en California." } },
  { n: 117, s: "Ts", name: { en: "Tennessine", es: "Teneso" }, mass: 294, cat: "halogen", row: 7, col: 17, config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", phase: { en: "Solid", es: "Sólido" }, melt: null, boil: null, discovered: 2010, discoverer: "JINR & ORNL", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Named after Tennessee. Second-heaviest known element.", es: "Nombrado por Tennessee. Segundo elemento conocido más pesado." } },
  { n: 118, s: "Og", name: { en: "Oganesson", es: "Oganesón" }, mass: 294, cat: "noble", row: 7, col: 18, config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", phase: { en: "Gas", es: "Gas" }, melt: null, boil: null, discovered: 2002, discoverer: "Yuri Oganessian", electroneg: null, radius: null, ionization: null, oxidation: null, desc: { en: "Heaviest known element. Named after Yuri Oganessian, who is still alive.", es: "Elemento conocido más pesado. Nombrado en honor a Yuri Oganessian, quien aún vive." } }
];

const ELEMENT_BY_SYMBOL = Object.fromEntries(ELEMENTS.map(e => [e.s, e]));

const CATEGORIES = {
  alkali: { label: { en: "Alkali metals", es: "Metales alcalinos" }, color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)" },
  alkaline: { label: { en: "Alkaline earth", es: "Alcalinotérreos" }, color: "#f97316", bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.5)" },
  transition: { label: { en: "Transition metals", es: "Metales de transición" }, color: "#eab308", bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.5)" },
  "post-transition": { label: { en: "Post-transition", es: "Post-transición" }, color: "#84cc16", bg: "rgba(132,204,22,0.15)", border: "rgba(132,204,22,0.5)" },
  metalloid: { label: { en: "Metalloids", es: "Metaloides" }, color: "#14b8a6", bg: "rgba(20,184,166,0.15)", border: "rgba(20,184,166,0.5)" },
  nonmetal: { label: { en: "Nonmetals", es: "No metales" }, color: "#06b6d4", bg: "rgba(6,182,212,0.15)", border: "rgba(6,182,212,0.5)" },
  halogen: { label: { en: "Halogens", es: "Halógenos" }, color: "#3b82f6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.5)" },
  noble: { label: { en: "Noble gases", es: "Gases nobles" }, color: "#8b5cf6", bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.5)" },
  lanthanide: { label: { en: "Lanthanides", es: "Lantánidos" }, color: "#ec4899", bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.5)" },
  actinide: { label: { en: "Actinides", es: "Actínidos" }, color: "#f43f5e", bg: "rgba(244,63,94,0.15)", border: "rgba(244,63,94,0.5)" }
};

const PROPERTY_MODES = {
  category:   { label: { en: "Category",          es: "Categoría" },         prop: null },
  electroneg: { label: { en: "Electronegativity", es: "Electronegatividad" }, prop: "electroneg",  unit: "Pauling" },
  radius:     { label: { en: "Atomic Radius",      es: "Radio Atómico" },     prop: "radius",      unit: "pm" },
  ionization: { label: { en: "Ionization Energy",  es: "Energía de Ioniz." }, prop: "ionization",  unit: "kJ/mol" },
  melt:       { label: { en: "Melting Point",       es: "Punto de Fusión" },   prop: "melt",        unit: "°C" },
  mass:       { label: { en: "Atomic Mass",         es: "Masa Atómica" },      prop: "mass",        unit: "u" },
};

const T = {
  en: {
    title: "Interactive Periodic Table",
    subtitle: "Hover for quick info · Click to pin · 118 elements",
    search: "Search by name, symbol, or number…",
    clearFilter: "Clear filter ×",
    placeholder: "Hover over an element to see details, or click to pin it",
    atomicMass: "Atomic mass",
    phase: "Phase (STP)",
    melting: "Melting",
    boiling: "Boiling",
    config: "Configuration",
    discovered: "Discovered",
    discoverer: "Discoverer",
    unknown: "Unknown",
    bce: "BCE",
    language: "Language",
    electroneg:  "Electronegativity",
    radius:      "Atomic radius",
    ionization:  "Ionization energy",
    oxidation:   "Oxidation states",
    visualize:   "Visualize by",
    noData:      "No data",
    tabTable:    "🔬 Table",
    tabCalc:     "⚗️ Calculator",
    tabCompare:  "🔍 Compare",
    tabQuiz:     "📝 Quiz",
    calcTitle:       "Molar Mass Calculator",
    calcPlaceholder: "Enter formula (e.g. H2O, Ca(OH)2)",
    calcMolarMass:   "Molar mass",
    calcElement:     "Element",
    calcAtoms:       "Atoms",
    calcMassPerAtom: "Mass/atom (u)",
    calcSubtotal:    "Subtotal (u)",
    calcPct:         "% by mass",
    calcError:       "Invalid formula",
    compareTitle:  "Compare Elements",
    compareSelect: "Select an element…",
    compareSwap:   "↔ Swap",
    compareClear:  "Clear",
    compareHigher: "Higher",
    compareLower:  "Lower",
    compareNA:     "N/A",
    quizTitle:   "Study Quiz",
    quizMode1:   "Symbol → Name",
    quizMode2:   "Name → Symbol",
    quizMode3:   "Property → Element",
    quizAnswer:  "Your answer…",
    quizCheck:   "Check",
    quizNext:    "Next →",
    quizStreak:  "Streak",
    quizScore:   "Score",
    quizCorrect: "Correct!",
    quizWrong:   "Wrong. Answer:",
    quizGuess:   "Identify this element:",
    quizHint:    "Hint",
  },
  es: {
    title: "Tabla Periódica Interactiva",
    subtitle: "Pasa el mouse para info rápida · Clic para fijar · 118 elementos",
    search: "Buscar por nombre, símbolo o número…",
    clearFilter: "Quitar filtro ×",
    placeholder: "Pasa el mouse sobre un elemento para ver detalles, o haz clic para fijarlo",
    atomicMass: "Masa atómica",
    phase: "Fase (CNTP)",
    melting: "Fusión",
    boiling: "Ebullición",
    config: "Configuración",
    discovered: "Descubierto",
    discoverer: "Descubridor",
    unknown: "Desconocido",
    bce: "a.C.",
    language: "Idioma",
    electroneg:  "Electronegatividad",
    radius:      "Radio atómico",
    ionization:  "Energía de ionización",
    oxidation:   "Estados de oxidación",
    visualize:   "Visualizar por",
    noData:      "Sin dato",
    tabTable:    "🔬 Tabla",
    tabCalc:     "⚗️ Calculadora",
    tabCompare:  "🔍 Comparar",
    tabQuiz:     "📝 Quiz",
    calcTitle:       "Calculadora de Masa Molar",
    calcPlaceholder: "Ingresa fórmula (ej. H2O, Ca(OH)2)",
    calcMolarMass:   "Masa molar",
    calcElement:     "Elemento",
    calcAtoms:       "Átomos",
    calcMassPerAtom: "Masa/átomo (u)",
    calcSubtotal:    "Subtotal (u)",
    calcPct:         "% en masa",
    calcError:       "Fórmula inválida",
    compareTitle:  "Comparar Elementos",
    compareSelect: "Seleccionar elemento…",
    compareSwap:   "↔ Intercambiar",
    compareClear:  "Limpiar",
    compareHigher: "Mayor",
    compareLower:  "Menor",
    compareNA:     "N/D",
    quizTitle:   "Quiz de Estudio",
    quizMode1:   "Símbolo → Nombre",
    quizMode2:   "Nombre → Símbolo",
    quizMode3:   "Propiedad → Elemento",
    quizAnswer:  "Tu respuesta…",
    quizCheck:   "Verificar",
    quizNext:    "Siguiente →",
    quizStreak:  "Racha",
    quizScore:   "Puntuación",
    quizCorrect: "¡Correcto!",
    quizWrong:   "Incorrecto. Respuesta:",
    quizGuess:   "Identifica este elemento:",
    quizHint:    "Pista",
  }
};

function pickRandom(seen, total) {
  const remaining = Array.from({ length: total }, (_, i) => i + 1).filter(n => !seen.has(n));
  if (remaining.length === 0) return null;
  return ELEMENTS.find(e => e.n === remaining[Math.floor(Math.random() * remaining.length)]);
}

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

export default function PeriodicTable() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(null);
  const [propertyMode, setPropertyMode] = useState("category");
  const [lang, setLang] = useState("es");
  const [activeTab, setActiveTab] = useState("table"); // "table"|"calculator"|"compare"|"quiz"
  const [formula, setFormula] = useState("");
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [compareSearchA, setCompareSearchA] = useState("");
  const [compareSearchB, setCompareSearchB] = useState("");
  const [quizMode, setQuizMode]       = useState("symbolToName");
  const [quizCurrent, setQuizCurrent] = useState(null);
  const [quizAnswer, setQuizAnswer]   = useState("");
  const [quizResult, setQuizResult]   = useState("idle");
  const [quizStreak, setQuizStreak]   = useState(0);
  const [quizScore, setQuizScore]     = useState(0);
  const [quizSeen, setQuizSeen]       = useState(new Set());
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const t = T[lang];

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q && !filter) return null;
    const set = new Set();
    ELEMENTS.forEach(e => {
      const matchesSearch = !q ||
        e.name.en.toLowerCase().includes(q) ||
        e.name.es.toLowerCase().includes(q) ||
        e.s.toLowerCase() === q ||
        String(e.n) === q;
      const matchesFilter = !filter || e.cat === filter;
      if (matchesSearch && matchesFilter) set.add(e.n);
    });
    return set;
  }, [search, filter]);

  const heatRange = useMemo(() => {
    const mode = PROPERTY_MODES[propertyMode];
    if (!mode.prop) return null;
    const values = ELEMENTS.map(e => e[mode.prop]).filter(v => v !== null && v !== undefined);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [propertyMode]);

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
    return {
      total,
      rows: rows.map(r => ({ ...r, pct: ((r.subtotal / total) * 100).toFixed(2) })),
    };
  }, [formula, lang]);

  const display = hovered || selected;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #1a1033 100%)", padding: isMobile ? "12px 8px" : "24px", fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", color: "#e4e4e7" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "22px" : "32px", fontWeight: "700", margin: "0 0 6px 0", background: "linear-gradient(90deg, #60a5fa, #c084fc, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t.title}
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
              {t.subtitle}
            </p>
          </div>
          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "3px" }}>
            {["es", "en"].map(code => (
              <button
                key={code}
                onClick={() => setLang(code)}
                style={{
                  padding: "6px 14px",
                  background: lang === code ? "rgba(96,165,250,0.2)" : "transparent",
                  border: lang === code ? "1px solid rgba(96,165,250,0.4)" : "1px solid transparent",
                  borderRadius: "6px",
                  color: lang === code ? "#fff" : "#94a3b8",
                  fontSize: "13px",
                  fontWeight: lang === code ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit"
                }}
              >
                {code === "es" ? "🇪🇸 ES" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </header>

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
                padding: isMobile ? "6px 4px" : "8px 12px",
                background: activeTab === tab.id ? "rgba(96,165,250,0.2)" : "transparent",
                border: activeTab === tab.id ? "1px solid rgba(96,165,250,0.4)" : "1px solid transparent",
                borderRadius: "7px",
                color: activeTab === tab.id ? "#fff" : "#94a3b8",
                fontSize: isMobile ? "11px" : "13px",
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

        {activeTab === "table" && (
        <>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#e4e4e7",
              fontSize: "14px",
              outline: "none",
              minWidth: isMobile ? "0" : "260px",
              flex: isMobile ? "1 1 100%" : "0 1 320px",
              fontFamily: "inherit"
            }}
          />
          {filter && (
            <button
              onClick={() => setFilter(null)}
              style={{
                padding: "8px 14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                color: "#e4e4e7",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              {t.clearFilter}
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? null : key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 10px",
                background: filter === key ? cat.bg : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter === key ? cat.border : "rgba(255,255,255,0.08)"}`,
                borderRadius: "6px",
                color: "#e4e4e7",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "inherit"
              }}
            >
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: cat.color }} />
              {cat.label[lang]}
            </button>
          ))}
        </div>

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

        <div className="pt-scroll" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(10, auto)", gap: "3px", minWidth: isMobile ? "560px" : undefined }}>
          {ELEMENTS.map(el => {
            const isMatch = !matches || matches.has(el.n);
            const isSelected = selected?.n === el.n;

            const heat = propertyMode !== "category" && heatRange
              ? heatColor(el[PROPERTY_MODES[propertyMode].prop], heatRange.min, heatRange.max)
              : null;

            const cat = CATEGORIES[el.cat];
            const elBg     = heat ? heat.bg     : (isMatch ? cat.bg     : "rgba(255,255,255,0.02)");
            const elBorder = heat ? (isMatch ? heat.border : "rgba(255,255,255,0.05)") : (isSelected ? cat.color : (isMatch ? cat.border : "rgba(255,255,255,0.05)"));
            const elColor  = heat ? heat.color  : (isMatch ? "#fff" : "#52525b");

            return (
              <button
                key={el.n}
                onMouseEnter={() => setHovered(el)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(isSelected ? null : el)}
                style={{
                  gridColumn: el.col,
                  gridRow: el.row,
                  aspectRatio: "1",
                  background: elBg,
                  border: `1px solid ${elBorder}`,
                  borderRadius: "4px",
                  padding: "2px",
                  color: elColor,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1px",
                  fontFamily: "inherit",
                  transition: "transform 0.1s, box-shadow 0.1s, background 0.15s, filter 0.1s",
                  transform: isSelected ? "scale(1.1)" : "scale(1)",
                  filter: (hovered?.n === el.n && isMatch) ? "brightness(1.3)" : "none",
                  boxShadow: isSelected ? `0 0 16px ${cat.color}` : "none",
                  opacity: isMatch ? 1 : 0.3,
                  position: "relative",
                  zIndex: isSelected ? 5 : 1
                }}
              >
                <div style={{ fontSize: "8px", opacity: 0.7, lineHeight: 1 }}>{el.n}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", lineHeight: 1 }}>{el.s}</div>
                <div style={{ fontSize: "7px", opacity: 0.7, lineHeight: 1, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", whiteSpace: "nowrap" }}>{el.name[lang]}</div>
              </button>
            );
          })}

          <div style={{ gridColumn: "3", gridRow: "9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#71717a" }}>57-71</div>
          <div style={{ gridColumn: "3", gridRow: "10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#71717a" }}>89-103</div>
        </div>
        </div>

        <div style={{
          marginTop: "24px",
          minHeight: "180px",
          padding: "20px",
          background: display ? `linear-gradient(135deg, ${CATEGORIES[display.cat].bg}, rgba(255,255,255,0.02))` : "rgba(255,255,255,0.03)",
          border: `1px solid ${display ? CATEGORIES[display.cat].border : "rgba(255,255,255,0.08)"}`,
          borderRadius: "12px",
          transition: "all 0.2s"
        }}>
          {display ? (
            <div style={{ display: isMobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: "auto 1fr", gap: isMobile ? "12px" : "24px", alignItems: "start" }}>
              <div style={{
                width: isMobile ? "80px" : "120px",
                height: isMobile ? "80px" : "120px",
                alignSelf: isMobile ? "center" : undefined,
                background: CATEGORIES[display.cat].bg,
                border: `2px solid ${CATEGORIES[display.cat].color}`,
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0
              }}>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>{display.n}</div>
                <div style={{ fontSize: isMobile ? "28px" : "44px", fontWeight: "700", lineHeight: 1 }}>{display.s}</div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>{display.mass}</div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#fff" }}>{display.name[lang]}</h2>
                  <span style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    background: CATEGORIES[display.cat].bg,
                    border: `1px solid ${CATEGORIES[display.cat].border}`,
                    borderRadius: "10px",
                    color: CATEGORIES[display.cat].color
                  }}>
                    {CATEGORIES[display.cat].label[lang]}
                  </span>
                </div>
                <p style={{ margin: "0 0 14px 0", fontSize: "14px", lineHeight: 1.5, color: "#cbd5e1" }}>{display.desc[lang]}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", fontSize: "12px" }}>
                  <Stat label={t.atomicMass} value={`${display.mass} u`} />
                  <Stat label={t.phase} value={display.phase[lang]} />
                  <Stat label={t.melting} value={display.melt !== null ? `${display.melt} °C` : t.unknown} />
                  <Stat label={t.boiling} value={display.boil !== null ? `${display.boil} °C` : t.unknown} />
                  <Stat label={t.config} value={display.config} />
                  <Stat label={t.discovered} value={display.discovered < 0 ? `~${Math.abs(display.discovered)} ${t.bce}` : display.discovered} />
                  <Stat label={t.discoverer} value={display.discoverer} />
                  <Stat label={t.electroneg} value={display.electroneg !== null && display.electroneg !== undefined ? `${display.electroneg} (Pauling)` : (t.noData ?? "—")} />
                  <Stat label={t.radius}     value={display.radius     !== null && display.radius !== undefined     ? `${display.radius} pm`            : (t.noData ?? "—")} />
                  <Stat label={t.ionization} value={display.ionization !== null && display.ionization !== undefined ? `${display.ionization} kJ/mol`    : (t.noData ?? "—")} />
                </div>
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
                            background: ox.startsWith("+") ? "rgba(34,197,94,0.15)" : ox.startsWith("-") ? "rgba(239,68,68,0.15)" : "rgba(148,163,184,0.1)",
                            border: `1px solid ${ox.startsWith("+") ? "rgba(34,197,94,0.4)" : ox.startsWith("-") ? "rgba(239,68,68,0.4)" : "rgba(148,163,184,0.3)"}`,
                            color: ox.startsWith("+") ? "#86efac" : ox.startsWith("-") ? "#fca5a5" : "#94a3b8",
                          }}
                        >
                          {ox}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#64748b", fontSize: "14px", padding: "40px 0" }}>
              {t.placeholder}
            </div>
          )}
        </div>
        </>
        )}

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

        {activeTab === "compare" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", marginBottom: "20px" }}>
              {t.compareTitle}
            </h2>

            {/* Selectores */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr", gap: "12px", alignItems: "start", marginBottom: "24px" }}>
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
                  marginTop: isMobile ? "0" : "28px",
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

        {activeTab === "quiz" && (() => {
          const startQuiz = () => {
            const el = pickRandom(quizSeen, 118);
            if (el) { setQuizCurrent(el); setQuizAnswer(""); setQuizResult("idle"); }
            else { const empty = new Set(); setQuizSeen(empty); const el2 = pickRandom(empty, 118); setQuizCurrent(el2); setQuizAnswer(""); setQuizResult("idle"); }
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

      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px 10px", borderRadius: "6px" }}>
      <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</div>
      <div style={{ color: "#f1f5f9", fontWeight: "500" }}>{value}</div>
    </div>
  );
}

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

function CompareTable({ a, b, lang, t }) {
  const rows = [
    { label: lang === "es" ? "Número atómico" : "Atomic number",         va: a.n,           vb: b.n,           numeric: true },
    { label: lang === "es" ? "Masa atómica (u)" : "Atomic mass (u)",     va: a.mass,        vb: b.mass,        numeric: true },
    { label: lang === "es" ? "Categoría" : "Category",                   va: CATEGORIES[a.cat].label[lang], vb: CATEGORIES[b.cat].label[lang], numeric: false },
    { label: lang === "es" ? "Fase (STP)" : "Phase (STP)",               va: a.phase[lang], vb: b.phase[lang], numeric: false },
    { label: lang === "es" ? "Config. electrónica" : "Electron config.",  va: a.config,      vb: b.config,      numeric: false },
    { label: lang === "es" ? "Electronegatividad" : "Electronegativity",  va: a.electroneg,  vb: b.electroneg,  numeric: true },
    { label: lang === "es" ? "Radio atómico (pm)" : "Atomic radius (pm)", va: a.radius,      vb: b.radius,      numeric: true },
    { label: lang === "es" ? "E. ionización (kJ/mol)" : "Ioniz. energy (kJ/mol)", va: a.ionization, vb: b.ionization, numeric: true },
    { label: lang === "es" ? "Fusión (°C)" : "Melting (°C)",              va: a.melt,        vb: b.melt,        numeric: true },
    { label: lang === "es" ? "Ebullición (°C)" : "Boiling (°C)",          va: a.boil,        vb: b.boil,        numeric: true },
    { label: lang === "es" ? "Estados de oxidación" : "Oxidation states",  va: a.oxidation ? a.oxidation.join(", ") : "—", vb: b.oxidation ? b.oxidation.join(", ") : "—", numeric: false },
    { label: lang === "es" ? "Descubierto" : "Discovered",                va: a.discovered,  vb: b.discovered,  numeric: false },
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
            const highlight = (higher) => higher ? { color: "#86efac", fontWeight: "600" } : { color: "#94a3b8" };
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
