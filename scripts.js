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
// 7. Room Photo Slideshow
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
  const slideshow = document.querySelector('.rooms-slideshow');
  if (!slideshow) return;

  const slides = Array.from(slideshow.querySelectorAll('.slideshow-slide'));
  const dots = Array.from(slideshow.querySelectorAll('.slideshow-dots button'));
  const caption = slideshow.querySelector('.slideshow-caption');
  const previousButton = slideshow.querySelector('.slideshow-prev');
  const nextButton = slideshow.querySelector('.slideshow-next');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentIndex = slides.findIndex(slide => slide.classList.contains('is-active'));
  let autoplayId;

  if (currentIndex < 0) currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle('is-active', isActive);
      if (isActive) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    if (caption) {
      caption.textContent = slides[currentIndex].dataset.caption || '';
    }
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function previousSlide() {
    showSlide(currentIndex - 1);
  }

  function stopAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = undefined;
    }
  }

  function startAutoplay() {
    if (prefersReducedMotion || autoplayId || slides.length < 2) return;
    autoplayId = window.setInterval(nextSlide, 5500);
  }

  previousButton?.addEventListener('click', () => {
    previousSlide();
    stopAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    nextSlide();
    stopAutoplay();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      showSlide(dotIndex);
      stopAutoplay();
    });
  });

  slideshow.addEventListener('mouseenter', stopAutoplay);
  slideshow.addEventListener('mouseleave', startAutoplay);
  slideshow.addEventListener('focusin', stopAutoplay);
  slideshow.addEventListener('focusout', startAutoplay);

  slideshow.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previousSlide();
      stopAutoplay();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
      stopAutoplay();
    }
  });

  showSlide(currentIndex);
  startAutoplay();
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
  const mobileNavQuery = window.matchMedia('(max-width: 768px)');

  function isMobileNav() {
    return mobileNavQuery.matches;
  }

  function setMenuState(isOpen) {
    menuBtn.classList.toggle('toggle-active', isOpen);
    menuLinks.classList.toggle('nav-open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));

    if (isMobileNav()) {
      menuLinks.setAttribute('aria-hidden', String(!isOpen));
    } else {
      menuLinks.removeAttribute('aria-hidden');
    }

    if (isOpen) {
      navAnchors[0]?.focus();
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.removeEventListener('keydown', handleKeydown);
    }
  }

  function syncMenuState() {
    setMenuState(isMobileNav() && menuLinks.classList.contains('nav-open'));
  }

  function toggleMenu() {
    if (!isMobileNav()) return;
    setMenuState(!menuLinks.classList.contains('nav-open'));
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
      if (isMobileNav() && menuLinks.classList.contains('nav-open')) {
        setMenuState(false);
      }
    });
  });

  if (typeof mobileNavQuery.addEventListener === 'function') {
    mobileNavQuery.addEventListener('change', syncMenuState);
  } else {
    mobileNavQuery.addListener(syncMenuState);
  }
  
  syncMenuState();
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', onScroll);
}

