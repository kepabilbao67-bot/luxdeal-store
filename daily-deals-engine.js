/**
 * LUXDEAL - Daily Deals Engine
 * =============================
 * Sistema automatizado que:
 * 1. Rota ofertas destacadas cada dia
 * 2. Selecciona "Oferta del Dia" basada en mejor descuento
 * 3. Genera ofertas frescas automaticamente
 * 4. Se puede ejecutar con cron job o manualmente
 * 
 * USO:
 * - En servidor: node daily-deals-engine.js
 * - Con cron: 0 8 * * * node /path/to/daily-deals-engine.js
 * - En frontend: se auto-ejecuta al cargar la pagina
 */

// ===== BASE DE DATOS DE OFERTAS =====
const DEALS_DATABASE = [
    {
        id: 'd001',
        name: 'Nike Air Max 90 Premium',
        category: 'ropa',
        price: 82.99,
        originalPrice: 149.99,
        discount: 45,
        store: 'Amazon',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
        affiliateUrl: 'https://www.amazon.es/dp/B0BX4S79FL?tag=luxdeal-21',
        description: 'Zapatillas Nike Air Max 90 Premium con unidad Air visible. Comodidad excepcional.',
        rating: 4.8,
        reviews: 2847,
        stock: 'high',
        addedDate: '2026-06-20',
        expiresDate: '2026-07-01',
        featured: false
    },
    {
        id: 'd002',
        name: 'Jamon Iberico 5J Cinco Jotas',
        category: 'alimentacion',
        price: 189.00,
        originalPrice: 289.00,
        discount: 35,
        store: 'El Corte Ingles',
        image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&h=400&fit=crop',
        affiliateUrl: '#',
        description: 'Jamon iberico de bellota 100% raza iberica. Curado 36 meses en bodega natural.',
        rating: 4.9,
        reviews: 1203,
        stock: 'medium',
        addedDate: '2026-06-18',
        expiresDate: '2026-06-30',
        featured: false
    },
    {
        id: 'd003',
        name: 'Sony WH-1000XM5',
        category: 'electronica',
        price: 228.00,
        originalPrice: 379.99,
        discount: 40,
        store: 'Amazon',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        affiliateUrl: 'https://www.amazon.es/dp/B0BX3L1PTK?tag=luxdeal-21',
        description: 'Auriculares inalambricos con cancelacion de ruido lider. 30h bateria.',
        rating: 4.9,
        reviews: 5621,
        stock: 'high',
        addedDate: '2026-06-22',
        expiresDate: '2026-07-05',
        featured: false
    },
    {
        id: 'd004',
        name: 'Dior Sauvage EDT 100ml',
        category: 'belleza',
        price: 72.50,
        originalPrice: 103.50,
        discount: 30,
        store: 'Sephora',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
        affiliateUrl: '#',
        description: 'Eau de Toilette con bergamota de Calabria y Ambroxan. El mas vendido.',
        rating: 4.8,
        reviews: 8432,
        stock: 'high',
        addedDate: '2026-06-21',
        expiresDate: '2026-07-10',
        featured: false
    },
    {
        id: 'd005',
        name: 'Ralph Lauren Polo Classic Fit',
        category: 'ropa',
        price: 54.99,
        originalPrice: 119.99,
        discount: 55,
        store: 'Zalando',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
        affiliateUrl: '#',
        description: 'Polo algodon pique premium. Logo bordado. Multiples colores disponibles.',
        rating: 4.5,
        reviews: 967,
        stock: 'medium',
        addedDate: '2026-06-23',
        expiresDate: '2026-07-02',
        featured: false
    },
    {
        id: 'd006',
        name: 'Vega Sicilia Valbuena 5',
        category: 'alimentacion',
        price: 95.00,
        originalPrice: 158.00,
        discount: 40,
        store: 'Bodeboca',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
        affiliateUrl: '#',
        description: 'Vino tinto D.O. Ribera del Duero. 95 puntos Parker. Crianza 5 anos.',
        rating: 4.9,
        reviews: 342,
        stock: 'low',
        addedDate: '2026-06-24',
        expiresDate: '2026-06-28',
        featured: false
    },
    {
        id: 'd007',
        name: 'Dyson V15 Detect Absolute',
        category: 'hogar',
        price: 489.00,
        originalPrice: 699.00,
        discount: 30,
        store: 'Amazon',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
        affiliateUrl: 'https://www.amazon.es/dp/B09MHGMKX4?tag=luxdeal-21',
        description: 'Aspiradora sin cable con laser. Sensor piezoelectrico. 60 min autonomia.',
        rating: 4.7,
        reviews: 3104,
        stock: 'medium',
        addedDate: '2026-06-19',
        expiresDate: '2026-07-08',
        featured: false
    },
    {
        id: 'd008',
        name: 'Apple AirPods Pro 2 USB-C',
        category: 'electronica',
        price: 189.99,
        originalPrice: 249.99,
        discount: 25,
        store: 'Amazon',
        image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=400&fit=crop',
        affiliateUrl: 'https://www.amazon.es/dp/B0CHWRXH8B?tag=luxdeal-21',
        description: 'Cancelacion activa de ruido 2x. Audio espacial. 30h con estuche.',
        rating: 4.8,
        reviews: 12847,
        stock: 'high',
        addedDate: '2026-06-22',
        expiresDate: '2026-07-15',
        featured: false
    },
    {
        id: 'd009',
        name: 'La Mer Moisturizing Cream 60ml',
        category: 'belleza',
        price: 264.00,
        originalPrice: 330.00,
        discount: 20,
        store: 'El Corte Ingles',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop',
        affiliateUrl: '#',
        description: 'La legendaria Creme de la Mer. Hidratacion profunda con Miracle Broth.',
        rating: 4.9,
        reviews: 1856,
        stock: 'low',
        addedDate: '2026-06-24',
        expiresDate: '2026-07-01',
        featured: false
    },
    {
        id: 'd010',
        name: 'Samsung Galaxy S24 Ultra 256GB',
        category: 'electronica',
        price: 899.00,
        originalPrice: 1399.00,
        discount: 36,
        store: 'Amazon',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
        affiliateUrl: 'https://www.amazon.es/dp/B0CS5XXXXX?tag=luxdeal-21',
        description: 'El smartphone mas potente de Samsung. S Pen integrado. IA Galaxy AI.',
        rating: 4.7,
        reviews: 6234,
        stock: 'medium',
        addedDate: '2026-06-24',
        expiresDate: '2026-07-05',
        featured: false
    },
    {
        id: 'd011',
        name: 'Adidas Ultraboost Light',
        category: 'ropa',
        price: 95.00,
        originalPrice: 180.00,
        discount: 47,
        store: 'Zalando',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        affiliateUrl: '#',
        description: 'Las zapatillas de running mas ligeras de Adidas. Boost mejorado.',
        rating: 4.6,
        reviews: 2341,
        stock: 'high',
        addedDate: '2026-06-23',
        expiresDate: '2026-07-03',
        featured: false
    },
    {
        id: 'd012',
        name: 'Le Creuset Cocotte 26cm',
        category: 'hogar',
        price: 199.00,
        originalPrice: 349.00,
        discount: 43,
        store: 'Amazon',
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop',
        affiliateUrl: 'https://www.amazon.es/dp/B00005QFPH?tag=luxdeal-21',
        description: 'Cocotte redonda hierro fundido esmaltado. Apta horno y todas las cocinas.',
        rating: 4.9,
        reviews: 4521,
        stock: 'medium',
        addedDate: '2026-06-24',
        expiresDate: '2026-07-10',
        featured: false
    },
    {
        id: 'd013',
        name: 'Aceite Oliva Virgen Extra Premium 5L',
        category: 'alimentacion',
        price: 32.99,
        originalPrice: 54.99,
        discount: 40,
        store: 'Amazon',
        image: 'https://images.unsplash.com/photo-1474979266404-7f28fc72bc66?w=400&h=400&fit=crop',
        affiliateUrl: 'https://www.amazon.es/dp/B08XXXXX?tag=luxdeal-21',
        description: 'AOVE cosecha temprana. Arbequina Jaen. Prensado en frio primera extraccion.',
        rating: 4.8,
        reviews: 1893,
        stock: 'high',
        addedDate: '2026-06-24',
        expiresDate: '2026-07-08',
        featured: false
    },
    {
        id: 'd014',
        name: 'Bose QuietComfort Ultra',
        category: 'electronica',
        price: 279.00,
        originalPrice: 449.95,
        discount: 38,
        store: 'Amazon',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
        affiliateUrl: 'https://www.amazon.es/dp/B0CCZ1L4XX?tag=luxdeal-21',
        description: 'Auriculares premium Bose con Immersive Audio. ANC adaptativa. 24h bateria.',
        rating: 4.7,
        reviews: 3892,
        stock: 'medium',
        addedDate: '2026-06-23',
        expiresDate: '2026-07-06',
        featured: false
    },
    {
        id: 'd015',
        name: 'Tom Ford Black Orchid EDP 50ml',
        category: 'belleza',
        price: 89.00,
        originalPrice: 135.00,
        discount: 34,
        store: 'Sephora',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop',
        affiliateUrl: '#',
        description: 'Fragancia unisex intensa con orquidea negra y especias oscuras. Iconica.',
        rating: 4.7,
        reviews: 2156,
        stock: 'medium',
        addedDate: '2026-06-24',
        expiresDate: '2026-07-12',
        featured: false
    }
];

