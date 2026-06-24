// ===== PROMO BANNER & COUNTDOWN =====
const promoBanner = document.getElementById('promoBanner');
const promoClose = document.getElementById('promoClose');

const countdownEnd = new Date().getTime() + (6 * 60 * 60 * 1000);

function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownEnd - now;
    if (distance <= 0) return;

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

promoClose.addEventListener('click', () => {
    document.body.classList.add('promo-closed');
});

// ===== CART FUNCTIONALITY =====
let cart = [];
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');


cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.querySelectorAll('.quick-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        updateCart();
        showAddedFeedback(btn);
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `<div class="cart-empty"><p>Tu lista esta vacia</p><a href="#ofertas" class="btn btn-outline" onclick="closeCart()">Ver Ofertas</a></div>`;
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</span>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">&#10005;</button>
            </div>
        `).join('');
        cartFooter.style.display = 'flex';
        cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function showAddedFeedback(btn) {
    const originalText = btn.textContent;
    btn.textContent = '✓ Agregado';
    btn.style.background = '#25d366';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1500);
}


// ===== CHECKOUT - Redirect to store links =====
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) return;
    showNotification('Redirigiendo a las tiendas oficiales para completar tu compra...');
    // In production, this would redirect to each store's affiliate link
    setTimeout(() => {
        showNotification('En produccion, te redirigimos a Amazon/Zalando/etc para pagar directo.');
    }, 2000);
});

// ===== FILTER TABS =====
const filterTabs = document.querySelectorAll('.filter-tab');
const productCards = document.querySelectorAll('.product-card');

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        productCards.forEach(card => {
            if (filter === 'todos' || card.dataset.category === filter) {
                card.style.display = '';
                card.style.animation = 'fadeInUp 0.4s ease both';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ===== CATEGORY CARDS CLICK =====
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        // Scroll to products
        document.getElementById('ofertas').scrollIntoView({ behavior: 'smooth' });
        // Activate filter
        setTimeout(() => {
            filterTabs.forEach(t => t.classList.remove('active'));
            const targetTab = document.querySelector(`.filter-tab[data-filter="${category}"]`);
            if (targetTab) {
                targetTab.classList.add('active');
                productCards.forEach(c => {
                    if (c.dataset.category === category) {
                        c.style.display = '';
                        c.style.animation = 'fadeInUp 0.4s ease both';
                    } else {
                        c.style.display = 'none';
                    }
                });
            }
        }, 600);
    });
});


// ===== SEARCH FUNCTIONALITY =====
const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchCloseBtn = document.getElementById('searchClose');

const productData = {
    '1': {
        name: 'Nike Air Max 90 Premium',
        category: 'Ropa de Marca',
        price: 82.99,
        originalPrice: 149.99,
        discount: '-45%',
        reviews: '2,847 resenas',
        source: 'Amazon',
        description: 'Zapatillas Nike Air Max 90 Premium con unidad Air visible y diseno retro. Comodidad excepcional para el dia a dia. Disponible en multiples tallas. Envio con Amazon Prime.',
        images: [
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop'
        ]
    },
    '2': {
        name: 'Jamon Iberico 5J Cinco Jotas',
        category: 'Alimentacion Delicatessen',
        price: 189.00,
        originalPrice: 289.00,
        discount: '-35%',
        reviews: '1,203 resenas',
        source: 'El Corte Ingles',
        description: 'Jamon iberico de bellota 100% raza iberica Cinco Jotas. Curado durante 36 meses en bodega natural. Pata entera con jamonero y cuchillo incluido. Certificado de origen.',
        images: [
            'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=500&fit=crop'
        ]
    },
    '3': {
        name: 'Sony WH-1000XM5 Auriculares',
        category: 'Electronica Premium',
        price: 228.00,
        originalPrice: 379.99,
        discount: '-40%',
        reviews: '5,621 resenas',
        source: 'Amazon',
        description: 'Auriculares inalambricos con cancelacion de ruido lider en la industria. 30 horas de bateria, audio Hi-Res, multiconexion y diseno ultraligero. Incluye estuche premium.',
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
        ]
    },
    '4': {
        name: 'Dior Sauvage EDT 100ml',
        category: 'Belleza & Lujo',
        price: 72.50,
        originalPrice: 103.50,
        discount: '-30%',
        reviews: '8,432 resenas',
        source: 'Sephora',
        description: 'Eau de Toilette Dior Sauvage 100ml. Fragancia masculina fresca y radical con notas de bergamota de Calabria y Ambroxan. El perfume masculino mas vendido del mundo.',
        images: [
            'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&h=500&fit=crop'
        ]
    },
    '5': {
        name: 'Ralph Lauren Polo Classic Fit',
        category: 'Ropa de Marca',
        price: 54.99,
        originalPrice: 119.99,
        discount: '-55%',
        reviews: '967 resenas',
        source: 'Zalando',
        description: 'Polo Ralph Lauren Classic Fit en algodon pique de primera calidad. Logo de pony bordado. Cuello acanalado con cierre de 2 botones. Disponible en multiples colores.',
        images: [
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop'
        ]
    },
    '6': {
        name: 'Vega Sicilia Valbuena 5 Aniversario',
        category: 'Alimentacion Delicatessen',
        price: 95.00,
        originalPrice: 158.00,
        discount: '-40%',
        reviews: '342 resenas',
        source: 'Bodeboca',
        description: 'Vino tinto D.O. Ribera del Duero. Crianza de 5 anos en barricas de roble frances y americano. 95 puntos Parker. Ideal para ocasiones especiales o coleccionismo.',
        images: [
            'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=500&h=500&fit=crop'
        ]
    },
    '7': {
        name: 'Dyson V15 Detect Absolute',
        category: 'Hogar Premium',
        price: 489.00,
        originalPrice: 699.00,
        discount: '-30%',
        reviews: '3,104 resenas',
        source: 'Amazon',
        description: 'Aspiradora sin cable con laser para detectar polvo microscopico. Sensor piezoelectrico que mide particulas. 60 min autonomia. Pantalla LCD con datos en tiempo real.',
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1527515637462-cee1cc7189e0?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=500&fit=crop'
        ]
    },
    '8': {
        name: 'Apple AirPods Pro 2 USB-C',
        category: 'Electronica Premium',
        price: 189.99,
        originalPrice: 249.99,
        discount: '-25%',
        reviews: '12,847 resenas',
        source: 'Amazon',
        description: 'AirPods Pro de segunda generacion con USB-C. Cancelacion activa de ruido 2x, audio adaptativo, audio espacial personalizado. Hasta 6h de bateria (30h con estuche).',
        images: [
            'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop'
        ]
    },
    '9': {
        name: 'La Mer Moisturizing Cream 60ml',
        category: 'Belleza & Lujo',
        price: 264.00,
        originalPrice: 330.00,
        discount: '-20%',
        reviews: '1,856 resenas',
        source: 'El Corte Ingles',
        description: 'La legendaria Creme de la Mer con Miracle Broth. Hidratacion profunda que transforma la piel. Reduce lineas finas y renueva la luminosidad. Tarro de lujo de 60ml.',
        images: [
            'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&h=500&fit=crop'
        ]
    }
};

const searchableProducts = Object.entries(productData).map(([id, p]) => ({ id, ...p }));

function openSearch() {
    searchOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 200);
}

function closeSearch() {
    searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
    searchInput.value = '';
    showSearchPlaceholder();
}

function showSearchPlaceholder() {
    searchResults.innerHTML = `
        <div class="search-placeholder">
            <p>Busca por marca, producto o categoria</p>
            <div class="search-suggestions">
                <span class="search-tag" data-query="nike">Nike</span>
                <span class="search-tag" data-query="sony">Sony</span>
                <span class="search-tag" data-query="jamon">Jamon</span>
                <span class="search-tag" data-query="dior">Dior</span>
                <span class="search-tag" data-query="dyson">Dyson</span>
                <span class="search-tag" data-query="apple">Apple</span>
            </div>
        </div>
    `;
    bindSearchTags();
}

function searchProducts(query) {
    if (!query.trim()) { showSearchPlaceholder(); return; }
    const q = query.toLowerCase();
    const results = searchableProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.source.toLowerCase().includes(q)
    );

    if (results.length === 0) {
        searchResults.innerHTML = `<div class="search-no-results"><p>No se encontraron ofertas para "<strong>${query}</strong>"</p></div>`;
        return;
    }

    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" data-product-id="${product.id}">
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <span>${product.source} · ${product.discount}</span>
            </div>
            <span class="search-result-price">$${product.price.toFixed(2)}</span>
        </div>
    `).join('');

    searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            closeSearch();
            setTimeout(() => openProductModal(item.dataset.productId), 300);
        });
    });
}

