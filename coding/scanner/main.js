// Import necessary functions and objects
import { loadGLTF } from "./libs/loader.js"; // Adjusted to use relative path
const THREE = window.MINDAR.IMAGE.THREE;

// Function to initialize MindARThree instance
const initializeMindAR = () => {
  try {
    return new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/target/goblin.mind', // Relative path to target file
    });
  } catch (error) {
    console.error("Error initializing MindARThree:", error);
  }
};

// Function to set up lighting for the scene
const setupLighting = (scene) => {
  try {
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
  } catch (error) {
    console.error("Error setting up lighting:", error);
  }
};

// Function to load and configure the 3D model with animations
const loadAndConfigureModel = async (path, scale, position) => {
  try {
    const model = await loadGLTF(path); // Load the GLTF model
    model.scene.scale.set(scale.x, scale.y, scale.z);
    model.scene.position.set(position.x, position.y, position.z);

    const mixer = new THREE.AnimationMixer(model.scene);

    // Play all animations in the model
    model.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
    });

    return { model, mixer };
  } catch (error) {
    console.error("Error loading and configuring model:", error);
  }
};

// Function to set up the anchor with the model
const setupAnchor = (mindarThree, anchorIndex, model) => {
  try {
    const anchor = mindarThree.addAnchor(anchorIndex);
    anchor.group.add(model);
  } catch (error) {
    console.error("Error setting up anchor:", error);
  }
};

// Function to start the rendering loop
const startRenderingLoop = (renderer, scene, camera, mixers) => {
  try {
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      mixers.forEach((mixer) => mixer.update(delta)); // Update all mixers
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.error("Error starting rendering loop:", error);
  }
};

// Main function to start the AR experience
document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    console.log("Starting AR experience...");
    try {
      const mindarThree = initializeMindAR();
      if (!mindarThree) {
        throw new Error("Failed to initialize MindARThree.");
      }

      const { renderer, scene, camera } = mindarThree;

      setupLighting(scene);

      // Load and configure the model with animations
      const { model, mixer } = await loadAndConfigureModel(
        './assets/model/page5.glb', // Relative path to model file
        { x: 0.15, y: 0.15, z: 0.15 },
        { x: 0, y: -0.4, z: 0 }
      );

      if (!model) {
        throw new Error("Failed to load 3D model.");
      }

      // Set up anchor and add the full model to the scene
      setupAnchor(mindarThree, 0, model.scene);

      // Start the MindAR session
      await mindarThree.start();

      // Start the rendering loop with the animation mixer
      startRenderingLoop(renderer, scene, camera, [mixer]);
    } catch (error) {
      console.error("Error during AR experience setup:", error);
    }
  };

  start();
});

