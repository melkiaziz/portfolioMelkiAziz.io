import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollExperience() {
  const sections = [...document.querySelectorAll('main > section[id]')];
  const progress = document.createElement('div');
  const progressBar = document.createElement('span');
  progress.className = 'scroll-progress';
  progress.id = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.append(progressBar);
  document.body.append(progress);

  gsap.to(progressBar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.15 }
  });

  const title = document.querySelector('#home h1');
  const animatedName = title?.querySelector('span');
  if (title && animatedName) {
    const fullTitle = title.innerText.replace(/\s+/g, ' ').trim();
    const name = animatedName.textContent;
    title.setAttribute('aria-label', fullTitle);
    animatedName.setAttribute('aria-hidden', 'true');
    animatedName.replaceChildren(...name.split(' ').flatMap((word, index) => {
      const wordElement = document.createElement('span');
      wordElement.className = 'hero-word';
      wordElement.append(...Array.from(word, character => {
        const letter = document.createElement('span');
        letter.className = 'hero-letter';
        letter.textContent = character;
        return letter;
      }));
      if (index === 0) return [wordElement];
      const space = document.createElement('span');
      space.className = 'hero-space';
      space.textContent = '\u00a0';
      return [space, wordElement];
    }));
    gsap.fromTo(animatedName.querySelectorAll('.hero-letter'), { yPercent: 18, rotate: 2 }, {
      yPercent: 0,
      rotate: 0,
      duration: 0.55,
      stagger: 0.025,
      delay: 0.12,
      ease: 'power3.out'
    });
  }

  sections.slice(1).forEach(section => {
    const targets = section.querySelectorAll('.eyebrow, .section-title, .section-desc, .about-grid, .timeline-item, .project-card, .skill-category-card, .cert-card, .contact-container');
    gsap.fromTo(targets, { y: 28, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.75,
      stagger: 0.07,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 82%', once: true }
    });
  });

  const timeline = document.querySelector('.timeline');
  if (timeline) {
    gsap.to(timeline, {
      '--timeline-reveal': 1,
      ease: 'none',
      scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 60%', scrub: 0.2 }
    });
  }

  sections.forEach((section, index) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 42%',
      end: 'bottom 42%',
      onToggle: self => {
        if (!self.isActive) return;
        document.body.dataset.zone = String(index);
        document.querySelectorAll('.nav-link-item').forEach(link => {
          const isCurrent = link.getAttribute('href') === `#${section.id}`;
          link.classList.toggle('active', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  });

  ScrollTrigger.refresh();
}