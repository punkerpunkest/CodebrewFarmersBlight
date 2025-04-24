import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import mapTexture from './assets/map.png';
import soil from './assets/soil_texture5.jpg';
const App = () => {
  useEffect(() => {
    // Create the scene
    const scene = new THREE.Scene();

    // Create the camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 15, -22);

    // Create the renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create OrbitControls
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update(); // Required after setting up OrbitControls
   

     /*****************************************
     * SOIL LAYER ADDITION - START
     *****************************************/
    // Create a soil/terrain box beneath the grid
    const soilGeometry = new THREE.BoxGeometry(16, 2, 16);
    
    // Create a soil texture
    const textureLoader1 = new THREE.TextureLoader();
    const soilTexture = textureLoader1.load(soil);
    
    // Repeat the texture to make it look more detailed
    soilTexture.wrapS = THREE.RepeatWrapping;
    soilTexture.wrapT = THREE.RepeatWrapping;
    soilTexture.repeat.set(4, 4);
    
    const soilMaterial = new THREE.MeshBasicMaterial({
      map: soilTexture,
      color: 0x755c48
    });
    
    const soilMesh = new THREE.Mesh(soilGeometry, soilMaterial);
    // Position the soil box beneath the grid
    soilMesh.position.y = -1.03; // Just 1 unit below the grid
    scene.add(soilMesh);
    
    // Add ambient light so we can see the soil texture
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
    
    // Add directional light to create some subtle shading
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight2.position.set(5, 20, 5);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight3.position.set(-5, 20, -5);
    scene.add(directionalLight3);
    /*****************************************
     * SOIL LAYER ADDITION - END
     *****************************************/

    // Create a plane mesh for raycasting (hidden but for calculation)
    const planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false })
    );
    planeMesh.rotateX(-Math.PI / 2);
    scene.add(planeMesh);

    const textureLoader = new THREE.TextureLoader();
    const gridTexture = textureLoader.load(mapTexture);

    

    const gridMaterial = new THREE.MeshBasicMaterial({
      map: gridTexture, // Apply the loaded texture
      side: THREE.DoubleSide,
      transparent: true, // If you want transparency on the grid
    });
    
    const gridGeometry = new THREE.PlaneGeometry(16, 16);
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotateX(-Math.PI / 2); // Rotate the grid to match the plane
    gridMesh.position.y = -0.01;
    scene.add(gridMesh);
    // Create a grid helper
    const grid = new THREE.GridHelper(16, 16);
    scene.add(grid);
     /*****************************************
     * WIND EFFECT IMPLEMENTATION - START 
     *****************************************/
    // Define a 16x16 array for wind positions
    const windGrid = [
      /*  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15  */
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 0
        [false,false,false,false,false, true , true ,false,false,false,false,false,false,false,false,false], // 1
        [false,false,false,false, true , true , true ,false,false,false,false,false,false,false,false,false], // 2
        [false,false,false, true , true , true , true ,false,false,false,false,false,false,false,false,false], // 3
        [false,false,false,false, true , true , true ,false,false,false,false,false,false,false,false,false], // 4
        [false,false,false,false,false, true , true ,false,false,false,false,false,false,false,false,false], // 5
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 6
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 7
        [false,false,false,false,false,false,false,false, true , true ,false,false,false,false,false,false], // 8
        [false,false,false,false,false,false,false, true , true , true ,false,false,false,false,false,false], // 9
        [false,false,false,false,false,false, true , true , true ,false,false,false,false,false,false,false], //10
        [false,false,false,false,false,false,false, true , true ,false,false,false,false,false,false,false], //11
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], //12
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], //13
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], //14
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], //15
      ];
      
      
    
    // Wind particle system
    const windParticles = [];
    
    // Create wind indicators for each wind position
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        if (windGrid[x][z]) {
          // Create wind particles for this grid cell
          const particleCount = 5 + Math.floor(Math.random() * 5); // 5-9 particles per cell
          
          for (let i = 0; i < particleCount; i++) {
            // Create a small line mesh to represent wind
            const windGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4);
            const windMaterial = new THREE.MeshBasicMaterial({
              color: 0xFFFFFF, // Light blue
              transparent: true,
              opacity: 0.4 + Math.random() * 0.3, // Varying opacity
            });
            
            const windMesh = new THREE.Mesh(windGeometry, windMaterial);
            
            // Position slightly above the grid with random offset within the cell
            windMesh.position.set(
              x - 7.5 + (Math.random() * 0.8 - 0.4), // Center with slight randomness
              0.2 + Math.random() * 0.2,             // Slightly above the grid
              z - 7.5 + (Math.random() * 0.8 - 0.4)  // Center with slight randomness
            );
            
            // Rotate to be horizontal (like wind flowing)
            windMesh.rotation.z = Math.PI / 2;
            
            // Wind direction (slightly randomized but generally west to east)
            windMesh.rotation.y = Math.PI / 4 + (Math.random() * Math.PI / 8);
            
            // Add to scenes
            scene.add(windMesh);
            
            // Store for animation
            windParticles.push({
              mesh: windMesh,
              speed: 0.001, // Random speed
              cell: { x, z },
              phase: Math.random() * Math.PI * 2, // Random starting phase
              originalY: windMesh.position.y
            });
          }
        }
      }
    }
    
    // Wind animation function
    function animateWind(time) {
      windParticles.forEach((particle) => {
        // Make wind particles slightly pulse and move in the wind direction
        const windEffect = Math.sin(time / 500 + particle.phase) * 0.1;
        
        // Subtle vertical bobbing
        particle.mesh.position.y = particle.originalY + Math.sin(time / 800 + particle.phase) * 0.05;
        
        // Wind pulsing effect - stretching and contracting
        particle.mesh.scale.y = 1 + windEffect * 0.3;
        
        // Subtle opacity pulsing
        particle.mesh.material.opacity = 0.4 + 0.2 * Math.sin(time / 600 + particle.phase);
        
        // Calculate direction vector based on rotation
        const direction = new THREE.Vector3(1, 0, 0);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), particle.mesh.rotation.y);
        direction.multiplyScalar(particle.speed);
        
        // Move in the direction
        particle.mesh.position.x += direction.x;
        particle.mesh.position.z += direction.z;
        
        // Check if particle has moved too far from its cell, wrap it around if so
        const cellCenterX = particle.cell.x - 7.5;
        const cellCenterZ = particle.cell.z - 7.5;
        
        // If it's moved more than 1 unit away, reset position
        if (Math.abs(particle.mesh.position.x - cellCenterX) > 0.8 ||
            Math.abs(particle.mesh.position.z - cellCenterZ) > 0.8) {
          // Reset position with some randomness
          particle.mesh.position.x = cellCenterX + (Math.random() * 0.6 - 0.3);
          particle.mesh.position.z = cellCenterZ + (Math.random() * 0.6 - 0.3);
        }
      });
    }
    /*****************************************
     * WIND EFFECT IMPLEMENTATION - END
     *****************************************/
   
   /*****************************************
     * CLOUD LAYER IMPLEMENTATION - START 
     *****************************************/
    // Define a 16x16 array for cloud positions (true = cloud, false = no cloud)
    const cloudGrid = [
      /* 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 */
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 0
        [false,false,false,false,false, true , true , true , true ,false,false,false,false,false,false,false], // 1
        [false,false,false,false, true , true , true , true , true , true ,false,false,false,false,false,false], // 2
        [false,false,false,false, true , true , true , true , true , true ,false,false,false,false,false,false], // 3
        [false,false,false,false,false, true , true , true , true ,false,false,false,false,false,false,false], // 4
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 5
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 6
        [false,false,false,false,false,false,false,false, true , true , true , true ,false,false,false,false], // 7
        [false,false,false,false,false,false,false, true , true , true , true , true , true ,false,false,false], // 8
        [false,false,false,false,false,false,false, true , true , true , true , true , true ,false,false,false], // 9
        [false,false,false,false,false,false,false,false, true , true , true , true ,false,false,false,false], // 10
        [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 11
        [false,false, true , true , true ,false,false,false,false,false,false,false,false,false,false,false], // 12
        [false, true , true , true , true , true ,false,false,false,false,false,false,false,false,false,false], // 13
        [false, true , true , true , true , true ,false,false,false,false,false,false,false,false,false,false], // 14
        [false,false, true , true , true ,false,false,false,false,false,false,false,false,false,false,false], // 15
      ];
      
    
    
    // Create cloud material (semi-transparent white)
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });
    const cloudContainer = new THREE.Group();
    scene.add(cloudContainer);
    // Create a box for each cloud
    const cloudMeshes = [];
    
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        if (cloudGrid[x][z]) {
          // Create a cloud box for this position
          const cloudGeometry = new THREE.BoxGeometry(1, 0.3, 1);
          const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
          
          // Position the cloud above the grid
          cloudMesh.position.set(
            x - 7.5, // Center the clouds over the grid
            5,       // Height above the grid
            z - 7.5  // Center the clouds over the grid
          );
          
          // Add some randomness to make clouds look more natural
          cloudMesh.scale.x = 0.8 + Math.random() * 0.4;
          cloudMesh.scale.z = 0.8 + Math.random() * 0.4;
          
          // Add the cloud to the scene
          scene.add(cloudMesh);
          cloudMeshes.push(cloudMesh);
        }
      }
    }

    
    // Function to animate clouds with gentle floating motion
    function animateClouds(time) {
      cloudMeshes.forEach((cloud, index) => {
        // Make each cloud float slightly up and down with a unique pattern
        cloud.position.y = 5 + 0.2 * Math.sin(time / 2000 + index * 0.2);
        
        // Optional: slight rotation
        cloud.rotation.y = time / 5000 + index * 0.1;
      });
    }
    /*****************************************
     * CLOUD LAYER IMPLEMENTATION - END
     *****************************************/
    // First, enable shadow mapping in the renderer
    // Enable shadows in the renderer
    // First clear any existing directional lights
