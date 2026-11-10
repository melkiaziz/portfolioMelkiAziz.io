import('three').then(THREE => {
const {
  AdditiveBlending,
  BufferGeometry,
  Clock,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer
} = THREE;

const canvas = document.getElementById('hero-scene');
const hero = document.getElementById('home');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileLayout = window.matchMedia('(max-width: 700px), (pointer: coarse)');

if (canvas && hero) {
  let renderer;

  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobileLayout.matches,
      powerPreference: 'low-power'
    });
  } catch (error) {
    console.warn('Three.js WebGL scene unavailable; keeping the static hero.', error);
  }

  if (renderer) {
    const scene = new Scene();
    const camera = new PerspectiveCamera(34, 1, 0.1, 30);
    camera.position.z = 5.2;

    const constellation = new Group();
    scene.add(constellation);

    const particleCount = mobileLayout.matches ? 640 : 1800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < particleCount; index += 1) {
      const vertical = 1 - ((index + 0.5) / particleCount) * 2;
      const ringRadius = Math.sqrt(1 - vertical * vertical);
      const angle = index * goldenAngle;
      const ripple = 1.18 + Math.sin(angle * 2 + vertical * 11) * 0.09;
      const offset = index * 3;
      const blend = (Math.sin(angle * 1.7 + vertical * 4) + 1) * 0.5;

      positions[offset] = Math.cos(angle) * ringRadius * ripple;
      positions[offset + 1] = vertical * ripple;
      positions[offset + 2] = Math.sin(angle) * ringRadius * ripple;
      colors[offset] = 0.22 + blend * 0.46;
      colors[offset + 1] = 0.76 - blend * 0.34;
      colors[offset + 2] = 1;
      sizes[index] = 1.5 + ((index * 17) % 10) * 0.16;
      phases[index] = (index % 97) * 0.13;
    }

    const pointGeometry = new BufferGeometry();
    pointGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    pointGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    pointGeometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
    pointGeometry.setAttribute('aPhase', new Float32BufferAttribute(phases, 1));

    const pointMaterial = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 }
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;

        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          float pulse = 0.82 + 0.18 * sin(uTime * 0.8 + aPhase);
          gl_PointSize = min(aSize * pulse * uPixelRatio * (4.0 / max(-viewPosition.z, 0.1)), 9.0);
          gl_Position = projectionMatrix * viewPosition;
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
          float alpha = 1.0 - smoothstep(0.08, 0.5, distanceFromCenter);
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `
    });

    const particles = new Points(pointGeometry, pointMaterial);
    constellation.add(particles);

    const centerGeometry = new IcosahedronGeometry(0.48, 1);
    const centerMaterial = new MeshBasicMaterial({
      color: 0x78edff,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
      depthWrite: false
    });
    const center = new Mesh(centerGeometry, centerMaterial);
    constellation.add(center);

    const orbitMaterial = new LineBasicMaterial({
      color: 0x8c8cff,
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    });
    const orbitCount = mobileLayout.matches ? 1 : 2;
    const orbitGeometries = [];

    for (let orbitIndex = 0; orbitIndex < orbitCount; orbitIndex += 1) {
      const orbitPositions = [];
      const segmentCount = mobileLayout.matches ? 96 : 160;
      const orbitRadius = 1.48 + orbitIndex * 0.12;

      for (let segment = 0; segment < segmentCount; segment += 1) {
        const angle = (segment / segmentCount) * Math.PI * 2;
        orbitPositions.push(
          Math.cos(angle) * orbitRadius,
          Math.sin(angle) * orbitRadius * 0.38,
          Math.sin(angle) * orbitRadius * 0.72
        );
      }

      const orbitGeometry = new BufferGeometry();
      orbitGeometry.setAttribute('position', new Float32BufferAttribute(orbitPositions, 3));
      const orbit = new LineLoop(orbitGeometry, orbitMaterial);
      orbit.rotation.set(0.72 + orbitIndex * 0.58, 0.18, 0.28 + orbitIndex * 0.66);
      constellation.add(orbit);
      orbitGeometries.push(orbitGeometry);
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileLayout.matches ? 1 : 2));

    const clock = new Clock();
    const pointer = { x: 0, y: 0 };
    let scrollProgress = 0;
    let animationFrame = 0;
    let isCanvasVisible = false;
    let isPageVisible = !document.hidden;
    let isDisposed = false;

    function renderFrame() {
      renderer.render(scene, camera);
    }

    function resizeRenderer() {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      pointMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      renderFrame();
    }

    function animate() {
      animationFrame = 0;
      if (isDisposed || !isCanvasVisible || !isPageVisible || motionPreference.matches) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const targetX = pointer.y * 0.13 + scrollProgress * 0.08;
      const targetY = elapsed * 0.1 + pointer.x * 0.18 + scrollProgress * 0.22;

      constellation.rotation.x += (targetX - constellation.rotation.x) * 0.035;
      constellation.rotation.y += (targetY - constellation.rotation.y) * 0.035;
      center.rotation.x += delta * 0.08;
      center.rotation.y += delta * 0.12;
      pointMaterial.uniforms.uTime.value += delta;
      renderFrame();

      animationFrame = requestAnimationFrame(animate);
    }

    function syncAnimation() {
      const shouldAnimate = isCanvasVisible && isPageVisible && !motionPreference.matches && !isDisposed;

      if (shouldAnimate && !animationFrame) {
        animationFrame = requestAnimationFrame(animate);
      } else if (!shouldAnimate) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        renderFrame();
      }
    }

    function updatePointer(event) {
      if (mobileLayout.matches || motionPreference.matches) return;

      const bounds = hero.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = 1 - ((event.clientY - bounds.top) / bounds.height) * 2;
    }

    function updateScroll() {
      const bounds = hero.getBoundingClientRect();
      scrollProgress = Math.max(0, Math.min(1, -bounds.top / Math.max(bounds.height, 1)));
    }

    const intersectionObserver = new IntersectionObserver((entries) => {
      isCanvasVisible = entries.some(entry => entry.isIntersecting);
      syncAnimation();
    }, { rootMargin: '80px 0px' });

    const resizeObserver = new ResizeObserver(resizeRenderer);
    intersectionObserver.observe(canvas);
    resizeObserver.observe(canvas);

    const onVisibilityChange = () => {
      isPageVisible = !document.hidden;
      syncAnimation();
    };
    const onMotionChange = () => syncAnimation();
    const onPageHide = (event) => {
      if (!event.persisted) dispose();
    };

    function dispose() {
      if (isDisposed) return;
      isDisposed = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('pagehide', onPageHide);
      motionPreference.removeEventListener('change', onMotionChange);
      pointGeometry.dispose();
      pointMaterial.dispose();
      centerGeometry.dispose();
      centerMaterial.dispose();
      orbitGeometries.forEach(geometry => geometry.dispose());
      orbitMaterial.dispose();
      renderer.dispose();
    }

    if (!mobileLayout.matches) {
      window.addEventListener('pointermove', updatePointer, { passive: true });
      window.addEventListener('scroll', updateScroll, { passive: true });
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    motionPreference.addEventListener('change', onMotionChange);
    updateScroll();
    resizeRenderer();
  }
}
}).catch(error => {
  console.warn('Three.js could not be loaded; keeping the static hero.', error);
});