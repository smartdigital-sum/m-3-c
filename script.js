// =============================================
//  Elegant Salon & Spa — script.js
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  function getContactValue(raw, type) {
    const value = String(raw || '');
    if (type === 'phone') {
      return value.replace(/^tel:/i, '').replace(/^https?:\/\/wa\.me\//i, '').replace(/\D/g, '');
    }
    if (type === 'email') {
      return value.replace(/^mailto:/i, '').trim();
    }
    return value.trim();
  }

  function openWhatsAppDraft(rawPhone, lines) {
    const phone = getContactValue(rawPhone, 'phone');
    if (!phone) return;
    const text = encodeURIComponent(lines.filter(Boolean).join('\n'));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener');
  }

  function openEmailDraft(rawEmail, subject, lines) {
    const email = getContactValue(rawEmail, 'email');
    if (!email) return;
    const body = encodeURIComponent(lines.filter(Boolean).join('\n'));
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
  }


  // ── LOADER ──────────────────────────────────
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      showPromoModal();
    }, 1200);
  });

  // ── PROMO MODAL ─────────────────────────────
  function showPromoModal() {
    if (sessionStorage.getItem('promoSeen')) return;
    const modal = document.getElementById('promoModal');
    setTimeout(() => {
      modal.classList.add('active');
      sessionStorage.setItem('promoSeen', '1');
    }, 1800);
  }

  window.closeModal = function () {
    document.getElementById('promoModal')?.classList.remove('active');
  };

  const closePromoBtn = document.getElementById('closePromo');
  closePromoBtn && closePromoBtn.addEventListener('click', closeModal);

  document.getElementById('promoModal')?.querySelector('.promo-backdrop')
    ?.addEventListener('click', closeModal);

  // ── NAVBAR ──────────────────────────────────
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 500);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ── ACTIVE NAV LINK ─────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = { threshold: 0.3 };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.querySelectorAll('a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);
  sections.forEach(s => sectionObserver.observe(s));

  // ── SCROLL REVEAL ───────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(
    '.stat, .team-card, .service-card, .gallery-item, .pricing-card, .perk, .contact-card, .testimonial-card, .about-text, .section-title, .section-eyebrow'
  ).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });

  document.querySelector('head').insertAdjacentHTML('beforeend', `
    <style>
      .in-view { opacity: 1 !important; transform: translateY(0) !important; }
      .nav-links a.active { color: var(--gold) !important; }
    </style>
  `);

  // Stagger children in grids
  ['team-grid', 'services-grid', 'pricing-grid', 'gallery-grid'].forEach(cls => {
    document.querySelectorAll(`.${cls} > *`).forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  // ── BUSINESS STATUS ─────────────────────────
  function updateBusinessStatus() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const hour = now.getHours();
    const isOpen = day >= 1 && day <= 6
      ? (hour >= 9 && hour < 20)
      : (hour >= 10 && hour < 18);
    const el = document.getElementById('businessStatus');
    if (el) {
      el.textContent = isOpen
        ? 'Open Now · Mon–Sat 9AM–8PM'
        : 'Closed · Opens ' + (day === 0 ? 'Mon at 9AM' : 'at 10AM Sun');
      el.style.color = isOpen ? '#4ade80' : '#f87171';
    }
  }
  updateBusinessStatus();

  // ── GALLERY FILTER + LIGHTBOX ────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.style.display = match ? '' : 'none';
      });
    });
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  let lightboxImages = [];
  let currentLbIndex = 0;

  function buildLightboxImages() {
    lightboxImages = [];
    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      if (img) lightboxImages.push({ src: img.src, alt: img.alt });
    });
  }
  buildLightboxImages();

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentLbIndex = index;
      lbImage.src = lightboxImages[index].src;
      lbImage.alt = lightboxImages[index].alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  document.getElementById('lbClose')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.getElementById('lbPrev')?.addEventListener('click', () => {
    currentLbIndex = (currentLbIndex - 1 + lightboxImages.length) % lightboxImages.length;
    lbImage.src = lightboxImages[currentLbIndex].src;
  });

  document.getElementById('lbNext')?.addEventListener('click', () => {
    currentLbIndex = (currentLbIndex + 1) % lightboxImages.length;
    lbImage.src = lightboxImages[currentLbIndex].src;
  });

  function closeLightbox() {
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lbPrev')?.click();
    if (e.key === 'ArrowRight') document.getElementById('lbNext')?.click();
  });

  // ── TESTIMONIALS SLIDER ──────────────────────
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('tDots');
  const cards = track?.querySelectorAll('.testimonial-card');
  let currentSlide = 0;
  let autoSlide;

  if (cards && cards.length) {
    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'dot t-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer?.appendChild(dot);
    });

    function goToSlide(n) {
      currentSlide = (n + cards.length) % cards.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dotsContainer?.querySelectorAll('.t-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
      });
    }

    document.getElementById('tPrev')?.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      resetAuto();
    });
    document.getElementById('tNext')?.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      resetAuto();
    });

    function startAuto() {
      autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }
    function resetAuto() {
      clearInterval(autoSlide);
      startAuto();
    }
    startAuto();

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
        resetAuto();
      }
    });
  }

  // ── BOOKING FORM ─────────────────────────────
  const bookingForm = document.getElementById('bookingForm');
  bookingForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = bookingForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    openWhatsAppDraft(
      document.querySelector('.booking-contact-links a[href*="wa.me"]')?.getAttribute('href') ||
      document.querySelector('a[href*="wa.me"]')?.getAttribute('href'),
      [
        'Hello Elegant Salon & Spa,',
        '',
        'I would like to request an appointment.',
        `Name: ${document.getElementById('b-name')?.value.trim() || ''}`,
        `Email: ${document.getElementById('b-email')?.value.trim() || ''}`,
        `Phone: ${document.getElementById('b-phone')?.value.trim() || ''}`,
        `Service: ${document.getElementById('b-service')?.value || ''}`,
        `Preferred Date: ${document.getElementById('b-date')?.value || ''}`,
        `Preferred Time: ${document.getElementById('b-time')?.value || ''}`,
        document.getElementById('b-notes')?.value.trim() ? `Special Requests: ${document.getElementById('b-notes').value.trim()}` : ''
      ]
    );
    setTimeout(() => {
      bookingForm.style.display = 'none';
      const success = document.getElementById('bookingSuccess');
      success.innerHTML = '<i class="fas fa-check-circle"></i> WhatsApp draft opened! Send the message to complete your booking request.';
      success.style.display = 'flex';
    }, 1200);
  });

  // Set min date to today
  const dateInput = document.getElementById('b-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // ── CONTACT FORM ─────────────────────────────
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    btn.disabled = true;
    const inputs = contactForm.querySelectorAll('input, textarea');
    openEmailDraft(
      document.querySelector('.contact-card a[href^="mailto:"]')?.getAttribute('href'),
      inputs[2]?.value.trim() || 'Salon Website Inquiry',
      [
        'Hello Elegant Salon & Spa,',
        '',
        `Name: ${inputs[0]?.value.trim() || ''}`,
        `Email: ${inputs[1]?.value.trim() || ''}`,
        '',
        inputs[3]?.value.trim() || ''
      ]
    );
    setTimeout(() => {
      contactForm.reset();
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.disabled = false;
      const success = document.getElementById('contactSuccess');
      success.innerHTML = '<i class="fas fa-check-circle"></i> Email draft opened! Send it from your mail app to finish your inquiry.';
      success.style.display = 'flex';
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }, 1400);
  });

  // ── NEWSLETTER FORM ───────────────────────────
  document.getElementById('newsletterForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();
    if (!email) return;
    
    openWhatsAppDraft(
      document.querySelector('.booking-contact-links a[href*="wa.me"]')?.getAttribute('href') ||
      document.querySelector('a[href*="wa.me"]')?.getAttribute('href'),
      [
        'Hello Elegant Salon & Spa,',
        '',
        'I would like to subscribe to the newsletter:',
        `Email: ${email}`
      ]
    );
    
    const success = document.getElementById('newsletterSuccess');
    success.style.display = 'flex';
    form.reset();
    setTimeout(() => { success.style.display = 'none'; }, 5000);
  });

  // ── BACK TO TOP ───────────────────────────────
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── SMOOTH SCROLL ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── PARALLAX HERO ────────────────────────────
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `scale(1) translateY(${scrolled * 0.25}px)`;
      }
    }, { passive: true });
  }

  // ── NUMBER COUNTER ANIMATION ─────────────────
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('strong').forEach(el => {
          const text = el.textContent.trim();
          const num = parseInt(text.replace(/\D/g, ''));
          const suffix = text.replace(/[\d]/g, '');
          if (!isNaN(num)) {
            animateCounter(el, num, suffix);
          }
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) statsObserver.observe(statsStrip);

  function animateCounter(el, target, suffix) {
    let current = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  }

});
