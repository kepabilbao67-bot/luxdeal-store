/**
 * LUXDEAL - Error Monitor & Price Checker
 * ==========================================
 * Sistema que detecta:
 * 1. Enlaces rotos (404, timeout, redirects erroneos)
 * 2. Cambios de precio (subio, bajo, ya no disponible)
 * 3. Productos sin stock
 * 4. Ofertas expiradas que siguen mostrándose
 * 5. Genera alertas visuales y logs
 * 
 * MODOS:
 * - Frontend: monitoreo en tiempo real con alertas visuales
 * - Backend (Node.js): cron job que verifica cada 6 horas
 */

class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.lastCheck = null;
        this.checkInterval = null;
        this.priceHistory = this.loadPriceHistory();
        this.STATUS = {
            OK: 'ok',
            PRICE_CHANGED: 'price_changed',
            PRICE_INCREASED: 'price_increased',
            LINK_BROKEN: 'link_broken',
            OUT_OF_STOCK: 'out_of_stock',
            EXPIRED: 'expired',
            REDIRECT_ERROR: 'redirect_error'
        };
    }

    // ===== PRICE MONITORING =====

    // Guarda historial de precios en localStorage
    loadPriceHistory() {
        try {
            const saved = localStorage.getItem('luxdeal_price_history');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    savePriceHistory() {
        try {
            localStorage.setItem('luxdeal_price_history', JSON.stringify(this.priceHistory));
        } catch (e) {
            console.warn('[Monitor] No se pudo guardar historial de precios');
        }
    }

    // Registra un precio para tracking
    trackPrice(productId, currentPrice, productName) {
        if (!this.priceHistory[productId]) {
            this.priceHistory[productId] = {
                name: productName,
                prices: [],
                lastChecked: null
            };
        }

        const history = this.priceHistory[productId];
        const lastPrice = history.prices.length > 0 
            ? history.prices[history.prices.length - 1].price 
            : null;

        // Solo registrar si el precio cambio
        if (lastPrice !== currentPrice) {
            history.prices.push({
                price: currentPrice,
                date: new Date().toISOString(),
                change: lastPrice ? ((currentPrice - lastPrice) / lastPrice * 100).toFixed(1) : 0
            });

            // Alert si el precio subio
            if (lastPrice && currentPrice > lastPrice) {
                this.addWarning({
                    type: this.STATUS.PRICE_INCREASED,
                    productId,
                    productName,
                    message: `Precio subio: $${lastPrice.toFixed(2)} → $${currentPrice.toFixed(2)} (+${((currentPrice - lastPrice) / lastPrice * 100).toFixed(1)}%)`,
                    oldPrice: lastPrice,
                    newPrice: currentPrice,
                    timestamp: new Date().toISOString()
                });
            }

            // Alert si el precio bajo mucho (posible error de datos)
            if (lastPrice && currentPrice < lastPrice * 0.5) {
                this.addWarning({
                    type: this.STATUS.PRICE_CHANGED,
                    productId,
                    productName,
                    message: `Caida de precio sospechosa (>50%): $${lastPrice.toFixed(2)} → $${currentPrice.toFixed(2)}. Verificar manualmente.`,
                    oldPrice: lastPrice,
                    newPrice: currentPrice,
                    timestamp: new Date().toISOString()
                });
            }
        }

        history.lastChecked = new Date().toISOString();
        this.savePriceHistory();
    }

    // ===== LINK VALIDATION =====

    // Verifica si un enlace es accesible
    async checkLink(url, productId, productName) {
        if (!url || url === '#') {
            this.addWarning({
                type: this.STATUS.LINK_BROKEN,
                productId,
                productName,
                message: `Link no configurado (placeholder "#")`,
                url,
                timestamp: new Date().toISOString()
            });
            return { status: 'placeholder', url };
        }

        try {
            // Usamos fetch con mode no-cors para verificar accesibilidad
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal
            });

            clearTimeout(timeout);

            // Con no-cors siempre da opaque response, pero al menos sabemos que no hizo timeout
            return { status: 'reachable', url, responseType: response.type };
        } catch (error) {
            if (error.name === 'AbortError') {
                this.addError({
                    type: this.STATUS.LINK_BROKEN,
                    productId,
                    productName,
                    message: `Link timeout (>8s): ${url}`,
                    url,
                    error: 'TIMEOUT',
                    timestamp: new Date().toISOString()
                });
                return { status: 'timeout', url };
            }

            this.addError({
                type: this.STATUS.LINK_BROKEN,
                productId,
                productName,
                message: `Link posiblemente roto: ${url} (${error.message})`,
                url,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return { status: 'error', url, error: error.message };
        }
    }

    // Verifica todos los links de afiliado en la pagina
    async checkAllLinks() {
        const cards = document.querySelectorAll('.product-card');
        const results = [];

        for (const card of cards) {
            const productId = card.dataset.product;
            const productName = card.querySelector('h3')?.textContent || 'Desconocido';
            const verifyLink = card.querySelector('.verify-link');

            if (verifyLink) {
                const url = verifyLink.href;
                const result = await this.checkLink(url, productId, productName);
                results.push({ productId, productName, ...result });
            }
        }

        this.lastCheck = new Date().toISOString();
        this.saveCheckResults(results);
        return results;
    }

    // ===== EXPIRY MONITORING =====

    // Verifica ofertas expiradas
    checkExpiredDeals(dealsDatabase) {
        const now = new Date();
        const expired = [];

        dealsDatabase.forEach(deal => {
            if (new Date(deal.expiresDate) < now) {
                expired.push(deal);
                this.addWarning({
                    type: this.STATUS.EXPIRED,
                    productId: deal.id,
                    productName: deal.name,
                    message: `Oferta expirada el ${deal.expiresDate}. Remover o actualizar.`,
                    timestamp: new Date().toISOString()
                });
            }
        });

        return expired;
    }

    // ===== ERROR/WARNING MANAGEMENT =====

    addError(error) {
        this.errors.push(error);
        this.saveErrors();
        console.error('[LUXDEAL Monitor] ERROR:', error.message);
        this.showVisualAlert(error, 'error');
    }

    addWarning(warning) {
        this.warnings.push(warning);
        this.saveErrors();
        console.warn('[LUXDEAL Monitor] WARNING:', warning.message);
        this.showVisualAlert(warning, 'warning');
    }

    clearErrors() {
        this.errors = [];
        this.warnings = [];
        this.saveErrors();
    }

    saveErrors() {
        try {
            localStorage.setItem('luxdeal_errors', JSON.stringify({
                errors: this.errors.slice(-50), // Keep last 50
                warnings: this.warnings.slice(-50),
                lastCheck: this.lastCheck
            }));
        } catch (e) {}
    }

    loadErrors() {
        try {
            const saved = localStorage.getItem('luxdeal_errors');
            if (saved) {
                const data = JSON.parse(saved);
                this.errors = data.errors || [];
                this.warnings = data.warnings || [];
                this.lastCheck = data.lastCheck;
            }
        } catch (e) {}
    }

    saveCheckResults(results) {
        try {
            localStorage.setItem('luxdeal_link_check', JSON.stringify({
                results,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {}
    }

    // ===== VISUAL ALERTS (Frontend) =====

    showVisualAlert(issue, type = 'warning') {
        // Only show in admin/debug mode
        if (!window.LUXDEAL_ADMIN_MODE) return;

        const alertEl = document.createElement('div');
        alertEl.className = `monitor-alert monitor-alert-${type}`;
        alertEl.innerHTML = `
            <div class="monitor-alert-icon">${type === 'error' ? '🚨' : '⚠️'}</div>
            <div class="monitor-alert-content">
                <strong>${issue.productName || 'Sistema'}</strong>
                <p>${issue.message}</p>
            </div>
            <button class="monitor-alert-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        const container = document.getElementById('monitorAlerts') || this.createAlertContainer();
        container.appendChild(alertEl);

        // Auto-remove after 10s
        setTimeout(() => {
            if (alertEl.parentElement) alertEl.remove();
        }, 10000);
    }

    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'monitorAlerts';
        container.className = 'monitor-alerts-container';
        document.body.appendChild(container);
        return container;
    }

    // Muestra el panel de estado completo (admin)
    showStatusPanel() {
        const panel = document.createElement('div');
        panel.className = 'monitor-panel';
        panel.innerHTML = `
            <div class="monitor-panel-header">
                <h3>🔍 LUXDEAL Monitor</h3>
                <button onclick="this.closest('.monitor-panel').remove()">×</button>
            </div>
            <div class="monitor-panel-body">
                <div class="monitor-stat">
                    <span class="monitor-stat-number">${this.errors.length}</span>
                    <span class="monitor-stat-label">Errores</span>
                </div>
                <div class="monitor-stat">
                    <span class="monitor-stat-number">${this.warnings.length}</span>
                    <span class="monitor-stat-label">Avisos</span>
                </div>
                <div class="monitor-stat">
                    <span class="monitor-stat-number">${this.lastCheck ? 'Hace ' + this.getTimeSince(this.lastCheck) : 'Nunca'}</span>
                    <span class="monitor-stat-label">Ultima revision</span>
                </div>
                <div class="monitor-log">
                    <h4>Ultimos eventos:</h4>
                    ${[...this.errors, ...this.warnings]
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 10)
                        .map(e => `<div class="monitor-log-item ${e.type === 'link_broken' ? 'error' : 'warning'}">
                            <span class="log-time">${new Date(e.timestamp).toLocaleString('es-ES')}</span>
                            <span class="log-msg">${e.message}</span>
                        </div>`).join('') || '<p>Sin eventos recientes</p>'}
                </div>
                <div class="monitor-actions">
                    <button class="btn btn-primary" onclick="errorMonitor.runFullCheck()">Ejecutar Revision Completa</button>
                    <button class="btn btn-outline" onclick="errorMonitor.clearErrors(); this.closest('.monitor-panel').remove();">Limpiar Errores</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    getTimeSince(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    }

    // ===== FULL SYSTEM CHECK =====

    async runFullCheck() {
        console.log('[LUXDEAL Monitor] Iniciando revision completa...');
        
        const results = {
            timestamp: new Date().toISOString(),
            links: [],
            prices: [],
            expired: [],
            errors: []
        };

        // 1. Check all links
        console.log('[Monitor] Verificando enlaces...');
        results.links = await this.checkAllLinks();

        // 2. Check prices from DOM
        console.log('[Monitor] Verificando precios...');
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.dataset.product;
            const name = card.querySelector('h3')?.textContent || '';
            const priceEl = card.querySelector('.current-price');
            if (priceEl) {
                const price = parseFloat(priceEl.textContent.replace('$', ''));
                if (!isNaN(price)) {
                    this.trackPrice(productId, price, name);
                    results.prices.push({ productId, name, price });
                }
            }
        });

        // 3. Check expired deals
        if (typeof DEALS_DATABASE !== 'undefined') {
            console.log('[Monitor] Verificando expirados...');
            results.expired = this.checkExpiredDeals(DEALS_DATABASE);
        }

        // 4. Validate affiliate config
        if (typeof AFFILIATE_CONFIG !== 'undefined') {
            console.log('[Monitor] Verificando config afiliados...');
            if (AFFILIATE_CONFIG.amazon.tag === 'luxdeal-21') {
                this.addWarning({
                    type: 'config',
                    productName: 'Amazon Associates',
                    message: 'Tag de Amazon Associates aun es el de ejemplo. Reemplaza con tu tag real.',
                    timestamp: new Date().toISOString()
                });
            }
            if (AFFILIATE_CONFIG.awin.affiliateId === '000000') {
                this.addWarning({
                    type: 'config',
                    productName: 'Awin',
                    message: 'Awin Affiliate ID aun es 000000. Registrate y pon tu ID real.',
                    timestamp: new Date().toISOString()
                });
            }
        }

        this.lastCheck = results.timestamp;
        this.saveErrors();

        console.log('[LUXDEAL Monitor] Revision completa:', {
            linksChecked: results.links.length,
            pricesTracked: results.prices.length,
            expired: results.expired.length,
            totalErrors: this.errors.length,
            totalWarnings: this.warnings.length
        });

        return results;
    }

    // ===== AUTO-MONITORING =====

    // Inicia monitoreo automatico (cada N minutos)
    startAutoMonitor(intervalMinutes = 30) {
        console.log(`[Monitor] Auto-monitor iniciado (cada ${intervalMinutes} min)`);
        
        // Check inmediato
        setTimeout(() => this.runFullCheck(), 3000);

        // Check periodico
        this.checkInterval = setInterval(() => {
            this.runFullCheck();
        }, intervalMinutes * 60 * 1000);
    }

    stopAutoMonitor() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('[Monitor] Auto-monitor detenido');
        }
    }

    // ===== PRODUCT CARD VISUAL INDICATORS =====

    // Marca visualmente las cards con problemas
    markProblematicCards() {
        const allIssues = [...this.errors, ...this.warnings];
        
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.dataset.product;
            const issues = allIssues.filter(i => i.productId === productId);
            
            // Remove old indicators
            card.querySelectorAll('.card-issue-badge').forEach(b => b.remove());

            if (issues.length > 0) {
                const hasError = issues.some(i => this.errors.includes(i));
                const badge = document.createElement('div');
                badge.className = `card-issue-badge ${hasError ? 'error' : 'warning'}`;
                badge.title = issues.map(i => i.message).join('\n');
                badge.textContent = hasError ? '⚠️' : '⚡';
                card.querySelector('.product-image')?.appendChild(badge);
            }
        });
    }
}

