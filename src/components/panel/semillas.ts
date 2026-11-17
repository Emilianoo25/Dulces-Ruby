/**
 * Datos iniciales del panel.
 * - Productos y presentaciones: salen del catálogo (src/data/catalogo.ts).
 * - Insumos típicos: sólo nombres y unidades, en cero (los completa ella).
 * - Demo: números INVENTADOS para mostrar cómo funciona el panel.
 */
import { categorias } from '../../data/catalogo';
import {
  aplicarMovimiento,
  hoy,
  mapaInsumos,
  movCompra,
  movProduccion,
  movVenta,
  nuevoId,
  type Datos,
  type Insumo,
  type Presentacion,
  type Producto,
  type Unidad,
} from './modelo';
import { cantidad } from './formato';

export function productosDelCatalogo(): Pick<Datos, 'productos' | 'presentaciones'> {
  const productos: Producto[] = [];
  const presentaciones: Presentacion[] = [];
  categorias.forEach((c, i) => {
    const id = nuevoId();
    productos.push({ id, nombre: c.titulo, emoji: c.emoji, rinde: 12, receta: [], orden: i });
    c.opciones.forEach((o, j) =>
      presentaciones.push({
        id: nuevoId(),
        productoId: id,
        nombre: o.nombre,
        unidades: o.cantidad,
        precio: o.precio,
        extras: [],
        orden: j,
      }),
    );
  });
  return { productos, presentaciones };
}

const TIPICOS: [string, Unidad][] = [
  ['Harina 0000', 'g'],
  ['Azúcar', 'g'],
  ['Huevos', 'u'],
  ['Manteca', 'g'],
  ['Leche', 'ml'],
  ['Levadura', 'g'],
  ['Chocolate cobertura', 'g'],
  ['Granitas de colores', 'g'],
  ['Almidón de mandioca', 'g'],
  ['Queso', 'g'],
  ['Aceite', 'ml'],
  ['Palitos', 'u'],
  ['Bandejas', 'u'],
  ['Cajas', 'u'],
  ['Bolsitas', 'u'],
];

export const insumosTipicos = (desde = 0): Insumo[] =>
  TIPICOS.map(([nombre, unidad], i) => ({
    id: nuevoId(),
    nombre,
    unidad,
    stock: 0,
    minimo: 0,
    costo: 0,
    orden: desde + i,
  }));

