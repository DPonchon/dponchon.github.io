/**
 * SaSa Cerámica — main.js
 * Vanilla ES6+. Sin dependencias externas.
 */

(function () {
  'use strict';

  /* ─── ELEMENTOS ─────────────────────────────────── */
  const header      = document.getElementById('header');
  const hamburger   = document.querySelector('.hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const overlay     = mobileMenu?.querySelector('.mobile-menu__overlay');
  const mobileLinks = mobileMenu?.querySelectorAll('.mobile-nav-link');
  const navLinks    = document.querySelectorAll('.nav-link:not(.nav-link--ig)');
  const sections    = document.querySelectorAll('main section[id]');

  /* ─── 1. NAVBAR SCROLL EFFECT ────────────────────── */
  let lastScrollY    = 0;
  let isMobile       = window.innerWidth < 768;
  let ticking        = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  function updateNavbar() {
    const scrollY = window.scrollY;

    // Clase .scrolled (fondo blur)
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Mobile: ocultar al bajar, mostrar al subir
    if (isMobile && !mobileMenu.classList.contains('is-open')) {
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      if (direction === 'down' && scrollY > 150) {
        header.classList.add('nav-hidden');
        header.classList.remove('nav-visible');
      } else if (direction === 'up') {
        header.classList.remove('nav-hidden');
        header.classList.add('nav-visible');
      }
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  window.addEventListener('resize', () => {
    isMobile = window.innerWidth < 768;
    if (!isMobile) {
      // Asegurar que el nav sea visible en desktop
      header.classList.remove('nav-hidden');
    }
  });


  /* ─── 2. MOBILE MENU ─────────────────────────────── */
  function openMenu() {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    // Mostrar navbar si estaba oculto
    header.classList.remove('nav-hidden');
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  overlay?.addEventListener('click', closeMenu);

  mobileLinks?.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });


  /* ─── 3. SMOOTH SCROLL CON OFFSET ───────────────── */
  function getNavbarHeight() {
    const barHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--envios-bar-height') || '36'
    );
    return (header?.offsetHeight || 64) + barHeight;
  }

  function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - getNavbarHeight() - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const targetId = href.slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      smoothScrollTo(targetId);
    });
  });


  /* ─── 4. SCROLL ANIMATIONS (IntersectionObserver) ── */
  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          animateObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    animateObserver.observe(el);
  });


  /* ─── 5. ACTIVE NAV LINK ─────────────────────────── */
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.remove('active');

          if (id === 'hero' && (href === '#' || href === '#hero')) {
            link.classList.add('active');
          } else if (href === `#${id}`) {
            link.classList.add('active');
          }
        });
      });
    },
    {
      threshold: 0,
      rootMargin: '-45% 0px -45% 0px',
    }
  );

  // Hero section is special — use the body/window
  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Activar "Inicio" al llegar al top
  window.addEventListener('scroll', () => {
    if (window.scrollY < 100) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#') {
          link.classList.add('active');
        }
      });
    }
  }, { passive: true });


  /* ─── 6. IMAGE SWAP — TOUCH TOGGLE ─────────────── */
  // Para dispositivos táctiles: toggle al tocar la tarjeta
  document.querySelectorAll('.producto-card__image-wrap.has-result').forEach(wrap => {
    // Crear botón toggle mobile
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'producto-card__toggle';
    toggleBtn.setAttribute('aria-label', 'Ver resultado del rodillo');
    toggleBtn.innerHTML = '✨ Ver resultado';
    wrap.appendChild(toggleBtn);

    let isShowingResult = false;

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isShowingResult = !isShowingResult;

      if (isShowingResult) {
        wrap.classList.add('show-result');
        toggleBtn.innerHTML = '← Ver rodillo';
        toggleBtn.setAttribute('aria-label', 'Ver el rodillo');
      } else {
        wrap.classList.remove('show-result');
        toggleBtn.innerHTML = '✨ Ver resultado';
        toggleBtn.setAttribute('aria-label', 'Ver resultado del rodillo');
      }
    });
  });


  /* ─── 7. GOOGLE ANALYTICS — EVENT TRACKING ─────── */
  function gaEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }

  // Click en botón Instagram de cada tarjeta de producto
  document.querySelectorAll('.btn--instagram').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.producto-card');
      const productName = card?.querySelector('.producto-card__name')?.textContent?.trim() || 'Desconocido';
      gaEvent('consulta_instagram', {
        event_category: 'conversion',
        event_label: productName,
        product_name: productName,
      });
    });
  });

  // Click en WhatsApp de cada tarjeta de producto
  document.querySelectorAll('.btn--whatsapp').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.producto-card');
      const productName = card?.querySelector('.producto-card__name')?.textContent?.trim() || 'Desconocido';
      gaEvent('consulta_whatsapp', {
        event_category: 'conversion',
        event_label: productName,
        product_name: productName,
      });
    });
  });

  // Click en CTA WhatsApp principal de contacto
  document.querySelector('.btn--wa-main')?.addEventListener('click', () => {
    gaEvent('cta_principal_whatsapp', {
      event_category: 'conversion',
      event_label: 'Sección Contacto',
    });
  });

  // Click en CTA principal de contacto (Instagram)
  document.querySelector('.btn--ig-main')?.addEventListener('click', () => {
    gaEvent('cta_principal_instagram', {
      event_category: 'conversion',
      event_label: 'Sección Contacto',
    });
  });

  // Click en Instagram desde navbar / footer
  document.querySelectorAll('.nav-link--ig, .footer__ig').forEach(btn => {
    btn.addEventListener('click', () => {
      gaEvent('instagram_navegacion', {
        event_category: 'engagement',
        event_label: btn.classList.contains('nav-link--ig') ? 'navbar' : 'footer',
      });
    });
  });

  // Scroll hasta sección Productos (señal de interés)
  const productosSection = document.getElementById('productos');
  if (productosSection) {
    let productosTracked = false;
    const productosObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !productosTracked) {
        productosTracked = true;
        gaEvent('seccion_vista', { event_category: 'engagement', event_label: 'productos' });
        productosObserver.disconnect();
      }
    }, { threshold: 0.3 });
    productosObserver.observe(productosSection);
  }

  // Scroll hasta sección Contacto (alta intención)
  const contactoSection = document.getElementById('contacto');
  if (contactoSection) {
    let contactoTracked = false;
    const contactoObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !contactoTracked) {
        contactoTracked = true;
        gaEvent('seccion_vista', { event_category: 'engagement', event_label: 'contacto' });
        contactoObserver.disconnect();
      }
    }, { threshold: 0.5 });
    contactoObserver.observe(contactoSection);
  }


  /* ─── 8. INIT ────────────────────────────────────── */
  // Activar las animaciones del hero inmediatamente (ya en viewport)
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero .animate-on-scroll').forEach(el => {
      setTimeout(() => el.classList.add('animated'), 100);
    });
  });

})();
