import * as THREE from 'three';
import { loadStatueModel } from './objectLoader.js';

// ========== Scene, Camera, Renderer ==========
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ========== Lights ==========
const ambientLight = new THREE.AmbientLight(0xfff8e7, 0.9);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xADC178, 0.7); 
spotLight.position.set(-5, 5, 5);
spotLight.angle = Math.PI / 5;
spotLight.penumbra = 0.3;
spotLight.decay = 2;
spotLight.distance = 15;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.radius = 7;
spotLight.castShadow = true;
scene.add(spotLight);

// const spotLight2 = new THREE.SpotLight(0xADC178, 0.3);
// spotLight2.position.set(5, 5, -5);
// spotLight2.angle = Math.PI / 5;
// spotLight2.penumbra = 0.3;
// spotLight2.decay = 2;
// spotLight2.distance = 15;
// spotLight2.shadow.mapSize.width = 2048;
// spotLight2.shadow.mapSize.height = 2048;
// spotLight2.shadow.radius = 4;
// spotLight2.castShadow = true;
// scene.add(spotLight2);


// ========== Textures ==========
const loader = new THREE.TextureLoader();

const floorTex = loader.load('/assets/floor2.jpeg');
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(4, 4);

const wallTex = loader.load('/assets/wall2.jpeg');
const roofTex = loader.load('/assets/roof.jpeg');
const tableTex = loader.load('/assets/table3.jpeg');
const painting1Tex = loader.load('/assets/cat3.jpeg');
const painting2Tex = loader.load('/assets/cat11.jpeg');
const painting3Tex = loader.load('/assets/hash.jpeg'); // left wall
const painting4Tex = loader.load('/assets/3.jpg'); // right wall

// Optional rug textures (fallback to solid color if missing)
const rugTex = loader.load('/assets/rug2.jpeg', t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });

// ========== Audio ==========
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
let isplay = true;

audioLoader.load('/assets/piano.wav', function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.15);
  sound.play();
});

const clickSound = new THREE.Audio(listener);
audioLoader.load('/assets/click.wav', (buffer) => {
  clickSound.setBuffer(buffer);
  clickSound.setVolume(0.5);
});

// ========== Room Geometry ==========
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ map: floorTex })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const createWall = (w, h, x, y, z, ry = 0) => {
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: wallTex })
  );
  wall.position.set(x, y, z);
  wall.rotation.y = ry;
  wall.receiveShadow = true;
  scene.add(wall);
};

createWall(20, 6, 0, 3, -10);                 // back
createWall(20, 6, 0, 3, 10, Math.PI);         // front
createWall(20, 6, -10, 3, 0, Math.PI / 2);    // left
createWall(20, 6, 10, 3, 0, -Math.PI / 2);    // right

const roof = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ map: roofTex })
);
roof.rotation.x = Math.PI / 2;
roof.position.y = 6;
roof.receiveShadow = false;
scene.add(roof);

// Table (center front)
const table = new THREE.Mesh(
  new THREE.BoxGeometry(4, 0.5, 2),
  new THREE.MeshStandardMaterial({ map: tableTex })
);
table.position.set(0, 0.25, -3);
table.castShadow = true;
table.receiveShadow = true;
scene.add(table);

// ========== Paintings ==========
const painting1 = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 4),
  new THREE.MeshStandardMaterial({ map: painting1Tex })
);
painting1.position.set(-5, 3, -9.8);
painting1.castShadow = false;
painting1.receiveShadow = false;
scene.add(painting1);

const painting2 = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 4),
  new THREE.MeshStandardMaterial({ map: painting2Tex })
);
painting2.position.set(5, 3, -9.8);
painting2.castShadow = false;
painting2.receiveShadow = false;
scene.add(painting2);

const painting3 = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 4),
  new THREE.MeshStandardMaterial({ map: painting3Tex, side: THREE.DoubleSide })
);
painting3.position.set(-9.8, 3, 0);
painting3.rotation.y = Math.PI / 2;
scene.add(painting3);

const painting4 = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 4),
  new THREE.MeshStandardMaterial({ map: painting4Tex, side: THREE.DoubleSide })
);
painting4.position.set(9.8, 3, 0);
painting4.rotation.y = -Math.PI / 2;
scene.add(painting4);

// ========== Statue ==========
loadStatueModel(scene, '/assets/cat_statue.glb');

// ========== Decor Helpers (Chandelier, Planters, Rugs) ==========
function addHangingSphereLight({
  x = 0, y = 6, z = 0,
  radius = 0.4,              // bigger sphere width
  rodHeight = 1.5,           // length of hanging rod
  sphereColor = 0xffffff,
  emissive = 0xffe9b0,
  emissiveIntensity = 0.6,
  lightColor = 0x1E90FF,
  lightIntensity = 0.4,
  lightDistance = 8
} = {}) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  // Hanging rod (cylinder from ceiling to lamp)
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, rodHeight, 12),
    new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.3 })
  );
  rod.position.y = -rodHeight / 2; // move below top anchor
  rod.castShadow = true;
  group.add(rod);

  // Sphere lamp shade
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 23),
    new THREE.MeshStandardMaterial({
      color: sphereColor,
      emissive: emissive,
      emissiveIntensity: emissiveIntensity,
      roughness: 0.3,
      metalness: 0.0
    })
  );
  sphere.position.y = -rodHeight; // at end of rod
  sphere.castShadow = false;
  group.add(sphere);

  // Point light inside the sphere
  const light = new THREE.PointLight(lightColor, lightIntensity, lightDistance, 2.0);
  light.position.set(0, -rodHeight, 0);
  light.castShadow = true;
  light.shadow.mapSize.set(512, 512);
  group.add(light);
  

  scene.add(group);

  return group;
}


