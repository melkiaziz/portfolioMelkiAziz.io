document.addEventListener('DOMContentLoaded', () => {
  // Update year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Detect mobile device
  const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  };

  /* ── 1. Tech Bootloader / Loader ─────────────────────────────────────────── */
  const loader = document.getElementById('loader');
  const loaderContent = document.getElementById('loader-content');
  
  const bootLines = [
    { text: '[SYS_INIT] Initialisation du noyau Aziz.dev...', type: 'info' },
    { text: '[SYS_INIT] Chargement des configurations système...', type: 'info' },
    { text: '[SQL_CONN] Connexion à la base de données PostgreSQL...', type: 'accent' },
    { text: '[SQL_CONN] Succès. Pool de connexions disponible.', type: 'success' },
    { text: '[BI_MODULE] Indexation des schémas d\'entrepôts de données...', type: 'accent' },
    { text: '[BI_MODULE] Chargement des dashboards Power BI...', type: 'info' },
    { text: '[WEB_MODULE] Initialisation du runtime Angular & Node.js...', type: 'info' },
    { text: '[BLOCKCHAIN] Compilation des Smart Contracts Solidity...', type: 'accent' },
    { text: '[BLOCKCHAIN] Réseau Ethereum local : connecté.', type: 'success' },
    { text: '[SYSTEM] Initialisation de l\'interface visuelle de particules...', type: 'info' },
    { text: '[SYSTEM] Melki Mohamed Aziz - Portfolio v2.0 est en ligne.', type: 'success' }
  ];

  let lineIdx = 0;
  function printLoaderLines() {
    if (lineIdx < bootLines.length) {
      const lineData = bootLines[lineIdx];
      const lineDiv = document.createElement('div');
      lineDiv.className = 'loader-line';
      if (lineData.type === 'accent') lineDiv.classList.add('accent');
      if (lineData.type === 'success') lineDiv.classList.add('success');
      
      lineDiv.innerHTML = `<span style="color:#6b7280;margin-right:8px;">&gt;</span>${lineData.text}`;
      loaderContent.appendChild(lineDiv);
      
      // Auto scroll
      loaderContent.scrollTop = loaderContent.scrollHeight;
      lineIdx++;
      setTimeout(printLoaderLines, Math.random() * 150 + 80);
    }
  }

  // Start printing boot lines
  if (loaderContent) {
    printLoaderLines();
  }

  // Force dismiss loader after 2.5s
  setTimeout(() => {
    if (loader) {
      loader.classList.add('fade-out');
      // Trigger skill bars animation after loader fades out
      setTimeout(initSkillsAnimate, 600);
    }
  }, 2600);


  /* ── 2. Custom kinetic cursor ────────────────────────────────────────────── */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  if (cursorDot && cursorRing && !isTouchDevice()) {
    document.body.classList.add('custom-cursor-active');
    cursorDot.style.display = 'block';
    cursorRing.style.display = 'block';

    document.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      
      // Set CSS variables for spotlight gradients
      document.documentElement.style.setProperty('--mouse-x', `${targetMouseX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${targetMouseY}px`);
    });

    // Lerp loop for fluid trailing effect
    const tickCursor = () => {
      // Direct placement for dot
      mouseX = targetMouseX;
      mouseY = targetMouseY;
      
      // Lerp for outer ring
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
      
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(tickCursor);
    };
    tickCursor();

    // Hover effect on links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .cert-card, .highlight-box, .filter-btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }


  /* ── 3. Neural Data Constellation Particles (Canvas) ─────────────────────── */
  const canvas = document.getElementById('data-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      createParticles();
    });

    class Particle {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.baseColor = Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(168, 85, 247, ';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce borders
        if (this.x < 0 || this.x > w) this.vx = -this.vx;
        if (this.y < 0 || this.y > h) this.vy = -this.vy;

        // React to mouse slightly
        if (!isTouchDevice()) {
          const dx = targetMouseX - this.x;
          const dy = targetMouseY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            // Smooth repulsion
            const force = (120 - dist) / 120;
            this.x -= dx / dist * force * 0.5;
            this.y -= dy / dist * force * 0.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor + '0.4)';
        ctx.fill();
      }
    }

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor(w / 14), 100);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (100 - dist) / 100 * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      connectParticles();
      animationId = requestAnimationFrame(loop);
    }

    createParticles();
    loop();
  }


  /* ── 4. Scrolling Navbar & Active Spy ─────────────────────────────────────── */
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


  /* ── 8. Mobile Navigation Toggle ─────────────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinksWrap = document.querySelector('.nav-links-wrap');

  if (navToggle && navLinksWrap) {
    navToggle.addEventListener('click', () => {
      // Simple toggle implementation for mobile
      if (navLinksWrap.style.display === 'flex') {
        navLinksWrap.style.display = 'none';
        navToggle.textContent = '☰';
      } else {
        navLinksWrap.style.display = 'flex';
        navLinksWrap.style.flexDirection = 'column';
        navLinksWrap.style.position = 'absolute';
        navLinksWrap.style.top = '100%';
        navLinksWrap.style.left = '0';
        navLinksWrap.style.right = '0';
        navLinksWrap.style.background = 'rgba(5, 7, 20, 0.95)';
        navLinksWrap.style.border = '1px solid var(--glass-border)';
        navLinksWrap.style.borderRadius = '16px';
        navLinksWrap.style.padding = '1.5rem';
        navLinksWrap.style.marginTop = '0.5rem';
        navLinksWrap.style.gap = '1rem';
        navToggle.textContent = '✕';
      }
    });

    // Close menu when clicking links on mobile
    const links = navLinksWrap.querySelectorAll('a');
    links.forEach(l => {
      l.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinksWrap.style.display = 'none';
          navToggle.textContent = '☰';
        }
      });
    });
  }

  /* ── 9. Card 3D Tilt Effect ──────────────────────────────────────────────── */
  const cards = document.querySelectorAll('.project-card, .cert-card');
  if (cards.length > 0 && !isTouchDevice()) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = x - xc;
        const dy = y - yc;
        
        // Rotate maximum 6 degrees
        const rx = -(dy / yc) * 6;
        const ry = (dx / xc) * 6;
        
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }
});
