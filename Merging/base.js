const videoElement = document.getElementsByClassName("input_webcam")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

document.addEventListener("mousedown", MouseDown, false);
document.addEventListener("mouseup", MouseUp, false);

THREE.Cache.enabled = true;

import * as THREE from "three";
import { TRIANGULATION } from "../resource/triangulation.js";
import { OrbitControls } from "https://unpkg.com/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "https://unpkg.com/three@0.133.1/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://unpkg.com/three@0.133.1/examples/jsm/geometries/TextGeometry.js";
import { getGesture } from "./gesture.js";
// import { Line2 } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/Line2.js";
// import { LineMaterial } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/LineMaterial.js";
// import { LineGeometry } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/LineGeometry.js";

const renderer = new THREE.WebGLRenderer();
const r_width = 640;
const r_height = 480;
renderer.setSize(r_width, r_height);
renderer.setViewport(0, 0, r_width, r_height);
document.body.appendChild(renderer.domElement);

// camera_ar
const camera_ar = new THREE.OrthographicCamera(
  r_width / -2,
  r_width / 2,
  r_height / 2,
  r_height / -2,
  1,
  500
);
camera_ar.position.set(0, 0, 500);
camera_ar.up.set(0, 1, 0);
const camera_helper = new THREE.CameraHelper(camera_ar);

const renderer_world = new THREE.WebGLRenderer();
renderer_world.setSize(r_width, r_height);
renderer_world.setViewport(0, 0, r_width, r_height);
document.body.appendChild(renderer_world.domElement);

// camera_world
const camera_world = new THREE.PerspectiveCamera(
  45,
  r_height / r_width,
  1,
  2500
);
camera_world.position.set(50, 50, 150);
camera_world.up.set(0, 1, 0);

// light
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(0, 0, camera_ar.position.z - camera_ar.near);
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
ambientlight.position.set(0, 0, camera_ar.near);
const light_helper = new THREE.DirectionalLightHelper(light, 0);