// ===== DAILY DEALS ALGORITHM =====

class DailyDealsEngine {
    constructor(dealsDB) {
        this.deals = dealsDB;
        this.today = new Date().toISOString().split('T')[0];
        this.dayOfYear = this.getDayOfYear();
    }

    getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // Selecciona la OFERTA DEL DIA (mejor descuento activo)
    getDealOfTheDay() {
        const activeDeals = this.getActiveDeals();
        // Rotate based on day of year so each day shows different deal
        const index = this.dayOfYear % activeDeals.length;
        // Sort by discount and pick rotated top deal
        const sorted = [...activeDeals].sort((a, b) => b.discount - a.discount);
        return sorted[index % sorted.length];
    }

    // Selecciona 6 ofertas del dia (rotacion diaria)
    getTodaysDeals(count = 6) {
        const activeDeals = this.getActiveDeals();
        const shuffled = this.seededShuffle([...activeDeals], this.dayOfYear);
        return shuffled.slice(0, count);
    }

    // Selecciona ofertas por categoria
    getDealsByCategory(category, count = 3) {
        const activeDeals = this.getActiveDeals().filter(d => d.category === category);
        const shuffled = this.seededShuffle([...activeDeals], this.dayOfYear);
        return shuffled.slice(0, count);
    }

    // Ofertas que expiran pronto (urgencia real)
    getExpiringDeals(days = 3) {
        const now = new Date();
        return this.getActiveDeals().filter(deal => {
            const expires = new Date(deal.expiresDate);
            const diffDays = (expires - now) / (1000 * 60 * 60 * 24);
            return diffDays > 0 && diffDays <= days;
        }).sort((a, b) => new Date(a.expiresDate) - new Date(b.expiresDate));
    }

