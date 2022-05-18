import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module.js";
//import { ImageUtils } from "https://cdn.skypack.dev/three@0.133.1/src/extras/ImageUtils.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight
);

camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0); //world < - > view space
camera.up.set(0, 1, 0);

const scene = new THREE.Scene();

const points = [];
points.push(new THREE.Vector3(-10, 0, 0));
points.push(new THREE.Vector3(0, 10, 0));
points.push(new THREE.Vector3(10, 0, 0));

const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const box_geometry = new THREE.BoxGeometry(5, 5, 5);

// const texture = new THREE.TextureLoader();

const material = new THREE.LineBasicMaterial({ color: 0xffffff });
// const box_material = new THREE.MeshBasicMaterial({ color: 0xffffff });

const line = new THREE.Line(geometry, material);
// const box_obj = new THREE.Mesh(geo_box, material);

// line.position.set(0, 20, 0); //A Vector3 representing the object's local position
line.up.set(0, 1, 0);
line.lookAt(0, 0, 0);
// line.lookAt(0, 100 = 20.1, 0); //A vector representing a (current) position in world space.
// default => line.lookAt(0, position, -1)

// line.matrixAutoUpdate = false;// -> line detail X, camera & line at same time
// line.matix = new THREE.Matrix4().makeRotation(THREE.MathUtils.deToRad(-70))
// line.matrix = new THREE.Matrix4().makeTranslation(0, 15, 0);

//box
// boxObj.matrixAutoUpdate = false;

// console.log(camera);

scene.add(line);
// scene.add(boxObj);
renderer.render(scene, camera);
