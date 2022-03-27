import * as THREE from "./three.module.js";
// import { MathUtils } from "./MathUtils.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight
);
camera.position.set(50, -50, 100);
camera.lookAt(0, 0, 0);
camera.up.set(0, 1, 0);

//light
const ambientLight = new THREE.AmbientLight(0x404040);
ambientLight.position.set(15, 15, 50);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 20, 20);

//floor
const plane_geo = new THREE.PlaneGeometry(100, 100, 1, 1);
const plane_material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
const plane = new THREE.Mesh(plane_geo, plane_material);
plane.position.set(0, 0, 0);
plane.lookAt(0, 0, 100);
plane.up.set(0, 1, 0);

//box
const box_side = 10;
const box_geo = new THREE.BoxGeometry(box_side, box_side, box_side);
const texture = new THREE.TextureLoader();
const material = new THREE.MeshPhongMaterial({
  map: texture.load("./image.PNG"),
});
/*
 - 'r' :  큐브의 x 축 방향으로 3도 rotation
 - 't' :  큐브의 y 축 방향으로 3도 rotation
 - 'y' :  큐브의 z 축 방향으로 3도 rotation
 - 'f' :  큐브의 x 축 방향으로 -3도 rotation
 - 'g' :  큐브의 y 축 방향으로 -3도 rotation
 - 'h' :  큐브의 z 축 방향으로 -3도 rotation
(40점)
 - 'a' :  큐브를 화면의 왼쪽 방향으로 10 pix 만큼 평행 이동
 - 'd' :  큐브를 화면의 오른쪽 방향으로 10 pix 만큼 평행 이동
 - 'w' :  큐브를 화면의 위쪽 방향으로 10 pix 만큼 평행 이동
 - 's' :  큐브를 화면의 아래쪽 방향으로 10 pix 만큼 평행 이동
*/
const box = new THREE.Mesh(box_geo, material);
box.position.set(0, 0, box_side / 2);
box.lookAt(0, 0, 100);
box.up.set(0, 1, 0);
box.matrixAutoUpdate = false;
// key 'r' > x 3 degree
let mat_r = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(3));
// key 't' > y 3 degree
let mat_t = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(3));
// key 'y' > z 3 degree
let mat_y = new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(3));
// key 'f' > x 3 degree
let mat_f = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(-3));
// key 'g' > y 3 degree
let mat_g = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(-3));
// key 'h' > z 3 degree
let mat_h = new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(-3));

// box.matrix = new THREE.Matrix4().makeTranslation(0, 0, 10).multiply(mat_r);
// box.matrix = new THREE.Matrix4().makeTranslation(0, 0, 80);

scene.add(plane);
scene.add(ambientLight);
scene.add(light);
scene.add(box);

document.addEventListener("keydown", (event) => {
  if (event.key == "r") {
    console.log("r");
    box.matrix = box.matrix.multiply(mat_r);
  }
  if (event.key == "t") {
    console.log("t");
    box.matrix = box.matrix.multiply(mat_t);
  }
  if (event.key == "y") {
    console.log("y");
    box.matrix = box.matrix.multiply(mat_y);
  }
  if (event.key == "f") {
    console.log("f");
    box.matrix = box.matrix.multiply(mat_f);
  }
  if (event.key == "g") {
    console.log("g");
    box.matrix = box.matrix.multiply(mat_g);
  }
  if (event.key == "h") {
    console.log("h");
    box.matrix = box.matrix.multiply(mat_h);
  }
  if (event.key == "z") {
    console.log("test");
    box = box.translate(10, 0, 0);
  }
});

// renderer.render(scene, camera);
animate();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
