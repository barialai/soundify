const SOUNDIFY_CONFIG = {
  // Replace these 3 values before going live.
  WHATSAPP_NUMBER: '971544685090', // country code + number, no + or spaces
  UPI_ID: 'REPLACE_WITH_UPI_ID',    // example: soundify@okaxis
  RAZORPAY_PAYMENT_LINK: 'https://rzp.io/l/REPLACE_ME'
};

const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const toast = document.querySelector('.toast');
const dateInput = document.querySelector('#dateInput');
const bookingForm = document.querySelector('#booking');
const cartDrawer = document.querySelector('.cart-drawer');
const cartBackdrop = document.querySelector('.cart-backdrop');
const cartTrigger = document.querySelector('.cart-trigger');
const cartClose = document.querySelector('.cart-close');
const stickyCart = document.querySelector('#stickyCart');
const stickyCartBtn = document.querySelector('.sticky-cart-btn');
const checkoutModal = document.querySelector('#checkoutModal');
const checkoutClose = document.querySelector('.checkout-close');
const customerForm = document.querySelector('#customerForm');
const checkoutDate = document.querySelector('#checkoutDate');
const rentalDaysInput = document.querySelector('#rentalDays');

const cart = new Map();
let qrInstance = null;

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(value);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__soundifyToast);
  window.__soundifyToast = setTimeout(() => toast.classList.remove('show'), 2200);
}

function todayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function cartCount() {
  return [...cart.values()].reduce((sum, item) => sum + item.qty, 0);
}

function baseCartTotal() {
  return [...cart.values()].reduce((sum, item) => sum + item.price * item.qty, 0);
}

function rentalDays() {
  return Math.max(1, Number(rentalDaysInput?.value || 1));
}

function payableTotal() {
  return baseCartTotal() * rentalDays();
}

function openCart() {
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartBackdrop.setAttribute('aria-hidden', 'false');
  body.classList.add('cart-open');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartBackdrop.setAttribute('aria-hidden', 'true');
  body.classList.remove('cart-open');
}

function openCheckout() {
  if (!cartCount()) {
    showToast('Add at least one item to your cart.');
    return;
  }
  closeCart();
  if (dateInput?.value && !checkoutDate.value) checkoutDate.value = dateInput.value;
  renderCheckout();
  checkoutModal.classList.add('open');
  checkoutModal.setAttribute('aria-hidden', 'false');
  body.classList.add('checkout-open');
}

function closeCheckout() {
  checkoutModal.classList.remove('open');
  checkoutModal.setAttribute('aria-hidden', 'true');
  body.classList.remove('checkout-open');
}

function addProduct(card) {
  const name = card.dataset.product;
  const price = Number(card.dataset.price);
  if (!name || !price) return;

  if (cart.has(name)) {
    cart.get(name).qty += 1;
  } else {
    cart.set(name, { name, price, qty: 1 });
  }
  renderCart();
  showToast(`${name} added to your cart.`);
}

