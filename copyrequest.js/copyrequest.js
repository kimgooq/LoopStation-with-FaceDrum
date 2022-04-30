import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
//상대경로 아니라 패키징 네임을 설정해야함

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);
camera.up.set(0, 1, 0);

const scene = new THREE.Scene();
// const texture = new THREE.TextureLoader().load( 'popcat.jpg' );
const geometry_box = new THREE.BoxGeometry(8, 8, 8); //이건 크기 조절
// const material_box = new THREE.MeshPhongMaterial({map : texture,shininess : 300});
const material_box = new THREE.MeshPhongMaterial({ color: 0xffffff });

const controls = new OrbitControls(camera, renderer.domElement);
//더이상 이카메라는 사용하지 않음 (카메라가 오빗 컨트롤 안에 들어갔기에 오빗 컨트롤이 이벤트에 연결되어 내부적으로 설정하게됨)
// controls.update();

const boxObj = new THREE.Mesh(geometry_box, material_box);
const lights = new THREE.DirectionalLight(0xffffff, 0.9);
lights.position.set(1, 0, 2);

boxObj.matrixAutoUpdate = false;
boxObj.matrix = new THREE.Matrix4().makeTranslation(0, 0, 10);

scene.add(boxObj);
scene.add(lights);
// renderer.render(scene, camera);

let a = 0,
  b = 0,
  c = 0;
let g = 0,
  f = 0;

// function updatemove() {
//     let rot_x = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(a));
//     let rot_y = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(b));
//     let rot_z = new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(c));
//     boxObj.matrix = new THREE.Matrix4().makeTranslation(g,f,10).multiply(rot_x).multiply(rot_y).multiply(rot_z);
// }

// document.addEventListener("keydown", (e) => {
//     if(e.key === 'r' || e.key === 'ㄱ')a += 3;
//     else if (e.key === 't'|| e.key === 'ㅅ')b += 3;
//     else if (e.key === 'y'|| e.key === 'ㅛ')c += 3;
//     else if (e.key === 'f'|| e.key === 'ㄹ')a -= 3;
//     else if (e.key === 'g'|| e.key === 'ㅎ')b -= 3;
//     else if (e.key === 'h'|| e.key === 'ㅗ')c -= 3;

//     else if(e.key === 'w'|| e.key ==='ㅈ') f += 10;
//     else if(e.key === 's'|| e.key ==='ㄴ')f -= 10;
//     else if(e.key === 'a'|| e.key ==='ㅁ')g -= 10;
//     else if(e.key === 'd'|| e.key ==='ㅇ')g += 10;
//     updatemove();
//     renderer.render( scene, camera );
// });

animate();
function animate() {
  requestAnimationFrame(animate);

  // 만약 controls.enableDamping, controls.autoRotate 둘 중 하나라도 true로 설정될 경우 필수로 호출되어야 합니다.
  controls.update();

  renderer.render(scene, camera);
}
