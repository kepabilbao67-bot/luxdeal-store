/**
 * LUXDEAL - Analytics & Tracking
 * ================================
 * Integra:
 * 1. Google Analytics 4 (GA4)
 * 2. Tracking de eventos de afiliado (clicks, conversiones)
 * 3. Tracking del chatbot (interacciones)
 * 4. Heatmap basico (scroll depth, clicks)
 * 5. UTM tracking para campanas
 *
 * CONFIGURACION:
 * Reemplaza 'G-XXXXXXXXXX' con tu ID real de GA4
 * Para obtenerlo: https://analytics.google.com → Admin → Data Streams
 */

const ANALYTICS_CONFIG = {
    // Google Analytics 4
    ga4Id: 'G-XXXXXXXXXX',  // ← REEMPLAZA con tu GA4 Measurement ID

    // Eventos custom para tracking
    events: {
        PRODUCT_VIEW: 'view_item',
        PRODUCT_CLICK: 'select_item',
        ADD_TO_CART: 'add_to_cart',
        AFFILIATE_CLICK: 'affiliate_click',
        SEARCH: 'search',
        FILTER: 'filter_category',
        CHATBOT_OPEN: 'chatbot_open',
        CHATBOT_MESSAGE: 'chatbot_message',
        NEWSLETTER_SIGNUP: 'newsletter_signup',
        POPUP_SHOWN: 'popup_shown',
        POPUP_SUBMIT: 'popup_submit',
        WHATSAPP_CLICK: 'whatsapp_click',
        SCROLL_DEPTH: 'scroll_depth'
    },

    // Debug mode (console.log de todos los eventos)
    debug: window.location.search.includes('debug=true')
};

// ===== GA4 INITIALIZATION =====
(function() {
    // Inject GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.ga4Id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', ANALYTICS_CONFIG.ga4Id, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        // Enhanced measurement
        cookie_flags: 'SameSite=None;Secure',
        // Custom dimensions
        custom_map: {
            'dimension1': 'affiliate_source',
            'dimension2': 'product_category',
            'dimension3': 'deal_discount'
        }
    });
})();

// ===== EVENT TRACKING =====
class LuxDealAnalytics {
    constructor() {
        this.scrollMilestones = [25, 50, 75, 100];
        this.scrollTracked = new Set();
        this.sessionStart = Date.now();
        this.interactions = 0;
        this.utm = this.parseUTM();

        this.init();
    }

    // Parse UTM parameters from URL
    parseUTM() {
        const params = new URLSearchParams(window.location.search);
        return {
            source: params.get('utm_source') || 'direct',
            medium: params.get('utm_medium') || 'none',
            campaign: params.get('utm_campaign') || '',
            content: params.get('utm_content') || '',
            term: params.get('utm_term') || ''
        };
    }

    // Send event to GA4
    track(eventName, params = {}) {
        this.interactions++;

        const enrichedParams = {
            ...params,
            utm_source: this.utm.source,
            utm_medium: this.utm.medium,
            utm_campaign: this.utm.campaign,
            session_duration: Math.floor((Date.now() - this.sessionStart) / 1000),
            interaction_count: this.interactions
        };

        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, enrichedParams);
        }

        if (ANALYTICS_CONFIG.debug) {
            console.log('[Analytics]', eventName, enrichedParams);
        }
    }

    // ===== SPECIFIC TRACKERS =====

    trackProductView(productId, productName, category, price) {
        this.track(ANALYTICS_CONFIG.events.PRODUCT_VIEW, {
            item_id: productId,
            item_name: productName,
            item_category: category,
            price: price,
            currency: 'EUR'
        });
    }

    trackAffiliateClick(productId, productName, store, price, discount) {
        this.track(ANALYTICS_CONFIG.events.AFFILIATE_CLICK, {
            item_id: productId,
            item_name: productName,
            affiliation: store,
            price: price,
            discount: discount,
            currency: 'EUR'
        });
    }

    trackAddToCart(productName, price, quantity) {
        this.track(ANALYTICS_CONFIG.events.ADD_TO_CART, {
            item_name: productName,
            price: price,
            quantity: quantity,
            currency: 'EUR',
            value: price * quantity
        });
    }

    trackSearch(query, resultsCount) {
        this.track(ANALYTICS_CONFIG.events.SEARCH, {
            search_term: query,
            results_count: resultsCount
        });
    }

    trackFilter(category) {
        this.track(ANALYTICS_CONFIG.events.FILTER, {
            item_category: category
        });
    }

    trackChatbot(action, message) {
        this.track(ANALYTICS_CONFIG.events.CHATBOT_MESSAGE, {
            chatbot_action: action,
            chatbot_message: message ? message.substring(0, 100) : ''
        });
    }

    trackNewsletter(email) {
        this.track(ANALYTICS_CONFIG.events.NEWSLETTER_SIGNUP, {
            method: 'email',
            // Don't send actual email to analytics for privacy
            signup_location: 'newsletter_form'
        });
    }

    trackWhatsApp() {
        this.track(ANALYTICS_CONFIG.events.WHATSAPP_CLICK, {
            method: 'whatsapp',
            link_url: 'wa.me'
        });
    }

    // ===== AUTOMATIC TRACKERS =====

    init() {
        this.trackScrollDepth();
        this.trackAffiliateClicks();
        this.trackProductClicks();
        this.trackTimeOnPage();
        this.trackWhatsAppClicks();

        if (ANALYTICS_CONFIG.debug) {
            console.log('[Analytics] Initialized with UTM:', this.utm);
        }
    }

    trackScrollDepth() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollPercent = Math.round(
                        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                    );

                    this.scrollMilestones.forEach(milestone => {
                        if (scrollPercent >= milestone && !this.scrollTracked.has(milestone)) {
                            this.scrollTracked.add(milestone);
                            this.track(ANALYTICS_CONFIG.events.SCROLL_DEPTH, {
                                percent_scrolled: milestone
                            });
                        }
                    });

                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    trackAffiliateClicks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.verify-link, #modalBuyNow');
            if (link) {
                const card = link.closest('.product-card');
                if (card) {
                    const name = card.querySelector('h3')?.textContent || '';
                    const source = card.querySelector('.product-source')?.textContent || '';
                    const price = card.querySelector('.current-price')?.textContent || '';
                    const discount = card.querySelector('.product-badge')?.textContent || '';

                    this.trackAffiliateClick(
                        card.dataset.product,
                        name,
                        source,
                        parseFloat(price.replace('$', '')),
                        discount
                    );
                }
            }
        });
    }

    trackProductClicks() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card && !e.target.closest('.quick-add, .verify-link')) {
                const name = card.querySelector('h3')?.textContent || '';
                const category = card.querySelector('.product-category')?.textContent || '';
                const price = card.querySelector('.current-price')?.textContent || '';

                this.trackProductView(
                    card.dataset.product,
                    name,
                    category,
                    parseFloat(price.replace('$', ''))
                );
            }
        });
    }

    trackTimeOnPage() {
        // Track when user leaves
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.floor((Date.now() - this.sessionStart) / 1000);
            this.track('time_on_page', {
                duration_seconds: timeOnPage,
                interactions: this.interactions
            });
        });
    }

    trackWhatsAppClicks() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.whatsapp-float, .btn-whatsapp')) {
                this.trackWhatsApp();
            }
        });
    }
}

