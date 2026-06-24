/**
 * CONFIGURACION DE AFILIADOS - LUXDEAL
 * =====================================
 * 
 * INSTRUCCIONES:
 * 1. Registrate en cada programa (ver GUIA-AFILIADOS.md)
 * 2. Reemplaza los valores de ejemplo con tus datos reales
 * 3. Incluye este archivo ANTES de script.js en tu HTML
 * 
 * Una vez configurado, todos los links "Verificar en..." y "Comprar en..."
 * se generaran automaticamente con tus enlaces de afiliado.
 */

const AFFILIATE_CONFIG = {

    // ===== AMAZON ASSOCIATES =====
    // Registro: https://affiliate-program.amazon.com/
    // Para España: https://afiliados.amazon.es/
    amazon: {
        enabled: true,
        tag: 'luxdeal-21',  // REEMPLAZA con tu tag real (ej: tutienda-21)
        domain: 'www.amazon.es',
        // Comisiones: Moda 4-6%, Electronica 1-3%, Belleza 3-6%, Hogar 3-5%
        generateLink: function(productUrl) {
            if (productUrl.includes('amazon')) {
                return productUrl + (productUrl.includes('?') ? '&' : '?') + 'tag=' + this.tag;
            }
            return `https://${this.domain}/s?k=${encodeURIComponent(productUrl)}&tag=${this.tag}`;
        }
    },

    // ===== AWIN (Zalando, El Corte Ingles, ASOS, Nike, Dyson) =====
    // Registro: https://www.awin.com/es/afiliados
    awin: {
        enabled: true,
        affiliateId: '000000',  // REEMPLAZA con tu Awin Affiliate ID real
        // IDs de programas (los obtienes al ser aceptado en cada programa)
        programs: {
            zalando:      { mid: '11825', commission: '5-8%' },
            elcorteingles:{ mid: '23243', commission: '2-6%' },
            asos:         { mid: '19908', commission: '5-6%' },
            nike:         { mid: '34498', commission: '5-11%' },
            dyson:        { mid: '25291', commission: '4-8%' },
            bodeboca:     { mid: '00000', commission: '8-12%' },
            mediamarkt:   { mid: '00000', commission: '2-4%' },
            pccomponentes:{ mid: '00000', commission: '2-6%' },
        },
        generateLink: function(programKey, destinationUrl) {
            const program = this.programs[programKey];
            if (!program) return destinationUrl;
            return `https://www.awin1.com/cread.php?awinmid=${program.mid}&awinaffid=${this.affiliateId}&ued=${encodeURIComponent(destinationUrl)}`;
        }
    },

    // ===== SEPHORA =====
    // Registro: https://r.creators.sephora.com/beauty/affiliates
    sephora: {
        enabled: true,
        affiliateId: 'XXXXXX',  // REEMPLAZA con tu ID de Sephora affiliates
        domain: 'www.sephora.es',
        commission: '5-10%',
        generateLink: function(productPath) {
            return `https://${this.domain}${productPath}?affiliate_id=${this.affiliateId}`;
        }
    },

    // ===== CJ AFFILIATE (Nike, Samsung, Adidas) =====
    // Registro: https://www.cj.com/
    cj: {
        enabled: false,  // Habilitar cuando te registres
        websiteId: '000000',  // Tu CJ website ID
        programs: {
            nike:    { cid: '000000' },
            samsung: { cid: '000000' },
            adidas:  { cid: '000000' },
        }
    },

    // ===== RAKUTEN (Sephora alternativo, Lacoste, Mango) =====
    // Registro: https://rakutenadvertising.com/
    rakuten: {
        enabled: false,  // Habilitar cuando te registres
        mid: '000000',
    }
};

// ===== PRODUCTOS CON LINKS DE AFILIADO =====
// Estos son los links reales que debes actualizar con URLs de producto
const PRODUCT_AFFILIATE_LINKS = {
    '1': { // Nike Air Max 90
        store: 'amazon',
        url: 'https://www.amazon.es/dp/B0BX4S79FL',  // ASIN real de Nike Air Max
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.amazon.generateLink(this.url);
        }
    },
    '2': { // Jamon Iberico 5J
        store: 'elcorteingles',
        url: 'https://www.elcorteingles.es/alimentacion/A12345678-jamon-iberico-5j/',
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.awin.generateLink('elcorteingles', this.url);
        }
    },
    '3': { // Sony WH-1000XM5
        store: 'amazon',
        url: 'https://www.amazon.es/dp/B0BX3L1PTK',  // ASIN real
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.amazon.generateLink(this.url);
        }
    },
    '4': { // Dior Sauvage
        store: 'sephora',
        url: '/perfumes/dior-sauvage-eau-de-toilette/',
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.sephora.generateLink(this.url);
        }
    },
    '5': { // Ralph Lauren Polo
        store: 'zalando',
        url: 'https://www.zalando.es/ralph-lauren-polo-classic-fit.html',
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.awin.generateLink('zalando', this.url);
        }
    },
    '6': { // Vega Sicilia
        store: 'bodeboca',
        url: 'https://www.bodeboca.com/vino/vega-sicilia-valbuena',
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.awin.generateLink('bodeboca', this.url);
        }
    },
    '7': { // Dyson V15
        store: 'amazon',
        url: 'https://www.amazon.es/dp/B09MHGMKX4',  // ASIN real
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.amazon.generateLink(this.url);
        }
    },
    '8': { // AirPods Pro 2
        store: 'amazon',
        url: 'https://www.amazon.es/dp/B0CHWRXH8B',  // ASIN real
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.amazon.generateLink(this.url);
        }
    },
    '9': { // La Mer
        store: 'elcorteingles',
        url: 'https://www.elcorteingles.es/belleza/A87654321-la-mer-moisturizing-cream/',
        affiliateUrl: function() {
            return AFFILIATE_CONFIG.awin.generateLink('elcorteingles', this.url);
        }
    }
};

/**
 * Funcion para generar el link de afiliado de un producto
 * Usa esto en lugar de href="#" en los botones "Verificar en..."
 */
function getAffiliateLink(productId) {
    const product = PRODUCT_AFFILIATE_LINKS[productId];
    if (product) {
        return product.affiliateUrl();
    }
    return '#';
}

/**
 * Inicializar todos los links de afiliado al cargar la pagina
 * Reemplaza los href="#" de los .verify-link con links reales
 */
function initAffiliateLinks() {
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = card.dataset.product;
        const verifyLink = card.querySelector('.verify-link');
        if (verifyLink && productId && PRODUCT_AFFILIATE_LINKS[productId]) {
            verifyLink.href = getAffiliateLink(productId);
        }
    });
    console.log('[LUXDEAL] Affiliate links initialized for', Object.keys(PRODUCT_AFFILIATE_LINKS).length, 'products');
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAffiliateLinks);
} else {
    initAffiliateLinks();
}
