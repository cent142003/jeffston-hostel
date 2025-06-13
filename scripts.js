// ============================================================================
// 1. Accessible Mobile Menu + Scroll-Spy
// ============================================================================
const menuBtn = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('#primary-navigation');
const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));

menuBtn.setAttribute('aria-expanded', 'false');
menuLinks.setAttribute('aria-hidden', 'true');

function toggleMenu() {
  const isOpen = menuBtn.classList.toggle('toggle-active');
  menuLinks.classList.toggle('nav-open');
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  menuLinks.setAttribute('aria-hidden', String(!isOpen));

  if (isOpen) {
    navAnchors[0].focus();
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
}

function handleKeydown(e) {
  const first = navAnchors[0];
  const last = navAnchors[navAnchors.length - 1];

  if (e.key === 'Escape') {
    toggleMenu();
    menuBtn.focus();
  }
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function onScroll() {
  const offsetY = window.pageYOffset;
  navAnchors.forEach(link => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    const top = target.offsetTop - 100;
    const bottom = top + target.offsetHeight;
    link.classList.toggle('active', offsetY >= top && offsetY < bottom);
  });
}

menuBtn.addEventListener('click', toggleMenu);
navAnchors.forEach(link => {
  link.addEventListener('click', () => {
    if (menuLinks.classList.contains('nav-open')) toggleMenu();
  });
});
window.addEventListener('scroll', onScroll);
document.addEventListener('DOMContentLoaded', onScroll);

// ============================================================================
// 2. Paystack Integration (Updated RoomType Pricing)
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  const bookingForm = document.querySelector('#booking-form');
  const payBtn = document.querySelector('#paystack-trigger');
  const durationInput = document.querySelector('#duration');
  const roomTypeInput = document.querySelector('#roomType');
  const amountField = document.querySelector('#amountInKobo');

  const pricing = {
    room1: { '1-semester': 360000, '22-weeks': 0, 'academic-year': 0 },
    room2: { '1-semester': 425000, '22-weeks': 0, 'academic-year': 0 },
    room3: { '1-semester': 380000, '22-weeks': 0, 'academic-year': 0 },
    room4: { '1-semester': 430000, '22-weeks': 0, 'academic-year': 0 },
    room5: { '1-semester': 550000, '22-weeks': 0, 'academic-year': 0 },
    room6: { '1-semester': 470000, '22-weeks': 0, 'academic-year': 0 },
    room7: { '1-semester': 470000, '22-weeks': 0, 'academic-year': 0 }
  };

  function calculateAmount(roomType, duration) {
    return pricing[roomType]?.[duration] || 0;
  }

  function updateAmount() {
    const roomType = roomTypeInput?.value;
    const duration = durationInput?.value;
    const amount = calculateAmount(roomType, duration);
    if (amountField) amountField.value = amount;
  }

  roomTypeInput?.addEventListener('change', updateAmount);
  durationInput?.addEventListener('change', updateAmount);

  payBtn?.addEventListener('click', () => {
    const formData = new FormData(bookingForm);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const roomType = formData.get('roomType');
    const duration = formData.get('duration');
    const amount = calculateAmount(roomType, duration);

    if (![fullName, email, phone, roomType, duration].every(Boolean) || amount === 0) {
      alert('Please complete all booking fields correctly before payment.');
      return;
    }

    const handler = PaystackPop.setup({
      key: 'pk_live_9302b8356f0551937a496101908e2eb772328962',
      email,
      amount,
      currency: 'GHS',
      metadata: {
        custom_fields: [
          { display_name: 'Full Name', value: fullName },
          { display_name: 'Phone Number', value: phone },
          { display_name: 'Room Type', value: roomType },
          { display_name: 'Duration', value: duration }
        ]
      },
      callback: function (response) {
        alert(`✅ Payment successful! Reference: ${response.reference}`);
        bookingForm.reset();
        if (amountField) amountField.value = '';
      },
      onClose: function () {
        alert('Payment window closed.');
      }
    });

    handler.openIframe();
  });
});

// ============================================================================
// 3. Animate On Scroll Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  if (window.AOS) {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
  }
});
