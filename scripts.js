// ============================================================================
// 5. WhatsApp Integration Enhancement
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
  const whatsappFloat = document.getElementById('whatsapp-float');
  const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me/"]');
  
  // Show/hide floating WhatsApp button based on scroll
  let lastScrollTop = 0;
  const toggleWhatsAppButton = window.throttle(() => {
    if (!whatsappFloat) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const heroSection = document.querySelector('.hero');
    const heroHeight = heroSection ? heroSection.offsetHeight : 0;
    
    // Show button after hero section
    if (scrollTop > heroHeight * 0.7) {
      whatsappFloat.style.opacity = '1';
      whatsappFloat.style.visibility = 'visible';
      whatsappFloat.style.transform = 'scale(1)';
    } else {
      whatsappFloat.style.opacity = '0.7';
    }
    
    lastScrollTop = scrollTop;
  }, 16);
  
  window.addEventListener('scroll', toggleWhatsAppButton, { passive: true });
  
  // Track WhatsApp link clicks for analytics (optional)
  whatsappLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const linkText = this.textContent.trim();
      const roomType = this.closest('.room-card') ? 
        this.closest('.room-card').querySelector('h3').textContent : 
        'General';
      
      // Optional: Send analytics event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
          event_category: 'Contact',
          event_label: roomType,
          value: 1
        });
      }
      
      // Optional: Console log for debugging
      console.log(`WhatsApp link clicked: ${linkText} - ${roomType}`);
    });
  });
  
  // Add click animation to WhatsApp buttons
  whatsappLinks.forEach(link => {
    link.addEventListener('mousedown', function() {
      this.style.transform = 'scale(0.95)';
    });
    
    link.addEventListener('mouseup', function() {
      this.style.transform = '';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
  
  // Initialize floating button state
  if (whatsappFloat) {
    whatsappFloat.style.opacity = '0.7';
    whatsappFloat.style.visibility = 'visible';
    whatsappFloat.style.transform = 'scale(1)';
    whatsappFloat.style.transition = 'all 0.3s ease';
  }
});

// ============================================================================
// 6. WhatsApp Sharing and Room Inquiry Functions
// ============================================================================

// Function to generate room-specific WhatsApp messages
function generateRoomMessage(roomType, roomTitle) {
  const baseUrl = 'https://wa.me/233201349321';
  const messages = {
    'room-budget': `Hi! I'm interested in the ${roomTitle} at Jeffston Court Hostel. Can you provide more details about availability, pricing, and amenities?`,
    'room-premium': `Hello! I'd like to know more about the ${roomTitle} at Jeffston Court Hostel. What are the current rates and availability?`,
    'room-standard': `Hi there! I'm interested in booking the ${roomTitle} at Jeffston Court Hostel. Can you help me with the booking process?`,
    'general': 'Hello! I\'m interested in accommodation at Jeffston Court Hostel. Can you please provide more information about your rooms and services?',
    'booking-help': 'Hi! I need assistance with booking a room at Jeffston Court Hostel. Can you help me complete my reservation?'
  };
  
  const message = messages[roomType] || messages['general'];
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

// Function to open WhatsApp with custom message
function openWhatsApp(messageType, roomTitle = '') {
  const url = generateRoomMessage(messageType, roomTitle);
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Enhanced contact form integration
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    // Add WhatsApp option to contact form
    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      // Create WhatsApp alternative button
      const whatsappAlt = document.createElement('p');
      whatsappAlt.className = 'contact-alternative';
      whatsappAlt.innerHTML = `
        Or <a href="#" class="whatsapp-link" onclick="openWhatsApp('general'); return false;">
          send us a message on WhatsApp
        </a> for faster response
      `;
      
      submitButton.parentNode.insertBefore(whatsappAlt, submitButton.nextSibling);
    }
  }
});

// ============================================================================
// 0. WebP Detection and Performance Setup
// ============================================================================
(function() {
  'use strict';
  
  // WebP detection
  function checkWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  
  // Add class to html element based on WebP support
  if (!checkWebPSupport()) {
    document.documentElement.classList.add('no-webp');
  }
  
  // Optimize scroll performance with throttling
  function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  window.throttle = throttle;
})();

// ============================================================================
// 1. Accessible Mobile Menu + Scroll-Spy (Optimized)
// ============================================================================
const menuBtn = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('#primary-navigation');
const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));

