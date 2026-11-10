const magneticSelector = '.btn, .project-link-btn, .project-detail-trigger, .nav-link-item, .filter-btn, .skill-node, .cert-action-btn, .contact-item';

export function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const halo = document.getElementById('cursor-ring');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!dot || !halo || coarsePointer.matches || reducedMotion.matches) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let haloX = targetX;
  let haloY = targetY;
  let animationFrame = 0;
  let isDisposed = false;
  let activeTarget = null;

  document.body.classList.add('custom-cursor-active');
  dot.style.display = 'block';
  halo.style.display = 'block';

  function animate() {
    animationFrame = 0;
    if (isDisposed || document.hidden) return;
    haloX += (targetX - haloX) * 0.23;
    haloY += (targetY - haloY) * 0.23;
    dot.style.left = `${targetX}px`;
    dot.style.top = `${targetY}px`;
    halo.style.left = `${haloX}px`;
    halo.style.top = `${haloY}px`;
    if (Math.abs(targetX - haloX) + Math.abs(targetY - haloY) > 0.35) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      haloX = targetX;
      haloY = targetY;
    }
  }

  function setActiveTarget(target) {
    activeTarget?.classList.remove('magnetic-target');
    if (activeTarget) {
      activeTarget.style.removeProperty('--magnetic-x');
      activeTarget.style.removeProperty('--magnetic-y');
    }
    activeTarget = target;
    activeTarget?.classList.add('magnetic-target');
    halo.classList.toggle('is-hovering', Boolean(activeTarget));
  }

  function onPointerMove(event) {
    targetX = event.clientX;
    targetY = event.clientY;
    document.documentElement.style.setProperty('--mouse-x', `${targetX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${targetY}px`);
    if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(animate);

    const target = event.target instanceof Element ? event.target.closest(magneticSelector) : null;
    if (target !== activeTarget) setActiveTarget(target);
    if (activeTarget) {
      const bounds = activeTarget.getBoundingClientRect();
      const strength = activeTarget.matches('.btn, .project-detail-trigger, .filter-btn') ? 0.1 : 0.055;
      activeTarget.style.setProperty('--magnetic-x', `${(event.clientX - bounds.left - bounds.width / 2) * strength}px`);
      activeTarget.style.setProperty('--magnetic-y', `${(event.clientY - bounds.top - bounds.height / 2) * strength}px`);
    }
  }

  function onFocusIn(event) {
    const target = event.target instanceof Element ? event.target.closest(magneticSelector) : null;
    if (target) halo.classList.add('is-hovering');
  }

  function onFocusOut() {
    if (!activeTarget) halo.classList.remove('is-hovering');
  }

  function onVisibilityChange() {
    if (document.hidden) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function dispose() {
    isDisposed = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    setActiveTarget(null);
    document.body.classList.remove('custom-cursor-active');
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('focusin', onFocusIn);
    document.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', dispose);
  }

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', dispose, { once: true });
}