export function initProjects() {
  const cards = [...document.querySelectorAll('.project-card')];
  const dialog = document.createElement('dialog');
  dialog.className = 'project-dialog';
  dialog.setAttribute('aria-labelledby', 'project-dialog-title');

  const shell = document.createElement('div');
  shell.className = 'project-dialog-shell';
  const closeButton = document.createElement('button');
  closeButton.className = 'project-dialog-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Fermer les détails du projet');
  closeButton.title = 'Fermer';
  closeButton.textContent = '×';
  const content = document.createElement('div');
  content.className = 'project-dialog-content';
  shell.append(closeButton, content);
  dialog.append(shell);
  document.body.append(dialog);
  let returnFocus = null;

  function closeDialog() {
    if (!dialog.open) return;
    dialog.close();
  }

  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });

  cards.forEach(card => {
    const trigger = document.createElement('button');
    trigger.className = 'project-detail-trigger';
    trigger.type = 'button';
    trigger.textContent = 'Explorer le projet';
    trigger.setAttribute('aria-label', `Explorer ${card.querySelector('h3')?.textContent || 'ce projet'}`);
    card.querySelector('.project-meta')?.append(trigger);

    trigger.addEventListener('click', () => {
      returnFocus = trigger;
      content.replaceChildren();
      const visual = card.querySelector('.project-visual')?.cloneNode(true);
      const body = card.querySelector('.project-body')?.cloneNode(true);
      body?.querySelector('.project-detail-trigger')?.remove();
      const heading = body?.querySelector('h3');
      if (heading) {
        heading.id = 'project-dialog-title';
        heading.setAttribute('tabindex', '-1');
      }
      if (visual) content.append(visual);
      if (body) content.append(body);
      if (!dialog.open) dialog.showModal();
    });

    card.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty('--pointer-x', `${x * 100}%`);
      card.style.setProperty('--pointer-y', `${y * 100}%`);
      card.style.setProperty('--tilt-x', `${(x - 0.5) * 5}deg`);
      card.style.setProperty('--tilt-y', `${(0.5 - y) * 5}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}