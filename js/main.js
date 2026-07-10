// ===== بارگذاری محصولات از فایل JSON =====
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('خطا در بارگذاری محصولات:', error);
        return [];
    }
}

// ===== نمایش محصولات در صفحه =====
async function displayProducts(containerId, limit = 0) {
    const products = await loadProducts();
    const container = document.getElementById(containerId);
    if (!container) return;

    let items = products;
    if (limit > 0) items = products.slice(0, limit);

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    container.innerHTML = items.map(product => {
        const inCart = cart.find(item => item.id === product.id);
        const qty = inCart ? inCart.quantity : 0;

        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" 
                     onerror="this.src='images/placeholder.jpg'">
                <div class="info">
                    <h3>${product.title}</h3>
                    <p class="author">✍️ ${product.author}</p>
                    <p class="price">${product.price.toLocaleString()} <span>تومان</span></p>
                    <div class="btn-row">
                        <button class="btn-add" onclick="addToCart(${product.id})">
                            ➕ افزودن به سبد
                        </button>
                        <button class="btn-remove ${qty > 0 ? 'show' : ''}" onclick="removeFromCart(${product.id})">
                            ➖ حذف از سبد
                        </button>
                    </div>
                    ${qty > 0 ? `<p style="font-size:13px;color:#1a237e;margin-top:8px;">تعداد در سبد: ${qty}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ===== افزودن به سبد خرید =====
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // رفرش صفحه برای نمایش تغییرات
    refreshProducts();
}

// ===== حذف از سبد خرید =====
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        if (existing.quantity > 1) {
            existing.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== productId);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // رفرش صفحه برای نمایش تغییرات
    refreshProducts();
}

// ===== رفرش محصولات =====
function refreshProducts() {
    // برای صفحه اصلی
    if (document.getElementById('featured-products')) {
        displayProducts('featured-products', 2);
    }
    // برای صفحه محصولات
    if (document.getElementById('all-products')) {
        displayProducts('all-products');
    }
    // برای سبد خرید
    if (document.getElementById('cart-items')) {
        renderCart();
    }
}

// ===== بروزرسانی تعداد سبد خرید =====
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartLinks = document.querySelectorAll('.cart-link');
    cartLinks.forEach(link => {
        link.textContent = `🛒 سبد خرید (${total})`;
    });
}

// ===== سبد خرید (صفحه cart.html) =====
let allProducts = [];

async function loadCartProducts() {
    try {
        const response = await fetch('data/products.json');
        allProducts = await response.json();
        renderCart();
    } catch (error) {
        console.error('خطا:', error);
    }
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    const emptyMsg = document.getElementById('empty-cart');

    if (cart.length === 0) {
        if (container) container.innerHTML = '';
        if (summary) summary.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (summary) summary.style.display = 'block';

    let total = 0;

    container.innerHTML = cart.map(item => {
        const product = allProducts.find(p => p.id === item.id);
        if (!product) return '';
        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.title}">
                <div class="info">
                    <h4>${product.title}</h4>
                    <p class="price">${product.price.toLocaleString()} تومان</p>
                </div>
                <div class="qty-control">
                    <button onclick="removeFromCart(${product.id})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="addToCart(${product.id})">+</button>
                </div>
                <button class="remove-btn" onclick="removeItem(${product.id})">🗑️</button>
            </div>
        `;
    }).join('');

    document.getElementById('total-price').textContent = total.toLocaleString();
}

function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    refreshProducts();
}

function goToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('❌ سبد خرید شما خالی است!');
        return;
    }
    window.location.href = 'checkout.html';
}

// ===== بارگذاری اولیه =====
document.addEventListener('DOMContentLoaded', () => {
    // صفحه اصلی
    if (document.getElementById('featured-products')) {
        displayProducts('featured-products', 2);
    }
    // صفحه محصولات
    if (document.getElementById('all-products')) {
        displayProducts('all-products');
    }
    // سبد خرید
    if (document.getElementById('cart-items')) {
        loadCartProducts();
    }
    updateCartCount();
});