    // Ofertas con stock bajo
    getLowStockDeals() {
        return this.getActiveDeals().filter(d => d.stock === 'low');
    }

    // Mejores ofertas (mayor descuento)
    getTopDiscounts(count = 5) {
        return this.getActiveDeals()
            .sort((a, b) => b.discount - a.discount)
            .slice(0, count);
    }

    // Solo ofertas activas (no expiradas)
    getActiveDeals() {
        const now = new Date();
        return this.deals.filter(deal => {
            const expires = new Date(deal.expiresDate);
            return expires > now;
        });
    }

    // Shuffle deterministico basado en seed (mismo resultado por dia)
    seededShuffle(array, seed) {
        let currentSeed = seed;
        const random = () => {
            currentSeed = (currentSeed * 16807) % 2147483647;
            return (currentSeed - 1) / 2147483646;
        };

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Genera HTML para la oferta del dia
    renderDealOfTheDay() {
        const deal = this.getDealOfTheDay();
        if (!deal) return '';

        return `
        <div class="deal-of-day">
            <div class="deal-of-day-badge">⚡ OFERTA DEL DIA</div>
            <div class="deal-of-day-content">
                <div class="deal-of-day-image">
                    <img src="${deal.image}" alt="${deal.name}">
                    <span class="deal-of-day-discount">-${deal.discount}%</span>
                </div>
                <div class="deal-of-day-info">
                    <span class="deal-of-day-store">${deal.store}</span>
                    <h3>${deal.name}</h3>
                    <p>${deal.description}</p>
                    <div class="deal-of-day-price">
                        <span class="current-price">$${deal.price.toFixed(2)}</span>
                        <span class="original-price">$${deal.originalPrice.toFixed(2)}</span>
                        <span class="savings">Ahorras $${(deal.originalPrice - deal.price).toFixed(2)}</span>
                    </div>
                    <div class="deal-of-day-meta">
                        <span class="stars">${'★'.repeat(Math.floor(deal.rating))} (${deal.reviews.toLocaleString()})</span>
                        <span class="deal-expires">Expira: ${new Date(deal.expiresDate).toLocaleDateString('es-ES')}</span>
                    </div>
                    <a href="${deal.affiliateUrl}" target="_blank" class="btn btn-primary">Comprar en ${deal.store} →</a>
                </div>
            </div>
        </div>`;
    }

    // Genera HTML para banner de ofertas expirando
    renderExpiringBanner() {
        const expiring = this.getExpiringDeals(2);
        if (expiring.length === 0) return '';

        return `
        <div class="expiring-banner">
            <span class="expiring-icon">⏰</span>
            <span class="expiring-text">
                <strong>${expiring.length} oferta${expiring.length > 1 ? 's' : ''} expira${expiring.length > 1 ? 'n' : ''} hoy:</strong>
                ${expiring.map(d => `${d.name} (-${d.discount}%)`).join(' | ')}
            </span>
        </div>`;
    }

    // Info para el log diario
    getDailySummary() {
        const active = this.getActiveDeals();
        const dotd = this.getDealOfTheDay();
        const expiring = this.getExpiringDeals(3);
        const lowStock = this.getLowStockDeals();

        return {
            date: this.today,
            totalActive: active.length,
            dealOfTheDay: dotd ? dotd.name : 'Ninguna',
            expiringSoon: expiring.length,
            lowStock: lowStock.length,
            categories: {
                ropa: active.filter(d => d.category === 'ropa').length,
                alimentacion: active.filter(d => d.category === 'alimentacion').length,
                electronica: active.filter(d => d.category === 'electronica').length,
                belleza: active.filter(d => d.category === 'belleza').length,
                hogar: active.filter(d => d.category === 'hogar').length,
            }
        };
    }
}

// ===== FRONTEND INITIALIZATION =====
// Se ejecuta automaticamente al cargar la pagina
const dealsEngine = new DailyDealsEngine(DEALS_DATABASE);

// Inject Deal of the Day into page
function initDailyDeals() {
    // Insert Deal of the Day before products section
    const productsSection = document.getElementById('ofertas');
    if (productsSection) {
        const dealHTML = dealsEngine.renderDealOfTheDay();
        if (dealHTML) {
            const dealContainer = document.createElement('div');
            dealContainer.innerHTML = dealHTML;
            productsSection.querySelector('.container').insertBefore(
                dealContainer.firstElementChild,
                productsSection.querySelector('.section-header').nextSibling
            );
        }
    }

    // Log daily summary to console
    const summary = dealsEngine.getDailySummary();
    console.log('[LUXDEAL Daily Deals]', summary);
}

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDailyDeals);
} else {
    initDailyDeals();
}
