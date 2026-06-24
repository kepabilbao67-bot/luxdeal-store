/**
 * LUXDEAL - Chatbot IA Inteligente
 * ==================================
 * Asistente virtual que:
 * 1. Responde preguntas sobre productos y ofertas
 * 2. Recomienda productos basado en necesidades
 * 3. Compara productos entre si
 * 4. Busca ofertas por presupuesto
 * 5. Explica como funciona el servicio
 * 6. Da info sobre envios, garantias, etc.
 * 
 * Funciona 100% en frontend (sin servidor)
 * usando NLP basico + base de conocimiento
 */

class LuxDealChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.context = {};
        this.typingDelay = 600;
        
        // Base de conocimiento
        this.knowledge = this.buildKnowledge();
        this.products = typeof DEALS_DATABASE !== 'undefined' ? DEALS_DATABASE : [];
        
        this.init();
    }

    // ===== KNOWLEDGE BASE =====
    buildKnowledge() {
        return {
            greetings: {
                patterns: ['hola', 'buenas', 'hey', 'buenos dias', 'buenas tardes', 'que tal', 'hi', 'hello'],
                responses: [
                    '¡Hola! 👋 Soy el asistente de LUXDEAL. Puedo ayudarte a encontrar las mejores ofertas. ¿Que buscas hoy?',
                    '¡Buenas! 😊 Estoy aqui para ayudarte. Puedo recomendarte productos, comparar precios o buscar ofertas por presupuesto. ¿En que te ayudo?',
                    '¡Hola! Bienvenid@ a LUXDEAL. Preguntame lo que quieras: ofertas del dia, productos por categoria, comparaciones... ¡Lo que necesites!'
                ]
            },
            howItWorks: {
                patterns: ['como funciona', 'que es esto', 'como compro', 'es seguro', 'como pago', 'es fiable', 'estafa'],
                responses: [
                    '🛡️ **LUXDEAL es un buscador de ofertas verificadas.** Asi funciona:\n\n1️⃣ Buscamos descuentos reales en Amazon, Zalando, El Corte Ingles, etc.\n2️⃣ Verificamos que cada oferta sea real\n3️⃣ Te redirigimos a la tienda oficial para comprar\n4️⃣ Tu pago, envio y garantia son directamente con la tienda\n\n✅ No guardamos datos de pago\n✅ Compras directo en Amazon/Zalando/etc\n✅ Misma garantia que comprando directo\n\n¿Algo mas que quieras saber?'
                ]
            },
            shipping: {
                patterns: ['envio', 'envios', 'cuanto tarda', 'cuando llega', 'delivery', 'entrega', 'llegar'],
                responses: [
                    '📦 **El envio depende de la tienda donde compres:**\n\n• Amazon Prime: 1-2 dias (gratis con Prime)\n• Amazon normal: 3-5 dias\n• Zalando: 2-4 dias (gratis en +25€)\n• El Corte Ingles: 2-5 dias\n• Sephora: 2-4 dias (gratis en +45€)\n\nCada tienda tiene sus propias condiciones. ¿Quieres que busque un producto especifico?'
                ]
            },
            returns: {
                patterns: ['devolucion', 'devolver', 'cambio', 'no me gusta', 'garantia', 'problema'],
                responses: [
                    '↩️ **Las devoluciones las gestiona la tienda directamente:**\n\n• Amazon: 30 dias, devolucion gratuita\n• Zalando: 100 dias para devolver\n• El Corte Ingles: 30 dias\n• Sephora: 30 dias (productos sin abrir)\n\nCompras directamente en la tienda oficial, asi que tienes todas sus garantias. ¿Necesitas ayuda con algo mas?'
                ]
            },
            budget: {
                patterns: ['presupuesto', 'barato', 'menos de', 'no mas de', 'economico', 'precio', 'cuanto cuesta', 'rango'],
                responses: ['BUDGET_SEARCH']
            },
            categories: {
                patterns: ['categorias', 'que venden', 'que tienen', 'tipos', 'secciones'],
                responses: [
                    '📋 **Nuestras categorias de ofertas:**\n\n👔 **Ropa de Marca** - Nike, Adidas, Ralph Lauren, Lacoste\n🍷 **Alimentacion Gourmet** - Jamon iberico, vinos, AOVE\n📱 **Electronica** - Apple, Sony, Samsung, Bose\n✨ **Belleza & Lujo** - Dior, La Mer, Tom Ford\n🏠 **Hogar Premium** - Dyson, Le Creuset, Nespresso\n\n¿Te interesa alguna en particular? Puedo mostrarte las mejores ofertas.'
                ]
            },
            recommend: {
                patterns: ['recomienda', 'recomendacion', 'sugieres', 'mejor', 'cual me', 'que me', 'regalo', 'para mi'],
                responses: ['RECOMMEND']
            },
            compare: {
                patterns: ['comparar', 'diferencia', 'versus', 'vs', 'mejor entre', 'cual es mejor'],
                responses: ['COMPARE']
            },
            dealOfDay: {
                patterns: ['oferta del dia', 'mejor oferta', 'deal', 'descuento hoy', 'que hay hoy', 'novedades'],
                responses: ['DEAL_OF_DAY']
            },
            thanks: {
                patterns: ['gracias', 'genial', 'perfecto', 'vale', 'ok gracias', 'muchas gracias', 'excelente'],
                responses: [
                    '😊 ¡De nada! Si necesitas algo mas, aqui estoy. ¡Feliz compra!',
                    '👍 ¡Me alegro de ayudar! Vuelve cuando quieras. ¡Que encuentres lo que buscas!',
                    '✨ ¡Un placer! Recuerda: las ofertas se actualizan cada dia, ¡no te las pierdas!'
                ]
            },
            goodbye: {
                patterns: ['adios', 'bye', 'hasta luego', 'chao', 'nos vemos', 'me voy'],
                responses: [
                    '👋 ¡Hasta luego! Vuelve mañana para nuevas ofertas. ¡Que tengas buen dia!',
                    '🙌 ¡Cuidate! Las ofertas se renuevan cada dia, ¡no te las pierdas!'
                ]
            },
            fallback: {
                responses: [
                    '🤔 No estoy seguro de entender. Puedo ayudarte con:\n\n• 🔍 **Buscar productos** (ej: "quiero auriculares")\n• 💰 **Por presupuesto** (ej: "algo por menos de 100€")\n• 📊 **Comparar** (ej: "Sony vs Bose")\n• ⭐ **Recomendaciones** (ej: "regalo para mi madre")\n• ❓ **Dudas** (envios, devoluciones, como funciona)\n\n¿Que necesitas?',
                    'Hmm, no te he pillado del todo 😅. Intenta preguntarme sobre:\n- Ofertas del dia\n- Productos por categoria (ropa, electronica, belleza...)\n- Busqueda por precio\n- Como funciona LUXDEAL\n\n¿En que te ayudo?'
                ]
            }
        };
    }

    // ===== NLP PROCESSING =====
    processMessage(userMessage) {
        const msg = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        
        // Check each intent
        for (const [intent, data] of Object.entries(this.knowledge)) {
            if (intent === 'fallback') continue;
            if (data.patterns && data.patterns.some(p => msg.includes(p))) {
                return this.generateResponse(intent, msg, userMessage);
            }
        }

        // Product-specific search
        const productMatch = this.searchProducts(msg);
        if (productMatch.length > 0) {
            return this.formatProductResults(productMatch, userMessage);
        }

        // Category search
        const categoryMatch = this.detectCategory(msg);
        if (categoryMatch) {
            return this.formatCategoryResults(categoryMatch);
        }

        // Fallback
        const fallbacks = this.knowledge.fallback.responses;
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    generateResponse(intent, normalizedMsg, originalMsg) {
        const data = this.knowledge[intent];
        
        // Special handlers
        if (data.responses[0] === 'BUDGET_SEARCH') {
            return this.handleBudgetSearch(normalizedMsg);
        }
        if (data.responses[0] === 'RECOMMEND') {
            return this.handleRecommendation(normalizedMsg, originalMsg);
        }
        if (data.responses[0] === 'COMPARE') {
            return this.handleComparison(normalizedMsg);
        }
        if (data.responses[0] === 'DEAL_OF_DAY') {
            return this.handleDealOfDay();
        }

        // Random response from list
        return data.responses[Math.floor(Math.random() * data.responses.length)];
    }

    // ===== SMART HANDLERS =====

    handleBudgetSearch(msg) {
        // Extract number from message
        const numbers = msg.match(/\d+/g);
        let maxBudget = numbers ? parseInt(numbers[numbers.length - 1]) : null;

        if (!maxBudget) {
            return '💰 ¡Claro! ¿Cual es tu presupuesto maximo? Por ejemplo: "busco algo por menos de 100 euros"';
        }

        const results = this.products.filter(p => p.price <= maxBudget)
            .sort((a, b) => b.discount - a.discount)
            .slice(0, 5);

        if (results.length === 0) {
            return `😕 No encontre ofertas por menos de $${maxBudget}. El producto mas barato que tenemos es de $${Math.min(...this.products.map(p => p.price)).toFixed(2)}. ¿Quieres que busque algo mas?`;
        }

        let response = `💰 **Ofertas por menos de $${maxBudget}:**\n\n`;
        results.forEach((p, i) => {
            response += `${i+1}. **${p.name}** - $${p.price.toFixed(2)} ~~$${p.originalPrice.toFixed(2)}~~ (-${p.discount}%) · ${p.store}\n`;
        });
        response += `\n¿Te interesa alguno? Puedo darte mas detalles o buscarlo en la pagina.`;
        return response;
    }

    handleRecommendation(msg, originalMsg) {
        // Detect gift/occasion context
        const isGift = msg.includes('regalo') || msg.includes('gift');
        const forMother = msg.includes('madre') || msg.includes('mama') || msg.includes('mujer');
        const forFather = msg.includes('padre') || msg.includes('papa') || msg.includes('hombre');
        
        let recs = [];
        let context = '';

        if (forMother || msg.includes('ella')) {
            recs = this.products.filter(p => ['belleza', 'alimentacion'].includes(p.category)).slice(0, 3);
            context = '🎁 **Recomendaciones para ella:**';
        } else if (forFather || msg.includes('el')) {
            recs = this.products.filter(p => ['electronica', 'ropa', 'alimentacion'].includes(p.category)).slice(0, 3);
            context = '🎁 **Recomendaciones para el:**';
        } else if (msg.includes('casa') || msg.includes('hogar')) {
            recs = this.products.filter(p => p.category === 'hogar').slice(0, 3);
            context = '🏠 **Mejores ofertas para el hogar:**';
        } else {
            // Top rated products
            recs = [...this.products].sort((a, b) => b.rating - a.rating).slice(0, 4);
            context = '⭐ **Nuestras mejores recomendaciones (mejor valorados):**';
        }

        if (recs.length === 0) {
            return '🤔 No encontre productos especificos para eso. ¿Puedes darme mas detalles? Por ejemplo: presupuesto, para quien es, que tipo de producto prefieres...';
        }

        let response = `${context}\n\n`;
        recs.forEach((p, i) => {
            response += `${i+1}. **${p.name}** · $${p.price.toFixed(2)} (-${p.discount}%)\n   ⭐ ${p.rating}/5 · ${p.store} · ${p.reviews.toLocaleString()} resenas\n\n`;
        });
        response += '¿Quieres mas info sobre alguno? ¿O busco por otro criterio?';
        return response;
    }

    handleComparison(msg) {
        // Try to find two products to compare
        const products = this.products;
        let found = [];

        // Simple keyword matching for comparison
        for (const p of products) {
            const nameLower = p.name.toLowerCase();
            if (msg.includes(nameLower.split(' ')[0].toLowerCase())) {
                found.push(p);
            }
        }

        // If found products from brand names
        const brands = ['sony', 'bose', 'apple', 'samsung', 'nike', 'adidas', 'dyson', 'dior', 'la mer'];
        if (found.length < 2) {
            found = [];
            for (const brand of brands) {
                if (msg.includes(brand)) {
                    const match = products.find(p => p.name.toLowerCase().includes(brand));
                    if (match) found.push(match);
                }
            }
        }

        if (found.length >= 2) {
            const [a, b] = found;
            return `📊 **Comparacion: ${a.name} vs ${b.name}**\n\n` +
                `| | ${a.name.split(' ').slice(0,3).join(' ')} | ${b.name.split(' ').slice(0,3).join(' ')} |\n` +
                `|---|---|---|\n` +
                `| 💰 Precio | $${a.price.toFixed(2)} | $${b.price.toFixed(2)} |\n` +
                `| 📉 Descuento | -${a.discount}% | -${b.discount}% |\n` +
                `| ⭐ Rating | ${a.rating}/5 | ${b.rating}/5 |\n` +
                `| 🏪 Tienda | ${a.store} | ${b.store} |\n` +
                `| 💬 Resenas | ${a.reviews.toLocaleString()} | ${b.reviews.toLocaleString()} |\n\n` +
                `**Mi recomendacion:** ${a.discount > b.discount ? a.name : b.name} tiene mejor descuento ahora (-${Math.max(a.discount, b.discount)}%), pero ${a.rating > b.rating ? a.name : b.name} tiene mejor valoracion. ¿Quieres que te de mas detalles?`;
        }

        return '📊 Para comparar, dime dos productos o marcas. Por ejemplo:\n- "Sony vs Bose"\n- "Nike vs Adidas"\n- "AirPods vs Sony auriculares"\n\n¿Que quieres comparar?';
    }

    handleDealOfDay() {
        if (typeof dealsEngine !== 'undefined') {
            const deal = dealsEngine.getDealOfTheDay();
            if (deal) {
                return `⚡ **OFERTA DEL DIA:**\n\n🏷️ **${deal.name}**\n💰 $${deal.price.toFixed(2)} ~~$${deal.originalPrice.toFixed(2)}~~ (**-${deal.discount}%**)\n🏪 ${deal.store}\n⭐ ${deal.rating}/5 (${deal.reviews.toLocaleString()} resenas)\n📅 Expira: ${new Date(deal.expiresDate).toLocaleDateString('es-ES')}\n\n${deal.description}\n\n¡No te la pierdas! ¿Quieres ver mas ofertas o tienes alguna pregunta?`;
            }
        }

        const topDeal = [...this.products].sort((a, b) => b.discount - a.discount)[0];
        if (topDeal) {
            return `⚡ **Mejor oferta disponible:**\n\n**${topDeal.name}** - $${topDeal.price.toFixed(2)} (-${topDeal.discount}%) en ${topDeal.store}\n\n¿Quieres mas detalles?`;
        }

        return 'Las ofertas del dia se actualizan cada manana. ¡Vuelve a revisar!';
    }

    // ===== PRODUCT SEARCH =====
    searchProducts(query) {
        const keywords = query.split(' ').filter(w => w.length > 2);
        return this.products.filter(p => {
            const searchText = `${p.name} ${p.category} ${p.store} ${p.description}`.toLowerCase();
            return keywords.some(kw => searchText.includes(kw));
        }).slice(0, 5);
    }

    detectCategory(msg) {
        const categoryMap = {
            'ropa': ['ropa', 'zapatillas', 'zapato', 'polo', 'camiseta', 'chaqueta', 'vestido', 'moda', 'nike', 'adidas', 'ralph'],
            'electronica': ['auricular', 'telefono', 'movil', 'portatil', 'tablet', 'airpod', 'sony', 'apple', 'samsung', 'bose', 'electronica', 'tech'],
            'alimentacion': ['comida', 'vino', 'jamon', 'aceite', 'gourmet', 'comer', 'beber', 'alimentacion', 'gastronomia'],
            'belleza': ['perfume', 'crema', 'maquillaje', 'belleza', 'skincare', 'piel', 'dior', 'la mer', 'tom ford', 'sephora'],
            'hogar': ['casa', 'hogar', 'aspiradora', 'cocina', 'dyson', 'le creuset', 'lampara', 'mueble']
        };

        for (const [cat, keywords] of Object.entries(categoryMap)) {
            if (keywords.some(kw => msg.includes(kw))) {
                return cat;
            }
        }
        return null;
    }

    formatProductResults(products, query) {
        if (products.length === 1) {
            const p = products[0];
            return `🔍 **Encontrado: ${p.name}**\n\n💰 Precio: $${p.price.toFixed(2)} ~~$${p.originalPrice.toFixed(2)}~~ (-${p.discount}%)\n🏪 Tienda: ${p.store}\n⭐ ${p.rating}/5 (${p.reviews.toLocaleString()} resenas)\n📝 ${p.description}\n\n¿Quieres comprarlo o ver mas opciones similares?`;
        }

        let response = `🔍 **Encontre ${products.length} oferta${products.length > 1 ? 's' : ''}:**\n\n`;
        products.forEach((p, i) => {
            response += `${i+1}. **${p.name}** · $${p.price.toFixed(2)} (-${p.discount}%) · ${p.store}\n`;
        });
        response += '\n¿Quieres mas detalles sobre alguno?';
        return response;
    }

    formatCategoryResults(category) {
        const categoryNames = {
            'ropa': 'Ropa de Marca',
            'electronica': 'Electronica Premium',
            'alimentacion': 'Alimentacion Gourmet',
            'belleza': 'Belleza & Lujo',
            'hogar': 'Hogar Premium'
        };

        const results = this.products
            .filter(p => p.category === category)
            .sort((a, b) => b.discount - a.discount)
            .slice(0, 4);

        if (results.length === 0) {
            return `No tengo ofertas de ${categoryNames[category]} ahora mismo, pero se actualizan cada dia. ¿Buscamos en otra categoria?`;
        }

        let response = `📂 **Ofertas en ${categoryNames[category]}:**\n\n`;
        results.forEach((p, i) => {
            response += `${i+1}. **${p.name}** · $${p.price.toFixed(2)} (-${p.discount}%) · ${p.store}\n`;
        });
        response += '\n¿Te interesa alguna? ¿O buscas algo mas especifico?';
        return response;
    }

    // ===== UI RENDERING =====
    init() {
        this.createChatWidget();
        this.bindEvents();
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'chatbotWidget';
        widget.innerHTML = `
            <button class="chatbot-trigger" id="chatbotTrigger">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span class="chatbot-badge">1</span>
            </button>
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar">🤖</div>
                        <div>
                            <h4>Asistente LUXDEAL</h4>
                            <span class="chatbot-status">En linea · Responde al instante</span>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbotClose">×</button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="chatbot-welcome">
                        <p>👋 ¡Hola! Soy tu asistente de ofertas.</p>
                        <p>Puedo ayudarte a:</p>
                        <div class="chatbot-quick-actions">
                            <button class="quick-action-btn" data-msg="¿Cual es la oferta del dia?">⚡ Oferta del dia</button>
                            <button class="quick-action-btn" data-msg="Recomiendame algo">⭐ Recomendaciones</button>
                            <button class="quick-action-btn" data-msg="Busco algo por menos de 100 euros">💰 Por presupuesto</button>
                            <button class="quick-action-btn" data-msg="¿Que categorias tienen?">📋 Categorias</button>
                            <button class="quick-action-btn" data-msg="¿Como funciona?">❓ Como funciona</button>
                        </div>
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" id="chatbotInput" placeholder="Escribe tu pregunta..." autocomplete="off">
                    <button class="chatbot-send" id="chatbotSend">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }

    bindEvents() {
        const trigger = document.getElementById('chatbotTrigger');
        const closeBtn = document.getElementById('chatbotClose');
        const input = document.getElementById('chatbotInput');
        const sendBtn = document.getElementById('chatbotSend');

        trigger.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = btn.dataset.msg;
                input.value = msg;
                this.sendMessage();
            });
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');
        const trigger = document.getElementById('chatbotTrigger');
        
        if (this.isOpen) {
            window.classList.add('active');
            trigger.classList.add('active');
            document.getElementById('chatbotInput').focus();
            // Hide badge
            const badge = trigger.querySelector('.chatbot-badge');
            if (badge) badge.style.display = 'none';
        } else {
            window.classList.remove('active');
            trigger.classList.remove('active');
        }
    }

    close() {
        this.isOpen = false;
        document.getElementById('chatbotWindow').classList.remove('active');
        document.getElementById('chatbotTrigger').classList.remove('active');
    }

    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const msg = input.value.trim();
        if (!msg) return;

        // Add user message
        this.addMessage(msg, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();

        // Process and respond
        setTimeout(() => {
            this.hideTyping();
            const response = this.processMessage(msg);
            this.addMessage(response, 'bot');
        }, this.typingDelay + Math.random() * 800);
    }

    addMessage(content, sender) {
        const messagesEl = document.getElementById('chatbotMessages');
        const msgEl = document.createElement('div');
        msgEl.className = `chatbot-message ${sender}`;
        
        // Format markdown-like syntax
        const formatted = this.formatMessage(content);
        
        msgEl.innerHTML = `
            <div class="message-content">${formatted}</div>
            <span class="message-time">${new Date().toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})}</span>
        `;
        
        messagesEl.appendChild(msgEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        this.messages.push({ content, sender, time: new Date() });
    }

    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/\n/g, '<br>')
            .replace(/\|.*\|/g, (match) => `<span class="msg-table">${match}</span>`);
    }

    showTyping() {
        const messagesEl = document.getElementById('chatbotMessages');
        const typing = document.createElement('div');
        typing.className = 'chatbot-typing';
        typing.id = 'chatbotTyping';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    hideTyping() {
        const typing = document.getElementById('chatbotTyping');
        if (typing) typing.remove();
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LuxDealChatbot());
} else {
    new LuxDealChatbot();
}
