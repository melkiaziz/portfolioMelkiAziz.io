import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer
} from 'three';

const mobileLayout = window.matchMedia('(max-width: 700px), (pointer: coarse)');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const palette = [0x61f5ef, 0x9c87ff, 0xff70ce, 0x7f9dff, 0x65e9e3, 0xb07fff, 0xff8ad4];
const zoneCount = palette.length;

function createNetwork(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const linkPositions = [];
  const linkColors = [];
  const zoneSize = Math.ceil(count / zoneCount);

  for (let zone = 0; zone < zoneCount; zone += 1) {
    const color = palette[zone];
    const red = ((color >> 16) & 255) / 255;
    const green = ((color >> 8) & 255) / 255;
    const blue = (color & 255) / 255;
    const first = zone * zoneSize;
    const last = Math.min(count, first + zoneSize);
    const centerX = Math.sin(zone * 1.4) * 1.5;
    const centerY = Math.cos(zone * 1.1) * 0.65;
    const centerZ = -zone * 10.2;

    for (let index = first; index < last; index += 1) {
      const local = index - first;
      const vertical = 1 - ((local + 0.5) / Math.max(last - first, 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - vertical * vertical));
      const angle = local * Math.PI * (3 - Math.sqrt(5));
      const ripple = 1.8 + Math.sin(angle * 2 + zone) * 0.62;
      const offset = index * 3;

      positions[offset] = centerX + Math.cos(angle) * radius * ripple;
      positions[offset + 1] = centerY + vertical * ripple;
      positions[offset + 2] = centerZ + Math.sin(angle) * radius * ripple;
      colors[offset] = red;
      colors[offset + 1] = green;
      colors[offset + 2] = blue;
      sizes[index] = 1.4 + ((index * 17) % 10) * 0.17;
      phases[index] = (index % 97) * 0.13;

      for (const step of [1, 13, 37]) {
        const neighbor = index + step;
        if (neighbor < last) {
          linkPositions.push(
            positions[offset], positions[offset + 1], positions[offset + 2],
            positions[neighbor * 3], positions[neighbor * 3 + 1], positions[neighbor * 3 + 2]
          );
          linkColors.push(red, green, blue, red, green, blue);
        }
      }
    }
  }

  return {
    positions,
    colors,
    sizes,
    phases,
    linkPositions: new Float32Array(linkPositions),
    linkColors: new Float32Array(linkColors),
    zoneSize
  };
}