function bindSearchTags() {
    document.querySelectorAll('.search-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.dataset.query;
            searchProducts(tag.dataset.query);
        });
    });
}

searchBtn.addEventListener('click', openSearch);
searchCloseBtn.addEventListener('click', closeSearch);
searchInput.addEventListener('input', (e) => searchProducts(e.target.value));
searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
bindSearchTags();

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchOverlay.classList.contains('active') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape') {
        if (searchOverlay.classList.contains('active')) closeSearch();
        if (document.getElementById('productModal') && document.getElementById('productModal').classList.contains('active')) closeProductModal();
        if (cartSidebar.classList.contains('active')) closeCart();
    }
});


// ===== PRODUCT MODAL =====
let modalQuantity = 1;

function openProductModal(productId) {
    const product = productData[productId];
    if (!product) return;

    // Create modal if not exists
    let modal = document.getElementById('productModal');
    if (!modal) {
        const modalHTML = `
        <div class="product-modal-overlay" id="productModalOverlay"></div>
        <div class="product-modal" id="productModal">
            <button class="modal-close" id="modalClose">&times;</button>
            <div class="modal-content">
                <div class="modal-gallery">
                    <div class="modal-main-image"><img src="" alt="" id="modalMainImage"></div>
                    <div class="modal-thumbnails" id="modalThumbnails"></div>
                </div>
                <div class="modal-info">
                    <span class="modal-category" id="modalCategory"></span>
                    <h2 id="modalTitle"></h2>
                    <div class="modal-rating"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="reviews" id="modalReviews"></span></div>
                    <div class="modal-price"><span class="current-price" id="modalPrice"></span><span class="original-price" id="modalOriginalPrice"></span><span class="modal-discount-badge" id="modalDiscount"></span></div>
                    <p class="modal-description" id="modalDescription"></p>
                    <div class="modal-features">
                        <div class="modal-feature"><span>&#10003;</span> <span id="modalSource">Vendido por Amazon</span></div>
                        <div class="modal-feature"><span>&#10003;</span> Envio directo por la tienda</div>
                        <div class="modal-feature"><span>&#10003;</span> Garantia y devoluciones oficiales</div>
                        <div class="modal-feature"><span>&#10003;</span> Precio verificado hoy</div>
                    </div>
                    <div class="modal-quantity"><label>Cantidad:</label><div class="quantity-selector"><button class="qty-btn" id="qtyMinus">-</button><span id="qtyValue">1</span><button class="qty-btn" id="qtyPlus">+</button></div></div>
                    <div class="modal-actions">
                        <a href="#" class="btn btn-primary btn-full" id="modalBuyNow" target="_blank">Comprar en la Tienda Oficial</a>
                        <button class="btn btn-outline btn-full" id="modalAddToCart">Agregar a Mi Lista</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('productModal');

        document.getElementById('modalClose').addEventListener('click', closeProductModal);
        document.getElementById('productModalOverlay').addEventListener('click', closeProductModal);
        document.getElementById('qtyMinus').addEventListener('click', () => {
            if (modalQuantity > 1) { modalQuantity--; document.getElementById('qtyValue').textContent = modalQuantity; }
        });
        document.getElementById('qtyPlus').addEventListener('click', () => {
            if (modalQuantity < 10) { modalQuantity++; document.getElementById('qtyValue').textContent = modalQuantity; }
        });
        document.getElementById('modalAddToCart').addEventListener('click', () => {
            const name = document.getElementById('modalTitle').textContent;
            const price = parseFloat(document.getElementById('modalPrice').textContent.replace('$', ''));
            const existing = cart.find(item => item.name === name);
            if (existing) existing.quantity += modalQuantity;
            else cart.push({ name, price, quantity: modalQuantity });
            updateCart();
            closeProductModal();
            showNotification(`"${name}" agregado a tu lista`);
        });
    }

    modalQuantity = 1;
    document.getElementById('qtyValue').textContent = '1';
    document.getElementById('modalMainImage').src = product.images[0];
    document.getElementById('modalCategory').textContent = product.category + ' · ' + product.source;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalReviews').textContent = product.reviews;
    document.getElementById('modalPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalSource').textContent = `Vendido y enviado por ${product.source}`;
    document.getElementById('modalBuyNow').textContent = `Comprar en ${product.source}`;

    if (product.originalPrice) {
        document.getElementById('modalOriginalPrice').textContent = `$${product.originalPrice.toFixed(2)}`;
        document.getElementById('modalOriginalPrice').style.display = 'inline';
    } else {
        document.getElementById('modalOriginalPrice').style.display = 'none';
    }

    if (product.discount) {
        document.getElementById('modalDiscount').textContent = product.discount;
        document.getElementById('modalDiscount').style.display = 'inline';
    } else {
        document.getElementById('modalDiscount').style.display = 'none';
    }

    document.getElementById('modalThumbnails').innerHTML = product.images.map((img, i) =>
        `<img src="${img}" alt="Vista ${i+1}" class="${i === 0 ? 'active' : ''}" onclick="changeModalImage('${img}', this)">`
    ).join('');

    modal.classList.add('active');
    document.getElementById('productModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('productModalOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function changeModalImage(src, thumb) {
    document.getElementById('modalMainImage').src = src;
    document.querySelectorAll('.modal-thumbnails img').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

// Product card click opens modal
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.closest('.quick-add') || e.target.closest('.verify-link')) return;
        openProductModal(card.dataset.product);
    });
});


// ===== DISCOUNT POPUP (exit intent) =====
const discountPopup = document.getElementById('discountPopup');
const popupClose = document.getElementById('popupClose');
const popupDismiss = document.getElementById('popupDismiss');
const popupForm = document.getElementById('popupForm');

let popupShown = false;

// Show popup on exit intent (mouse leaves viewport top)
document.addEventListener('mouseout', (e) => {
    if (e.clientY <= 0 && !popupShown) {
        popupShown = true;
        setTimeout(() => discountPopup.classList.add('active'), 500);
    }
});

// Also show after 30 seconds if not already shown
setTimeout(() => {
    if (!popupShown) {
        popupShown = true;
        discountPopup.classList.add('active');
    }
}, 30000);

function closePopup() {
    discountPopup.classList.remove('active');
}

popupClose.addEventListener('click', closePopup);
popupDismiss.addEventListener('click', closePopup);

popupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    closePopup();
    showNotification('Suscrito! Recibiras las ofertas VIP en tu correo cada dia.');
});

// ===== MOBILE MENU =====
const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// ===== SCROLL ANIMATIONS =====
function animateOnScroll() {
    const elements = document.querySelectorAll('.product-card, .feature-card, .testimonial-card, .about-content, .about-images, .category-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    elements.forEach(el => { el.classList.add('animate-on-scroll'); observer.observe(el); });
}
animateOnScroll();

// ===== HEADER SCROLL EFFECT =====
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    header.style.boxShadow = window.pageYOffset > 50 ? '0 2px 20px rgba(0,0,0,0.1)' : 'none';
});

// ===== FORMS =====
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.querySelector('input').value = '';
    showNotification('Suscrito! Recibiras ofertas premium diarias en tu correo.');
});

document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('Mensaje enviado! Te responderemos pronto.');
    e.target.reset();
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const headerHeight = document.querySelector('.header').offsetHeight;
            window.scrollTo({ top: target.offsetTop - headerHeight - 20, behavior: 'smooth' });
        }
    });
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">&times;</button>`;
    document.body.appendChild(notification);

    Object.assign(notification.style, {
        position: 'fixed', bottom: '24px', left: '24px', background: '#1b4332', color: 'white',
        padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: '9999', boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        fontSize: '0.9rem', maxWidth: '400px', animation: 'fadeInUp 0.4s ease'
    });
    notification.querySelector('button').style.cssText = 'background:none;border:none;color:white;font-size:1.3rem;cursor:pointer;padding:0;line-height:1;';

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const stats = document.querySelectorAll('.hero-stats .stat strong');
    stats.forEach(stat => {
        const text = stat.textContent;
        if (text.includes('500+')) animateNumber(stat, 0, 500, '+');
        else if (text.includes('-70%')) { /* keep static */ }
    });
}
function animateNumber(el, start, end, suffix) {
    let current = start;
    const increment = end / 30;
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) { current = end; clearInterval(timer); }
        el.textContent = Math.floor(current) + suffix;
    }, 50);
}
setTimeout(animateCounters, 1000);


