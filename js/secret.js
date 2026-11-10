const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

export function initEasterEgg() {
  const toast = document.createElement('div');
  toast.className = 'easter-egg-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.append(toast);

  let typedKeys = [];
  let dismissTimer = 0;

  document.addEventListener('keydown', event => {
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;

    typedKeys.push(event.key.toLowerCase());
    typedKeys = typedKeys.slice(-konamiCode.length);
    if (!konamiCode.every((key, index) => typedKeys[index] === key)) return;

    const isEclipse = document.body.dataset.theme !== 'eclipse';
    if (isEclipse) document.body.dataset.theme = 'eclipse';
    else delete document.body.dataset.theme;
    toast.textContent = isEclipse ? 'Spectrum: Eclipse' : 'Spectrum: Original';
    toast.classList.add('is-visible');
    window.clearTimeout(dismissTimer);
    dismissTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
    typedKeys = [];
  });

  window.addEventListener('pagehide', () => window.clearTimeout(dismissTimer), { once: true });
}