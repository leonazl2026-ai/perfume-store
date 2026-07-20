// State Management: Cart ထဲက ပစ္စည်းများကို သိမ်းဆည်းရန် Array
let cart = JSON.parse(localStorage.getItem('fragrance_cart')) || [];

// DOM Elements များကို ဆွဲယူခြင်း
const cartIcon = document.querySelector('.cart-icon');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartBadge = document.querySelector('.cart-icon .badge');
const cartCountHeader = document.getElementById('cartCountHeader');

// App စတင်ချိန်တွင် Cart ကို Render လုပ်ပါ
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    setupEventListeners();
});

function setupEventListeners() {
    // Cart Drawer ဖွင့်/ပိတ် Events
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // "Add to Cart" Button များအားလုံးအတွက် Click Event တပ်ဆင်ခြင်း
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach((btn) => {
        btn.addEventListener('click', handleAddToCart);
    });
}

// Open / Close Cart Functions
function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
}

// Product ကို Cart ထဲ ထည့်သွင်းခြင်း
function handleAddToCart(e) {
    const card = e.target.closest('.product-card');
    
    // Product Data ဆွဲယူခြင်း
    const title = card.querySelector('.product-title').innerText;
    const priceText = card.querySelector('.current-price').innerText;
    const price = parseInt(priceText.replace(/[^0-9]/g, '')); // Number သီးသန့်ပြောင်းခြင်း
    const imageSrc = card.querySelector('img').src;

    // အရင်ရှိပြီးသား ပစ္စည်းဖြစ်ပါက Quantity ကိုပဲ တိုးမည်
    const existingIndex = cart.findIndex(item => item.title === title);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            title: title,
            price: price,
            image: imageSrc,
            quantity: 1
        });
    }

    saveAndRender();
    openCart(); // ပစ္စည်းထည့်ပြီးလျှင် Cart Drawer ကို တန်းဖွင့်ပြမည်
}

// Quantity တိုး/လျော့ သို့မဟုတ် ပစ္စည်းဖျက်ခြင်း
function changeQuantity(title, change) {
    const index = cart.findIndex(item => item.title === title);
    if (index > -1) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1); // Quantity 0 ဖြစ်သွားလျှင် ဖျက်မည်
        }
    }
    saveAndRender();
}

function removeFromCart(title) {
    cart = cart.filter(item => item.title !== title);
    saveAndRender();
}

// LocalStorage ထဲ သိမ်းဆည်းပြီး UI ကို အမြဲတမ်း Update လုပ်ပေးခြင်း
function saveAndRender() {
    localStorage.setItem('fragrance_cart', JSON.stringify(cart));
    updateCartUI();
}

// UI Rendering Engine
function updateCartUI() {
    // ၁။ Cart Badge & Header Count ကို Update လုပ်ခြင်း
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.innerText = totalItems;
    cartCountHeader.innerText = totalItems;

    // ၂။ Subtotal တွက်ချက်ခြင်း
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartSubtotal.innerText = totalAmount.toLocaleString() + ' MMK';

    // ၃။ Cart Items List ကို Render လုပ်ခြင်း
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is currently empty.</p>';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()} MMK</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeQuantity('${item.title}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity('${item.title}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.title}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}