/** Panel de ejemplo con números inventados (sólo modo prueba) */
export function datosDemo(): Datos {
  const insumos = insumosTipicos();
  const by = (n: string) => insumos.find((i) => i.nombre === n)!;
  // [nombre, comprado, pagado $, mínimo]
  const compras: [string, number, number, number][] = [
    ['Harina 0000', 5000, 6500, 1000],
    ['Azúcar', 2000, 2600, 500],
    ['Huevos', 30, 7200, 6],
    ['Manteca', 1000, 9800, 200],
    ['Leche', 3000, 4200, 500],
    ['Levadura', 250, 2500, 50],
    ['Chocolate cobertura', 1000, 14000, 300],
    ['Granitas de colores', 200, 2400, 50],
    ['Almidón de mandioca', 2000, 5600, 500],
    ['Queso', 1500, 15000, 400],
    ['Aceite', 900, 2700, 200],
    ['Bandejas', 20, 3000, 5],
    ['Cajas', 10, 4500, 3],
    ['Bolsitas', 50, 1500, 10],
    ['Palitos', 100, 2500, 20],
  ];
  compras.forEach(([n, , , min]) => (by(n).minimo = min));

  const productos = productosDelCatalogo();
  const donas = productos.productos[0];
  const chipitas = productos.productos[1];
  donas.rinde = 30;
  donas.receta = [
    { insumoId: by('Harina 0000').id, cantidad: 500 },
    { insumoId: by('Azúcar').id, cantidad: 80 },
    { insumoId: by('Huevos').id, cantidad: 2 },
    { insumoId: by('Manteca').id, cantidad: 60 },
    { insumoId: by('Leche').id, cantidad: 250 },
    { insumoId: by('Levadura').id, cantidad: 10 },
    { insumoId: by('Chocolate cobertura').id, cantidad: 300 },
    { insumoId: by('Granitas de colores').id, cantidad: 40 },
  ];
  chipitas.rinde = 40;
  chipitas.receta = [
    { insumoId: by('Almidón de mandioca').id, cantidad: 500 },
    { insumoId: by('Queso').id, cantidad: 300 },
    { insumoId: by('Huevos').id, cantidad: 2 },
    { insumoId: by('Leche').id, cantidad: 150 },
    { insumoId: by('Aceite').id, cantidad: 100 },
  ];
  const pres = productos.presentaciones;
  const p = (prod: Producto, n: string) => pres.find((x) => x.productoId === prod.id && x.nombre === n);
  const bandeja = p(donas, 'Bandeja de 6');
  const caja = p(donas, 'Caja de 15');
  const media = p(chipitas, 'Media docena');
  const docena = p(chipitas, 'Docena');
  if (bandeja) bandeja.extras = [{ insumoId: by('Bandejas').id, cantidad: 1 }];
  if (caja) caja.extras = [{ insumoId: by('Cajas').id, cantidad: 1 }];
  if (media) media.extras = [{ insumoId: by('Bolsitas').id, cantidad: 1 }];
  if (docena) docena.extras = [{ insumoId: by('Bolsitas').id, cantidad: 1 }];
  const palito = p(donas, 'Palito de 3');
  if (palito) palito.extras = [{ insumoId: by('Palitos').id, cantidad: 1 }];

  let d: Datos = { insumos, ...productos, movimientos: [] };
  const dia = (menos: number) => {
    const f = new Date();
    f.setDate(f.getDate() - menos);
    return hoy(f);
  };
  // Compras de hace unos días
  compras.forEach(([n, cant, total]) => {
    const ins = d.insumos.find((i) => i.nombre === n)!;
    d = aplicarMovimiento(d, movCompra(ins, cant, total, dia(6), cantidad(cant, ins.unidad)));
  });
  // Producción y ventas
  const prod = (pr: Producto, u: number, dd: number) => {
    const actual = d.productos.find((x) => x.id === pr.id)!;
    d = aplicarMovimiento(d, movProduccion(actual, u, dia(dd), mapaInsumos(d)));
  };
  const vend = (pr: Presentacion | undefined, c: number, dd: number) => {
    if (pr) d = aplicarMovimiento(d, movVenta(pr, c, pr.precio, dia(dd), d));
  };
  prod(donas, 60, 4);
  prod(chipitas, 60, 4);
  vend(caja, 2, 3);
  vend(docena, 2, 3);
  vend(bandeja, 2, 2);
  prod(donas, 30, 1);
  vend(caja, 1, 1);
  vend(media, 3, 1);
  vend(docena, 1, 0);
  vend(palito, 4, 0);
  return d;
}

/* ─────────────────────── catálogo ↔ panel ─────────────────────── */

const igual = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export interface FaltanteCatalogo {
  producto: Producto;
  nombre: string;
  unidades: number;
  precio: number;
}

/** Formas de venta del catálogo que todavía no están en el panel (por nombre de producto + presentación) */
export function faltantesDelCatalogo(d: Datos): FaltanteCatalogo[] {
  const out: FaltanteCatalogo[] = [];
  categorias.forEach((c) => {
    const producto = d.productos.find((p) => igual(p.nombre, c.titulo));
    if (!producto) return;
    c.opciones.forEach((o) => {
      const existe = d.presentaciones.some((x) => x.productoId === producto.id && igual(x.nombre, o.nombre));
      if (!existe) out.push({ producto, nombre: o.nombre, unidades: o.cantidad, precio: o.precio });
    });
  });
  return out;
}

/** Arma la presentación a agregar. Si se llama "palito" y existe el insumo "Palitos", lo usa como envase. */
export function presentacionDesdeCatalogo(f: FaltanteCatalogo, d: Datos): Presentacion {
  const palitos = /palito/i.test(f.nombre) ? d.insumos.find((i) => /^palitos?$/i.test(i.nombre.trim())) : undefined;
  return {
    id: nuevoId(),
    productoId: f.producto.id,
    nombre: f.nombre,
    unidades: f.unidades,
    precio: f.precio,
    extras: palitos ? [{ insumoId: palitos.id, cantidad: 1 }] : [],
    orden: d.presentaciones.filter((x) => x.productoId === f.producto.id).length,
  };
}

/** Precio con el que figura esta presentación en el catálogo público (null si no está) */
export function precioEnCatalogo(productoNombre: string, presentacionNombre: string): number | null {
  const c = categorias.find((x) => igual(x.titulo, productoNombre));
  const o = c?.opciones.find((x) => igual(x.nombre, presentacionNombre));
  return o ? o.precio : null;
}

