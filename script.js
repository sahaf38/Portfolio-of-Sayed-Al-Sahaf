import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('#security-canvas');
const stage = document.querySelector('.hero-stage');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0, 7.2);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const group = new THREE.Group();
scene.add(group);
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 2), new THREE.MeshBasicMaterial({ color: 0xc8f36a, wireframe: true, transparent: true, opacity: .95 }));
group.add(core);
const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.75, 2), new THREE.MeshBasicMaterial({ color: 0x183425, transparent: true, opacity: .95 }));
group.add(inner);

const rings = [];
[[1.65, .12, 0xc8f36a], [2.05, .07, 0xff765f], [2.45, .045, 0x6c9880]].forEach(([radius, opacity, color], index) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .012 + index * .006, 8, 100), new THREE.MeshBasicMaterial({ color, transparent: true, opacity }));
  ring.rotation.set(index * .7, index * .35, index * .3);
  group.add(ring); rings.push(ring);
});

const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(240 * 3);
for (let index = 0; index < 240; index += 1) {
  const radius = 2.8 + Math.random() * 1.8;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  particlePositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
  particlePositions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  particlePositions[index * 3 + 2] = radius * Math.cos(phi);
}
particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleField = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0xc8f36a, size: .025, transparent: true, opacity: .6 }));
group.add(particleField);

let targetX = 0; let targetY = 0;
stage.addEventListener('pointermove', (event) => { const bounds = stage.getBoundingClientRect(); targetX = ((event.clientX - bounds.left) / bounds.width - .5) * .55; targetY = ((event.clientY - bounds.top) / bounds.height - .5) * .35; });
stage.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });

function resize() { const bounds = stage.getBoundingClientRect(); const width = Math.max(bounds.width, 1); const height = Math.max(bounds.height, 1); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); }
window.addEventListener('resize', resize); resize();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock = new THREE.Clock();
function animate() {
  const time = clock.getElapsedTime();
  if (!reduceMotion) {
    group.rotation.y += (targetX - group.rotation.y) * .035;
    group.rotation.x += (-targetY - group.rotation.x) * .035;
    core.rotation.x = time * .13; core.rotation.y = time * .18;
    inner.rotation.y = -time * .24;
    rings.forEach((ring, index) => { ring.rotation.z += (.002 + index * .001); ring.rotation.x += (index % 2 ? -.001 : .001); });
    particleField.rotation.y = time * .025;
  }
  renderer.render(scene, camera); requestAnimationFrame(animate);
}
animate();