scene.children.forEach(child => {
  if (child instanceof THREE.DirectionalLight) {
    scene.remove(child);
  }
});

// Enable shadows in the renderer
// COMPREHENSIVE SHADOW TROUBLESHOOTING

// 1. RENDERER CONFIGURATION
// Make sure shadow mapping is DEFINITELY enabled
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Try different types if needed

// 2. LIGHT SETUP WITH DEBUGGING
// Create a new directional light with high intensity
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight1.position.set(0, 15, 0);
directionalLight1.castShadow = true;

// Set up shadow parameters with GENEROUS bounds
directionalLight1.shadow.mapSize.width = 4096; // Try larger sizes for better quality
directionalLight1.shadow.mapSize.height = 4096;
directionalLight1.shadow.camera.near = 0.1;
directionalLight1.shadow.camera.far = 50;
directionalLight1.shadow.camera.left = -15;
directionalLight1.shadow.camera.right = 15;
directionalLight1.shadow.camera.top = 15;
directionalLight1.shadow.camera.bottom = -15;
directionalLight1.shadow.bias = -0.001;

// Critical: Target and update matrices
directionalLight1.target.position.set(0, 0, 0);
scene.add(directionalLight1.target);
scene.add(directionalLight1);

// Force updates to ensure matrices are current
directionalLight1.updateMatrixWorld(true);
directionalLight1.target.updateMatrixWorld(true);
directionalLight1.shadow.camera.updateProjectionMatrix();

