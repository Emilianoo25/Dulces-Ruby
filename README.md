# Dulce Ruby — catálogo y panel

- **Catálogo** (público): `https://dulces-ruby.vercel.app/` — libro de recetas que se hojea, carrito y pedido por WhatsApp.
- **Panel** (privado): `https://dulces-ruby.vercel.app/panel/` — stock, recetas, costos, ventas y ganancias.

Astro 5 (estático) + Preact (panel) + `page-flip` (libro) + Supabase (datos del panel).

## Comandos

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # sitio estático en /dist
npm run preview
npm run check     # tipos
```

## Editar el catálogo

Todo está en **`src/data/catalogo.ts`**: productos, precios, promos, lugares y fotos.

- **Precios**: cambiás el número y se recalcula todo (precio por unidad, "ahorrás", mejor precio, packs del carrito).
- **Producto nuevo**: copiás un bloque de `categorias`; aparece solo en el menú, el índice, el libro (2 páginas) y el panel.
- **Fotos**: subilas a `public/fotos/` y poné `foto: '/fotos/donas.jpg'`. Sin foto se muestra una ilustración.
- **Opción "aparte"** (`aparte: true`, ej. Palito de 3): formato propio, no se combina con los packs del carrito.
- **Lugares**: la página "¿Dónde nos encontrás?" aparece sola cuando hay un lugar sin `pendiente`.
- **Links por sección**: `/#donas`, `/#chipitas`, `/#promos`, `/#pedir`.

## Carrito y pedidos

"+ Agregar" suma al pedido. El carrito arma solo la combinación más barata de packs
(2 medias docenas → 1 docena; 6 sueltas → bandeja) y lo muestra en vivo en la página.
Al confirmar pide nombre, retiro/envío, para cuándo, pago y comentario, y abre WhatsApp con el pedido escrito.

## Panel y Supabase

Sin configurar, el panel funciona en **modo prueba** (datos de ejemplo en el navegador).
Para usarlo de verdad se conecta a un proyecto **Supabase de Dulce Ruby**:

1. Crear el proyecto en supabase.com (región São Paulo).
2. **SQL Editor** → pegar todo `supabase/panel.sql` → **Run**.
3. **Authentication → URL Configuration** → *Site URL*: `https://dulces-ruby.vercel.app/panel/` (y agregarla en *Redirect URLs*).
4. **Project Settings → API**: copiar *Project URL* y *Publishable key* en `src/data/panel.ts`
   (o como variables `PUBLIC_DR_SUPABASE_URL` / `PUBLIC_DR_SUPABASE_KEY` en Vercel). **Nunca** la *secret / service_role*.
5. Ruby entra al panel → **Crear cuenta** → confirma el mail.
6. **Authentication → Sign In / Providers** → desactivar *Allow new users to sign up*.

Ojo: en el plan gratis, Supabase pausa el proyecto si nadie lo usa por 7 días (se reactiva desde el dashboard).

## Estructura

```
src/data/catalogo.ts        ← productos, precios, promos, lugares, WhatsApp
src/data/panel.ts           ← conexión con Supabase
src/pages/index.astro       ← catálogo (libro)
src/pages/panel/index.astro ← panel
src/scripts/libro.ts        ← flipbook (gestos táctiles propios sobre page-flip 2.0.7)
src/scripts/carrito.ts      ← carrito, packs y pedido por WhatsApp
src/components/panel/       ← app del panel (lógica de costos en modelo.ts)
supabase/panel.sql          ← tablas, seguridad (RLS) y funciones del panel
```