// orbitcontrols
const controls = new OrbitControls(camera_world, renderer_world.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// raycaster
const mouse = new THREE.Vector2();
const rayCast = new THREE.Raycaster();

const scene = new THREE.Scene();
const video_texture = new THREE.VideoTexture(videoElement);

// plane with video / cam
const plane_geo = new THREE.PlaneGeometry(r_width, r_height);
const plane_mat = new THREE.MeshBasicMaterial({ map: video_texture });
const video_mesh = new THREE.Mesh(plane_geo, plane_mat);
video_mesh.position.set(0, 0, camera_ar.position.z - camera_ar.far);

// text

let textMesh, group_text;
let text_geometry_sound1;
const font_material = new THREE.MeshPhongMaterial({ color: 0xffffff });
const text_loader = new FontLoader();
text_loader.load("./DH_light.json", function (font) {
  text_geometry_sound1 = new TextGeometry("←　You", {
    font: font,
    size: 20,
    height: 1,
    curveSegments: 3,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  });
  group_text = new THREE.Group();
  group_text.matrixAutoUpdate = true;
  // group_text.position.x = 75;
  scene.add(group_text);
  //text
  // text_materials = [
  //   new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
  //   new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
  // ];
  const text_materials = [
    font_material,
    font_material, // front
    // side
  ];
  textMesh = new THREE.Mesh(text_geometry_sound1, text_materials);
  // textMesh.position.x = -200;
  group_text.add(textMesh);
  // scene.add(textMesh);
  // textMesh.matrixWorldNeedsUpdate = true;
  textMesh.matrixAutoUpdate = true;
});

scene.add(light);
scene.add(ambientlight);
scene.add(light_helper);
scene.add(camera_helper);
scene.add(video_mesh);

let face_mesh = null;
let axis_X = null;
let axis_Y = null;
let axis_Z = null;

let origin_axis_X = new THREE.Vector3(1, 0, 0);
let origin_axis_Y = new THREE.Vector3(0, 25, -1);
// let origin_axis_X = new THREE.Vector3(1, 0, 0);

const ip_lt = new THREE.Vector3(-1, 1, -1).unproject(camera_ar);
const ip_rb = new THREE.Vector3(1, -1, -1).unproject(camera_ar);
const ip_diff = new THREE.Vector3().subVectors(ip_rb, ip_lt);
const x_scale = Math.abs(ip_diff.x);

// let test = new THREE.Vector3(0.8, 0.2, 0).unproject(camera_ar);
// console.log(new THREE.Vector3(0.8, 0.2, -1).unproject(camera_ar));
// console.log(new THREE.Vector3(0.8, 0.2, 0).unproject(camera_world));
// console.log(new THREE.Vector3(0.8, 0.2, 0.5).unproject(camera_world));
// console.log(new THREE.Vector3(0.8, 0.2, 1).unproject(camera_world));
const myGesture = {
  gesture: "",
};

function landmark2WS(pos_ns, camera) {
  const pos_ps = new THREE.Vector3(
    (pos_ns.x - 0.5) * 2,
    -(pos_ns.y - 0.5) * 2,
    -1
  );
  const pos_ws = new THREE.Vector3(pos_ps.x, pos_ps.y, pos_ps.z).unproject(
    camera
  );
  pos_ws.z = -pos_ns.z * x_scale - camera.near + camera.position.z;
  return new THREE.Vector3().addVectors(
    pos_ws,
    new THREE.Vector3(0, 0, -(camera.far - camera.near) / 2)
  );
}

function landmark2WSwithoutTranslation(pos_ns, camera) {
  const pos_ps = new THREE.Vector3(
    (pos_ns.x - 0.5) * 2,
    -(pos_ns.y - 0.5) * 2,
    -1
  );
  const pos_ws = new THREE.Vector3(pos_ps.x, pos_ps.y, pos_ps.z).unproject(
    camera
  );
  pos_ws.z = -pos_ns.z * x_scale - camera.near + camera.position.z;
  return pos_ws;
}

function GetAngleTo(v1, v2) {
  const denominator = Math.sqrt(v1.lengthSq() * v2.lengthSq());

  if (denominator === 0) return Math.PI / 2;

  const theta = v1.dot(v2) / denominator;

  // clamp, to handle numerical problems

  // return Math.acos(clamp(theta, -1, 1));
  return theta;
}

function GetPS(pos) {
  return new THREE.Vector3((pos.x - 0.5) * 2, -(pos.y - 0.5) * 2, pos.z);
}
function GetWS(pos) {
  return ProjScale(
    new THREE.Vector3(pos.x, pos.y, pos.z).unproject(camera_ar),
    camera_ar.position,
    center_dist,
    250.0
  );
}

// OrthographicCamera used, so we just need translate position by (far - near)/2
function ProjScale(p_ms, cam_pos, src_d, dst_d) {
  let vec_cam2p = new THREE.Vector3().subVectors(p_ms, cam_pos);
  return new THREE.Vector3().addVectors(
    cam_pos,
    vec_cam2p.multiplyScalar(dst_d / src_d)
  );
}

const box_geometry = new THREE.BoxGeometry(8, 8, 8);
const box_material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const box_mesh = new THREE.Mesh(box_geometry, box_material);
scene.add(box_mesh);

function onResults2(results) {
  console.log(results);
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, landmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });

      if (myGesture.gesture != getGesture(landmarks)) {
        if (getGesture(landmarks) != "") {
          console.log(getGesture(landmarks));
          myGesture.gesture = getGesture(landmarks);
          if (myGesture.gesture == "One") {
            startDrum();
          }
        }
      }
    }
  }

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
      //   color: "#C0C0C070",
      //   lineWidth: 1,
      // });
      // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
      //   color: "#FF3030",
      // });
      // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
      //   color: "#FF3030",
      // });
      // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
      //   color: "#FF3030",
      // });
      // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
      //   color: "#30FF30",
      // });
      // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
      //   color: "#30FF30",
      // });
      // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
      //   color: "#30FF30",
      // });
      // drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
      //   color: "#E0E0E0",
      // });
      // drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: "#E0E0E0" });

      if (face_mesh == null) {
        // face_mesh setAttribute
        let face_geometry = new THREE.BufferGeometry();
        face_geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 3), 3)
        );
        face_geometry.setAttribute(
          "normal",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 3), 3)
        );
        face_geometry.setAttribute(
          "uv",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 2), 2)
        );
        let face_material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          specular: new THREE.Color(0, 0, 0),
          shininess: 100,
        });
        face_mesh = new THREE.Mesh(face_geometry, face_material);
        face_mesh.geometry.setIndex(TRIANGULATION);

        // face_mesh local Axis
        let LocalAxis_X_geo = new THREE.BufferGeometry();
        let LocalAxis_Y_geo = new THREE.BufferGeometry();
        let LocalAxis_Z_geo = new THREE.BufferGeometry();
        LocalAxis_X_geo.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(2 * 3), 3)
        );
        LocalAxis_Y_geo.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(2 * 3), 3)
        );
        LocalAxis_Z_geo.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(2 * 3), 3)
        );
        const LocalAxis_X_material = new THREE.LineBasicMaterial({
          color: 0x00ffff,
        });
        const LocalAxis_Y_material = new THREE.LineBasicMaterial({
          color: 0xff00ff,
        });
        const LocalAxis_Z_material = new THREE.LineBasicMaterial({
          color: 0x0000ff,
        });
        axis_X = new THREE.Line(LocalAxis_X_geo, LocalAxis_X_material);
        axis_Y = new THREE.Line(LocalAxis_Y_geo, LocalAxis_Y_material);
        axis_Z = new THREE.Line(LocalAxis_Z_geo, LocalAxis_Z_material);

        scene.add(face_mesh);
        scene.add(axis_X);
        scene.add(axis_Y);
        scene.add(axis_Z);
      }

      const p_c = new THREE.Vector3(0, 0, 0).unproject(camera_ar);
      const vec_cam2center = new THREE.Vector3().subVectors(
        p_c,
        camera_ar.position
      );
      const center_dist = vec_cam2center.length();

      // landmark for vector representing local axis
      //   let landmark_top = GetPS(landmarks[10]);
      //   let landmark_bottom = GetPS(landmarks[152]);
      //   let landmark_left = GetPS(landmarks[234]);
      //   let landmark_right = GetPS(landmarks[454]);

      // Draw face_mesh & Local Axis
      const num_points = landmarks.length;
      for (let i = 0; i < num_points; i++) {
        const pos_ns = landmarks[i];
        let pos_ws = landmark2WS(pos_ns, camera_ar);

        face_mesh.geometry.attributes.position.array[3 * i + 0] = pos_ws.x;
        face_mesh.geometry.attributes.position.array[3 * i + 1] = pos_ws.y;
        face_mesh.geometry.attributes.position.array[3 * i + 2] = pos_ws.z;
        face_mesh.geometry.attributes.uv.array[2 * i + 0] = pos_ns.x;
        face_mesh.geometry.attributes.uv.array[2 * i + 1] = 1.0 - pos_ns.y;
      }
      // wink
      let vec_left_eye_height = new THREE.Vector3(
        landmarks[159].x - landmarks[145].x,
        landmarks[159].y - landmarks[145].y,
        landmarks[159].z - landmarks[145].z
      );
      let vec_left_eye_width = new THREE.Vector3(
        landmarks[133].x - landmarks[33].x,
        landmarks[133].y - landmarks[33].y,
        landmarks[133].z - landmarks[33].z
      );

      let vec_right_eye_height = new THREE.Vector3(
        landmarks[386].x - landmarks[374].x,
        landmarks[386].y - landmarks[374].y,
        landmarks[386].z - landmarks[374].z
      );
      let vec_right_eye_width = new THREE.Vector3(
        landmarks[263].x - landmarks[362].x,
        landmarks[263].y - landmarks[362].y,
        landmarks[263].z - landmarks[362].z
      );
      // vec_left_eye = landmark2WSwithoutTranslation(vec_left_eye, camera_ar);
      const dis_left_eye =
        vec_left_eye_height.length() / vec_left_eye_width.length();
      const dis_right_eye =
        vec_right_eye_height.length() / vec_right_eye_width.length();
      // console.log(dis_left_eye);
      let lefteye_Isopened = 1;
      let righteye_Isclosed = 1;
      // for wink detection, must check other eye is enough opened
      if (dis_left_eye < 0.075 && dis_right_eye > 0.25) {
        lefteye_Isopened = -1;
      } else if (dis_right_eye < 0.075 && dis_left_eye > 0.25) {
        righteye_Isclosed = -1;
      }
      let Iswink = lefteye_Isopened * righteye_Isclosed;
      if (Iswink < 0) {
        console.log("wink");
      }

      // mouth
      let vec_mouth_height = new THREE.Vector3(
        landmarks[0].x - landmarks[17].x,
        landmarks[0].y - landmarks[17].y,
        landmarks[0].z - landmarks[17].z
      );
      let vec_mouth_width = new THREE.Vector3(
        landmarks[291].x - landmarks[61].x,
        landmarks[291].y - landmarks[61].y,
        landmarks[291].z - landmarks[61].z
      );
      const dis_mouth = vec_mouth_height.length() / vec_mouth_width.length();
      if (dis_mouth > 1.2) {
        console.log("A");
      }
      // box_mesh.position.set(pos_iris.x, pos_iris.y, pos_iris.z);

      // make Local Axis for vector representing face_mesh local axis
      let landmark_top = landmark2WS(landmarks[10], camera_ar);
      let landmark_bottom = landmark2WS(landmarks[152], camera_ar);
      let landmark_left = landmark2WS(landmarks[234], camera_ar); //234 105
      let landmark_right = landmark2WS(landmarks[454], camera_ar); //454 334
      let pos_root = new THREE.Vector3(
        (landmark_top.x +
          landmark_bottom.x +
          landmark_right.x +
          landmark_left.x) /
          4,
        (landmark_top.y +
          landmark_bottom.y +
          landmark_right.y +
          landmark_left.y) /
          4,
        (landmark_top.z +
          landmark_bottom.z +
          landmark_right.z +
          landmark_left.z) /
          4
      );
      group_text.position.x = pos_root.x;
      group_text.position.y = pos_root.y;
      group_text.position.z = pos_root.z;
      // left 50 right 280
      axis_X.geometry.attributes.position.array[0] = landmark_left.x;
      axis_X.geometry.attributes.position.array[1] = landmark_left.y;
      axis_X.geometry.attributes.position.array[2] = landmark_left.z;
      axis_X.geometry.attributes.position.array[3] = landmark_right.x;
      axis_X.geometry.attributes.position.array[4] = landmark_right.y;
      axis_X.geometry.attributes.position.array[5] = landmark_right.z;

      axis_Y.geometry.attributes.position.array[0] = landmark_bottom.x;
      axis_Y.geometry.attributes.position.array[1] = landmark_bottom.y;
      axis_Y.geometry.attributes.position.array[2] = landmark_bottom.z;
      axis_Y.geometry.attributes.position.array[3] = landmark_top.x;
      axis_Y.geometry.attributes.position.array[4] = landmark_top.y;
      axis_Y.geometry.attributes.position.array[5] = landmark_top.z;
      //   console.log(axis_X);
      let vec_axis_X = new THREE.Vector3(
        landmark_right.x - landmark_left.x,
        landmark_right.y - landmark_left.y,
        landmark_right.z - landmark_left.z
      );

      let vec_axis_X_RotateY = new THREE.Vector3(
        landmark_right.x - landmark_left.x,
        0,
        landmark_right.z - landmark_left.z
      );
      let vec_axis_X_RotateZ = new THREE.Vector3(
        landmark_right.x - landmark_left.x,
        landmark_right.y - landmark_left.y,
        0
      );
      let vec_axis_Y_RotateX = new THREE.Vector3(
        0,
        landmark_top.y - landmark_bottom.y,
        landmark_top.z - landmark_bottom.z
      );

      // roll
      let orientation_X = origin_axis_Y.angleTo(vec_axis_Y_RotateX);
      if (vec_axis_Y_RotateX.z < 0) {
        orientation_X *= -1;
      }
      // pitch
      let orientation_Y = origin_axis_X.angleTo(vec_axis_X_RotateY);
      if (vec_axis_X_RotateY.z > 0) {
        orientation_Y *= -1;
      }
      // yaw
      let orientation_Z = origin_axis_X.angleTo(vec_axis_X_RotateZ);
      if (vec_axis_X_RotateZ.y < 0) {
        orientation_Z *= -1;
      }

      textMesh.position.x = -175 - vec_axis_X.length() / 2;
      group_text.setRotationFromEuler(
        new THREE.Euler(orientation_X, orientation_Y, orientation_Z, "XYZ")
      );

      // degree 20 30 38
      if (orientation_X > 0.349) {
        console.log("down");
      }
      if (orientation_X < -0.349) {
        console.log("up");
      }
      if (orientation_Y > 0.52) {
        console.log("right");
      }
      if (orientation_Y < -0.52) {
        console.log("left");
      }
      if (orientation_Z > 0.66) {
        console.log("left shake");
      }
      if (orientation_Z < -0.66) {
        console.log("right shake");
      }

      face_mesh.geometry.attributes.position.needsUpdate = true;
      face_mesh.geometry.attributes.uv.needsUpdate = true;
      face_mesh.geometry.computeVertexNormals();

      axis_X.geometry.attributes.position.needsUpdate = true;
      axis_Y.geometry.attributes.position.needsUpdate = true;
      axis_Z.geometry.attributes.position.needsUpdate = true;

      let texure_frame = new THREE.CanvasTexture(results.image);
      face_mesh.material.map = texure_frame;

      light.target = face_mesh;
    }
  }
  scene.remove(light_helper);
  scene.remove(camera_helper);
  renderer.render(scene, camera_ar);

  scene.add(light_helper);
  scene.add(camera_helper);
  renderer_world.render(scene, camera_world);
  controls.update();

  canvasCtx.restore();
}