// ===== MAILCHIMP / EMAIL INTEGRATION =====
/**
 * Para integrar Mailchimp:
 * 1. Crea cuenta en mailchimp.com
 * 2. Crea una "Audience" (lista)
 * 3. Ve a Audience → Signup forms → Embedded forms
 * 4. Copia el action URL del formulario
 * 5. Reemplaza MAILCHIMP_URL abajo con tu URL
 *
 * Para ConvertKit:
 * 1. Crea cuenta en convertkit.com
 * 2. Crea un Form
 * 3. Usa el form ID en CONVERTKIT_FORM_ID
 */

const EMAIL_CONFIG = {
    provider: 'mailchimp',  // 'mailchimp' o 'convertkit'

    // Mailchimp
    mailchimp: {
        // REEMPLAZA con tu action URL de Mailchimp:
        actionUrl: 'https://tudominio.us21.list-manage.com/subscribe/post?u=XXXXXXX&id=XXXXXXX',
        // Lo encuentras en: Audience → Signup forms → Embedded forms → busca el action=""
    },

    // ConvertKit (alternativa)
    convertkit: {
        formId: '0000000',  // Tu form ID de ConvertKit
        apiUrl: 'https://api.convertkit.com/v3/forms/'
    }
};

// Hook into existing newsletter forms
function initEmailMarketing() {
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                subscribeEmail(email, 'newsletter');
                luxdealAnalytics.trackNewsletter(email);
            }
        });
    }

    // Popup form
    const popupForm = document.getElementById('popupForm');
    if (popupForm) {
        popupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = popupForm.querySelector('input[type="email"]').value;
            if (email) {
                subscribeEmail(email, 'popup_vip');
                luxdealAnalytics.track('popup_submit', { method: 'email' });
            }
        });
    }
}

function subscribeEmail(email, source) {
    if (EMAIL_CONFIG.provider === 'mailchimp') {
        // Submit to Mailchimp via JSONP (no CORS issues)
        const url = EMAIL_CONFIG.mailchimp.actionUrl.replace('/post?', '/post-json?') +
            `&EMAIL=${encodeURIComponent(email)}&SOURCE=${source}&c=mailchimpCallback`;

        const script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);

        // Callback
        window.mailchimpCallback = function(response) {
            if (response.result === 'success') {
                showNotification('Suscrito! Revisa tu correo para confirmar.');
            } else {
                if (response.msg.includes('already subscribed')) {
                    showNotification('Ya estas suscrito! Gracias.');
                } else {
                    showNotification('Suscrito! Gracias por unirte.');
                }
            }
            script.remove();
        };
    } else if (EMAIL_CONFIG.provider === 'convertkit') {
        // ConvertKit API
        fetch(`${EMAIL_CONFIG.convertkit.apiUrl}${EMAIL_CONFIG.convertkit.formId}/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, tags: [source] })
        }).then(() => {
            showNotification('Suscrito! Recibiras ofertas VIP.');
        }).catch(() => {
            showNotification('Suscrito! Gracias.');
        });
    }

    // Always save locally as backup
    const subscribers = JSON.parse(localStorage.getItem('luxdeal_subscribers') || '[]');
    subscribers.push({ email, source, date: new Date().toISOString() });
    localStorage.setItem('luxdeal_subscribers', JSON.stringify(subscribers));
}

// ===== INIT =====
const luxdealAnalytics = new LuxDealAnalytics();

document.addEventListener('DOMContentLoaded', () => {
    initEmailMarketing();
});
