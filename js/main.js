/* ============================================================
   Vindhya Industrial Force — Main JavaScript
   Mobile nav, scroll-spy, form validation, Netlify submit,
   scroll-reveal, dynamic year.
   ============================================================ */

(function () {
  'use strict';

  // Gracefully bail if required globals are missing
  const doc = document;

  /* ---------- Mobile Navigation Drawer ---------- */
  const menuBtn = doc.getElementById('menu-btn');
  const mobileMenu = doc.getElementById('mobile-menu');

  const setDrawer = (open) => {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      setDrawer(!mobileMenu.classList.contains('is-open'));
    });

    // Close drawer when any internal link is tapped
    doc.querySelectorAll('.drawer-link, .drawer-cta a').forEach((link) => {
      link.addEventListener('click', () => setDrawer(false));
    });
  }

  /* ---------- Active Nav Link Highlight (Scroll Spy) ---------- */
  const sections = doc.querySelectorAll('main section[id]');
  const navLinks = doc.querySelectorAll('.nav-link');

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const target = link.getAttribute('href')?.slice(1);
      const isActive = target === id;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const onScroll = () => {
    if (!sections.length) return;
    const scrollPos = window.scrollY + 140; // sticky-header offset
    let currentId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    // If near the bottom, force the last section active
    if (window.innerHeight + window.scrollY >= doc.body.offsetHeight - 10) {
      currentId = sections[sections.length - 1].id;
    }

    setActiveLink(currentId);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-Reveal on Enter ---------- */
  const revealEls = doc.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Trusted By Clients Carousel (Splide) ---------- */
  if (window.Splide) {
    const clientsEl = doc.querySelector('.clients-splide');
    if (clientsEl) {
      new window.Splide(clientsEl, {
        type: 'loop',
        autoplay: true,
        interval: 3000,
        pauseOnHover: true,
        speed: 800,
        arrows: false,
        pagination: false,
        gap: '2.5rem',
        perPage: 6,
        breakpoints: {
          1280: { perPage: 5 },
          1024: { perPage: 3 },
          640: { perPage: 2 }
        }
      }).mount();
    }
  }

  /* ---------- Hero / Services Image Carousel (Swiper) ---------- */
  if (window.Swiper) {
    const heroSwiperEl = doc.querySelector('.hero-swiper');
    if (heroSwiperEl) {
      new window.Swiper(heroSwiperEl, {
        loop: true,
        speed: 800,
        spaceBetween: 0,
        grabCursor: true,
        autoplay: {
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        effect: 'fade',
        fadeEffect: { crossFade: true },
        pagination: {
          el: heroSwiperEl.querySelector('.swiper-pagination'),
          clickable: true
        },
        navigation: {
          nextEl: heroSwiperEl.querySelector('.swiper-button-next'),
          prevEl: heroSwiperEl.querySelector('.swiper-button-prev')
        },
        breakpoints: {
          768: {
            effect: 'slide',
            slidesPerView: 1,
            autoplay: {
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }
          }
        }
      });
    }
  }

  // ============================================================
  // Contact Form — validation + Netlify submit
  // ============================================================
  const form = doc.getElementById('inquiryForm');
  const submitBtn = doc.getElementById('submitBtn');
  const formAlert = doc.getElementById('formAlert');

  const setFieldError = (field, message) => {
    const group = field.closest('.field-group');
    if (!group) return;
    const errorEl = group.querySelector('.field-error');
    group.classList.toggle('is-invalid', Boolean(message));

    if (errorEl) {
      errorEl.textContent = message || '';
    }
    return !message;
  };

  const validateField = (field) => {
    const val = (field.value || '').trim();

    switch (field.id) {
      case 'name':
        if (!val) return setFieldError(field, 'Please enter your full name.');
        if (val.length < 3) return setFieldError(field, 'Name must be at least 3 characters.');
        if (!/^[a-zA-Z\s.'-]+$/.test(val)) return setFieldError(field, 'Name can only contain letters and spaces.');
        return setFieldError(field, '');

      case 'phone': {
        if (!val) return setFieldError(field, 'Please enter your phone number.');
        // Normalise: strip spaces/dashes and any +91 / leading 0 country prefix
        const digits = val.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^0/, '');
        // Indian mobile: exactly 10 digits starting 6-9
        if (!/^[6-9]\d{9}$/.test(digits)) {
          return setFieldError(field, 'Enter a valid 10-digit mobile number.');
        }
        return setFieldError(field, '');
      }

      case 'message':
        if (val && val.length < 10) return setFieldError(field, 'Message is too short (min 10 characters).');
        return setFieldError(field, '');

      case 'service':
        if (!val) return setFieldError(field, 'Please select a service.');
        return setFieldError(field, '');

      default:
        return true;
    }
  };

  if (form) {
    const fields = ['name', 'phone', 'service', 'message']
      .map((id) => doc.getElementById(id))
      .filter(Boolean);

    // Live validation once the user has attempted submission or blurred a field
    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));

      field.addEventListener('input', () => {
        if (field.closest('.field-group')?.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate all fields
      const results = fields.map((field) => validateField(field));
      const isValid = results.every(Boolean);

      if (!isValid) {
        const firstInvalid = form.querySelector('.field-group.is-invalid');
        if (firstInvalid) {
          const input = firstInvalid.querySelector('input, select, textarea');
          if (input) input.focus();
        }
        return;
      }

      // Disable button while submitting
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting… <i class="fa-solid fa-spinner fa-spin ml-2"></i>';
      }

      // Netlify AJAX-friendly POST to the same page. Netlify's
      // built-in form handling picks up the payload via the
      // "form-name" hidden field.
      const payload = new URLSearchParams(new FormData(form));

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString()
      })
        .then((res) => {
          // Netlify returns a 200 (or redirect) when accepted
          if (res.ok || res.redirected) {
            window.location.href = '/thank-you.html';
          } else {
            throw new Error('netlify-response-not-ok');
          }
        })
        .catch(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Inquiry <i class="fa-solid fa-paper-plane ml-2"></i>';
          }
          if (formAlert) {
            formAlert.classList.remove('hidden');
            formAlert.textContent =
              'Something went wrong submitting the form. Please try again or call us at +91-9425655443.';
            formAlert.classList.remove('bg-emerald-50', 'border-emerald-200', 'text-emerald-800');
            formAlert.classList.add('bg-red-50', 'border-red-200', 'text-red-700');
          }
        });
    });
  }

  /* ---------- Dynamic Copyright Year ---------- */
  const yearEl = doc.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();