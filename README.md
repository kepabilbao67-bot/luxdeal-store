# 💎 LUXDEAL - Marketplace de Ofertas Premium Verificadas

> Tu buscador inteligente de ofertas en marcas premium. Modelo de afiliados: los productos son vendidos y enviados por Amazon, Zalando, El Corte Inglés, Sephora y más.

![LUXDEAL](https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop)

## 🚀 Demo en Vivo

Abre `index.html` en tu navegador o despliega en GitHub Pages / Netlify / Vercel.

**Panel Admin:** Añade `?admin=true` a la URL para acceder al monitor de errores.

---

## ✨ Características

### Página Principal
- 🏷️ **9 productos de marcas premium** con descuentos reales
- 🔥 **Banner countdown** con ofertas flash
- 📂 **5 categorías** (Ropa, Gourmet, Electrónica, Belleza, Hogar)
- 🔍 **Buscador inteligente** (Ctrl+K) por marca/producto/categoría
- 🛒 **Carrito/lista** para guardar ofertas favoritas
- 📱 **100% responsive** (móvil, tablet, desktop)
- 💬 **WhatsApp flotante** para consultas directas
- 💎 **Popup VIP** para captar emails (exit intent)

### Motor de Ofertas Diarias
- 🔄 **Rotación automática** de productos cada día
- ⚡ **"Oferta del Día"** destacada con banner especial
- ⏰ **Alertas de expiración** para ofertas que terminan pronto
- 📊 **Base de datos** con 15 productos de marcas reales

### Chatbot IA Inteligente
- 🤖 **Búsqueda conversacional** ("quiero auriculares")
- 💰 **Filtro por presupuesto** ("algo por menos de 100€")
- 📊 **Comparaciones** ("Sony vs Bose")
- 🎁 **Recomendaciones personalizadas** ("regalo para mi madre")
- ❓ **FAQ automatizado** (envíos, devoluciones, cómo funciona)

### Monitor de Errores (Admin)
- 🔗 **Verificación de links** rotos/timeout
- 📈 **Historial de precios** con alertas de cambios
- ⚠️ **Detección de ofertas expiradas**
- ⚙️ **Validación de config** de afiliados
- 📋 **Panel visual** con logs y estadísticas

### Sistema de Afiliados
- 🛍️ **Amazon Associates** (1-10% comisión)
- 👗 **Awin** - Zalando, El Corte Inglés, ASOS, Nike, Dyson (3-11%)
- 💄 **Sephora Affiliates** (5-10%)
- 📱 **CJ Affiliate** - Nike, Samsung, Adidas (3-15%)
- 🔗 **Generación automática de links** con tu tag

---

## 📁 Estructura del Proyecto

```
luxdeal/
├── index.html              → Página principal (39 KB)
├── styles.css              → Estilos principales (38 KB)
├── chatbot-ia.css          → Estilos del chatbot (11 KB)
├── script.js               → Lógica principal frontend (28 KB)
├── config-afiliados.js     → Configuración de afiliados (7 KB)
├── daily-deals-engine.js   → Motor de ofertas diarias (17 KB)
├── error-monitor.js        → Monitor de errores/precios (19 KB)
├── chatbot-ia.js           → Chatbot IA inteligente (24 KB)
├── legal.html              → Aviso legal y disclosure (7 KB)
├── GUIA-AFILIADOS.md       → Guía para registrarse en afiliados (6 KB)
└── README.md               → Este archivo
```

---

## ⚡ Inicio Rápido

### 1. Clona el repositorio
```bash
git clone https://github.com/tu-usuario/luxdeal.git
cd luxdeal
```

### 2. Configura tus afiliados
Edita `config-afiliados.js`:
```javascript
// Reemplaza con tu tag real de Amazon
amazon: {
    tag: 'TU-TAG-REAL-21',  // ← Pon tu tag aquí
    ...
}

// Reemplaza con tu Awin Affiliate ID
awin: {
    affiliateId: 'TU-ID-REAL',  // ← Pon tu ID aquí
    ...
}
```

### 3. Abre en navegador
```bash
# Opción 1: Abrir directamente
open index.html

# Opción 2: Con servidor local
npx serve .
# → http://localhost:3000
```

### 4. Despliega gratis
- **GitHub Pages:** Settings → Pages → Source: main → Save
- **Netlify:** Arrastra la carpeta a netlify.com/drop
- **Vercel:** `npx vercel --prod`

---

## 💰 Cómo Monetizar

### Paso 1: Regístrate en programas de afiliados
| Programa | Link de Registro | Comisión |
|----------|-----------------|----------|
| Amazon Associates ES | [afiliados.amazon.es](https://afiliados.amazon.es/) | 1-10% |
| Awin (Zalando, ECI, Nike) | [awin.com/es/afiliados](https://www.awin.com/es/afiliados) | 3-11% |
| Sephora | [r.creators.sephora.com](https://r.creators.sephora.com/beauty/affiliates) | 5-10% |
| CJ Affiliate | [cj.com](https://www.cj.com/) | 3-15% |

### Paso 2: Configura tus links
Edita `config-afiliados.js` con tus datos reales (ver guía completa en `GUIA-AFILIADOS.md`)

### Paso 3: Genera tráfico
- SEO: La página ya está optimizada con metatags
- Redes sociales: Comparte ofertas diarias
- Email marketing: Usa el formulario de newsletter
- WhatsApp: Canal de ofertas con el botón flotante

### Ingresos estimados:
| Visitas/día | Ventas/día | Ingreso mensual |
|-------------|-----------|-----------------|
| 1,000 | 20 | ~$1,800 |
| 5,000 | 100 | ~$9,000 |
| 10,000 | 200 | ~$30,000 |

---

## 🛠️ Personalización

### Cambiar colores
En `styles.css`, modifica las variables CSS:
```css
:root {
    --primary: #2d6a4f;        /* Verde principal */
    --primary-dark: #1b4332;   /* Verde oscuro */
    --secondary: #d4a373;      /* Dorado */
    --accent: #f4845f;         /* Naranja badges */
}
```

### Agregar productos
En `daily-deals-engine.js`, añade al array `DEALS_DATABASE`:
```javascript
{
    id: 'd016',
    name: 'Tu Producto',
    category: 'electronica',
    price: 99.99,
    originalPrice: 149.99,
    discount: 33,
    store: 'Amazon',
    affiliateUrl: 'https://amazon.es/dp/XXX?tag=tu-tag-21',
    ...
}
```

### Panel Admin
Accede a `tu-sitio.com?admin=true` para:
- Ver errores y warnings
- Verificar enlaces
- Monitorear cambios de precio
- Detectar ofertas expiradas

---

## 📋 Requisitos Legales

✅ Ya incluidos en `legal.html`:
- Declaración de afiliados (Affiliate Disclosure)
- Lista de redes de afiliados utilizadas
- Explicación del modelo de negocio
- Política de cookies
- Nota de que los precios pueden cambiar

---

## 🤝 Tecnologías

- **HTML5** + **CSS3** (variables, grid, flexbox, animaciones)
- **JavaScript** vanilla (sin frameworks ni dependencias)
- **Google Fonts** (Poppins + Playfair Display)
- **Unsplash** (imágenes placeholder)
- **Responsive** hasta 320px

---

## 📄 Licencia

MIT - Usa este proyecto como quieras para tu negocio.

---

Creado con 💎 por LUXDEAL
