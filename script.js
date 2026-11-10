document.addEventListener('DOMContentLoaded', () => {
  // Update year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ── 1. Scrolling Navbar ──────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link-item');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Scrollspy via Intersection Observer
  if ('IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach(sec => spyObserver.observe(sec));
  }


  /* ── 5. Project Filters ──────────────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filterVal === 'all' || category === filterVal) {
          // Fade in
          card.classList.remove('hidden');
          setTimeout(() => {
            card.classList.remove('fade-out');
          }, 50);
        } else {
          // Fade out
          card.classList.add('fade-out');
          card.addEventListener('transitionend', function hideCard(e) {
            if (e.propertyName === 'opacity' && card.classList.contains('fade-out')) {
              card.classList.add('hidden');
              card.removeEventListener('transitionend', hideCard);
            }
          });
        }
      });
    });
  });


  /* ── 6. Skill Bars Animation on Scroll ───────────────────────────────────── */
  const skillBars = document.querySelectorAll('.skill-bar-inner');
  
  function initSkillsAnimate() {
    if ('IntersectionObserver' in window) {
      const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const percentage = bar.getAttribute('data-val');
            bar.style.width = percentage;
            skillsObserver.unobserve(bar);
          }
        });
      }, { threshold: 0.1 });

      skillBars.forEach(bar => skillsObserver.observe(bar));
    } else {
      // Fallback
      skillBars.forEach(bar => {
        bar.style.width = bar.getAttribute('data-val');
      });
    }
  }

  document.addEventListener('portfolio:ready', initSkillsAnimate, { once: true });


  /* ── 7. AJAX Contact Form ────────────────────────────────────────────────── */
  const form = document.getElementById('portfolio-form');
  const formStatus = document.getElementById('form-status');

  if (form && formStatus) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      
      formStatus.className = 'form-status-msg';
      formStatus.textContent = '[SYSTEM] Envoi du message en cours...';
      formStatus.style.display = 'block';

      fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          formStatus.className = 'form-status-msg success';
          formStatus.textContent = '[SUCCESS] Message envoyé ! Je vous répondrai très prochainement.';
          form.reset();
        } else {
          response.json().then(data => {
            if (Object.hasOwn(data, 'errors')) {
              formStatus.className = 'form-status-msg error';
              formStatus.textContent = '[ERROR] ' + data.errors.map(error => error.message).join(', ');
            } else {
              formStatus.className = 'form-status-msg error';
              formStatus.textContent = '[ERROR] Une erreur s\'est produite. Veuillez réessayer.';
            }
          });
        }
      })
      .catch(error => {
        formStatus.className = 'form-status-msg error';
        formStatus.textContent = '[ERROR] Erreur réseau. Veuillez vérifier votre connexion.';
      });
    });
  }


  /* ── 2. Mobile Navigation ─────────────────────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinksWrap = document.querySelector('.nav-links-wrap');

  if (navToggle && navLinksWrap) {
    function setMenuOpen(isOpen) {
      navLinksWrap.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu principal' : 'Ouvrir le menu principal');
      navToggle.textContent = isOpen ? '×' : '☰';
    }

    setMenuOpen(false);
    navToggle.addEventListener('click', () => {
      setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    navLinksWrap.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 700) setMenuOpen(false);
    }, { passive: true });
  }
});
