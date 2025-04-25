import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import mapTexture from './assets/map.png';
import soil from './assets/soil_texture5.jpg';
import daylight from './assets/daylight.png';
import SimpleOverlay from './SimpleOverlay';
import wheat from './assets/wheat/scene.gltf?url';
import island from './assets/island/scene.gltf?url';
import croptext from './assets/croptext/result.gltf?url';
import field from './assets/wheat_field_low_poly/scene.gltf?url';
import panel1 from './assets/CropPanel.png';
import panel2 from './assets/CropPanel2.png';

import protein from './assets/CropProteinA.png';
import calories from './assets/CropCalories.png';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const App = () => {
  
  useEffect(() => {
    // Create the scene  const scene = new THREE.Scene();
    const gltfloader = new GLTFLoader();
    let wheatModel;

    const bestPlantGrid = [
      ["Barley", "Rice", "Sugarcane", "Sunflower", "Soybean", "Sunflower", "Sunflower", "Sunflower", "Wheat", "Potato", "Corn", "Rice", "Barley", "Potato", "Corn", "Wheat"],
      ["Sugarcane", "Corn", "Wheat", "Soybean", "Wheat", "Rice", "Barley", "Potato", "Corn", "Rice", "Potato", "Sunflower", "Soybean", "Wheat", "Corn", "Rice"],
      ["Rice", "Sunflower", "Corn", "Soybean", "Barley", "Corn", "Potato", "Sugarcane", "Potato", "Soybean", "Corn", "Barley", "Rice", "Sunflower", "Corn", "Rice"],
      ["Barley", "Rice", "Sugarcane", "Corn", "Soybean", "Wheat", "Sunflower", "Rice", "Soybean", "Potato", "Wheat", "Sugarcane", "Corn", "Barley", "Sunflower", "Potato"],
      ["Sunflower", "Rice", "Corn", "Soybean", "Barley", "Potato", "Sugarcane", "Wheat", "Corn", "Rice", "Soybean", "Sugarcane", "Barley", "Potato", "Wheat", "Sunflower"],
      ["Wheat", "Potato", "Sugarcane", "Soybean", "Rice", "Corn", "Barley", "Sunflower", "Soybean", "Corn", "Sugarcane", "Wheat", "Rice", "Potato", "Corn", "Wheat"],
      ["Barley", "Wheat", "Rice", "Potato", "Soybean", "Sunflower", "Corn", "Sugarcane", "Sunflower", "Corn", "Barley", "Rice", "Wheat", "Potato", "Soybean", "Corn"],
      ["Soybean", "Sugarcane", "Corn", "Barley", "Sunflower", "Potato", "Wheat", "Rice", "Corn", "Soybean", "Sugarcane", "Potato", "Rice", "Wheat", "Barley", "Sunflower"],
      ["Rice", "Corn", "Wheat", "Soybean", "Sunflower", "Potato", "Barley", "Sugarcane", "Corn", "Rice", "Soybean", "Barley", "Potato", "Wheat", "Corn", "Sunflower"],
      ["Potato", "Corn", "Rice", "Soybean", "Sunflower", "Wheat", "Barley", "Sugarcane", "Corn", "Soybean", "Potato", "Wheat", "Rice", "Barley", "Sunflower", "Corn"],
      ["Rice", "Wheat", "Barley", "Potato", "Soybean", "Corn", "Sunflower", "Sugarcane", "Barley", "Corn", "Soybean", "Wheat", "Potato", "Sunflower", "Rice", "Corn"],
      ["Corn", "Sugarcane", "Potato", "Wheat", "Barley", "Rice", "Soybean", "Sunflower", "Corn", "Barley", "Wheat", "Potato", "Soybean", "Sugarcane", "Corn", "Rice"],
      ["Wheat", "Soybean", "Rice", "Corn", "Sunflower", "Potato", "Barley", "Sugarcane", "Corn", "Wheat", "Barley", "Rice", "Potato", "Soybean", "Sunflower", "Corn"],
      ["Barley", "Sunflower", "Corn", "Potato", "Rice", "Soybean", "Wheat", "Sugarcane", "Sunflower", "Potato", "Barley", "Corn", "Rice", "Soybean", "Wheat", "Corn"],
      ["Sugarcane", "Wheat", "Barley", "Sunflower", "Corn", "Soybean", "Potato", "Rice", "Sunflower", "Corn", "Wheat", "Soybean", "Rice", "Potato", "Barley", "Sugarcane"],
      ["Rice", "Corn", "Wheat", "Potato", "Barley", "Soybean", "Sunflower", "Sugarcane", "Corn", "Barley", "Rice", "Wheat", "Potato", "Soybean", "Sunflower", "Corn"]
    ];
    
    let croptextModel;
    let islandModel;
    let fieldModel;
    let textSprite = null;
    let textCanvas = null;
    let textContext = null;
    let textTexture = null;
    let textMaterial = null;
    let isFieldHovered = false;
    let originalMaterials = new Map();
    gltfloader.load(
      wheat, 
      (gltfScene) => {

        wheatModel = gltfScene.scene;
        wheatModel.position.set(1000, 1000, 1000);
        scene.add(wheatModel);
        
       
      },
      (progress) => {
        // Optional: Log loading progress
        console.log("Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (error) => {
        // This will catch loading errors
        console.error("Error loading wheat model:", error);
      }
    );
    gltfloader.load(
      island, 
      (gltfScene) => {

        islandModel = gltfScene.scene;
        islandModel.scale.set(0.4, 0.4, 0.4)
        islandModel.position.set(0, 0, 15);
        scene.add(islandModel);
        
       
      },
      (progress) => {
        // Optional: Log loading progress
        console.log("Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (error) => {
        // This will catch loading errors
        console.error("Error loading island model:", error);
      }
    );
    gltfloader.load(
      croptext, 
      (gltfScene) => {

        croptextModel = gltfScene.scene;
        croptextModel.scale.set(2, 2, 2)
        croptextModel.position.set(0, 8, 11);

        // Rotate 180 degrees around Y axis (in radians)
        croptextModel.rotation.y = Math.PI; // 180 degrees

        // Make the model completely white by traversing all meshes
        croptextModel.traverse((child) => {
          if (child.isMesh) {
            // Create a new white material
            child.material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            
            // If you want to preserve the original material type but make it white:
            // child.material.color.set(0xFFFFFF);
          }
        });
        scene.add(croptextModel);
        
       
      },
      (progress) => {
        // Optional: Log loading progress
        console.log("Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (error) => {
        // This will catch loading errors
        console.error("Error loading island model:", error);
      }
    );
    gltfloader.load(
      field, 
      (gltfScene) => {

        fieldModel = gltfScene.scene;
        fieldModel.scale.set(0.004, 0.004, 0.004)
        fieldModel.position.set(1, 3.8, 13);
        fieldModel.traverse((child) => {
          if (child.isMesh) {
            // Mark this model as interactive
            child.userData.isField = true;
            
            // Store original materials to restore later
            originalMaterials.set(child.uuid, child.material.clone());
          }
        });
        scene.add(fieldModel);
        
       
      },
      (progress) => {
        // Optional: Log loading progress
        console.log("Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (error) => {
        // This will catch loading errors
        console.error("Error loading island model:", error);
      }
    );
    function setBackgroundImage(imagePath) {
      // Create a texture loader
      const backgroundLoader = new THREE.TextureLoader();
      
      // Load the texture from your assets folder
      backgroundLoader.load(
        // Path to your image in the assets folder
        imagePath, 
        
        // onLoad callback - when the image has loaded successfully
        function(texture) {
          // Set the texture as the scene background
          scene.background = texture;
        },
        
        // onProgress callback - optional
        undefined,
        
        // onError callback - if the load fails
        function(err) {
          console.error('Error loading background texture:', err);
        }
      );
    }
    setBackgroundImage(daylight);


    // Create the camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 13, -25);

    // Create the renderer
    const renderer = new THREE.WebGLRenderer();
    createTextSprite();
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
    
    const soilMaterial = new THREE.MeshPhongMaterial({
      map: soilTexture,
      color: 0x755c48
    });
    
    const soilMesh = new THREE.Mesh(soilGeometry, soilMaterial);
    // Position the soil box beneath the grid
    soilMesh.position.y = -1.03; // Just 1 unit below the grid
    scene.add(soilMesh);
    soilMesh.castShadow = false;
    
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

    

    const gridMaterial = new THREE.MeshPhongMaterial({
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
              color: 0xFFFFFF,
              transparent: true,
              opacity: 0.4 + Math.random() * 0.3,
              emissive: 0xCCCCCC,
              emissiveIntensity: 0.3
            });
            
            
            const windMesh = new THREE.Mesh(windGeometry, windMaterial);
            windMesh.renderOrder = 10;
            windMesh.castShadow = false;
            windMesh.receiveShadow = false;
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
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      // Make it slightly emissive to ensure visibility
      emissive: 0x333333
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
          cloudMesh.castShadow = true;
          cloudMesh.receiveShadow = false;
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
    /*****************************************
 * RAINFALL IMPLEMENTATION - START
 *****************************************/
// Create an array to store all rain drops
const raindrops = [];

// Define a 16x16 array to determine which cloud tiles have rainfall
// true = raining, false = not raining
const rainfallGrid = [
  /* 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 */
    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 0
    [false,false,false,false,false,false, true , true ,false,false,false,false,false,false,false,false], // 1
    [false,false,false,false,false, true , true , true , true ,false,false,false,false,false,false,false], // 2
    [false,false,false,false,false, true , true , true , true ,false,false,false,false,false,false,false], // 3
    [false,false,false,false,false,false, true , true ,false,false,false,false,false,false,false,false], // 4
    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 5
    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 6
    [false,false,false,false,false,false,false,false,false, true , true ,false,false,false,false,false], // 7
    [false,false,false,false,false,false,false,false, true , true , true , true ,false,false,false,false], // 8
    [false,false,false,false,false,false,false,false, true , true , true , true ,false,false,false,false], // 9
    [false,false,false,false,false,false,false,false,false, true , true ,false,false,false,false,false], // 10
    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 11
    [false,false,false, true , true ,false,false,false,false,false,false,false,false,false,false,false], // 12
    [false,false, true , true , true , true ,false,false,false,false,false,false,false,false,false,false], // 13
    [false,false, true , true , true , true ,false,false,false,false,false,false,false,false,false,false], // 14
    [false,false,false, true , true ,false,false,false,false,false,false,false,false,false,false,false], // 15
];

// Create a rain material (semi-transparent blue)
const rainMaterial = new THREE.MeshBasicMaterial({
  color: 0x9db3ff,
  transparent: true,
  opacity: 0.6
});

// Create a raindrop geometry (thin elongated box)
const rainGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);

// Create rain container
const rainContainer = new THREE.Group();
scene.add(rainContainer);

// Configure rain settings
const rainConfig = {
  maxRaindrops: 500,      // Maximum number of raindrops
  rainSpeed: 0.01,         // Base speed of raindrops
  rainVariance: 0.05,     // Speed variance
  spawnRate: 5,           // How many raindrops to spawn each frame
  minHeight: 0,           // Minimum height (ground level)
  maxHeight: 5            // Maximum height (cloud level)
};

// Function to create a new raindrop
function createRaindrop() {
  // Find a random position where there's rainfall according to the rainfallGrid
  let validPositions = [];
  
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      // Check if this position has both a cloud and is designated as a rainfall position
      if (cloudGrid[x][z] && rainfallGrid[x][z]) {
        validPositions.push({x, z});
      }
    }
  }
  
  // If no valid positions, return
  if (validPositions.length === 0) return null;
  
  // Select a random position
  const randomPos = validPositions[Math.floor(Math.random() * validPositions.length)];
  
  // Create a raindrop mesh
  const raindrop = new THREE.Mesh(rainGeometry, rainMaterial);
  
  // Position the raindrop below the cloud with some randomness
  raindrop.position.set(
    randomPos.x - 7.5 + (Math.random() * 0.8 - 0.4), // Add some random offset
    rainConfig.maxHeight, // Start at cloud level
    randomPos.z - 7.5 + (Math.random() * 0.8 - 0.4)  // Add some random offset
  );
  
  // Add individual speed property
  raindrop.speed = rainConfig.rainSpeed + (Math.random() * rainConfig.rainVariance);
  
  // Add the raindrop to the scene and array
  rainContainer.add(raindrop);
  raindrops.push(raindrop);
  
  return raindrop;
}

// Function to animate rainfall
function animateRain() {
  // Add new raindrops based on spawn rate
  for (let i = 0; i < rainConfig.spawnRate; i++) {
    // Only create new drops if below the maximum
    if (raindrops.length < rainConfig.maxRaindrops) {
      createRaindrop();
    }
  }
  
  // Update existing raindrops
  for (let i = raindrops.length - 1; i >= 0; i--) {
    const drop = raindrops[i];
    
    // Move the raindrop down
    drop.position.y -= drop.speed;
    
    // If the raindrop reaches the ground, remove it
    if (drop.position.y <= rainConfig.minHeight) {
      rainContainer.remove(drop);
      raindrops.splice(i, 1);
    }
  }
}



// You can add other event listeners here as needed
// For example: document.addEventListener('keydown', event => {
//   if (event.key === 'r') rainConfig.spawnRate = (rainConfig.spawnRate === 5) ? 10 : 5;
// });
/*****************************************
 * RAINFALL IMPLEMENTATION - END
 *****************************************/
/*****************************************
 * COLOR INTENSITY LAYER IMPLEMENTATION 
 *****************************************/


const intensityGrid = [
  [10.1, 10.2, 10.1, 10.3, 10.2, 10.1, 10.4, 10.2, 10.3, 10.1, 10.2, 10.3, 10.4, 10.2, 10.3, 10.1],
  [10.2, 10.3, 10.4, 10.2, 10.3, 10.4, 10.2, 10.3, 10.4, 10.2, 10.3, 10.4, 10.2, 10.3, 10.4, 10.2],
  [10.3, 10.4, 10.5, 10.3, 10.4, 10.5, 10.3, 10.4, 10.5, 10.3, 10.4, 10.5, 10.3, 10.4, 10.5, 10.3],
  [10.4, 10.5, 10.6, 10.4, 10.5, 10.6, 10.4, 10.5, 10.6, 10.4, 10.5, 10.6, 10.4, 10.5, 10.6, 10.4],
  [10.5, 10.6, 10.7, 10.5, 10.6, 10.7, 10.5, 10.6, 10.7, 10.5, 10.6, 10.7, 10.5, 10.6, 10.7, 10.5],
  [10.6, 10.7, 10.8, 10.6, 10.7, 10.8, 10.6, 11.0, 10.8, 10.6, 10.7, 10.8, 10.6, 10.7, 10.8, 10.6],
  [10.7, 10.8, 10.9, 10.7, 10.8, 10.9, 10.7, 10.8, 10.9, 10.7, 10.8, 10.9, 10.7, 10.8, 10.9, 10.7],
  [10.8, 10.9, 11.0, 10.8, 10.9, 11.0, 10.8, 10.9, 11.0, 10.8, 10.9, 11.0, 10.8, 10.9, 11.0, 10.8],
  [10.9, 11.0, 11.1, 10.9, 11.0, 11.1, 10.9, 11.0, 11.1, 10.9, 11.0, 11.1, 10.9, 11.0, 11.1, 10.9],
  [11.0, 11.1, 11.2, 11.0, 11.1, 11.2, 11.0, 11.1, 11.2, 11.0, 11.1, 11.2, 11.0, 11.1, 11.2, 11.0],
  [11.1, 11.2, 11.3, 11.1, 11.2, 11.3, 11.1, 11.2, 11.3, 11.1, 11.2, 11.3, 11.1, 11.2, 11.3, 11.1],
  [11.2, 11.3, 11.4, 11.2, 11.3, 11.4, 11.2, 11.3, 11.4, 11.2, 11.3, 11.4, 11.2, 11.3, 11.4, 11.2],
  [11.3, 11.4, 11.5, 11.3, 11.4, 11.5, 11.3, 11.4, 11.5, 11.3, 11.4, 11.5, 11.3, 11.4, 11.5, 11.3],
  [11.4, 11.5, 11.6, 11.4, 11.5, 11.6, 11.4, 11.5, 11.6, 11.4, 11.5, 11.6, 11.4, 11.5, 11.6, 11.4],
  [11.5, 11.6, 11.7, 11.5, 11.6, 11.7, 11.5, 11.6, 11.7, 11.5, 11.6, 11.7, 11.5, 11.6, 12.2, 11.5],
  [11.6, 11.7, 11.8, 11.6, 11.7, 11.8, 11.6, 11.7, 11.8, 11.6, 11.7, 11.8, 11.6, 11.7, 11.8, 11.6],
];


const colorGridContainer = new THREE.Group();
scene.add(colorGridContainer);


const redColor = new THREE.Color(0xff0000);
const greenColor = new THREE.Color(0x00ff00);

// Function to find the min and max values in the grid
function findMinMaxValues(grid) {
  let min = Infinity;
  let max = -Infinity;
  
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      const value = grid[x][z];
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  
  return { min, max };
}

// Find the value range
let { min, max } = findMinMaxValues(intensityGrid);
let range = max - min;

// Create a function to normalize values and map them to colors
function getColorForValue(value) {
  // Normalize the value to range [0,1]
  const normalizedValue = (value - min) / range;
  
  // Create a color by lerping between yellow and green
  const color = new THREE.Color();
  color.lerpColors(redColor, greenColor, normalizedValue);
  
  return color;
}

// Create color tiles for each grid position
function createColorGrid() {
  // Clear any existing tiles
  while (colorGridContainer.children.length > 0) {
    colorGridContainer.remove(colorGridContainer.children[0]);
  }
  
  // Create a tile for each grid position
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      const value = intensityGrid[x][z];
      const color = getColorForValue(value);
      
      // Create a plane geometry for this tile
      const tileGeometry = new THREE.PlaneGeometry(1, 1);
      const tileMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      
      const tile = new THREE.Mesh(tileGeometry, tileMaterial);
      tile.renderOrder = 10;
      // Position the tile at grid coordinates with slight offset above ground
      tile.position.set(
        x - 7.5, // Center the grid
        0.05,    // Just above the ground
        z - 7.5  // Center the grid
      );
      
      // Rotate to be flat/horizontal
      tile.rotation.x = -Math.PI / 2;
      
      // Add to container
      colorGridContainer.add(tile);
    }
  }
}

// Create the color grid
createColorGrid();

// Optional: Function to update the color grid if data changes
function updateColorGrid(newData) {
  // Update the data grid
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      intensityGrid[x][z] = newData[x][z];
    }
  }
  
  // Find new min/max values
  const { min: newMin, max: newMax } = findMinMaxValues(intensityGrid);
  min = newMin;
  max = newMax;
  range = max - min;
  
  // Update colors for all tiles
  colorGridContainer.children.forEach((tile, index) => {
    const x = Math.floor(index / 16);
    const z = index % 16;
    const value = intensityGrid[x][z];
    const color = getColorForValue(value);
    
    tile.material.color = color;
  });
}
function createTextSprite() {
  // Create canvas for the text
  textCanvas = document.createElement('canvas');
  textCanvas.width = 256;
  textCanvas.height = 128;
  textContext = textCanvas.getContext('2d');
  
  // Create texture from canvas
  textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  
  // Create material with the texture
  textMaterial = new THREE.SpriteMaterial({
    map: textTexture,
    transparent: true
  });
  
  // Create sprite with the material
  textSprite = new THREE.Sprite(textMaterial);
  textSprite.scale.set(2, 1, 1);
  textSprite.visible = false;
  
  // Add to scene
  scene.add(textSprite);
}
function updateTextSprite(x, z) {
  // Clear the canvas
  textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
  
  // Background
  textContext.fillStyle = 'rgba(17, 24, 39, 0.8)';
  textContext.fillRect(0, 0, textCanvas.width, textCanvas.height);
  
  // Border
  textContext.strokeStyle = 'rgba(74, 85, 104, 0.6)';
  textContext.lineWidth = 4;
  textContext.strokeRect(2, 2, textCanvas.width - 4, textCanvas.height - 4);
  
  // Log the raw input values
  console.log(`Raw input values: x=${x}, z=${z}`);
  
  // Make sure coordinates are within bounds (0-15) for our 16x16 grid
  const gridX = Math.max(0, Math.min(15, Math.floor(x)));
  const gridZ = Math.max(0, Math.min(15, Math.floor(z)));
  
  console.log(`Bounded grid coordinates: x=${gridX}, z=${gridZ}`);
  
  // Check for negative values
  if (x < 0) console.warn("Warning: Negative X coordinate received");
  if (z < 0) console.warn("Warning: Negative Z coordinate received");
  
  // Get best plant from our array
  // Use try-catch to detect any array access errors
  let bestPlant = "Unknown";
  try {
    bestPlant = bestPlantGrid[gridZ][gridX];
    console.log(`Successfully retrieved plant: ${bestPlant} at [${gridZ}][${gridX}]`);
  } catch (error) {
    console.error(`Error accessing bestPlantGrid[${gridZ}][${gridX}]:`, error);
  }
  
  // Text
  textContext.font = 'bold 24px monospace';
  textContext.fillStyle = 'white';
  textContext.textAlign = 'center';
  textContext.fillText(`Position: (${gridZ}, ${gridX})`, textCanvas.width / 2, 40);
  textContext.fillText(`Best Plant: ${bestPlant}`, textCanvas.width / 2, 80);
  
  // Update texture
  textTexture.needsUpdate = true;
}
function updateSpriteRotation() {
  if (textSprite && textSprite.visible) {
    textSprite.position.y = 1.5; // Keep it at consistent height
    
    // Make the text always face the camera
    textSprite.lookAt(camera.position);
  }
}
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
// More realistic shadow settings with better performance balance
directionalLight1.shadow.mapSize.width = 2048; // Good balance between quality and performance
directionalLight1.shadow.mapSize.height = 2048;
directionalLight1.shadow.camera.near = 1; // More realistic near plane for outdoor scene
directionalLight1.shadow.camera.far = 20; // Only need to see shadows within scene bounds
directionalLight1.shadow.camera.left = -8; // Tighter frustum for sharper shadows
directionalLight1.shadow.camera.right = 8;
directionalLight1.shadow.camera.top = 8;
directionalLight1.shadow.camera.bottom = -8;
directionalLight1.shadow.bias = -0.0005; // Subtle bias to prevent shadow acne
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



