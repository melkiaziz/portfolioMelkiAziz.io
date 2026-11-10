const loader = document.getElementById('loader');
const progressBar = document.getElementById('loader-progress');
const progressLabel = document.getElementById('loader-percent');
const progressTrack = document.querySelector('.loader-meter');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const startedAt = performance.now();
const readyTasks = [];
let completedTasks = 0;

async function loadLocalModule(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}.`);
  const source = await response.text();
  const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  return import(moduleUrl);
}

function trackReady(task) {
  readyTasks.push(Promise.resolve(task).catch(() => undefined).then(() => {
    completedTasks += 1;
    const progress = Math.round((completedTasks / readyTasks.length) * 100);
    progressBar.style.width = `${progress}%`;
    progressLabel.textContent = `${progress}%`;
    progressTrack.setAttribute('aria-valuenow', String(progress));
  }));
}

const heroImage = document.querySelector('.portrait-img');
trackReady(heroImage?.complete ? Promise.resolve() : new Promise(resolve => {
  if (!heroImage) return resolve();
  heroImage.addEventListener('load', resolve, { once: true });
  heroImage.addEventListener('error', resolve, { once: true });
}));

trackReady(document.fonts?.ready || Promise.resolve());
trackReady(document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => {
  window.addEventListener('load', resolve, { once: true });
}));

let sceneReady = Promise.resolve();
if (!reducedMotion.matches) {
  sceneReady = loadLocalModule('js/scene.js')
    .then(({ createScene }) => createScene())
    .catch(error => {
      document.body.dataset.sceneFallback = 'true';
      console.warn('3D scene unavailable; using the static visual fallback.', error);
    });
  trackReady(loadLocalModule('js/scroll.js')
    .then(({ initScrollExperience }) => initScrollExperience())
    .catch(error => console.warn('Scroll animations unavailable; native scrolling remains active.', error)));
}
trackReady(sceneReady);

Promise.all(readyTasks).then(() => {
  const revealDelay = Math.max(0, 520 - (performance.now() - startedAt));
  window.setTimeout(() => {
    loader?.classList.add('fade-out');
    document.body.classList.add('is-entering');
    document.dispatchEvent(new Event('portfolio:ready'));
    window.setTimeout(() => document.body.classList.remove('is-entering'), 1300);
  }, revealDelay);
});

window.setTimeout(() => {
  if (!loader?.classList.contains('fade-out')) {
    document.body.dataset.sceneFallback = 'true';
    loader.classList.add('fade-out');
    document.body.classList.add('is-entering');
  }
}, 9000);