// ============================================================================
// 5. WhatsApp Integration Enhancement
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
  const whatsappFloat = document.getElementById('whatsapp-float');
  const mobileBookingBar = document.querySelector('.mobile-booking-bar');
  const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me/"]');
  
  // Show/hide floating WhatsApp button based on scroll
  let lastScrollTop = 0;
  const toggleWhatsAppButton = window.throttle(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const heroSection = document.querySelector('.hero');
    const heroHeight = heroSection ? heroSection.offsetHeight : 0;
    const pastHero = scrollTop > heroHeight * 0.72;
    
    if (mobileBookingBar) {
      mobileBookingBar.classList.toggle('is-visible', pastHero);
    }

    if (!whatsappFloat) return;

    // Show button after hero section
    if (pastHero) {
      whatsappFloat.style.opacity = '1';
      whatsappFloat.style.visibility = 'visible';
      whatsappFloat.style.transform = 'scale(1)';
    } else {
      whatsappFloat.style.opacity = '0.7';
    }
    
    lastScrollTop = scrollTop;
  }, 16);
  
  window.addEventListener('scroll', toggleWhatsAppButton, { passive: true });
  toggleWhatsAppButton();
  
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
    'room-standard': `Hi, I'd like to arrange a viewing for the ${roomTitle} at Jeffston Court Hostel. Please let me know when I can come. I understand payment is at the property after viewing.`,
    'general': 'Hello! I\'m interested in accommodation at Jeffston Court Hostel. Can you please provide more information about your rooms and services?',
    'booking-help': 'Hi, I would like to view a room at Jeffston Court Hostel before paying. Please help me arrange a visit.'
  };
  
  const message = messages[roomType] || messages['general'];
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