if (menuBtn && menuLinks) {
  menuBtn.setAttribute('aria-expanded', 'false');
  menuLinks.setAttribute('aria-hidden', 'true');

  function toggleMenu() {
    const isOpen = menuBtn.classList.toggle('toggle-active');
    menuLinks.classList.toggle('nav-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuLinks.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      navAnchors[0]?.focus();
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

  // Optimized scroll spy with throttling
  const onScroll = window.throttle(() => {
    const offsetY = window.pageYOffset;
    navAnchors.forEach(link => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      const top = target.offsetTop - 100;
      const bottom = top + target.offsetHeight;
      link.classList.toggle('active', offsetY >= top && offsetY < bottom);
    });
  }, 16); // ~60fps

  menuBtn.addEventListener('click', toggleMenu);
  navAnchors.forEach(link => {
    link.addEventListener('click', () => {
      if (menuLinks.classList.contains('nav-open')) toggleMenu();
    });
  });
  
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', onScroll);
}

// ============================================================================
// 2. Paystack Integration (Updated RoomType Pricing) - Optimized
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  const bookingForm = document.querySelector('#booking-form');
  const payBtn = document.querySelector('#paystack-trigger');
  const durationInput = document.querySelector('#duration');
  const roomTypeInput = document.querySelector('#roomType');
  const amountField = document.querySelector('#amountInKobo');

  // Cache pricing data (amounts in pesewas for Paystack)
  const pricing = {
    '4-in-room-4750': { 'first-semester': 475000, 'second-semester': 450000, 'full-academic-year': 925000 },
    '4-in-room-5750': { 'first-semester': 575000, 'second-semester': 545000, 'full-academic-year': 1120000 },
    '3-in-room-5100': { 'first-semester': 510000, 'second-semester': 485000, 'full-academic-year': 995000 },
    '3-in-room-6500': { 'first-semester': 650000, 'second-semester': 615000, 'full-academic-year': 1265000 },
    '2-in-room-5500': { 'first-semester': 550000, 'second-semester': 520000, 'full-academic-year': 1070000 },
    '2-in-room-8000': { 'first-semester': 800000, 'second-semester': 760000, 'full-academic-year': 1560000 },
    '2-in-room-9000': { 'first-semester': 900000, 'second-semester': 855000, 'full-academic-year': 1755000 }
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

  // Add event listeners with early return if elements don't exist
  if (roomTypeInput && durationInput) {
    roomTypeInput.addEventListener('change', updateAmount);
    durationInput.addEventListener('change', updateAmount);
  }

  if (payBtn && bookingForm) {
    payBtn.addEventListener('click', () => {
      const formData = new FormData(bookingForm);
      const fullName = formData.get('fullName');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const roomType = formData.get('roomType');
      const duration = formData.get('duration');
      const amount = calculateAmount(roomType, duration);

      // Validate required fields
      if (![fullName, email, phone, roomType, duration].every(Boolean) || amount === 0) {
        alert('Please complete all booking fields correctly before payment.');
        return;
      }

      // Check if Paystack is loaded
      if (typeof PaystackPop === 'undefined') {
        alert('Payment system is still loading. Please try again in a moment.');
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
  }
});

// ============================================================================
// 3. Animate On Scroll Initialization (Optimized)
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (window.AOS && !prefersReducedMotion) {
    AOS.init({ 
      duration: 800, 
      easing: 'ease-in-out', 
      once: true,
      offset: 120,
      disable: 'mobile' // Disable on mobile for better performance
    });
  }
});

// ============================================================================
// 4. Performance Optimizations
// ============================================================================

// Lazy loading handled by native loading="lazy" attribute in HTML
// No additional JavaScript lazy loading needed

// Preload critical resources on user interaction
let resourcesPreloaded = false;
function preloadCriticalResources() {
  if (resourcesPreloaded) return;
  resourcesPreloaded = true;
  
  const criticalResources = [
    'Assets/images/bedroom1.jpg',
    'Assets/images/bedroom2.jpg',
    'Assets/images/NEW4.jpg'
  ];
  
  criticalResources.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Preload resources on first user interaction
['mousedown', 'touchstart', 'keydown'].forEach(event => {
  document.addEventListener(event, preloadCriticalResources, { once: true, passive: true });
});

// Optimize form interactions
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    // Add visual feedback for form interactions
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      }, { passive: true });
      
      input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
      }, { passive: true });
    });
  });
});
