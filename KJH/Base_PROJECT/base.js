const videoElement = document.getElementsByClassName("input_webcam")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

document.addEventListener("mousedown", MouseDown, false);
document.addEventListener("mouseup", MouseUp, false);

import * as THREE from "three";
import { TRIANGULATION } from "../resource/triangulation.js";
import { OrbitControls } from "https://unpkg.com/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/Line2.js";
import { LineMaterial } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/LineGeometry.js";

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
camera_ar.position.set(0, 0, 100);
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

scene.add(light);
scene.add(ambientlight);
scene.add(light_helper);
scene.add(camera_helper);
scene.add(video_mesh);

let face_mesh = null;
let axis_X = null;
let axis_Y = null;
let axis_Z = null;

const ip_lt = new THREE.Vector3(-1, 1, -1).unproject(camera_ar);
const ip_rb = new THREE.Vector3(1, -1, -1).unproject(camera_ar);
const ip_diff = new THREE.Vector3().subVectors(ip_rb, ip_lt);
const x_scale = Math.abs(ip_diff.x);

function landmark2WS(pos_ns, camera) {
  const pos_ps = new THREE.Vector3(
    (pos_ns.x - 0.5) * 2,
    -(pos_ns.y - 0.5) * 2,
    0
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

function onResults2(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1,
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
        color: "#E0E0E0",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: "#E0E0E0" });

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
      // make Local Axis for vector representing face_mesh local axis
      let landmark_top = landmark2WS(landmarks[10], camera_ar);
      let landmark_bottom = landmark2WS(landmarks[152], camera_ar);
      let landmark_left = landmark2WS(landmarks[105], camera_ar); //234
      let landmark_right = landmark2WS(landmarks[334], camera_ar); //454
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

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
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
