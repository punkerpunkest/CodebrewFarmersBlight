import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import mapTexture from './assets/map.png';
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

    // Create a plane mesh for raycasting (hidden but for calculation)
    const planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false })
    );
    planeMesh.rotateX(-Math.PI / 2);
    scene.add(planeMesh);

    const textureLoader = new THREE.TextureLoader();
    const gridTexture = textureLoader.load(mapTexture)

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

    // Create a highlight mesh (will change color on mouse hover)
    const highlightMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true })
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
