export function initContact() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const contactControls = document.querySelectorAll('.contact-methods a, .contact-form .btn');
  const layer = document.createElement('div');
  layer.className = 'contact-particle-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);

  function burst(event) {
    if (reducedMotion.matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const originX = event.clientX || bounds.left + bounds.width / 2;
    const originY = event.clientY || bounds.top + bounds.height / 2;

    for (let index = 0; index < 12; index += 1) {
      const particle = document.createElement('span');
      const angle = (Math.PI * 2 * index) / 12 + Math.random() * 0.18;
      const distance = 24 + Math.random() * 42;
      particle.className = 'contact-particle';
      particle.style.left = `${originX}px`;
      particle.style.top = `${originY}px`;
      particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--particle-delay', `${Math.random() * 90}ms`);
      layer.append(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
  }

  contactControls.forEach(control => control.addEventListener('click', burst));

  const form = document.getElementById('portfolio-form');
  const status = document.getElementById('form-status');
  const submitButton = form?.querySelector('[type="submit"]');
  if (!form || !status || !submitButton) return;

  const originalLabel = submitButton.textContent;
  const statusObserver = new MutationObserver(() => {
    const text = status.textContent || '';
    const isSending = text.includes('Envoi du message en cours');
    status.dataset.state = text.includes('[SUCCESS]') ? 'success' : text.includes('[ERROR]') ? 'error' : isSending ? 'sending' : '';
    submitButton.setAttribute('aria-busy', String(isSending));
    submitButton.textContent = isSending ? 'Envoi en cours…' : originalLabel;
  });
  statusObserver.observe(status, { childList: true, characterData: true, subtree: true });
  window.addEventListener('pagehide', () => statusObserver.disconnect(), { once: true });
}