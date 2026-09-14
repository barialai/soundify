const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const toast = document.querySelector('.toast');
const dateInput = document.querySelector('#dateInput');
const bookingForm = document.querySelector('#booking');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__soundifyToast);
  window.__soundifyToast = setTimeout(() => toast.classList.remove('show'), 2200);
}

if (dateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
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

  document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' });
  showToast(`Showing available equipment for ${location}.`);
});

document.querySelectorAll('.wishlist').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('active');
    button.textContent = button.classList.contains('active') ? '♥' : '♡';
  });
});

document.querySelectorAll('.add-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const added = button.classList.toggle('added');
    button.textContent = added ? 'Added ✓' : 'Add +';
    showToast(added ? 'Added to your rental list.' : 'Removed from your rental list.');
  });
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
