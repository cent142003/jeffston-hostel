// ============================================================================
// 1. Accessible Mobile Menu + Scroll-Spy
// ============================================================================

const menuBtn = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('#primary-navigation');
const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));

// Initialize ARIA attributes
menuBtn.setAttribute('aria-expanded', 'false');
menuLinks.setAttribute('aria-hidden', 'true');

// Toggle menu function
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

// Trap focus inside the nav
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

// ScrollSpy for section highlight
function onScroll() {
  const offsetY = window.pageYOffset;

  navAnchors.forEach(link => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    const top = target.offsetTop - 100;
    const bottom = top + target.offsetHeight;

    if (offsetY >= top && offsetY < bottom) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Attach events
menuBtn.addEventListener('click', toggleMenu);
navAnchors.forEach(link => {
  link.addEventListener('click', () => {
    if (menuLinks.classList.contains('nav-open')) {
      toggleMenu();
    }
  });
});
window.addEventListener('scroll', onScroll);
document.addEventListener('DOMContentLoaded', onScroll); // Initial highlight

// ============================================================================
// 2. Paystack Integration
// ============================================================================

const bookingForm = document.querySelector('.booking-form');
const payBtn = document.querySelector('#paystack-trigger');

// Toggle loading state
function setLoading(isLoading) {
  payBtn.disabled = isLoading;
  payBtn.classList.toggle('loading', isLoading);
}

// Calculate price based on duration
function calculateAmount(duration) {
  switch (duration) {
    case 'academic-year': return 120000; // GHS 1200
    case '3-months': return 90000;
    case '1-month': return 35000;
    default: return 0;
  }
}

// Paystack flow
function openPaystack() {
  const formData = new FormData(bookingForm);

  const email = formData.get('email');
  const fullName = formData.get('fullName');
  const phone = formData.get('phone');
  const roomType = formData.get('roomType');
  const duration = formData.get('duration');
  const amount = calculateAmount(duration);

  if (!email || !fullName || !phone || !roomType || !duration || amount === 0) {
    alert('Please complete all required fields.');
    return;
  }

  setLoading(true);

  const handler = PaystackPop.setup({
    key: 'pk_test_your_public_key_here', // Replace with your real public key
    email,
    amount,
    currency: 'GHS',
    metadata: {
      custom_fields: [
        { display_name: 'Full Name', value: fullName },
        { display_name: 'Phone', value: phone },
        { display_name: 'Room Type', value: roomType },
        { display_name: 'Duration', value: duration }
      ]
    },
    callback: function (response) {
      alert(`Payment complete! Reference: ${response.reference}`);
      bookingForm.reset();
      setLoading(false);
    },
    onClose: function () {
      setLoading(false);
      alert('Payment was not completed.');
    }
  });

  handler.openIframe();
}

// Attach Paystack button event
payBtn.addEventListener('click', openPaystack);

// ============================================================================
// 3. Optional: Animate On Scroll Library Setup (AOS)
// ============================================================================

/* Added here */
document.addEventListener('DOMContentLoaded', function () {
  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }
});