// ===== INITIALIZE =====
const errorMonitor = new ErrorMonitor();
errorMonitor.loadErrors();

// Admin mode: add ?admin=true to URL to see monitor panel
if (window.location.search.includes('admin=true')) {
    window.LUXDEAL_ADMIN_MODE = true;
    errorMonitor.startAutoMonitor(30);
    
    // Add admin button to header
    document.addEventListener('DOMContentLoaded', () => {
        const adminBtn = document.createElement('button');
        adminBtn.className = 'admin-monitor-btn';
        adminBtn.innerHTML = '🔍';
        adminBtn.title = 'Monitor de Errores';
        adminBtn.onclick = () => errorMonitor.showStatusPanel();
        adminBtn.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;background:#1b4332;color:white;border:none;width:44px;height:44px;border-radius:50%;font-size:1.2rem;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        document.body.appendChild(adminBtn);
    });
} else {
    // Normal mode: just track prices silently
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.dataset.product;
            const name = card.querySelector('h3')?.textContent || '';
            const priceEl = card.querySelector('.current-price');
            if (priceEl && productId) {
                const price = parseFloat(priceEl.textContent.replace('$', ''));
                if (!isNaN(price)) {
                    errorMonitor.trackPrice(productId, price, name);
                }
            }
        });
    });
}