//  Get faceMesh
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
faceMesh.onResults(onResults2);

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
hands.onResults(onResults2);
console.log(hands.onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement }),
      await hands.send({ image: videoElement });
  },
  width: r_width,
  height: r_height,
});
camera.start();

// Mouse Event
let IsPressed = false;
function MouseDown(e) {
  IsPressed = true;
}
function MouseUp(e) {
  IsPressed = false;
}

renderer.domElement.addEventListener(
  "mousemove",
  function (e) {
    if (IsPressed == true) {
      mouse.x = (e.clientX / r_width) * 2 - 1;
      mouse.y = -(e.clientY / r_height) * 2 + 1;

      rayCast.setFromCamera(mouse, camera_ar);
      let n;
      n = -camera_ar.near / rayCast.ray.direction.z;

      light.position.set(
        rayCast.ray.direction.x * n,
        rayCast.ray.direction.y * n,
        camera_ar.position.z + rayCast.ray.direction.z * n
      );
      light.lookAt(0, 0, 0);
    }
  },
  false
);

const wheeltodistance = 2;
let near_og;
renderer.domElement.addEventListener(
  "mousewheel",
  function (e) {
    near_og = camera_helper.camera.near;
    if (e.wheelDelta < 0) {
      camera_helper.camera.near -= wheeltodistance;
      light.position.z += wheeltodistance;
    } else if (e.wheelDelta > 0) {
      light.position.z -= wheeltodistance;
      camera_ar.near += wheeltodistance;
    }
    light.position.x *= camera_helper.camera.near / near_og;
    light.position.y *= camera_helper.camera.near / near_og;
    light.lookAt(0, 0, 0);
    camera_ar.updateProjectionMatrix();
    camera_helper.update();
    light_helper.update();
  },
  false
);