/* ─────────────────── sincronización automática con el catálogo ───────────────────
 * Al abrir el panel, lo que está en el catálogo y falta en el panel se agrega solo
 * (productos, formas de venta y, para los palitos, el insumo "Palitos" como envase).
 * Se recuerda qué ya se sincronizó en este dispositivo: si Ruby borra algo a propósito,
 * no vuelve a aparecer solo (queda como sugerencia en Recetas para re-agregarlo).
 */
const CLAVE_VISTO = 'dr-panel-catalogo-visto-v1';
const claveCat = (producto: string, opcion: string) => `${producto.trim().toLowerCase()}|${opcion.trim().toLowerCase()}`;

export function leerVisto(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE_VISTO) || '[]') as string[]);
  } catch {
    return new Set();
  }
}
export function guardarVisto(v: Set<string>): void {
  try {
    localStorage.setItem(CLAVE_VISTO, JSON.stringify([...v]));
  } catch {
    /* sin almacenamiento: se vuelve a sincronizar la próxima vez */
  }
}

const esPalito = (nombre: string) => /palito/i.test(nombre);
const buscarPalitos = (d: Pick<Datos, 'insumos'>) => d.insumos.find((i) => /^palitos?$/i.test(i.nombre.trim()));

export interface Sincronizacion {
  datos: Datos;
  insumos: Insumo[];
  productos: Producto[];
  presentaciones: Presentacion[];
  agregados: string[];
  visto: Set<string>;
}

export function sincronizarConCatalogo(d: Datos, vistoPrevio: Set<string>): Sincronizacion {
  const visto = new Set(vistoPrevio);
  const insumos: Insumo[] = [];
  const productos: Producto[] = [];
  const presentaciones: Presentacion[] = [];
  const agregados: string[] = [];
  let datos = d;

  const asegurarPalitos = (): Insumo => {
    const ya = buscarPalitos(datos);
    if (ya) return ya;
    const nuevo: Insumo = { id: nuevoId(), nombre: 'Palitos', unidad: 'u', stock: 0, minimo: 0, costo: 0, orden: datos.insumos.length };
    insumos.push(nuevo);
    datos = { ...datos, insumos: [...datos.insumos, nuevo] };
    return nuevo;
  };

  categorias.forEach((c, ci) => {
    const claves = c.opciones.map((o) => claveCat(c.titulo, o.nombre));
    let producto = datos.productos.find((p) => igual(p.nombre, c.titulo));
    if (!producto) {
      // Producto nuevo en el catálogo (nunca visto en este panel) → se crea
      if (claves.some((k) => visto.has(k))) return; // lo borraron a propósito
      producto = { id: nuevoId(), nombre: c.titulo, emoji: c.emoji, rinde: 12, receta: [], orden: datos.productos.length + ci };
      productos.push(producto);
      datos = { ...datos, productos: [...datos.productos, producto] };
      agregados.push(c.titulo);
    }
    const prod = producto;
    c.opciones.forEach((o) => {
      const k = claveCat(c.titulo, o.nombre);
      const existe = datos.presentaciones.some((x) => x.productoId === prod.id && igual(x.nombre, o.nombre));
      if (!existe && !visto.has(k)) {
        const nueva: Presentacion = {
          id: nuevoId(),
          productoId: prod.id,
          nombre: o.nombre,
          unidades: o.cantidad,
          precio: o.precio,
          extras: esPalito(o.nombre) ? [{ insumoId: asegurarPalitos().id, cantidad: 1 }] : [],
          orden: datos.presentaciones.filter((x) => x.productoId === prod.id).length,
        };
        presentaciones.push(nueva);
        datos = { ...datos, presentaciones: [...datos.presentaciones, nueva] };
        agregados.push(`${o.nombre} (${c.titulo.toLowerCase()})`);
      }
      visto.add(k);
    });
  });

  return { datos, insumos, productos, presentaciones, agregados, visto };
}

/** Formas de venta "palito" sin envase → les asigna el insumo Palitos (si existe) */
export function vincularPalitos(d: Datos): Presentacion[] {
  const palitos = buscarPalitos(d);
  if (!palitos) return [];
  return d.presentaciones
    .filter((p) => esPalito(p.nombre) && p.extras.length === 0)
    .map((p) => ({ ...p, extras: [{ insumoId: palitos.id, cantidad: 1 }] }));
}
