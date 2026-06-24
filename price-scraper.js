/**
 * LUXDEAL - Price Scraper & Alert System
 * ========================================
 * Detecta bajadas de precio automaticamente y genera alertas.
 * 
 * FUNCIONALIDADES:
 * 1. Monitorea precios de productos en Amazon/Zalando/etc
 * 2. Detecta bajadas significativas (>15%)
 * 3. Genera alertas para Telegram/Email
 * 4. Historial de precios para mostrar graficos
 *
 * NOTA: En produccion necesitaras una API de precios o
 * un backend con puppeteer/playwright para scraping real.
 * Aqui usamos una simulacion + la API de Keepa (Amazon).
 *
 * APIS DE PRECIOS RECOMENDADAS:
 * - Keepa.com (Amazon) — desde 15€/mes
 * - PriceAPI.com — multi-tienda
 * - Rainforest API — Amazon completo
 */

const SCRAPER_CONFIG = {
    // Keepa API (Amazon price tracking)
    keepa: {
        apiKey: 'TU_KEEPA_API_KEY',  // https://keepa.com/#!api
        domain: 1,  // 1=.com, 3=.co.uk, 4=.de, 8=.es
    },

    // Alertas
    alerts: {
        minDiscount: 15,       // % minimo para alertar
        checkInterval: 6,      // horas entre checks
        channels: ['telegram', 'email']
    },

    // Productos a monitorear (ASINs de Amazon)
    watchlist: [
        { asin: 'B0BX4S79FL', name: 'Nike Air Max 90', targetPrice: 80 },
        { asin: 'B0BX3L1PTK', name: 'Sony WH-1000XM5', targetPrice: 220 },
        { asin: 'B0CHWRXH8B', name: 'AirPods Pro 2', targetPrice: 180 },
        { asin: 'B09MHGMKX4', name: 'Dyson V15', targetPrice: 470 },
        { asin: 'B00005QFPH', name: 'Le Creuset Cocotte', targetPrice: 190 },
    ]
};


// ===== PRICE HISTORY =====
class PriceTracker {
    constructor() {
        this.history = this.load();
    }

    load() {
        try {
            return JSON.parse(localStorage.getItem('luxdeal_prices') || '{}');
        } catch(e) { return {}; }
    }

    save() {
        try {
            localStorage.setItem('luxdeal_prices', JSON.stringify(this.history));
        } catch(e) {}
    }

    addPrice(productId, price, store) {
        if (!this.history[productId]) {
            this.history[productId] = { prices: [], alerts: [] };
        }
        
        const lastPrice = this.history[productId].prices.slice(-1)[0];
        
        // Only add if price changed
        if (!lastPrice || lastPrice.price !== price) {
            this.history[productId].prices.push({
                price,
                store,
                date: new Date().toISOString()
            });

            // Check for significant drop
            if (lastPrice && price < lastPrice.price * 0.85) {
                const drop = ((lastPrice.price - price) / lastPrice.price * 100).toFixed(1);
                this.history[productId].alerts.push({
                    type: 'price_drop',
                    from: lastPrice.price,
                    to: price,
                    drop: drop + '%',
                    date: new Date().toISOString()
                });
                return { alert: true, drop, from: lastPrice.price, to: price };
            }
        }
        
        this.save();
        return { alert: false };
    }

    getHistory(productId) {
        return this.history[productId]?.prices || [];
    }

    getLowestPrice(productId) {
        const prices = this.getHistory(productId);
        if (prices.length === 0) return null;
        return Math.min(...prices.map(p => p.price));
    }

    getHighestPrice(productId) {
        const prices = this.getHistory(productId);
        if (prices.length === 0) return null;
        return Math.max(...prices.map(p => p.price));
    }

    // Generate mini price chart (ASCII for console, or data for frontend)
    getMiniChart(productId, width = 20) {
        const prices = this.getHistory(productId).slice(-width);
        if (prices.length < 2) return 'No hay suficientes datos';

        const values = prices.map(p => p.price);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const chars = '▁▂▃▄▅▆▇█';
        return values.map(v => {
            const normalized = (v - min) / range;
            const index = Math.round(normalized * (chars.length - 1));
            return chars[index];
        }).join('');
    }
}

// ===== KEEPA API INTEGRATION =====
async function checkAmazonPrice(asin) {
    if (SCRAPER_CONFIG.keepa.apiKey === 'TU_KEEPA_API_KEY') {
        console.log('[Scraper] Keepa API key not configured');
        return null;
    }

    const url = `https://api.keepa.com/product?key=${SCRAPER_CONFIG.keepa.apiKey}&domain=${SCRAPER_CONFIG.keepa.domain}&asin=${asin}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.products && data.products[0]) {
            const product = data.products[0];
            // Keepa prices are in cents, divide by 100
            const currentPrice = product.stats?.current?.[0] / 100;
            const lowestPrice = product.stats?.min?.[0] / 100;
            const highestPrice = product.stats?.max?.[0] / 100;
            
            return {
                asin,
                currentPrice,
                lowestPrice,
                highestPrice,
                title: product.title,
                isAvailable: product.availabilityAmazon === 0
            };
        }
    } catch (error) {
        console.error('[Scraper] Keepa API error:', error.message);
    }
    return null;
}

// ===== AUTO-CHECK WATCHLIST =====
async function checkWatchlist() {
    const tracker = new PriceTracker();
    const alerts = [];

    for (const item of SCRAPER_CONFIG.watchlist) {
        const data = await checkAmazonPrice(item.asin);
        if (data && data.currentPrice) {
            const result = tracker.addPrice(item.asin, data.currentPrice, 'Amazon');
            
            if (result.alert) {
                alerts.push({
                    ...item,
                    ...result,
                    currentPrice: data.currentPrice
                });
            }

            // Target price alert
            if (data.currentPrice <= item.targetPrice) {
                alerts.push({
                    ...item,
                    type: 'target_reached',
                    currentPrice: data.currentPrice,
                    message: `${item.name} ha bajado a $${data.currentPrice} (tu objetivo: $${item.targetPrice})`
                });
            }
        }
    }

    if (alerts.length > 0) {
        console.log('[Scraper] Price alerts:', alerts);
        // Here you would send to Telegram/Email
    }

    return alerts;
}

// ===== INIT =====
const priceTracker = new PriceTracker();

// Track prices from DOM on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.product-card').forEach(card => {
        const id = card.dataset.product;
        const priceEl = card.querySelector('.current-price');
        const source = card.querySelector('.product-source');
        if (priceEl && id) {
            const price = parseFloat(priceEl.textContent.replace('$', ''));
            const store = source?.textContent || 'Unknown';
            priceTracker.addPrice(id, price, store);
        }
    });
    priceTracker.save();
});
