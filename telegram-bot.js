/**
 * LUXDEAL - Telegram Bot Config
 * ===============================
 * Bot automatico que publica ofertas diarias en tu canal de Telegram.
 *
 * SETUP:
 * 1. Habla con @BotFather en Telegram
 * 2. Escribe /newbot → sigue instrucciones → obten tu TOKEN
 * 3. Crea un canal (ej: @LuxDealOfertas)
 * 4. Anade tu bot como administrador del canal
 * 5. Reemplaza los valores abajo con los tuyos
 * 6. Ejecuta: node telegram-bot.js
 *
 * AUTOMATIZACION (cron):
 * Ejecutar 2 veces al dia (9:00 y 18:00):
 * 0 9,18 * * * cd /path/to/luxdeal && node telegram-bot.js
 *
 * HOSTING GRATIS:
 * - Render.com (cron jobs gratis)
 * - Railway.app
 * - GitHub Actions (schedule)
 */

const TELEGRAM_CONFIG = {
    botToken: 'TU_BOT_TOKEN_AQUI',  // De @BotFather
    channelId: '@LuxDealOfertas',     // Tu canal
    maxDealsPerPost: 3,               // Ofertas por mensaje
    postTime: ['09:00', '18:00'],     // Horas de publicacion
    includeAffiliate: true            // Incluir links de afiliado
};

// ===== DEAL FORMATTER =====
function formatDealForTelegram(deal) {
    const savings = (deal.originalPrice - deal.price).toFixed(2);
    const emoji = {
        'ropa': '👔',
        'electronica': '📱',
        'alimentacion': '🍷',
        'belleza': '✨',
        'hogar': '🏠'
    };

    return `
${emoji[deal.category] || '🏷️'} *${deal.name}*

💰 *$${deal.price.toFixed(2)}* ~~$${deal.originalPrice.toFixed(2)}~~ (*-${deal.discount}%*)
💵 Ahorras: $${savings}
🏪 Tienda: ${deal.store}
⭐ ${deal.rating}/5 (${deal.reviews.toLocaleString()} resenas)

🔗 [Comprar en ${deal.store}](${deal.affiliateUrl || 'https://stellular-naiad-fd59fa.netlify.app/#ofertas'})
`.trim();
}

function formatDailyPost(deals) {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    let message = `🔥 *OFERTAS DEL DIA - ${today.toUpperCase()}*\n\n`;
    message += `Las mejores ofertas verificadas de hoy:\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    deals.forEach((deal, i) => {
        message += formatDealForTelegram(deal);
        if (i < deals.length - 1) message += `\n\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    });

    message += `\n\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `\n📲 Mas ofertas en: stellular-naiad-fd59fa.netlify.app`;
    message += `\n💬 Dudas: @LuxDealSoporte`;
    message += `\n\n#ofertas #descuentos #premium #luxdeal`;

    return message;
}

// ===== TELEGRAM API =====
async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CONFIG.channelId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: false,
            disable_notification: false
        })
    });

    const data = await response.json();
    if (data.ok) {
        console.log('[Telegram] Mensaje enviado correctamente');
    } else {
        console.error('[Telegram] Error:', data.description);
    }
    return data;
}

// ===== GITHUB ACTIONS WORKFLOW =====
// Puedes usar este archivo con GitHub Actions para automatizar:
const GITHUB_ACTIONS_WORKFLOW = `
# .github/workflows/telegram-deals.yml
name: Post Daily Deals to Telegram

on:
  schedule:
    - cron: '0 7,16 * * *'  # 9:00 y 18:00 hora España (UTC+2)
  workflow_dispatch:  # Para ejecutar manualmente

jobs:
  post-deals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node telegram-bot.js
        env:
          TELEGRAM_BOT_TOKEN: \${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHANNEL_ID: \${{ secrets.TELEGRAM_CHANNEL_ID }}
`;

// ===== MAIN EXECUTION =====
// Para usar con Node.js en servidor o GitHub Actions:
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    const deals = require('./daily-deals-engine.js');

    async function main() {
        // Use env vars if available (for GitHub Actions)
        if (process.env.TELEGRAM_BOT_TOKEN) {
            TELEGRAM_CONFIG.botToken = process.env.TELEGRAM_BOT_TOKEN;
        }
        if (process.env.TELEGRAM_CHANNEL_ID) {
            TELEGRAM_CONFIG.channelId = process.env.TELEGRAM_CHANNEL_ID;
        }

        // Get today's top deals
        const topDeals = DEALS_DATABASE
            .sort((a, b) => b.discount - a.discount)
            .slice(0, TELEGRAM_CONFIG.maxDealsPerPost);

        // Format and send
        const message = formatDailyPost(topDeals);
        console.log('[Telegram] Sending daily deals...');
        console.log(message);

        if (TELEGRAM_CONFIG.botToken !== 'TU_BOT_TOKEN_AQUI') {
            await sendToTelegram(message);
        } else {
            console.log('[Telegram] Bot token not configured. Set TELEGRAM_BOT_TOKEN.');
            console.log('[Telegram] Preview above shows what would be sent.');
        }
    }

    main().catch(console.error);
}

// Export for browser use (preview)
if (typeof window !== 'undefined') {
    window.telegramBot = {
        formatDealForTelegram,
        formatDailyPost,
        config: TELEGRAM_CONFIG
    };
}
