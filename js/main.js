/* ============================================================
   Vindhya Industrial Force — Enterprise JavaScript
   Navbar scroll, mobile menu, scroll-spy, scroll-reveal,
   Netlify form validation & submit, dynamic year.
   ============================================================ */

(function () {
  'use strict';

  const doc = document;

  /* ---------- Navbar: solid background on scroll ---------- */
  const navbar = doc.getElementById('navbar');

  const onNavScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ---------- Mobile Navigation Menu ---------- */
  const hamburger = doc.getElementById('hamburger');
  const navLinks = doc.getElementById('navLinks');

  const closeMenu = () => {
    if (!navLinks || !hamburger) return;
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    if (!navLinks || !hamburger) return;
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', toggleMenu);

    // Close the menu when any internal link is tapped
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close when the viewport grows back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991) closeMenu();
    });
  }

  /* ---------- Scroll-Spy: Active Nav Link Highlight ---------- */
  const sections = doc.querySelectorAll('section[id]');
  const linkEls = Array.from(doc.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)'));

  const setActiveLink = (id) => {
    linkEls.forEach((link) => {
      const target = link.getAttribute('href').slice(1);
      const isActive = target === id;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const onScrollSpy = () => {
    if (!sections.length) return;
    const scrollPos = window.scrollY + 120;
    let currentId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    if (window.innerHeight + window.scrollY >= doc.body.offsetHeight - 10) {
      currentId = sections[sections.length - 1].id;
    }

    setActiveLink(currentId);
  };

  window.addEventListener('scroll', onScrollSpy, { passive: true });
  onScrollSpy();

  /* ---------- Scroll-Reveal on Enter ---------- */
  const revealEls = doc.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ============================================================
     Contact Form — validation + Netlify submit
     ============================================================ */
  const form = doc.getElementById('inquiryForm');
  const submitBtn = doc.getElementById('submitBtn');
  const formAlert = doc.getElementById('formAlert');

  const setFieldError = (field, message) => {
    const group = field.closest('.field-group');
    if (!group) return true;
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
        const digits = val.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^0/, '');
        if (!/^[6-9]\d{9}$/.test(digits)) {
          return setFieldError(field, 'Enter a valid 10-digit mobile number.');
        }
        return setFieldError(field, '');
      }

      case 'service':
        if (!val) return setFieldError(field, 'Please select a service.');
        return setFieldError(field, '');

      case 'message':
        if (val && val.length < 10) return setFieldError(field, 'Message is too short (min 10 characters).');
        return setFieldError(field, '');

      default:
        return true;
    }
  };

  const showAlert = (type, message) => {
    if (!formAlert) return;
    formAlert.classList.remove('success', 'error', 'show');
    // Force reflow so the class re-triggers between submits
    void formAlert.offsetWidth;
    formAlert.textContent = message;
    formAlert.classList.add(type, 'show');
  };

  const hideAlert = () => {
    if (formAlert) {
      formAlert.classList.remove('success', 'error', 'show');
    }
  };

  if (form) {
    const fields = ['name', 'phone', 'service', 'message']
      .map((id) => doc.getElementById(id))
      .filter(Boolean);

    // Live validation once the user has blurred a field or attempted submission
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
      hideAlert();

      const results = fields.map((field) => validateField(field));
      const isValid = results.every(Boolean);

      if (!isValid) {
        const firstInvalid = form.querySelector('.field-group.is-invalid');
        if (firstInvalid) {
          const input = firstInvalid.querySelector('input, select, textarea');
          if (input) input.focus();
        }
        showAlert('error', 'Please fix the highlighted fields and try again.');
        return;
      }

      // Disable button while submitting
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting… <i class="fa-solid fa-spinner fa-spin"></i>';
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
          if (res.ok || res.redirected) {
            window.location.href = '/thank-you.html';
          } else {
            throw new Error('netlify-response-not-ok');
          }
        })
        .catch(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Inquiry <i class="fa-solid fa-paper-plane"></i>';
          }
          showAlert('error', 'Something went wrong submitting the form. Please try again or call us at +91-9425655443.');
        });
    });
  }

  /* ---------- Dynamic Copyright Year ---------- */
  const yearEl = doc.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();