// Function to open WhatsApp with custom message
function openWhatsApp(messageType, roomTitle = '') {
  const url = generateRoomMessage(messageType, roomTitle);
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ============================================================================
// 6a. Google Sheet Room Sync
// ============================================================================
(function () {
  window.JCH_ROOM_PRICING = {};
  window.JCH_ROOM_FEED_READY = false;

  // Keep the customer's intent across 60-second refreshes and temporary outages.
  let preferredRoomValue = '';
  let newestRoomRequest = 0;
  function setRoomFeedStatus(message, showRetry) {
    const messageEl = document.querySelector('#room-feed-status');
    const retryButton = document.querySelector('#retry-room-feed');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.dataset.state = showRetry ? 'error' : 'ready';
    }
    if (retryButton) retryButton.hidden = !showRetry;
  }

  document.addEventListener('change', function(event) {
    if (event.target?.id === 'roomType') {
      preferredRoomValue = event.target.value || '';
    }
  });

  function roomValue(roomCode) {
    return `room-${String(roomCode || '').trim().toLowerCase()}`;
  }

  function parseMoney(value) {
    const amount = Number(String(value || '').replace(/[^\d.]/g, ''));
    return Number.isFinite(amount) ? amount : 0;
  }

  function formatCedi(value) {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      maximumFractionDigits: 0
    }).format(value).replace('GH₵', '₵');
  }

  function normalizeRoom(raw) {
    const code = raw.room || raw.Room || raw.code || raw.Code || raw.roomCode || raw.RoomCode;
    const type = raw.type || raw.Type || raw.roomType || raw.RoomType;
    const occupancy = raw.occupancy || raw.Occupancy || `${raw.occupied ?? raw.Occupied ?? 0}/${raw.capacity ?? raw.Capacity ?? 0}`;
    const rent = parseMoney(raw.rentAmount ?? raw.rent ?? raw.Rent ?? raw.price ?? raw.Price);
    const [occupied, capacity] = String(occupancy).split('/').map(part => Number(part.trim()));
    const safeCapacity = Number.isFinite(capacity) && capacity > 0 ? capacity : 0;
    const safeOccupied = Number.isFinite(occupied) ? Math.max(0, occupied) : 0;
    const rawAvailable = Number(raw.availableBeds ?? raw.AvailableBeds);
    const availableBeds = Number.isFinite(rawAvailable)
      ? Math.max(0, rawAvailable)
      : Math.max(0, safeCapacity - safeOccupied);
    const computedStatus = safeCapacity > 0 && availableBeds <= 0 ? 'Full' : 'Available';

    if (!code || !type || !rent) return null;

    return {
      code: String(code).trim().toUpperCase(),
      type: String(type).trim(),
      occupancy: safeCapacity ? `${safeOccupied}/${safeCapacity}` : String(occupancy).trim(),
      occupied: safeOccupied,
      capacity: safeCapacity,
      availableBeds,
      rent,
      status: computedStatus
    };
  }

  function normalizePayload(payload) {
    if (payload?.ok === false) throw new Error('Live room service returned an error');
    const rows = Array.isArray(payload) ? payload : payload?.rooms ?? payload?.data;
    if (!Array.isArray(rows)) throw new Error('Live room response contains no rooms array');
    return rows.map(normalizeRoom).filter(Boolean);
  }

  function waitlistUrl(roomCode) {
    const text = `Hi, I'd like to join the waitlist for Room ${roomCode} at Jeffston Court Hostel. I understand payment is only at the property after a viewing.`;
    return `https://wa.me/233201349321?text=${encodeURIComponent(text)}`;
  }

  function pricingForRent(rent) {
    const semester = Math.round(rent * 100);
    return {
      'first-semester': semester,
      'second-semester': semester,
      'full-academic-year': semester * 2
    };
  }

  function renderRooms(rooms) {
    const tableBody = document.querySelector('.rooms-table tbody');
    const roomSelect = document.querySelector('#roomType');
    if (!tableBody || !roomSelect) return;

    const requestedRoom = roomSelect.value || preferredRoomValue;
    const totalAvailableBeds = rooms.reduce((sum, room) => sum + Math.max(0, Number(room.availableBeds) || 0), 0);
    const fullRooms = rooms.filter(room => room.status.toLowerCase() === 'full').length;
    const availableRooms = rooms.filter(room => room.status.toLowerCase() !== 'full');
    const startingRent = availableRooms.length ? Math.min(...availableRooms.map(room => room.rent)) : 0;
    const setText = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = value;
    };
    setText('#hero-live-availability', totalAvailableBeds + ' bed' + (totalAvailableBeds === 1 ? '' : 's') + ' available');
    setText('#live-total-rooms', String(rooms.length));
    setText('#live-available-beds', String(totalAvailableBeds));
    setText('#live-starting-rent', startingRent ? formatCedi(startingRent) : 'Waitlist only');
    setText('#hero-live-price', startingRent ? 'From ' + formatCedi(startingRent) : 'Waitlist only');
    setText('#live-full-rooms', String(fullRooms));

    tableBody.innerHTML = rooms.length ? rooms.map(room => {
      const isFull = room.status.toLowerCase() === 'full';
      const filled = room.capacity ? Math.min(100, Math.round((room.occupied / room.capacity) * 100)) : 0;
      const action = isFull
        ? `<a class="btn room-waitlist-btn" href="${waitlistUrl(room.code)}" target="_blank" rel="noopener noreferrer">Waitlist</a>`
        : `<button type="button" class="btn room-select-btn" data-room-value="${roomValue(room.code)}">Arrange a Viewing</button>`;

      return `
        <tr>
          <th scope="row">${room.code}</th>
          <td>${room.type}</td>
          <td><span class="occupancy-meter ${isFull ? 'is-full' : ''}" style="--filled: ${filled}%;"></span>${room.occupancy}</td>
          <td>${formatCedi(room.rent)}</td>
          <td><span class="status-pill ${isFull ? 'status-full' : 'status-available'}">${isFull ? 'Full' : `${room.availableBeds} bed${room.availableBeds === 1 ? '' : 's'} available`}</span></td>
          <td>${action}</td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="6">No current rooms listed. Please contact the hostel to confirm availability.</td></tr>';

    const roomOptions = '<option value="" disabled selected>Select available room</option>' + rooms.map(room => {
      const isFull = room.status.toLowerCase() === 'full';
      const disabled = isFull ? ' disabled' : '';
      const state = isFull ? 'Full' : `${room.availableBeds} bed${room.availableBeds === 1 ? '' : 's'} available (${room.occupancy} occupied)`;
      return `<option value="${roomValue(room.code)}"${disabled}>${room.code} - ${room.type} - ${state} - GHS ${room.rent.toLocaleString('en-US')} per semester</option>`;
    }).join('');

    // Avoid closing the iPhone's native room picker when nothing has changed.
    if (roomSelect.dataset.optionsFingerprint !== roomOptions) {
      roomSelect.innerHTML = roomOptions;
      roomSelect.dataset.optionsFingerprint = roomOptions;
    }
    const availableChoice = requestedRoom && [...roomSelect.options].some(option =>
      option.value === requestedRoom && !option.disabled
    );
    roomSelect.disabled = availableRooms.length === 0;
    if (availableChoice) {
      roomSelect.value = requestedRoom;
      preferredRoomValue = requestedRoom;
    } else {
      roomSelect.value = '';
      preferredRoomValue = '';
    }

    window.JCH_ROOM_PRICING = availableRooms.reduce((pricing, room) => {
      pricing[roomValue(room.code)] = pricingForRent(room.rent);
      return pricing;
    }, {});
    window.JCH_ROOM_FEED_READY = true;
    const status = requestedRoom && !availableChoice
      ? 'Your previously selected room is no longer available. Please choose another.'
      : availableRooms.length
        ? 'Live room availability loaded. Choose an available bed space.'
        : 'No room spaces are currently available online. Ask management about the waitlist.';
    setRoomFeedStatus(status, false);

    document.dispatchEvent(new CustomEvent('jch:rooms-updated', { detail: { rooms } }));
  }

  function loadRoomsWithJsonp(apiUrl) {
    return new Promise((resolve, reject) => {
      const callbackName = `jchRoomsCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const url = new URL(apiUrl, window.location.href);
      url.searchParams.set('callback', callbackName);

      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error('Room API JSONP request timed out'));
      }, 12000);

      function cleanup() {
        window.clearTimeout(timeoutId);
        delete window[callbackName];
        script.remove();
      }

      window[callbackName] = payload => {
        cleanup();
        resolve(payload);
      };

      script.src = url.toString();
      script.async = true;
      script.onerror = () => {
        cleanup();
        reject(new Error('Room API JSONP request failed'));
      };

      document.head.appendChild(script);
    });
  }

  async function syncRoomsFromSheet() {
    const roomsSection = document.querySelector('#rooms');
    const apiUrl = window.JCH_ROOMS_API_URL || roomsSection?.dataset.roomsApi;
    const fallbackUrl = roomsSection?.dataset.roomsFallbackApi;
    if (!apiUrl || apiUrl.includes('PASTE_')) return;
    const requestNumber = ++newestRoomRequest;

    try {
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Room API returned ${response.status}`);
      const rooms = normalizePayload(await response.json());
      if (requestNumber !== newestRoomRequest) return;
      renderRooms(rooms);
    } catch (error) {
      try {
        if (!fallbackUrl) throw new Error('No live fallback feed configured');
        const rooms = normalizePayload(await loadRoomsWithJsonp(fallbackUrl));
        if (requestNumber !== newestRoomRequest) return;
        renderRooms(rooms);
      } catch (fallbackError) {
        if (requestNumber !== newestRoomRequest) return;
        window.JCH_ROOM_FEED_READY = false;
        window.JCH_ROOM_PRICING = {};
        const roomSelect = document.querySelector('#roomType');
        const viewingButton = document.querySelector('#viewing-trigger');
        const amountField = document.querySelector('#quotedAmountPesewas');
        const heroAvailability = document.querySelector('#hero-live-availability');
        const heroPrice = document.querySelector('#hero-live-price');
        if (roomSelect) {
          if (roomSelect.value) preferredRoomValue = roomSelect.value;
          roomSelect.innerHTML = '<option value="" disabled selected>Live availability temporarily unavailable</option>';
          roomSelect.dataset.optionsFingerprint = '';
          roomSelect.disabled = true;
        }
        if (amountField) amountField.value = '';
        const selectionSummary = document.querySelector('#selected-room-summary');
        if (selectionSummary) {
          selectionSummary.textContent = '';
          selectionSummary.hidden = true;
        }
        if (viewingButton) {
          viewingButton.disabled = true;
          viewingButton.textContent = 'Live availability unavailable — contact reception';
        }
        if (heroAvailability) heroAvailability.textContent = 'Call or WhatsApp for live availability';
        if (heroPrice) heroPrice.textContent = 'Live price temporarily unavailable';
        setRoomFeedStatus('Cannot load live room prices. Retry or contact reception to arrange a viewing. Never pay online.', true);
        console.warn('Live room sync failed; viewing enquiry disabled:', error, fallbackError);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    syncRoomsFromSheet();
    document.querySelector('#retry-room-feed')?.addEventListener('click', syncRoomsFromSheet);
    window.setInterval(syncRoomsFromSheet, 60000);
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') syncRoomsFromSheet();
    });
  });
})();

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
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) {
        link.classList.remove('active');
        return;
      }

      const target = document.querySelector(href);
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
// 2. Viewing enquiries — all payments at the property after an inspection
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  const bookingForm = document.querySelector('#booking-form');
  const viewingBtn = document.querySelector('#viewing-trigger');
  const durationInput = document.querySelector('#duration');
  const roomTypeInput = document.querySelector('#roomType');
  const amountField = document.querySelector('#quotedAmountPesewas');
  const selectedSummary = document.querySelector('#selected-room-summary');
  let pricing = window.JCH_ROOM_PRICING || {};

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

  function updateAmount() {
    if (!viewingBtn) return;
    const roomType = roomTypeInput?.value;
    const duration = durationInput?.value;
    const selectedOption = roomTypeInput?.selectedOptions?.[0];
    const amount = window.JCH_ROOM_FEED_READY && selectedOption && !selectedOption.disabled
      ? calculateAmount(roomType, duration)
      : 0;

    if (amountField) amountField.value = amount || '';
    if (selectedSummary) {
      if (amount > 0) {
        const roomCode = selectedOption.textContent.split(' - ')[0];
        const period = durationInput?.selectedOptions?.[0]?.textContent || 'selected period';
        selectedSummary.textContent = 'Selected: ' + roomCode + ' — ' +
          formatCurrency(amount) + ' for ' + period +
          '. Price and availability must be confirmed by reception. View the room before paying at the hostel.';
        selectedSummary.hidden = false;
      } else {
        selectedSummary.textContent = '';
        selectedSummary.hidden = true;
      }
    }

    viewingBtn.disabled = amount <= 0;
    viewingBtn.textContent = window.JCH_ROOM_FEED_READY
      ? 'Arrange a Viewing on WhatsApp'
      : 'Live availability unavailable — contact reception';
  }

  function selectRoom(roomValue) {
    if (!roomTypeInput) return;
    roomTypeInput.value = roomValue;
    roomTypeInput.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    durationInput?.focus();
  }

  // Preserve the live room selection and refresh behavior. No checkout is created.
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-room-value]');
    if (!button) return;
    selectRoom(button.dataset.roomValue);
  });

  document.addEventListener('jch:rooms-updated', () => {
    pricing = window.JCH_ROOM_PRICING || {};
    updateAmount();
  });
  roomTypeInput?.addEventListener('change', updateAmount);
  durationInput?.addEventListener('change', updateAmount);
  bookingForm?.addEventListener('submit', event => event.preventDefault());

  viewingBtn?.addEventListener('click', () => {
    // Fail closed: stale, sold-out and unselected rooms cannot produce a quote.
    if (!window.JCH_ROOM_FEED_READY || !roomTypeInput?.value || !durationInput?.value ||
        roomTypeInput.selectedOptions?.[0]?.disabled ||
        calculateAmount(roomTypeInput.value, durationInput.value) <= 0) {
      updateAmount();
      return;
    }
    const roomCode = roomTypeInput.selectedOptions[0].textContent.split(' - ')[0];
    const period = durationInput.selectedOptions[0]?.textContent || 'selected period';
    const message = 'Hi, I would like to arrange a viewing for Room ' + roomCode +
      ' at Jeffston Court Hostel for ' + period +
      '. Please let me know when I can come. I understand all payments are made at the hostel after viewing the room, not online.';
    const url = 'https://wa.me/233201349321?text=' + encodeURIComponent(message);
    if (window.jchTrack) window.jchTrack('Viewing enquiry opened');
    window.open(url, '_blank', 'noopener,noreferrer');
  });

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
    'Assets/images/bedroom3.jpg',
    'Assets/images/bedroom4.jpg',
    'Assets/images/bedroom5.jpg',
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