function updateQty(name, delta) {
  const item = cart.get(name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.delete(name);
  renderCart();
  renderCheckout();
}

function removeProduct(name) {
  cart.delete(name);
  renderCart();
  renderCheckout();
}

function renderCart() {
  const count = cartCount();
  const total = baseCartTotal();
  document.querySelectorAll('.cart-count').forEach((el) => el.textContent = count);
  document.querySelector('#cartTotal').textContent = money(total);
  document.querySelector('#stickyCartCount').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  document.querySelector('#stickyCartTotal').textContent = money(total);

  const itemsEl = document.querySelector('#cartItems');
  const emptyEl = document.querySelector('#cartEmpty');
  const checkoutBtn = document.querySelector('#startCheckout');

  if (!count) {
    itemsEl.innerHTML = '';
    emptyEl.hidden = false;
    checkoutBtn.disabled = true;
    stickyCart.classList.remove('show');
    stickyCart.setAttribute('aria-hidden', 'true');
  } else {
    emptyEl.hidden = true;
    checkoutBtn.disabled = false;
    stickyCart.classList.add('show');
    stickyCart.setAttribute('aria-hidden', 'false');
    itemsEl.innerHTML = [...cart.values()].map(item => `
      <div class="cart-line">
        <div class="cart-line-copy"><strong>${item.name}</strong><small>${money(item.price)} / day</small></div>
        <div class="qty-control">
          <button type="button" data-cart-action="minus" data-name="${encodeURIComponent(item.name)}">−</button>
          <span>${item.qty}</span>
          <button type="button" data-cart-action="plus" data-name="${encodeURIComponent(item.name)}">+</button>
        </div>
        <strong class="cart-line-price">${money(item.price * item.qty)}</strong>
        <button type="button" class="remove-line" data-cart-action="remove" data-name="${encodeURIComponent(item.name)}" aria-label="Remove ${item.name}">×</button>
      </div>`).join('');
  }

  document.querySelectorAll('.product-card').forEach(card => {
    const button = card.querySelector('.add-btn');
    const item = cart.get(card.dataset.product);
    if (!button) return;
    button.classList.toggle('added', Boolean(item));
    button.textContent = item ? `Added (${item.qty})` : 'Add +';
  });
}

function renderCheckout() {
  const count = cartCount();
  const days = rentalDays();
  const total = payableTotal();
  const checkoutItems = document.querySelector('#checkoutItems');
  if (!checkoutItems) return;

  checkoutItems.innerHTML = [...cart.values()].map(item => `
    <div class="checkout-line">
      <div><strong>${item.name}</strong><small>${item.qty} × ${money(item.price)} × ${days} ${days === 1 ? 'day' : 'days'}</small></div>
      <strong>${money(item.qty * item.price * days)}</strong>
    </div>`).join('');

  document.querySelector('#summaryCount').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  document.querySelector('#checkoutTotal').textContent = money(total);
  document.querySelector('#paymentAmount').textContent = money(total);
  document.querySelector('#razorpayAmount').textContent = money(total);
  document.querySelector('#upiIdLabel').textContent = SOUNDIFY_CONFIG.UPI_ID;
  renderUpiPayment();
}

function getUpiUri() {
  const amount = payableTotal().toFixed(2);
  const note = encodeURIComponent('Soundify equipment rental');
  return `upi://pay?pa=${encodeURIComponent(SOUNDIFY_CONFIG.UPI_ID)}&pn=${encodeURIComponent('Soundify')}&am=${amount}&cu=INR&tn=${note}`;
}

function renderUpiPayment() {
  const uri = getUpiUri();
  const upiLink = document.querySelector('#upiPayLink');
  if (upiLink) upiLink.href = uri;

  const qrBox = document.querySelector('#upiQr');
  if (!qrBox) return;
  qrBox.innerHTML = '';

  if (window.QRCode && SOUNDIFY_CONFIG.UPI_ID !== 'REPLACE_WITH_UPI_ID') {
    qrInstance = new QRCode(qrBox, {
      text: uri,
      width: 130,
      height: 130,
      correctLevel: QRCode.CorrectLevel.M
    });
  } else {
    qrBox.innerHTML = '<span>ADD<br>UPI ID<br>TO SHOW QR</span>';
  }
}

function selectedPaymentMethod() {
  return customerForm.querySelector('input[name="payment"]:checked')?.value || 'UPI / Google Pay';
}

function createWhatsAppMessage(data) {
  const days = rentalDays();
  const items = [...cart.values()].map((item, index) =>
    `${index + 1}. ${item.name}\n   Qty: ${item.qty} | ${money(item.price)}/day | ${days} ${days === 1 ? 'day' : 'days'} | ${money(item.price * item.qty * days)}`
  ).join('\n');

  const bookingId = `SF-${Date.now().toString().slice(-6)}`;
  const paymentDone = document.querySelector('#paymentCompleted').checked ? 'Customer marked as PAID – please verify' : 'Payment pending';
  const pageLocation = document.querySelector('#locationInput')?.value.trim() || 'Bengaluru';

  return `Hi Soundify, I would like to book the following equipment.\n\n*BOOKING REQUEST: ${bookingId}*\n\n*CUSTOMER*\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\n\n*EVENT / DELIVERY*\nCity: ${pageLocation}\nEvent date: ${data.eventDate}\nRental period: ${days} ${days === 1 ? 'day' : 'days'}\nDelivery address: ${data.deliveryAddress}\nExact location: ${data.exactLocation}\n\n*EQUIPMENT*\n${items}\n\n*EQUIPMENT TOTAL: ${money(payableTotal())}*\nDelivery / setup / deposit: To be confirmed\n\n*PAYMENT*\nMethod: ${selectedPaymentMethod()}\nStatus: ${paymentDone}\n\nPlease verify availability, payment and delivery charges. I understand the booking is final only after I receive Soundify's confirmation email.`;
}

if (dateInput) {
  dateInput.min = todayString();
  checkoutDate.min = todayString();
}

menuToggle?.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
});