// 3. ENSURE MATERIALS ARE COMPATIBLE WITH SHADOWS
// For each cloud
cloudMeshes.forEach(cloud => {
  // Ensure castShadow is set
  cloud.castShadow = true;
  cloud.receiveShadow = false;

  // FORCE a new material that works with shadows
  const newMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    // Make it slightly emissive to ensure visibility
    emissive: 0x333333
  });
  
  // Apply the new material
  cloud.material = newMaterial;
  
  // Log to confirm shadows are enabled
  console.log("Cloud castShadow:", cloud.castShadow);
});

// 4. ENSURE RECEIVING SURFACES HAVE PROPER MATERIALS
// For the ground mesh
gridMesh.receiveShadow = true;
gridMesh.castShadow = false;

// If gridMesh is using a BasicMaterial, it won't show shadows
if (gridMesh.material.type === 'MeshBasicMaterial') {
  // Save current texture if there is one
  const currentMap = gridMesh.material.map;
  
  // Create new material that can receive shadows
  const newMaterial = new THREE.MeshPhongMaterial({
    map: currentMap,
    side: THREE.DoubleSide,
    // More opaque to clearly show shadows
    transparent: true,
    opacity: 1.0
  });
  
  // Apply new material
  gridMesh.material = newMaterial;
}

