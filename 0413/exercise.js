// import * as THREE from "https://cdn.skypack.dev/@three0.133.1/build/three.module.js";
// import { OrbitControls } from "https://cdn.skypack.dev/@three0.133.1/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.133.1/examples/jsm/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(640, 480);
renderer.setViewport(0, 0, 640, 480);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 640 / 480);

camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0); //world < - > view space
camera.up.set(0, 1, 0);
const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

const points = [];
points.push(new THREE.Vector3(-10, 0, 0));
points.push(new THREE.Vector3(0, 10, 0));
points.push(new THREE.Vector3(10, 0, 0));

const geometry = new THREE.BufferGeometry().setFromPoints(points);

const material = new THREE.LineBasicMaterial({ color: 0xffffff });

const line = new THREE.Line(geometry, material);
line.up.set(0, 1, 0);
line.lookAt(0, 0, 0);

scene.add(line);

animate();

function animate() {
  requestAnimationFrame(animate);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  renderer.render(scene, camera);
}
