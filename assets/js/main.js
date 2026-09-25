/* ==========================================================================
   Cosa CRM — site behaviour
   ==========================================================================
   ▼▼▼ EDIT THIS BLOCK — it's the only place you need to change links ▼▼▼ */

const CONFIG = {
  // Your white-labelled GoHighLevel login URL, e.g. 'https://app.cosacrm.com'
  loginUrl:  'https://app.cosacrm.com',

  // Business contact details (leave blank to hide the button)
  phone:     '',            // e.g. '+15551234567'
  phoneText: '',            // e.g. '(555) 123-4567'
  email:     'admin@cosaventures.com',   // e.g. 'hello@cosacrm.com'

  // Where the demo form posts. Leave blank for demo mode (shows a success
  // message without sending anything). Options:
  //   • A GHL inbound webhook URL   -> 'https://services.leadconnectorhq.com/hooks/…'
  //   • A Formspree endpoint        -> 'https://formspree.io/f/xxxxxxx'
  //   • Your own endpoint accepting JSON POST
  formEndpoint: '',

  // Optional: send visitors here after a successful submit ('' = stay put)
  thankYouUrl: ''
};

/* ▲▲▲ END EDIT BLOCK ▲▲▲ ================================================= */


(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------------------------------------------------------------- config
     Apply CONFIG to every [data-link] element on the page. */
  function applyConfig() {
    $$('[data-link="login"]').forEach(el => {
      if (CONFIG.loginUrl) {
        el.href = CONFIG.loginUrl;
        el.target = '_blank';
        el.rel = 'noopener';
      } else {
        el.hidden = true;                        // no portal URL set
      }
    });

    $$('[data-link="phone"]').forEach(el => {
      if (CONFIG.phone) {
        el.href = 'tel:' + CONFIG.phone.replace(/[^\d+]/g, '');
        const label = el.querySelector('em');
        if (label) label.textContent = CONFIG.phoneText || CONFIG.phone;
      } else {
        el.hidden = true;
      }
    });

    $$('[data-link="email"]').forEach(el => {
      if (CONFIG.email) {
        el.href = 'mailto:' + CONFIG.email;
        const label = el.querySelector('em');
        if (label) label.textContent = CONFIG.email;
      } else {
        el.hidden = true;
      }
    });
  }

  /* ------------------------------------------------------------------- nav */
  function initNav() {
    const nav    = $('#nav');
    const toggle = $('#navToggle');
    const links  = $('#navLinks');
    if (!nav || !toggle || !links) return;

    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const close = () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    links.addEventListener('click', e => {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) close();
    });
  }

  /* -------------------------------------------------------- scroll reveal */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------ animated counts */
  function initCounters() {
    const nodes = $$('[data-count]');
    if (!nodes.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = (el, value) => {
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix   = el.dataset.prefix || '';
      const suffix   = el.dataset.suffix || '';
      el.textContent = prefix + value.toFixed(decimals) + suffix;
    };

    const run = el => {
      const target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      if (reduce || !('requestAnimationFrame' in window)) { render(el, target); return; }

      const duration = 1400;
      let start = null;

      const tick = now => {
        if (start === null) start = now;
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
        render(el, target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    nodes.forEach(el => io.observe(el));
  }

  /* --------------------------------------------------------- one-open FAQ */
  function initFaq() {
    const items = $$('.faq__item');
    items.forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach(other => { if (other !== item) other.open = false; });
      });
    });
  }

  /* ------------------------------------------------------------ demo form */
  function initForm() {
    const form   = $('#demoForm');
    const status = $('#formStatus');
    if (!form) return;

    const setError = (field, message) => {
      const wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.add('is-invalid');
      if (!wrap.querySelector('.err')) {
        const span = document.createElement('span');
        span.className = 'err';
        span.textContent = message;
        wrap.appendChild(span);
      }
    };

    const clearErrors = () => {
      $$('.field.is-invalid', form).forEach(wrap => {
        wrap.classList.remove('is-invalid');
        const err = wrap.querySelector('.err');
        if (err) err.remove();
      });
    };

    const validate = () => {
      clearErrors();
      let ok = true;

      const name = form.elements.name;
      if (!name.value.trim()) { setError(name, 'Please enter your name.'); ok = false; }

      const email = form.elements.email;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        setError(email, 'Please enter a valid email.'); ok = false;
      }

      const phone = form.elements.phone;
      if (phone.value.replace(/\D/g, '').length < 7) {
        setError(phone, 'Please enter a valid phone number.'); ok = false;
      }

      return ok;
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      if (!validate()) {
        status.className = 'form-status bad';
        status.textContent = 'Please fix the highlighted fields.';
        const firstBad = $('.field.is-invalid input, .field.is-invalid select', form);
        if (firstBad) firstBad.focus();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.page = window.location.href;

      try {
        if (CONFIG.formEndpoint) {
          const res = await fetch(CONFIG.formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Request failed with status ' + res.status);
        } else {
          // Demo mode — no endpoint configured yet.
          console.info('[Cosa CRM] No formEndpoint set in CONFIG. Payload:', payload);
          await new Promise(r => setTimeout(r, 550));
        }

        if (CONFIG.thankYouUrl) { window.location.href = CONFIG.thankYouUrl; return; }

        form.reset();
        status.className = 'form-status ok';
        status.textContent = CONFIG.formEndpoint
          ? "Thanks — we've got it. Expect a reply within one business day."
          : 'Demo mode: set CONFIG.formEndpoint in assets/js/main.js to receive submissions.';
      } catch (err) {
        console.error(err);
        status.className = 'form-status bad';
        status.textContent = 'Something went wrong. Please email us instead.';
      } finally {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
    });

    // Clear a field's error as soon as the user edits it.
    form.addEventListener('input', e => {
      const wrap = e.target.closest('.field.is-invalid');
      if (!wrap) return;
      wrap.classList.remove('is-invalid');
      const err = wrap.querySelector('.err');
      if (err) err.remove();
    });
  }

  /* ------------------------------------------------------------ misc bits */
  function initYear() {
    const el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ go! */
  function init() {
    applyConfig();
    initNav();
    initReveal();
    initCounters();
    initFaq();
    initForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
