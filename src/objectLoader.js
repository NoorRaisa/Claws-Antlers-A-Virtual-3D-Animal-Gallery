import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { statueVertexShader, statueFragmentShader } from './shaders.js';

export function loadStatueModel(scene, modelPath, tableTopY = 0.5) {
    const loader = new GLTFLoader();

    loader.load(
        modelPath,
        (gltf) => {
            const statue = gltf.scene;

            // --- Compute bounding box ---
            const bbox = new THREE.Box3().setFromObject(statue);
            const size = new THREE.Vector3();
            bbox.getSize(size);

            // Scale statue to target height
            const targetHeight = 2.5; // statue height in units
            const scale = targetHeight / size.y;
            statue.scale.set(1.2*scale, scale, scale);

            // --- Recompute bounding box after scaling ---
            const scaledBBox = new THREE.Box3().setFromObject(statue);
            const bottomY = scaledBBox.min.y; // bottom of model in world coordinates
            const height = scaledBBox.max.y - scaledBBox.min.y;

            // --- Position statue so its bottom aligns with tableTopY ---
            statue.position.set(
                0, 
                tableTopY - bottomY, // shift down so bottom sits exactly on table
                -3
            );

            // --- Apply custom shader ---
            statue.traverse((child) => {
                if (child.isMesh) {
                    // let mapTexture = child.material.map;
                    // if (!mapTexture) {
                    //     mapTexture = new THREE.TextureLoader().load('/assets/statue2.jpeg');
                    // }
                    let mapTexture=new THREE.TextureLoader().load('/assets/statue1.jpeg');

                    child.material = new THREE.ShaderMaterial({
                        vertexShader: statueVertexShader,
                        fragmentShader: statueFragmentShader,
                        uniforms: {
                            uTexture: { value: mapTexture },
                            uTime: { value: 0 }
                        },
                        side: THREE.DoubleSide
                    });
                }
            });

            scene.add(statue);
        },
        undefined,
        (err) => console.error('Error loading GLB:', err)
    );
}