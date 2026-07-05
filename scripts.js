// ============================================================================
// Jeffston Court Hostel interactions
// Room-level pricing and UI/UX refresh
// ============================================================================
(function () {
  'use strict';

  const WHATSAPP_BASE = 'https://wa.me/233201349321';
  const ROOMS = [{"id": "A101", "type": "Standard", "occupancy": "2/4", "rent": 5500, "status": "Available", "image": "room4"}, {"id": "A102", "type": "Standard Big", "occupancy": "0/4", "rent": 6700, "status": "Available", "image": "room4"}, {"id": "B201", "type": "General", "occupancy": "2/2", "rent": 7800, "status": "Full", "image": "room3"}, {"id": "B202", "type": "General", "occupancy": "2/3", "rent": 6700, "status": "Available", "image": "room3"}, {"id": "B203", "type": "General", "occupancy": "0/4", "rent": 6800, "status": "Available", "image": "room4"}, {"id": "C301", "type": "General", "occupancy": "2/2", "rent": 8000, "status": "Full", "image": "room3"}, {"id": "C302", "type": "Premium", "occupancy": "1/2", "rent": 6000, "status": "Available", "image": "room3"}, {"id": "C303", "type": "Premium", "occupancy": "1/3", "rent": 5500, "status": "Available", "image": "room3"}];

  const ROOM_IMAGES = {
    A101: 'Assets/images/NEW4.jpg',
    A102: 'Assets/images/NEW4.jpg',
    B201: 'Assets/images/bedroom1.jpg',
    B202: 'Assets/images/bedroom2.jpg',
    B203: 'Assets/images/NEW4.jpg',
    C301: 'Assets/images/bedroom1.jpg',
    C302: 'Assets/images/bedroom2.jpg',
    C303: 'Assets/images/bedroom2.jpg'
  };

  const uiCss = `
    html{scroll-behavior:smooth;scroll-padding-top:92px}
    body{font-family:Inter,"Segoe UI",system-ui,-apple-system,BlinkMacSystemFont,sans-serif;text-rendering:optimizeLegibility;background:linear-gradient(180deg,#fafaf9,#f3f7f4);color:#111827}
    .navbar{background:rgba(255,255,255,.92);backdrop-filter:blur(16px);box-shadow:0 10px 35px rgba(16,24,40,.10)}.navbar-inner{min-height:76px}
    .logo-text{font-size:1.1rem;background:linear-gradient(45deg,#033c22,#c99a11);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
    .nav-links a{border-radius:999px;font-weight:700}.nav-links a:hover,.nav-links a:focus,.nav-links a.active{transform:translateY(-1px)}
    .hero{min-height:calc(100svh - 76px);isolation:isolate;background:#041b10!important}.hero:after{background:radial-gradient(circle at 50% 40%,rgba(201,154,17,.23),transparent 34%),linear-gradient(110deg,rgba(3,30,17,.88),rgba(3,30,17,.42))}
    .hero-content{max-width:950px}.hero h1{font-size:clamp(2.7rem,8vw,5.8rem);letter-spacing:-.06em;text-shadow:0 16px 42px rgba(0,0,0,.35)}.hero-subtitle{font-size:clamp(1.1rem,2.5vw,1.55rem);color:#f4c542}
    .hero p:not(.hero-subtitle){max-width:720px;margin-left:auto;margin-right:auto;color:rgba(255,255,255,.92)}.hero-actions .btn{min-height:52px;padding:14px 22px;border-radius:999px}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:800;transition:transform .2s ease,box-shadow .2s ease,background .2s ease,opacity .2s ease}.btn:hover,.btn:focus{transform:translateY(-2px)}
    .btn-primary{background:linear-gradient(135deg,#043f25,#0a7c47);color:#fff;box-shadow:0 14px 28px rgba(7,100,60,.28)}.btn-primary:disabled{cursor:not-allowed;opacity:.55;transform:none;box-shadow:none}
    .hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;max-width:680px;margin:40px auto 0}.hero-stats div{padding:16px;border:1px solid rgba(255,255,255,.18);border-radius:22px;background:rgba(255,255,255,.1);backdrop-filter:blur(12px)}.hero-stats strong{display:block;color:#fff;font-size:1.35rem}.hero-stats span{display:block;color:rgba(255,255,255,.78);font-size:.86rem}
    .about-container,.facilities-grid,.rooms-grid,.contact-container{max-width:1160px}section{padding:72px 16px}section h2{font-size:clamp(2rem,5vw,3.2rem);letter-spacing:-.04em;color:#043f25}
    .about-container,.facility-box,.room-card,.booking-form,.contact-form,.contact-options,.map-container,.gallery-card{border:1px solid rgba(49,47,62,.08);border-radius:26px;box-shadow:0 10px 30px rgba(16,24,40,.08);background:#fff}
    .facility-box,.room-card,.gallery-card{transition:transform .2s ease,box-shadow .2s ease;overflow:hidden}.facility-box:hover,.room-card:hover,.gallery-card:hover{transform:translateY(-6px);box-shadow:0 18px 45px rgba(16,24,40,.14)}
    .room-card img,.gallery-card img{width:100%;aspect-ratio:4/3;object-fit:cover}.room-card figcaption{padding:20px}.room-price{color:#06633b;font-weight:900}.room-actions{padding:0 20px 20px}
    .room-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0 4px}.room-meta span{padding:10px;border-radius:14px;background:#f4f7f4;color:#334155;font-weight:800;font-size:.9rem}
    .room-status{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;font-size:.82rem;font-weight:900}.room-status.available{background:#e8f8ef;color:#06633b}.room-status.full{background:#fee4e2;color:#b42318}.room-status::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}
    .btn-whatsapp,.btn-whatsapp-small{background:#25d366;color:#fff}.btn-whatsapp:hover,.btn-whatsapp:focus,.btn-whatsapp-small:hover,.btn-whatsapp-small:focus{background:#128c7e;color:#fff}
    .booking-form{padding:28px;background:rgba(255,255,255,.96)}fieldset{border:1px solid #e4e9e4;border-radius:20px;background:#fff;padding:22px}legend{font-weight:900;color:#043f25;padding:0 8px}label{font-weight:800;color:#043f25}input,select,textarea{border-radius:14px;background:#fafaf9;padding:13px 14px;font:inherit}input:focus,select:focus,textarea:focus{border-color:#0a7c47;box-shadow:0 0 0 4px rgba(7,193,96,.16)}.error-message{display:block;min-height:1.1rem;margin-top:-10px;margin-bottom:8px;color:#b42318;font-size:.88rem;font-weight:700}
    .price-summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-radius:20px;background:linear-gradient(135deg,rgba(7,193,96,.12),rgba(244,197,66,.18));border:1px solid rgba(7,193,96,.16)}.price-summary span{color:#5d6570;font-weight:800}.price-summary strong{color:#043f25;font-size:1.12rem}
    .availability-note{max-width:860px;margin:0 auto 28px;padding:16px 20px;border-radius:20px;background:#fff8e1;border:1px solid rgba(201,154,17,.25);color:#4a3510;font-weight:800;text-align:center}
    .contact-method{border:1px solid #e9eee9;border-radius:18px;background:#fafaf9}.contact-details a{font-weight:800;color:#06633b}.whatsapp-contact a,.whatsapp-contact h4,.whatsapp-contact p{color:#fff}.map-container iframe{min-height:430px;border-radius:18px}.whatsapp-float{z-index:1200}.whatsapp-btn{min-height:58px;padding:14px 18px;border-radius:999px;box-shadow:0 12px 32px rgba(37,211,102,.40);font-weight:900}
    .toast{position:fixed;right:18px;top:18px;z-index:2000;max-width:min(360px,calc(100vw - 36px));padding:14px 16px;border-radius:14px;background:#b42318;color:#fff;box-shadow:0 16px 45px rgba(16,24,40,.18);font-weight:800}
    .payment-modal{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,.72)}.payment-modal__content{max-width:540px;width:100%;padding:32px;border-radius:28px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.22);text-align:center}.payment-modal__icon{font-size:3.4rem;margin-bottom:16px}.payment-modal__details,.payment-modal__next{margin:16px 0;padding:16px;border-radius:18px;background:#f4f6f5;text-align:left}.payment-modal__next{background:rgba(7,193,96,.10)}.payment-modal__actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:24px}
    .site-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:32px max(16px,calc((100vw - 1160px)/2));background:#043f25;color:#fff}.site-footer strong{color:#fff;font-size:1.2rem}.site-footer p{color:rgba(255,255,255,.76)}.btn-footer{background:#fff;color:#043f25}
    @media(max-width:768px){html{scroll-padding-top:76px}section{padding:56px 16px}.navbar-inner{min-height:68px}.nav-toggle{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:999px;background:#f4f6f5;border:1px solid #e9eee9}.nav-links{left:16px;right:16px;border-radius:22px}.hero{min-height:auto;padding:72px 16px}.hero-actions,.site-footer,.price-summary{flex-direction:column;align-items:stretch}.hero-actions .btn,.booking-actions .btn,.btn-footer{width:100%}.hero-stats{grid-template-columns:1fr}.room-meta{grid-template-columns:1fr}.whatsapp-btn{width:58px;height:58px;padding:0;justify-content:center}.whatsapp-text{display:none}.payment-modal__content{padding:24px}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
  `;

  function injectStyles() {
    if (document.getElementById('jch-ui-enhancements')) return;
    const style = document.createElement('style');
    style.id = 'jch-ui-enhancements';
    style.textContent = uiCss;
    document.head.appendChild(style);
  }

  function throttle(func, wait) {
    let timeout = null;
    let lastArgs = null;
    return function throttled(...args) {
      lastArgs = args;
      if (timeout) return;
      timeout = window.setTimeout(() => {
        timeout = null;
        func.apply(this, lastArgs);
      }, wait);
    };
  }

  function escapeHtml(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(amount);
  }

  function roomLabel(room) {
    return `${room.id} - ${room.type} (${room.occupancy})`;
  }

  function availableRooms() {
    return ROOMS.filter(room => room.status.toLowerCase() === 'available');
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    injectUiEnhancements();
    initMobileNavigation();
    initWhatsAppEnhancements();
    initBookingForm();
    initAnimations();
    initFormFocusStates();
    initResourcePrefetch();
  });

  function injectUiEnhancements() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !document.querySelector('.hero-stats')) {
      const stats = document.createElement('div');
      stats.className = 'hero-stats';
      stats.setAttribute('aria-label', 'Key hostel benefits');
      stats.innerHTML = '<div><strong>24/7</strong><span>security & CCTV</span></div><div><strong>Wi-Fi</strong><span>high-speed access</span></div><div><strong>Power</strong><span>generator backup</span></div>';
      heroContent.appendChild(stats);
    }

    const roomsSection = document.querySelector('#rooms');
    const roomsGrid = document.querySelector('.rooms-grid');
    if (roomsSection && !document.querySelector('.availability-note')) {
      roomsSection.querySelector('h2')?.insertAdjacentHTML('afterend', '<p class="availability-note">Room prices now follow the live room-by-room rent format. Full rooms are visible but cannot be selected for payment.</p>');
    }

    if (roomsGrid) {
      roomsGrid.innerHTML = ROOMS.map(room => {
        const isAvailable = room.status.toLowerCase() === 'available';
        const statusClass = isAvailable ? 'available' : 'full';
        const action = isAvailable
          ? `<a href="#booking" class="btn btn-primary" data-room-select="${room.id}">Book this room</a>`
          : `<a href="${WHATSAPP_BASE}?text=${encodeURIComponent('Hi, I am interested in ' + room.id + ' at Jeffston Court Hostel. Please let me know if a space opens.')}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-small">Join waitlist</a>`;
        return `<article class="room-card" role="region" aria-labelledby="room-${room.id}">
          <figure>
            <img src="${ROOM_IMAGES[room.id] || 'Assets/images/bedroom1.jpg'}" alt="${escapeHtml(roomLabel(room))} at Jeffston Court Hostel" loading="lazy">
            <figcaption>
              <h3 id="room-${room.id}">Room ${escapeHtml(room.id)}</h3>
              <p class="room-price">${formatCurrency(room.rent)} current rent</p>
              <div class="room-meta">
                <span>Type: ${escapeHtml(room.type)}</span>
                <span>Occupancy: ${escapeHtml(room.occupancy)}</span>
              </div>
              <span class="room-status ${statusClass}">${escapeHtml(room.status)}</span>
            </figcaption>
          </figure>
          <div class="room-actions">${action}</div>
        </article>`;
      }).join('');
      roomsGrid.querySelectorAll('[data-room-select]').forEach(link => {
        link.addEventListener('click', () => {
          const select = document.querySelector('#roomType');
          if (select) {
            select.value = link.dataset.roomSelect;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    }

    const locationDetails = Array.from(document.querySelectorAll('.contact-details')).find(detail => detail.textContent.includes('Adenta Court Complex'));
    if (locationDetails && !locationDetails.querySelector('a[href*="maps.app.goo.gl"]')) {
      const mapLink = document.createElement('p');
      mapLink.innerHTML = '<a href="https://maps.app.goo.gl/hcb8EMkCtQ6vAygy8?g_st=ic" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>';
      locationDetails.appendChild(mapLink);
    }

    if (!document.querySelector('.site-footer')) {
      const footer = document.createElement('footer');
      footer.className = 'site-footer';
      footer.innerHTML = '<div><strong>Jeffston Court Hostel</strong><p>Adenta Court, near Frafraha Snr. High School. Call 0554 671 081 or 0201 349 321.</p></div><a href="#booking" class="btn btn-footer">Start Booking</a>';
      document.body.appendChild(footer);
    }
  }

  function initMobileNavigation() {
    const menuBtn = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('#primary-navigation');
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));
    if (!menuBtn || !menuLinks) return;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuLinks.setAttribute('aria-hidden', 'true');

    function closeMenu() {
      menuBtn.classList.remove('toggle-active');
      menuLinks.classList.remove('nav-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuLinks.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', handleKeydown);
    }

    function openMenu() {
      menuBtn.classList.add('toggle-active');
      menuLinks.classList.add('nav-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuLinks.setAttribute('aria-hidden', 'false');
      document.addEventListener('keydown', handleKeydown);
    }

    function toggleMenu() {
      menuLinks.classList.contains('nav-open') ? closeMenu() : openMenu();
    }

    function handleKeydown(event) {
      const first = navAnchors[0];
      const last = navAnchors[navAnchors.length - 1];
      if (event.key === 'Escape') { closeMenu(); menuBtn.focus(); }
      if (event.key === 'Tab' && menuLinks.classList.contains('nav-open')) {
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }

    const onScroll = throttle(() => {
      const offsetY = window.pageYOffset;
      navAnchors.forEach(link => {
        const selector = link.getAttribute('href');
        if (!selector || !selector.startsWith('#')) return;
        const target = document.querySelector(selector);
        if (!target) return;
        const top = target.offsetTop - 120;
        const bottom = top + target.offsetHeight;
        link.classList.toggle('active', offsetY >= top && offsetY < bottom);
      });
    }, 80);

    menuBtn.addEventListener('click', toggleMenu);
    navAnchors.forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initWhatsAppEnhancements() {
    const whatsappFloat = document.getElementById('whatsapp-float');
    const toggleWhatsAppButton = throttle(() => {
      if (!whatsappFloat) return;
      const hero = document.querySelector('.hero');
      const heroHeight = hero ? hero.offsetHeight : 480;
      const showStrong = window.pageYOffset > heroHeight * 0.55;
      whatsappFloat.style.opacity = showStrong ? '1' : '0.72';
      whatsappFloat.style.transform = showStrong ? 'scale(1)' : 'scale(0.96)';
    }, 100);
    window.addEventListener('scroll', toggleWhatsAppButton, { passive: true });
    toggleWhatsAppButton();
  }

  function initBookingForm() {
    const bookingForm = document.querySelector('#booking-form');
    const payBtn = document.querySelector('#paystack-trigger');
    const durationInput = document.querySelector('#duration');
    const roomTypeInput = document.querySelector('#roomType');
    const amountField = document.querySelector('#amountInKobo');
    const bookingRefField = document.querySelector('#bookingRef');
    if (!bookingForm || !payBtn || !durationInput || !roomTypeInput) return;

    const roomLabelNode = document.querySelector('label[for="roomType"]');
    if (roomLabelNode) roomLabelNode.textContent = 'Available Room';
    roomTypeInput.innerHTML = '<option value="" disabled selected>Select Available Room</option>' + availableRooms().map(room => `<option value="${room.id}">${roomLabel(room)} - ${formatCurrency(room.rent)}</option>`).join('');

    const durationLabel = document.querySelector('label[for="duration"]');
    if (durationLabel) durationLabel.textContent = 'Payment Period';
    durationInput.innerHTML = '<option value="current-rent" selected>Current advertised rent</option>';

    let pricePreview = document.querySelector('#price-preview');
    if (!pricePreview) {
      const summary = document.createElement('div');
      summary.className = 'price-summary';
      summary.setAttribute('aria-live', 'polite');
      summary.innerHTML = '<span>Selected amount</span><strong id="price-preview">Choose a room</strong>';
      const actions = bookingForm.querySelector('.booking-actions');
      bookingForm.insertBefore(summary, actions || payBtn);
      pricePreview = summary.querySelector('#price-preview');
    }

    function selectedRoom() { return ROOMS.find(room => room.id === roomTypeInput.value); }
    function getValue(id) { return document.getElementById(id)?.value?.trim() || ''; }
    function setError(id, message) { const el = document.getElementById(`error-${id}`); if (el) el.textContent = message; }
    function clearErrors() { document.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; }); }

    function validateBookingForm(showErrors = true) {
      const fullName = getValue('fullName');
      const email = getValue('email');
      const phone = getValue('phone');
      const room = selectedRoom();
      let isValid = true;
      if (showErrors) clearErrors();
      if (!fullName) { if (showErrors) setError('fullName', 'Full name is required.'); isValid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { if (showErrors) setError('email', 'Enter a valid email address.'); isValid = false; }
      if (phone.replace(/\D/g, '').length < 9) { if (showErrors) setError('phone', 'Enter a valid phone number.'); isValid = false; }
      if (!room) { if (showErrors) setError('roomType', 'Please select an available room.'); isValid = false; }
      if (room && room.status.toLowerCase() !== 'available') { if (showErrors) setError('roomType', 'This room is full. Please choose an available room.'); isValid = false; }
      return { isValid, fullName, email, phone, room, amount: room ? room.rent * 100 : 0 };
    }

    function updateAmount() {
      const room = selectedRoom();
      if (room && room.status.toLowerCase() === 'available') {
        const amountPesewas = room.rent * 100;
        if (amountField) amountField.value = amountPesewas;
        payBtn.textContent = `Proceed to Payment - ${formatCurrency(room.rent)}`;
        payBtn.disabled = false;
        pricePreview.textContent = `${formatCurrency(room.rent)} for Room ${room.id}`;
      } else {
        if (amountField) amountField.value = '';
        payBtn.textContent = 'Proceed to Payment';
        payBtn.disabled = true;
        pricePreview.textContent = 'Choose a room';
      }
    }

    function showErrorMessage(message) {
      document.querySelector('.toast')?.remove();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'alert');
      toast.textContent = message;
      document.body.appendChild(toast);
      window.setTimeout(() => toast.remove(), 5200);
    }

    function showThankYouMessage(response, details) {
      const modal = document.createElement('div');
      modal.className = 'payment-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'payment-success-title');
      const whatsappUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(`Hi, I just completed payment for Jeffston Court Hostel. Room: ${details.room.id}. Reference: ${response.reference}`)}`;
      modal.innerHTML = `<div class="payment-modal__content"><div class="payment-modal__icon" aria-hidden="true">✅</div><h2 id="payment-success-title">Payment Successful</h2><p>Thank you for booking with Jeffston Court Hostel.</p><div class="payment-modal__details"><h3>Booking details</h3><p><strong>Name:</strong> ${escapeHtml(details.fullName)}</p><p><strong>Email:</strong> ${escapeHtml(details.email)}</p><p><strong>Room:</strong> ${escapeHtml(roomLabel(details.room))}</p><p><strong>Amount:</strong> ${formatCurrency(details.room.rent)}</p><p><strong>Reference:</strong> ${escapeHtml(response.reference || '')}</p></div><div class="payment-modal__next"><h3>Next steps</h3><p>We will confirm your booking details. Message us on WhatsApp if you need faster support.</p></div><div class="payment-modal__actions"><button type="button" class="btn btn-primary" data-close-modal>Close</button><a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">Contact on WhatsApp</a></div></div>`;
      modal.addEventListener('click', event => { if (event.target === modal || event.target.matches('[data-close-modal]')) modal.remove(); });
      document.body.appendChild(modal);
      modal.querySelector('[data-close-modal]')?.focus();
    }

    roomTypeInput.addEventListener('change', updateAmount);
    durationInput.addEventListener('change', updateAmount);
    bookingForm.addEventListener('input', () => validateBookingForm(false));

    payBtn.addEventListener('click', () => {
      const details = validateBookingForm(true);
      if (!details.isValid) { showErrorMessage('Please complete the highlighted booking fields before payment.'); return; }
      if (typeof window.PaystackPop === 'undefined') { showErrorMessage('Payment system is still loading. Please try again in a moment.'); return; }
      const handler = window.PaystackPop.setup({
        key: 'pk_live_9302b8356f0551937a496101908e2eb772328962',
        email: details.email,
        amount: details.amount,
        currency: 'GHS',
        metadata: { custom_fields: [
          { display_name: 'Full Name', value: details.fullName },
          { display_name: 'Phone Number', value: details.phone },
          { display_name: 'Room ID', value: details.room.id },
          { display_name: 'Room Type', value: details.room.type },
          { display_name: 'Occupancy', value: details.room.occupancy }
        ] },
        callback: function (response) {
          if (bookingRefField) bookingRefField.value = response.reference || '';
          showThankYouMessage(response, details);
          bookingForm.reset();
          updateAmount();
        },
        onClose: function () { showErrorMessage('Payment window closed before completion.'); }
      });
      handler.openIframe();
    });

    updateAmount();
  }

  function initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.AOS && !prefersReducedMotion) {
      window.AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 90, disable: 'mobile' });
    }
  }

  function initFormFocusStates() {
    document.querySelectorAll('form input, form select, form textarea').forEach(input => {
      input.addEventListener('focus', function () { this.closest('fieldset')?.classList.add('focused'); });
      input.addEventListener('blur', function () { this.closest('fieldset')?.classList.remove('focused'); });
    });
  }

  function initResourcePrefetch() {
    let done = false;
    function preload() {
      if (done) return;
      done = true;
      Object.values(ROOM_IMAGES).forEach(src => {
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
      });
    }
    ['mousedown', 'touchstart', 'keydown'].forEach(event => document.addEventListener(event, preload, { once: true, passive: true }));
  }
})();