export function createScene() {
  const canvas = document.getElementById('scene-canvas');
  if (!canvas || motionPreference.matches) return;

  const isMobile = mobileLayout.matches;
  const particleCount = isMobile ? 720 : 1680;
  const network = createNetwork(particleCount);
  let renderer;

  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'low-power'
    });
  } catch (error) {
    document.body.dataset.sceneFallback = 'true';
    throw error;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(43, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute('position', new Float32BufferAttribute(network.positions, 3));
  pointGeometry.setAttribute('color', new Float32BufferAttribute(network.colors, 3));
  pointGeometry.setAttribute('aSize', new Float32BufferAttribute(network.sizes, 1));
  pointGeometry.setAttribute('aPhase', new Float32BufferAttribute(network.phases, 1));

  const pointMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new Vector2(4, 4) },
      uInfluence: { value: 0 }
    },
    vertexShader: `
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform vec2 uMouse;
      uniform float uInfluence;
      varying vec3 vColor;
      varying float vFade;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vec4 clipPosition = projectionMatrix * viewPosition;
        vec2 screenPosition = clipPosition.xy / clipPosition.w;
        vec2 cursorDelta = uMouse - screenPosition;
        float distanceToCursor = length(cursorDelta);
        float force = exp(-distanceToCursor * 5.5) * uInfluence;
        clipPosition.xy += cursorDelta * force * 0.16 * clipPosition.w;
        gl_PointSize = min(aSize * uPixelRatio * (5.0 / max(-viewPosition.z, 0.1)), 10.0);
        gl_PointSize *= 0.82 + 0.18 * sin(uTime * 0.8 + aPhase);
        gl_Position = clipPosition;
        vColor = color;
        vFade = 1.0 - smoothstep(42.0, 64.0, -viewPosition.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vFade;
      void main() {
        float radius = length(gl_PointCoord - vec2(0.5));
        float alpha = (1.0 - smoothstep(0.08, 0.5, radius)) * vFade;
        gl_FragColor = vec4(vColor, alpha * 0.88);
      }
    `
  });

  const particles = new Points(pointGeometry, pointMaterial);
  scene.add(particles);

  const linkGeometry = new BufferGeometry();
  linkGeometry.setAttribute('position', new Float32BufferAttribute(network.linkPositions, 3));
  linkGeometry.setAttribute('color', new Float32BufferAttribute(network.linkColors, 3));
  const linkMaterial = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    blending: AdditiveBlending
  });
  const links = new LineSegments(linkGeometry, linkMaterial);
  scene.add(links);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const pointer = { x: 4, y: 4 };
  let animationFrame = 0;
  let isVisible = !document.hidden;
  let isDisposed = false;
  let scrollProgress = 0;
  let lastFrameTime = performance.now();
  let fpsWindowStart = lastFrameTime;
  let fpsFrameCount = 0;
  let lowFpsSeconds = 0;
  let highFpsSeconds = 0;
  let quality = 1;
  let activeParticles = particleCount;

  function resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    pointMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function updateScroll() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  }

  function updatePointer(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = 1 - (event.clientY / window.innerHeight) * 2;
    pointMaterial.uniforms.uMouse.value.set(pointer.x, pointer.y);
    pointMaterial.uniforms.uInfluence.value = 1;
  }

  function updateOrientation(event) {
    if (typeof event.gamma !== 'number' || typeof event.beta !== 'number') return;
    pointer.x = Math.max(-1, Math.min(1, event.gamma / 35));
    pointer.y = Math.max(-1, Math.min(1, (event.beta - 35) / 55));
    pointMaterial.uniforms.uMouse.value.set(pointer.x, pointer.y);
    pointMaterial.uniforms.uInfluence.value = 0.55;
  }

  function adaptQuality(now) {
    fpsFrameCount += 1;
    if (now - fpsWindowStart < 1000) return;

    const fps = fpsFrameCount * 1000 / (now - fpsWindowStart);
    const intervalSeconds = (now - fpsWindowStart) / 1000;
    fpsFrameCount = 0;
    fpsWindowStart = now;

    if (fps < 45) {
      lowFpsSeconds += intervalSeconds;
      highFpsSeconds = 0;
    } else if (fps > 58) {
      highFpsSeconds += intervalSeconds;
      lowFpsSeconds = 0;
    } else {
      lowFpsSeconds = 0;
      highFpsSeconds = 0;
    }

    if (lowFpsSeconds >= 2 && quality > 0.5) {
      quality = Math.max(0.5, quality - 0.25);
      activeParticles = Math.floor(particleCount * quality);
      pointGeometry.setDrawRange(0, activeParticles);
      linkGeometry.setDrawRange(0, Math.floor(linkGeometry.attributes.position.count * quality));
      lowFpsSeconds = 0;
      highFpsSeconds = 0;
    } else if (highFpsSeconds >= 8 && quality < 1) {
      quality = Math.min(1, quality + 0.25);
      activeParticles = Math.floor(particleCount * quality);
      pointGeometry.setDrawRange(0, activeParticles);
      linkGeometry.setDrawRange(0, Math.floor(linkGeometry.attributes.position.count * quality));
      lowFpsSeconds = 0;
      highFpsSeconds = 0;
    }
  }

  function frame(now) {
    animationFrame = 0;
    if (isDisposed || !isVisible) return;

    const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;
    camera.position.z = 8 - scrollProgress * 61;
    camera.position.x += (Math.sin(scrollProgress * Math.PI * 6) * 1.25 - camera.position.x) * 0.025;
    camera.position.y += (Math.cos(scrollProgress * Math.PI * 4) * 0.42 - camera.position.y) * 0.025;
    pointMaterial.uniforms.uTime.value += delta;
    adaptQuality(now);
    render();
    animationFrame = requestAnimationFrame(frame);
  }

  function syncAnimation() {
    if (isVisible && !isDisposed && !animationFrame) {
      lastFrameTime = performance.now();
      animationFrame = requestAnimationFrame(frame);
    } else if (!isVisible && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function handleVisibility() {
    isVisible = !document.hidden;
    syncAnimation();
  }

  function dispose() {
    if (isDisposed) return;
    isDisposed = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', updateScroll);
    window.removeEventListener('pointermove', updatePointer);
    window.removeEventListener('deviceorientation', updateOrientation);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('pagehide', handlePageHide);
    pointGeometry.dispose();
    pointMaterial.dispose();
    linkGeometry.dispose();
    linkMaterial.dispose();
    renderer.dispose();
  }

  function handlePageHide(event) {
    if (!event.persisted) dispose();
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', updateScroll, { passive: true });
  if (!isMobile) window.addEventListener('pointermove', updatePointer, { passive: true });
  if (isMobile && 'DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', updateOrientation, { passive: true });
  }
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', handlePageHide);
  resize();
  updateScroll();
  syncAnimation();
  canvas.dataset.activeParticles = String(activeParticles);
}