function addPlanter({ x = -8, z = -8, potHeight = 1.0 } = {}) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Simple pot
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.35, potHeight, 32, 1, false),
    new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 })
  );
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);

  // Soil
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0x3e2723 })
  );
  soil.position.y = potHeight / 2;
  group.add(soil);

  // Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, potHeight, 8),
    new THREE.MeshStandardMaterial({ color: 0x5d4037 })
  );
  stem.position.y = potHeight / 2;
  group.add(stem);

  // Two simple leaves
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 });
  const leaf1 = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 12), leafMat);
  leaf1.position.y = potHeight + 0.3;
  group.add(leaf1);

  const leaf2 = leaf1.clone();
  leaf2.scale.set(0.7, 0.7, 0.7);
  leaf2.position.y = potHeight + 0.65;
  group.add(leaf2);

  scene.add(group);
  return group;
}

addHangingSphereLight({
  x: 0, y: 6, z: -3,
  radius: 0.4,        // bigger/wider sphere
  rodHeight: 1,     // longer hanging rod
  lightIntensity: 0.25,
  lightDistance: 6
});



function addRoundRug({ x = 0, z = -3, radius = 3.0 } = {}) {
  const mat = new THREE.MeshStandardMaterial({
    map: rugTex || null,
    color: rugTex ? 0xffffff : 0x6e5d52,
    roughness: 0.95,
    metalness: 0.0
  });
  const rug = new THREE.Mesh(new THREE.CircleGeometry(radius, 64), mat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(x, 0.01, z); // lift to avoid z-fighting
  rug.receiveShadow = true;
  scene.add(rug);
  return rug;
}


// ========== Place Decor ==========
//addChandelier({ x: 0, z: -3.0, y: 6, ringRadius: 1.3 });     // above table/statue
addPlanter({ x: -9.5, z: -8.8, potHeight: 1.0 });
addPlanter({ x:  9.5, z: -8.8, potHeight: 1.0 })
addRoundRug({ x: 0, z: -3, radius: 3.0 });                    // around table


const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Paintings click-to-cycle
const paintings = [painting1, painting2, painting3, painting4];
const paintingTextures = [painting1Tex, painting2Tex, painting3Tex, painting4Tex];
const currentTextureIndex = [0, 1, 2, 3];

window.addEventListener('click', () => {
  paintings.forEach((painting, i) => {
    currentTextureIndex[i] = (currentTextureIndex[i] + 1) % paintingTextures.length;
    painting.material.map = paintingTextures[currentTextureIndex[i]];
    painting.material.needsUpdate = true;
  });
  clickSound.play();
});

// Toggle music (P key)
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'p') {
    if (isplay) {
      sound.pause();
      isplay = false;
    } else {
      sound.play();
      isplay = true;
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    ambientLight.intensity = Math.min(ambientLight.intensity + 0.1, 2.0);
    console.log('Ambient intensity:', ambientLight.intensity.toFixed(2));
  }
  if (e.key === 'ArrowDown') {
    ambientLight.intensity = Math.max(ambientLight.intensity - 0.1, 0.0);
    console.log('Ambient intensity:', ambientLight.intensity.toFixed(2));
  }
});


// ========== Camera Orbit Animation ==========
const clock = new THREE.Clock();
const target = new THREE.Vector3(0, 1, -2); // center near statue/table
let radius = 8;
let theta = 0;
let phi = 0.2;
const angularSpeed = 0.015;
const zoomSpeed = 0.2;
let phiMin = -0.117;
let phiMax = 1.1;
function animate() {
  requestAnimationFrame(animate);

  if (keys['a']) theta -= angularSpeed;
  if (keys['d']) theta += angularSpeed;
  if (keys['w']) phi += angularSpeed;
  if (keys['s']) phi -= angularSpeed;
  if (keys['q']) radius -= zoomSpeed;
  if (keys['e']) radius += zoomSpeed;

  // const maxPhi = Math.PI / 2 - 0.1;
  // const minPhi = -Math.PI / 2 + 0.1;
  // phi = Math.max(minPhi, Math.min(maxPhi, phi));

  // later inside animate
  phi = Math.max(phiMin, Math.min(phiMax, phi));


  radius = Math.max(2, Math.min(8.3, radius));

  camera.position.x = target.x + radius * Math.cos(phi) * Math.sin(theta);
  camera.position.y = target.y + radius * Math.sin(phi);
  camera.position.z = target.z + radius * Math.cos(phi) * Math.cos(theta);
  camera.lookAt(target);

  // Spotlight slow sweep
  spotLight.position.x += 0.07;
  if (spotLight.position.x > 3) spotLight.position.x = -3;

  // Update potential shader time on statue (if any custom mat)
  const elapsed = clock.getElapsedTime();
  scene.traverse((obj) => {
    if (obj.material?.uniforms?.uTime) {
      obj.material.uniforms.uTime.value = elapsed;
    }
  });

  renderer.render(scene, camera);
}
animate();

// ========== Resize ==========
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