// ============================================================================
// 2. Enhanced Paystack Integration - Your Custom Implementation Improved
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  const bookingForm = document.querySelector('#booking-form');
  const payBtn = document.querySelector('#paystack-trigger');
  const durationInput = document.querySelector('#duration');
  const roomTypeInput = document.querySelector('#roomType');
  const amountField = document.querySelector('#amountInKobo');

  // Updated pricing structure (amounts in pesewas for Paystack)
  const pricing = {
    'room-a101': { 'first-semester': 550000, 'second-semester': 550000, 'full-academic-year': 1100000 },
    'room-a102': { 'first-semester': 670000, 'second-semester': 670000, 'full-academic-year': 1340000 },
    'room-b201': { 'first-semester': 780000, 'second-semester': 780000, 'full-academic-year': 1560000 },
    'room-b202': { 'first-semester': 670000, 'second-semester': 670000, 'full-academic-year': 1340000 },
    'room-b203': { 'first-semester': 680000, 'second-semester': 680000, 'full-academic-year': 1360000 },
    'room-c301': { 'first-semester': 800000, 'second-semester': 800000, 'full-academic-year': 1600000 },
    'room-c302': { 'first-semester': 600000, 'second-semester': 600000, 'full-academic-year': 1200000 },
    'room-c303': { 'first-semester': 550000, 'second-semester': 550000, 'full-academic-year': 1100000 }
  };

  // Enhanced validation function
  function validateBookingForm() {
    const fullName = document.getElementById('fullName')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();
    const roomType = document.getElementById('roomType')?.value;
    const duration = document.getElementById('duration')?.value;

    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    let isValid = true;

    if (!fullName) {
      document.getElementById('error-fullName').textContent = 'Full name is required';
      isValid = false;
    }

    if (!email || !email.includes('@')) {
      document.getElementById('error-email').textContent = 'Valid email is required';
      isValid = false;
    }

    if (!phone) {
      document.getElementById('error-phone').textContent = 'Phone number is required';
      isValid = false;
    }

    if (!roomType) {
      document.getElementById('error-roomType').textContent = 'Please select a room';
      isValid = false;
    }

    if (!duration) {
      document.getElementById('error-duration').textContent = 'Please select duration';
      isValid = false;
    }

    return { isValid, fullName, email, phone, roomType, duration };
  }

  function calculateAmount(roomType, duration) {
    return pricing[roomType]?.[duration] || 0;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount / 100);
  }

  function escapeHTML(value) {
    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return String(value ?? '').replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  function formatSelectionLabel(value) {
    return String(value ?? '').replace(/-/g, ' ');
  }

  function updateAmount() {
    const roomType = roomTypeInput?.value;
    const duration = durationInput?.value;
    const amount = calculateAmount(roomType, duration);
    if (amountField) amountField.value = amount;
    
    // Update payment button with amount (your style enhanced)
    if (payBtn && amount > 0) {
      payBtn.textContent = `Proceed to Payment - ${formatCurrency(amount)}`;
      payBtn.disabled = false;
    } else {
      payBtn.textContent = 'Proceed to Payment';
      payBtn.disabled = true;
    }
  }

  function showThankYouMessage(response, bookingDetails) {
    const reference = String(response.reference ?? '');
    const safeDetails = {
      fullName: escapeHTML(bookingDetails.fullName),
      email: escapeHTML(bookingDetails.email),
      room: escapeHTML(bookingDetails.roomLabel || formatSelectionLabel(bookingDetails.roomType)),
      duration: escapeHTML(bookingDetails.durationLabel || formatSelectionLabel(bookingDetails.duration)),
      amount: escapeHTML(formatCurrency(bookingDetails.amount)),
      reference: escapeHTML(reference)
    };
    const whatsappUrl = `https://wa.me/233201349321?text=Hi%2C%20I%20just%20completed%20my%20payment%20for%20Jeffston%20Court%20Hostel.%20Reference%3A%20${encodeURIComponent(reference)}`;

    // Create thank you modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 10px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    content.innerHTML = `
      <div style="color: #25d366; font-size: 4rem; margin-bottom: 1rem;">✅</div>
      <h2 style="color: #2c3e50; margin-bottom: 1rem;">Payment Successful!</h2>
      <p style="color: #7f8c8d; margin-bottom: 1rem;">Thank you for booking with Jeffston Court Hostel</p>
      
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 5px; margin: 1rem 0; text-align: left;">
        <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">Booking Details:</h3>
        <p><strong>Name:</strong> ${safeDetails.fullName}</p>
        <p><strong>Email:</strong> ${safeDetails.email}</p>
        <p><strong>Room:</strong> ${safeDetails.room}</p>
        <p><strong>Duration:</strong> ${safeDetails.duration}</p>
        <p><strong>Amount:</strong> ${safeDetails.amount}</p>
        <p><strong>Reference:</strong> ${safeDetails.reference}</p>
      </div>
      
      <div style="background: #e8f5e8; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
        <h4 style="color: #25d366; margin-bottom: 0.5rem;">What's Next?</h4>
        <p style="font-size: 0.9rem; color: #2c3e50;">
          • We'll send a confirmation email within 24 hours<br>
          • You'll receive your room assignment details<br>
          • Contact us on WhatsApp for any questions
        </p>
      </div>
      
      <div style="margin-top: 1.5rem;">
        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                style="background: #25d366; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 5px; cursor: pointer; margin-right: 0.5rem;">
          Close
        </button>
        <a href="${escapeHTML(whatsappUrl)}" 
           target="_blank" rel="noopener noreferrer"
           style="background: #128c7e; color: white; padding: 0.75rem 1.5rem; border-radius: 5px; text-decoration: none; display: inline-block;">
          Contact on WhatsApp
        </a>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 30000);
  }

  function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 1rem;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
  }

  function selectRoom(roomValue) {
    if (!roomTypeInput) return;

    roomTypeInput.value = roomValue;
    roomTypeInput.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    durationInput?.focus();
  }

  document.querySelectorAll('[data-room-value]').forEach(button => {
    button.addEventListener('click', () => selectRoom(button.dataset.roomValue));
  });

  // Your original event listeners
  roomTypeInput?.addEventListener('change', updateAmount);
  durationInput?.addEventListener('change', updateAmount);

  payBtn?.addEventListener('click', () => {
    console.log('Payment button clicked!');
    
    const formData = new FormData(bookingForm);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const roomType = formData.get('roomType');
    const duration = formData.get('duration');
    const amount = calculateAmount(roomType, duration);
    const roomLabel = roomTypeInput?.selectedOptions?.[0]?.textContent?.trim() || roomType;
    const durationLabel = durationInput?.selectedOptions?.[0]?.textContent?.trim() || duration;

    console.log('Form data:', { fullName, email, phone, roomType, duration, amount });
    console.log('Paystack available:', typeof PaystackPop !== 'undefined');

    if (![fullName, email, phone, roomType, duration].every(Boolean) || amount === 0) {
      alert('Please complete all booking fields correctly before payment.');
      console.log('Validation failed');
      return;
    }

    if (typeof PaystackPop === 'undefined') {
      alert('Payment system is loading. Please try again in a moment.');
      console.error('PaystackPop is not available');
      return;
    }

    console.log('Setting up Paystack payment...');

    const handler = PaystackPop.setup({
      key: 'pk_live_9302b8356f0551937a496101908e2eb772328962',
      email,
      amount,
      currency: 'GHS',
      metadata: {
        custom_fields: [
          { display_name: 'Full Name', value: fullName },
          { display_name: 'Phone Number', value: phone },
          { display_name: 'Room', value: roomLabel },
          { display_name: 'Duration', value: durationLabel }
        ]
      },
      callback: function (response) {
        console.log('Payment successful:', response);
        // Show professional thank you message
        showThankYouMessage(response, {
          fullName,
          email,
          phone,
          roomType,
          roomLabel,
          duration,
          durationLabel,
          amount,
          reference: response.reference
        });
        
        bookingForm.reset();
        if (amountField) amountField.value = '';
      },
      onClose: function () {
        console.log('Payment window closed');
        alert('Payment window closed.');
      }
    });

    console.log('Opening Paystack iframe...');
    handler.openIframe();
  });

  // Initialize amount display on page load
  updateAmount();
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
    'Assets/images/bedroom2.jpg',
    'Assets/images/kit2.jpg',
    'Assets/images/bedroom1.jpg',
    'Assets/images/liv3.jpg'
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