gridMesh.receiveShadow = true;
gridMesh.castShadow = false;









// 8. FORCE A RENDER UPDATE
// This ensures all changes take effect
setTimeout(() => {
  
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
    let intersectsField;

    // Mouse movement handler
    window.addEventListener('mousemove', (e) => {
      mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mousePosition, camera);
      intersects = raycaster.intersectObject(planeMesh);
      intersectsField = raycaster.intersectObject(fieldModel);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        console.log("Raw intersection point:", intersect.point);
        
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        console.log("Highlighted position:", highlightPos);
        
        highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);
        highlightMesh.material.color.setHex(0xFFFFFF);
        
        // Show and position the text sprite
        if (textSprite) {
          textSprite.visible = true;
          textSprite.position.set(highlightPos.x, 2, highlightPos.z); // Position above the highlighted block
          
          // Make sure coordinates are properly bounded for our 16x16 grid
          const gridX = Math.max(0, Math.min(15, Math.floor(highlightPos.x + 8)));
          const gridZ = Math.max(0, Math.min(15, Math.floor(highlightPos.z + 8)));
          
          console.log(`Sending to updateTextSprite: x=${gridX}, z=${gridZ}`);
          updateTextSprite(gridX, gridZ);
        }
      } else {
        // Hide the text sprite when not hovering
        if (textSprite) {
          textSprite.visible = false;
        }
      }
      if (intersectsField.length > 0) {
        // Mouse is hovering over the field
        if (!isFieldHovered) {
          isFieldHovered = true;
          
          // Apply highlight effect to the model
          
        }
      } else if (isFieldHovered) {
        // Mouse moved away from the field
        isFieldHovered = false;
        
       
      }
      document.body.style.cursor = 'auto';

    });

    // Sphere mesh to add on mouse click
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 4, 2),
      new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFFEA00 })
    );

    const objects = [];
    let fieldInfoPanel;
   
    // Mouse click handler
    window.addEventListener('mousedown', () => {
      if (fieldModel && intersectsField && intersectsField.length > 0) {
        showFieldInfoPanel();
      } else {
        hideFieldInfoPanel();
      }
      if (intersects.length > 0) {
        if (wheatModel) {
          // Clone the wheat model
          const wheatClone = wheatModel.clone();
          
          // Position the wheat clone at the highlight mesh location
          wheatClone.position.copy(highlightMesh.position);
          
          // You might need to adjust scale if the wheat model is too big or small
          wheatClone.scale.set(1, 1, 1);
          wheatClone.position.y = 1;
          wheatClone.traverse((child) => {
            if (child.isMesh) {
              child.renderOrder = 10; // Higher value = rendered later (on top)
              
              // If you're using transparent materials, make sure depthWrite is managed properly
              
            }
          });  
          // Add to scene and objects array
          scene.add(wheatClone);
          objects.push(wheatClone);
          
          // Change highlight color
          highlightMesh.material.color.setHex(0xFF0000);
        } else {
          // Fallback to sphere if wheat model isn't loaded yet
          const sphereClone = sphereMesh.clone();
          sphereClone.position.copy(highlightMesh.position);
          scene.add(sphereClone);
          objects.push(sphereClone);
          highlightMesh.material.color.setHex(0xFF0000);
        }
      }
    });
    function showFieldInfoPanel() {
      // Remove existing panel if there is one
      hideFieldInfoPanel();
      
      // Create a new panel element
      // Create a new panel element
     // Create a new panel element
// Create a new panel element
// Create a new panel element
// Create a new panel element
fieldInfoPanel = document.createElement('div');
fieldInfoPanel.id = 'field-info-panel';
fieldInfoPanel.style.backgroundImage = `url(${panel1})`;
fieldInfoPanel.style.backgroundSize = '100% 100%';
fieldInfoPanel.style.backgroundPosition = 'center';
fieldInfoPanel.style.backgroundRepeat = 'no-repeat';
fieldInfoPanel.style.border = 'none';
fieldInfoPanel.style.boxShadow = 'none';

// Apply Tailwind classes with no border, no shadow, no rounded corners
fieldInfoPanel.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 z-50 w-160 h-144 mt-8 overflow-hidden border-0 shadow-none rounded-none';

// Add to the document
fieldInfoPanel.innerHTML = `
  <div class="relative h-full w-full">
    <!-- Protein image positioned absolutely -->
    <div class="image-button cursor-pointer transform transition-transform hover:scale-105 absolute" 
         id="panel2-button" 
         style="top: 42%; left: 50%; transform: translate(-50%, -50%);">
      <img src="${protein}" alt="Protein" class="w-64 h-52 object-cover">
    </div>
    
    <!-- Calories image positioned absolutely -->
    <div class="image-button cursor-pointer transform transition-transform hover:scale-105 absolute" 
         id="panel3-button" 
         style="top: 70%; left: 50%; transform: translate(-50%, -50%);">
      <img src="${calories}" alt="Calories" class="w-64 h-52 object-cover">
    </div>
  </div>
`;

      document.body.appendChild(fieldInfoPanel);
      document.getElementById('panel2-button').addEventListener('click', () => {
        // Add your action for the first button
        console.log('Panel 2 button clicked');
        // Example: switchToPanel(2);
      });
      
      document.getElementById('panel3-button').addEventListener('click', () => {
        // Add your action for the second button
        console.log('Panel 3 button clicked');
        // Example: switchToPanel(3);
      });
      
      // Add event listeners to buttons
      document.getElementById('close-panel-btn').addEventListener('click', hideFieldInfoPanel);
      document.getElementById('optimize-btn').addEventListener('click', () => {
        alert('Optimizing field...');
        // Add your optimization logic here
      });
      
      // Log test confirmation
      console.log('Simple low-poly field panel displayed');
    }
    // Function to hide the info panel
    function hideFieldInfoPanel() {
      const panel = document.getElementById('field-info-panel');
      if (panel) {
        document.body.removeChild(panel);
        fieldInfoPanel = null;
      }
    }
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
       animateRain();
       updateSpriteRotation();
     
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

  
  return (
    <div className="relative w-full h-screen">
      {/* Top left panel with temperature and humidity info */}
      <div 
        className="absolute top-4 left-4 p-5 text-white overflow-hidden w-72 h-32 flex flex-col justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(45,55,72,0.9) 0%, rgba(17,24,39,0.95) 100%)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(74, 85, 104, 0.3)",
          borderRadius: "4px",
          fontFamily: "'VT323', 'Silkscreen', monospace" /* Pixelated game-like font */
        }}
      >
        <div className="text-base font-bold uppercase tracking-wider">Temperature: 70°C</div>
        <div className="text-base font-bold uppercase tracking-wider">Humidity: 70%</div>
      </div>
      
      {/* Main content area */}
      {/* You can add your canvas or other content here */}
    </div>
  );
};

export default App;
