var container;
var camera, scene, renderer;

// Sphere 1
var sphereGeometry1, sphereMaterial1, sphereMesh1;

// Sphere 2
var sphereGeometry2, sphereMaterial2, sphereMesh2;

// Pivot point
var pivotPoint;

// Camera settings
var FOV = 35;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var NEAR = 1;
var FAR = 10000;

// Renderer
pixelRatio = window.devicePixelRatio;

// Background color
backgroundColor = new THREE.Color(0x21252d);

init();
animate();

function init() {
  // Container
  container = document.createElement("div");
  document.body.appendChild(container);

  // Camera
  camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, NEAR, FAR);

  // Scene
  scene = new THREE.Scene();

  // -------------------------------------

  // Sphere Geometry 1
  sphereGeometry1 = new THREE.SphereBufferGeometry(100, 30, 30);

  // Sphere Material 1
  sphereMaterial1 = new THREE.MeshLambertMaterial({
    color: 0xfccdd3,
  });

  // Sphere Mesh 1
  sphereMesh1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
  sphereMesh1.receiveShadow = true;
  sphereMesh1.position.set(0, 1, 0);
  scene.add(sphereMesh1);

  // Pivot point
  pivotPoint = new THREE.Object3D();
  sphereMesh1.add(pivotPoint);

  // Sphere Geometry 2
  sphereGeometry2 = new THREE.SphereBufferGeometry(30, 20, 20);

  // Sphere Material 2
  sphereMaterial2 = new THREE.MeshLambertMaterial({
    color: 0x6ed3cf,
  });

  // Sphere Mesh 2
  sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);

  // Position from pivot point to sphere 2
  sphereMesh2.position.set(260, 4, 6);

  // make the pivotpoint the sphere's parent.
  pivotPoint.add(sphereMesh2);

  // Lights
  var spotLight1 = new THREE.SpotLight(0xf0fdff, 2.5);
  spotLight1.position.set(300, 400, 0);
  spotLight1.castShadow = true;
  spotLight1.shadowDarkness = 0.2;
  spotLight1.shadow.bias = 0.0001;
  spotLight1.angle = Math.PI / 4;
  spotLight1.penumbra = 0.05;
  spotLight1.decay = 2;
  spotLight1.distance = 1000;
  spotLight1.shadow.camera.near = 1;
  spotLight1.shadow.camera.far = 1000;
  spotLight1.shadow.mapSize.width = 1024;
  spotLight1.shadow.mapSize.height = 1024;
  camera.lookAt(scene.position);
  scene.add(spotLight1);

  var spotLight2 = new THREE.SpotLight(0xf0fdff, 2.3);
  spotLight2.position.set(-300, 400, 0);
  spotLight2.castShadow = true;
  spotLight2.shadowDarkness = 0.2;
  spotLight2.shadow.bias = 0.0001;
  spotLight2.angle = Math.PI / 4;
  spotLight2.penumbra = 0.05;
  spotLight2.decay = 2;
  spotLight2.distance = 1000;
  spotLight2.shadow.camera.near = 1;
  spotLight2.shadow.camera.far = 1000;
  spotLight2.shadow.mapSize.width = 1024;
  spotLight2.shadow.mapSize.height = 1024;
  camera.lookAt(scene.position);
  scene.add(spotLight2);

  hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 500, 0);
  scene.add(hemiLight);

  // -------------------------------------

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(WIDTH, HEIGHT);

  // Background color
  renderer.setClearColor(backgroundColor);

  // Create canvas in DOM and apply to container
  container.appendChild(renderer.domElement);

  // Event Listener
  window.addEventListener("resize", onWindowResize, false);

  // Position and point the camera to the center of the scene
  camera.position.x = 300;
  camera.position.y = 400;
  camera.position.z = 700;
  camera.lookAt(scene.position);

  // Shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Gamma
  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  // Fog
  scene.fog = new THREE.Fog(0x23272a, 0.5, 1700, 4000);
} // End of init

// Resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  render();
}

// Mesh animation
function render() {
  // -------------------------------------
  // Animating sphere 1
  var time = Date.now() * 0.0005;
  sphereMesh1.position.x = Math.cos(time * 10) * 5;
  sphereMesh1.position.y = Math.cos(time * 7) * 3;
  sphereMesh1.position.z = Math.cos(time * 8) * 4;

  // Animating sphere 2
  pivotPoint.rotation.y += 0.05;

  // -------------------------------------
}