// Do the same for soil mesh
soilMesh.receiveShadow = true;
soilMesh.castShadow = false;

if (soilMesh.material.type === 'MeshBasicMaterial') {
  const currentMap = soilMesh.material.map;
  const newMaterial = new THREE.MeshPhongMaterial({
    map: currentMap,
    side: THREE.DoubleSide
  });
  soilMesh.material = newMaterial;
}

// 5. ADD A SIMPLE TEST OBJECT TO VERIFY SHADOWS WORK AT ALL
// Create a simple sphere that will cast a shadow
const testSphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshPhongMaterial({ color: 0xff0000 })
);
testSphere.position.set(0, 5, 0); // Position above the grid
testSphere.castShadow = true;
testSphere.receiveShadow = false;
scene.add(testSphere);

// 6. VISUALIZATION HELPERS
// Show the shadow camera frustum
const cameraHelper = new THREE.CameraHelper(directionalLight1.shadow.camera);
scene.add(cameraHelper);

// Show a line representing the light direction
const directionHelper = new THREE.ArrowHelper(
  new THREE.Vector3(0, -1, 0), // Direction vector pointing down
  directionalLight1.position,   // Start position
  10,                         // Length
  0xff0000,                   // Color (red)
  1,                          // Arrow head length
  0.5                         // Arrow head width
);
scene.add(directionHelper);

// 7. LOG SHADOW PROPERTIES FOR DEBUGGING
console.log("Renderer shadowMap enabled:", renderer.shadowMap.enabled);
console.log("Light castShadow:", directionalLight1.castShadow);
console.log("Ground receiveShadow:", gridMesh.receiveShadow);
console.log("Shadow camera matrix:", directionalLight1.shadow.camera.matrix);
console.log("Shadow map size:", directionalLight1.shadow.mapSize);

// 8. FORCE A RENDER UPDATE
// This ensures all changes take effect
setTimeout(() => {
  cameraHelper.update();
  directionalLight1.updateMatrixWorld(true);
  renderer.render(scene, camera);
}, 200);

    // Create a highlight mesh (will change color on mouse hover)
    const highlightMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, transparent: true })
    );
    highlightMesh.rotateX(-Math.PI / 2);
    highlightMesh.position.set(0.5, 0, 0.5);
    scene.add(highlightMesh);

    // Raycaster and mouse position
    const mousePosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let intersects;

    // Mouse movement handler
    window.addEventListener('mousemove', (e) => {
      mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mousePosition, camera);
      intersects = raycaster.intersectObject(planeMesh);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);
        highlightMesh.material.color.setHex(0xFFFFFF);
      }
    });

    // Sphere mesh to add on mouse click
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 4, 2),
      new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFFEA00 })
    );

    const objects = [];
    // Mouse click handler
    window.addEventListener('mousedown', () => {
      if (intersects.length > 0) {
        const sphereClone = sphereMesh.clone();
        sphereClone.position.copy(highlightMesh.position);
        scene.add(sphereClone);
        objects.push(sphereClone);
        highlightMesh.material.color.setHex(0xFF0000);
      }
    });

    // Animation loop
    function animate(time) {
       /*****************************************
       * WIND ANIMATION CALL - START
       *****************************************/
       animateWind(time);
       /*****************************************
        * WIND ANIMATION CALL - END
        *****************************************/
       /*****************************************
       * CLOUD ANIMATION CALL - START
       *****************************************/
       animateClouds(time);
       /*****************************************
        * CLOUD ANIMATION CALL - END
        *****************************************/
      objects.forEach((object) => {
        object.rotation.x = time / 1000;
        object.rotation.z = time / 1000;
        object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
      });
      renderer.render(scene, camera);
    }

    // Start the animation loop
    renderer.setAnimationLoop(animate);

    // Resize handling
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Clean up when the component unmounts
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return <div />;
};

export default App;