// ===== COOKIE CONSENT =====
const cookieConsent = document.getElementById('cookieConsent');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');

if (!localStorage.getItem('luxdeal_cookies')) {
    setTimeout(() => cookieConsent.classList.add('active'), 2000);
}

cookieAccept.addEventListener('click', () => {
    localStorage.setItem('luxdeal_cookies', 'all');
    cookieConsent.classList.remove('active');
});

cookieReject.addEventListener('click', () => {
    localStorage.setItem('luxdeal_cookies', 'essential');
    cookieConsent.classList.remove('active');
});

// ===== PWA INSTALL PROMPT =====
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install banner after 15 seconds
    if (!localStorage.getItem('luxdeal_pwa_dismissed')) {
        setTimeout(showPWABanner, 15000);
    }
});

function showPWABanner() {
    if (!deferredPrompt) return;

    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.id = 'pwaInstallBanner';
    banner.innerHTML = `
        <span class="pwa-icon">💎</span>
        <div class="pwa-text">
            <h4>Instalar LUXDEAL</h4>
            <p>Accede rapido desde tu pantalla de inicio</p>
        </div>
        <div class="pwa-actions">
            <button class="pwa-install-btn" id="pwaInstallBtn">Instalar</button>
            <button class="pwa-dismiss-btn" id="pwaDismissBtn">&times;</button>
        </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add('active'), 100);

    document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                showNotification('LUXDEAL instalada! Buscala en tu pantalla de inicio.');
            }
            deferredPrompt = null;
        }
        banner.classList.remove('active');
        setTimeout(() => banner.remove(), 500);
    });

    document.getElementById('pwaDismissBtn').addEventListener('click', () => {
        localStorage.setItem('luxdeal_pwa_dismissed', 'true');
        banner.classList.remove('active');
        setTimeout(() => banner.remove(), 500);
    });
}

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

        // Toggle clicked
        if (!wasActive) item.classList.add('active');
    });
});