document.querySelectorAll('.mobile-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const location = document.querySelector('#locationInput')?.value.trim() || 'Bengaluru';
  const date = dateInput?.value;
  if (!date) {
    showToast('Choose your event date first.');
    dateInput?.focus();
    return;
  }
  checkoutDate.value = date;
  document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' });
  showToast(`Showing equipment for ${location}. Add what you need to your cart.`);
});

document.querySelectorAll('.wishlist').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('active');
    button.textContent = button.classList.contains('active') ? '♥' : '♡';
  });
});

document.querySelectorAll('.add-btn').forEach((button) => {
  button.addEventListener('click', () => addProduct(button.closest('.product-card')));
});

document.querySelectorAll('.category-card[data-filter]').forEach((card) => {
  card.addEventListener('click', () => {
    const category = card.dataset.filter;
    if (category === 'packages') return;
    setTimeout(() => {
      document.querySelectorAll('.product-card').forEach((product) => {
        const match = product.dataset.category === category;
        product.style.outline = match ? '2px solid #111' : 'none';
        product.style.outlineOffset = match ? '3px' : '0';
      });
      showToast(`${card.querySelector('strong')?.textContent || 'Category'} selected.`);
    }, 250);
  });
});

cartTrigger?.addEventListener('click', openCart);
stickyCartBtn?.addEventListener('click', openCart);
cartClose?.addEventListener('click', closeCart);
cartBackdrop?.addEventListener('click', closeCart);
document.querySelector('#startCheckout')?.addEventListener('click', openCheckout);
checkoutClose?.addEventListener('click', closeCheckout);
checkoutModal?.addEventListener('click', (event) => {
  if (event.target === checkoutModal) closeCheckout();
});

document.querySelector('#cartItems')?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-cart-action]');
  if (!btn) return;
  const name = decodeURIComponent(btn.dataset.name);
  const action = btn.dataset.cartAction;
  if (action === 'plus') updateQty(name, 1);
  if (action === 'minus') updateQty(name, -1);
  if (action === 'remove') removeProduct(name);
});

rentalDaysInput?.addEventListener('input', renderCheckout);

document.querySelectorAll('input[name="payment"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.payment-card').forEach(card => card.classList.toggle('selected', card.contains(radio) && radio.checked));
    const upi = radio.value === 'UPI / Google Pay';
    document.querySelector('#upiPanel').classList.toggle('hidden', !upi);
    document.querySelector('#razorpayPanel').classList.toggle('hidden', upi);
  });
});

document.querySelector('#razorpayPay')?.addEventListener('click', () => {
  if (!SOUNDIFY_CONFIG.RAZORPAY_PAYMENT_LINK || SOUNDIFY_CONFIG.RAZORPAY_PAYMENT_LINK.includes('REPLACE_ME')) {
    showToast('Add your Razorpay payment link in script.js first.');
    return;
  }
  window.open(SOUNDIFY_CONFIG.RAZORPAY_PAYMENT_LINK, '_blank', 'noopener');
});

customerForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!cartCount()) {
    showToast('Your cart is empty.');
    return;
  }
  if (!customerForm.reportValidity()) return;
  const data = {
    name: document.querySelector('#customerName').value.trim(),
    phone: document.querySelector('#customerPhone').value.trim(),
    email: document.querySelector('#customerEmail').value.trim(),
    eventDate: checkoutDate.value,
    deliveryAddress: document.querySelector('#deliveryAddress').value.trim(),
    exactLocation: document.querySelector('#exactLocation').value.trim()
  };

  const message = createWhatsAppMessage(data);
  const url = `https://wa.me/${SOUNDIFY_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
  showToast('Booking request opened in WhatsApp.');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCart();
    closeCheckout();
  }
});

renderCart();
