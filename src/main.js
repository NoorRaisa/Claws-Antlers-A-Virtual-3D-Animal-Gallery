import * as THREE from 'three';
import { loadStatueModel } from './objectLoader.js';

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xADC178, 1);
spotLight.position.set(-5, 5, 5);
spotLight.angle=Math.PI/4;
spotLight.penumbra = 0.3; 
spotLight.decay=2;
spotLight.distance=15;
spotLight.shadow.mapSize.width=2048;
spotLight.shadow.mapSize.height=2048;
spotLight.shadow.radius=4;
spotLight.castShadow = true;
scene.add(spotLight);


const spotLight2 = new THREE.SpotLight(0xADC178, 0.8);
spotLight2.position.set(5, 5, -5);
spotLight2.angle = Math.PI / 3;   // slightly wider coverage
spotLight2.penumbra = 0.3;
spotLight2.decay = 2;
spotLight2.distance = 15;
spotLight2.castShadow = true;
spotLight2.shadow.mapSize.width = 2048;
spotLight2.shadow.mapSize.height = 2048;
spotLight2.shadow.radius = 4;
spotLight2.castShadow = true;
scene.add(spotLight2);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(0, 10, 0);
dirLight.castShadow=false;
scene.add(dirLight);


const loader = new THREE.TextureLoader();
const floorTex = loader.load('/assets/floor2.jpeg');
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(4, 4);

const wallTex = loader.load('/assets/wall2.jpeg');
const roofTex = loader.load('/assets/roof.jpeg');
const tableTex = loader.load('/assets/table1.jpeg');
const painting1Tex = loader.load('/assets/cat1.jpeg');
const painting2Tex = loader.load('/assets/cat2.jpeg');

// --- Floor ---
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ map: floorTex }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- Walls ---
const createWall = (w, h, x, y, z, ry = 0) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: wallTex }));
    wall.position.set(x, y, z);
    wall.rotation.y = ry;
    scene.add(wall);
};
createWall(20, 6, 0, 3, -10); // back
createWall(20, 6, 0, 3, 10, Math.PI); // front
createWall(20, 6, -10, 3, 0, Math.PI / 2); // left
createWall(20, 6, 10, 3, 0, -Math.PI / 2); // right

// --- Roof ---
const roof = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ map: roofTex }));
roof.rotation.x = Math.PI / 2;
roof.position.y = 6;
scene.add(roof);

// --- Table ---
const table = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 2), new THREE.MeshStandardMaterial({ map: tableTex }));
table.position.set(0, 0.25, -3);
scene.add(table);

// --- Paintings ---
const painting1 = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshStandardMaterial({ map: painting1Tex }));
painting1.position.set(-5, 3, -9.8);
scene.add(painting1);

const painting2 = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshStandardMaterial({ map: painting2Tex }));
painting2.position.set(5, 3, -9.8);
scene.add(painting2);

// --- Statue ---
loadStatueModel(scene, '/assets/cat_statue.glb');

// --- Camera controls ---
const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// --- Mouse click to change painting ---
window.addEventListener('click', () => {
    painting1.material.map = painting2Tex;
});

// --- Animation Loop ---
const clock = new THREE.Clock();
// --- Camera orbit parameters ---
const target = new THREE.Vector3(0, 1, -3); // center point (statue/table)
let radius = 8;      // distance from target
let theta = Math.PI; // horizontal angle (radians)
let phi = 0.2;       // vertical angle (radians)
const angularSpeed = 0.02; // keyboard rotation speed
const zoomSpeed = 0.2;     // zoom in/out speed

function animate() {
    requestAnimationFrame(animate);

    // --- Keyboard-controlled orbit ---
    if(keys['a']) theta -= angularSpeed; // rotate left
    if(keys['d']) theta += angularSpeed; // rotate right
    if(keys['w']) phi += angularSpeed;   // rotate up
    if(keys['s']) phi -= angularSpeed;   // rotate down
    if(keys['q']) radius -= zoomSpeed;   // zoom in
    if(keys['e']) radius += zoomSpeed;   // zoom out

    // Clamp vertical rotation to avoid flipping
    const maxPhi = Math.PI / 2 - 0.1;
    const minPhi = -Math.PI / 2 + 0.1;
    phi = Math.max(minPhi, Math.min(maxPhi, phi));

    // Clamp zoom distance
    radius = Math.max(2, Math.min(20, radius));

    // Convert spherical to Cartesian coordinates
    camera.position.x = target.x + radius * Math.cos(phi) * Math.sin(theta);
    camera.position.y = target.y + radius * Math.sin(phi);
    camera.position.z = target.z + radius * Math.cos(phi) * Math.cos(theta);

    // Always look at the target
    camera.lookAt(target);

    // --- Spotlight animation ---
    spotLight.position.x += 0.05;
    if(spotLight.position.x > 5) spotLight.position.x = -5;
    

    // --- Update statue shader time ---
    const elapsed = clock.getElapsedTime();
    scene.traverse((obj) => {
        if(obj.material?.uniforms?.uTime) {
            obj.material.uniforms.uTime.value = elapsed;
        }
    });

    // --- Render scene ---
    renderer.render(scene, camera);
}
animate();

// --- Window resize ---
window.addEventListener