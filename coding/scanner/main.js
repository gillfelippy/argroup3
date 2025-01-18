// Import necessary functions and objects
import { loadGLTF } from "./libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

// Function to initialize MindARThree instance
const initializeMindAR = () => {
  try {
    return new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/target/goblin.mind', // Replace with your target image path
    });
  } catch (error) {
    console.error("Error initializing MindAR:", error);
    alert("Failed to initialize MindAR. Check console for details.");
  }
};

// Function to set up lighting for the scene
const setupLighting = (scene) => {
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);
};

// Function to load and configure the 3D model with animations
const loadAndConfigureModel = async (path, scale, position) => {
  try {
    const model = await loadGLTF(path);
    model.scene.scale.set(scale.x, scale.y, scale.z);
    model.scene.position.set(position.x, position.y, position.z);

    const mixer = new THREE.AnimationMixer(model.scene);

    // Play all animations in the model (adjust if needed for specific clips)
    model.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
    });

    return { model, mixer };
  } catch (error) {
    console.error("Error loading model:", error);
    alert("Failed to load 3D model. Check console for details.");
  }
};

// Function to set up the anchor with the model
const setupAnchor = (mindarThree, anchorIndex, model) => {
  try {
    const anchor = mindarThree.addAnchor(anchorIndex);
    anchor.group.add(model);
  } catch (error) {
    console.error("Error setting up anchor:", error);
    alert("Failed to set up anchor. Check console for details.");
  }
};

// Function to start the rendering loop
const startRenderingLoop = (renderer, scene, camera, mixers) => {
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    try {
      const delta = clock.getDelta();
      mixers.forEach((mixer) => mixer.update(delta)); // Update all mixers
      renderer.render(scene, camera);
    } catch (error) {
      console.error("Error in rendering loop:", error);
    }
  });
};

// Main function to start the AR experience
document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    try {
      const mindarThree = initializeMindAR();
      if (!mindarThree) return; // Exit if initialization failed

      const { renderer, scene, camera } = mindarThree;

      setupLighting(scene);

      // Load and configure the model with animations
      const { model, mixer } = await loadAndConfigureModel(
        './assets/model/page5.glb',
        { x: 0.15, y: 0.15, z: 0.15 },
        { x: 0, y: -0.4, z: 0 }
      );
      if (!model || !mixer) return; // Exit if model loading failed

      // Set up anchor and add the full model to the scene
      setupAnchor(mindarThree, 0, model.scene);

      // Start the MindAR session
      await mindarThree.start();

      // Start the rendering loop with the animation mixer
      startRenderingLoop(renderer, scene, camera, [mixer]);
    } catch (error) {
      console.error("Error starting AR experience:", error);
      alert("Failed to start AR experience. Check console for details.");
    }
  };

  start();
});

