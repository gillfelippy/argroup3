// Import necessary functions and objects
import { loadGLTF } from "/project/libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

// Function to initialize MindARThree instance
const initializeMindAR = () => {
  return new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: './assets/target/goblin.mind', // Replace with your target image path
  });
};

// Function to set up lighting for the scene
const setupLighting = (scene) => {
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);
};

// Function to load and configure the 3D model with animations
const loadAndConfigureModel = async (path, scale, position) => {
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
};

// Function to set up the anchor with the model
const setupAnchor = (mindarThree, anchorIndex, model) => {
  const anchor = mindarThree.addAnchor(anchorIndex);
  anchor.group.add(model);
};

// Function to start the rendering loop
const startRenderingLoop = (renderer, scene, camera, mixers) => {
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta)); // Update all mixers
    renderer.render(scene, camera);
  });
};

// Main function to start the AR experience
document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    const mindarThree = initializeMindAR();
    const { renderer, scene, camera } = mindarThree;

    setupLighting(scene);

    // Load and configure the model with animations
    const { model, mixer } = await loadAndConfigureModel(
      './assets/model/page5.glb',
      { x: 0.15, y: 0.15, z: 0.15 },
      { x: 0, y: -0.4, z: 0 }
    );

    // Set up anchor and add the full model to the scene
    setupAnchor(mindarThree, 0, model.scene);

    // Start the MindAR session
    await mindarThree.start();

    // Start the rendering loop with the animation mixer
    startRenderingLoop(renderer, scene, camera, [mixer]);
  };

  start();
});
