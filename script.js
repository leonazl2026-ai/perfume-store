// ==========================================
// CONFIGURATION
// ==========================================
const MY_PHONE_NUMBER = "959123456789"; // 959 လိုင်းဖြင့် စတင်သော သင့်ဖုန်းနံပါတ် (Viber / WhatsApp အတွက်)
const TELEGRAM_USERNAME = "Ngapyinn";  // @ မပါဘဲ ထည့်ပါ

// ==========================================
// STATE MANAGEMENT & DOM ELEMENTS
// ==========================================
let cart = JSON.parse(localStorage.getItem('fragrance_cart')) || [];

const cartIcon = document.querySelector('.cart-icon');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartBadge = document.querySelector('.cart-icon .badge');
const cartCountHeader = document.getElementById('cartCountHeader');

// Checkout Modal Elements
const checkoutBtn = document.querySelector('.checkout-btn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const checkoutForm = document.getElementById('checkoutForm');

// ==========================================
// INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    setupEventListeners();
});

function setupEventListeners() {
    // Cart Drawer ဖွင့်/ပိတ် Events
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }

    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // "Add to Cart" Button များအားလုံးအတွက် Click Event တပ်ဆင်ခြင်း
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach((btn) => {
        btn.addEventListener('click', handleAddToCart);
    });

    // Checkout Events
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("သင့် Cart ထဲတွင် ပစ္စည်းမရှိသေးပါ။");
                return;
            }
            closeCart();
            openCheckoutModal();
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeCheckoutModal);
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckoutModal);
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);
}

// ==========================================
// CART DRAWER FUNCTIONS
// ==========================================
function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
}

function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
}

function handleAddToCart(e) {
    const card = e.target.closest('.product-card');
    
    const title = card.querySelector('.product-title').innerText;
    const priceText = card.querySelector('.current-price').innerText;
    const price = parseInt(priceText.replace(/[^0-9]/g, '')); 
    const imageSrc = card.querySelector('img').src;

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
    openCart(); 
}

function changeQuantity(title, change) {
    const index = cart.findIndex(item => item.title === title);
    if (index > -1) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1); 
        }
    }
    saveAndRender();
}

function removeFromCart(title) {
    cart = cart.filter(item => item.title !== title);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('fragrance_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) cartBadge.innerText = totalItems;
    if (cartCountHeader) cartCountHeader.innerText = totalItems;

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartSubtotal) cartSubtotal.innerText = totalAmount.toLocaleString() + ' MMK';

    if (!cartItemsContainer) return;

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

// ==========================================
// CHECKOUT & ORDER SENDING FUNCTIONS
// ==========================================
function openCheckoutModal() {
    if (checkoutModal) checkoutModal.classList.add('active');
    if (checkoutOverlay) checkoutOverlay.classList.add('active');
}

function closeCheckoutModal() {
    if (checkoutModal) checkoutModal.classList.remove('active');
    if (checkoutOverlay) checkoutOverlay.classList.remove('active');
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;
    const channel = document.getElementById('orderChannel').value;

    let orderText = `🛒 *NEW PERFUME ORDER*\n`;
    orderText += `---------------------------\n`;
    orderText += `👤 *Customer:* ${name}\n`;
    orderText += `📞 *Phone:* ${phone}\n`;
    orderText += `🏠 *Address:* ${address}\n`;
    orderText += `---------------------------\n`;
    orderText += `🛍️ *Order Items:*\n`;

    cart.forEach((item, index) => {
        orderText += `${index + 1}. ${item.title} x ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} MMK\n`;
    });

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderText += `---------------------------\n`;
    orderText += `💰 *Total Amount:* ${totalAmount.toLocaleString()} MMK\n`;

    const encodedText = encodeURIComponent(orderText);

    if (channel === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?phone=${MY_PHONE_NUMBER}&text=${encodedText}`, '_blank');
    } else if (channel === 'telegram') {
        // Telegram Share URL ကို သုံးထားသဖြင့် စာသားအဆင်သင့် ပါသွားပါမည်
        window.open(`https://t.me/share/url?url=&text=${encodedText}`, '_blank');
    } else if (channel === 'viber') {
        window.open(`viber://chat?number=+${MY_PHONE_NUMBER}`, '_blank');
    }

    cart = [];
    saveAndRender();
    closeCheckoutModal();
}
