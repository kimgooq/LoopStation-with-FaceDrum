const videoElement = document.getElementsByClassName("input_webcam")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

document.addEventListener("mousedown", MouseDown, false);
document.addEventListener("mouseup", MouseUp, false);

import * as THREE from "three";
import { TRIANGULATION } from "./triangulation.js";
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

const camera_ar = new THREE.PerspectiveCamera(60, r_height / r_width, 50, 300);
camera_ar.position.set(0, 0, 100);
camera_ar.up.set(0, 1, 0);
const camera_helper = new THREE.CameraHelper(camera_ar);

const renderer_world = new THREE.WebGLRenderer();
renderer_world.setSize(r_width, r_height);
renderer_world.setViewport(0, 0, r_width, r_height);
document.body.appendChild(renderer_world.domElement);

const camera_world = new THREE.PerspectiveCamera(
  45,
  r_height / r_width,
  1,
  2000
);
camera_world.position.set(50, 50, 150);
camera_world.up.set(0, 1, 0);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(0, 0, camera_ar.position.z - camera_ar.near);
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
ambientlight.position.set(0, 0, camera_ar.near);
const light_helper = new THREE.DirectionalLightHelper(light, 0);

const controls = new OrbitControls(camera_world, renderer_world.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const mouse = new THREE.Vector2();
const rayCast = new THREE.Raycaster();

const scene = new THREE.Scene();
const video_texture = new THREE.VideoTexture(videoElement);

const frustumHeight =
  2.0 * camera_ar.far * Math.tan(THREE.MathUtils.degToRad(camera_ar.fov * 0.5));
const frustumWidth = frustumHeight * camera_ar.aspect;

const plane_geo = new THREE.PlaneGeometry(frustumWidth, frustumHeight);
const plane_mat = new THREE.MeshBasicMaterial({ map: video_texture });
const video_mesh = new THREE.Mesh(plane_geo, plane_mat);
video_mesh.position.set(0, 0, camera_ar.position.z - camera_ar.far);

scene.add(light);
scene.add(ambientlight);
scene.add(light_helper);
scene.add(camera_helper);
scene.add(video_mesh);

let oval_point_mesh = null;
let oval_line = null;
let face_mesh = null;

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

      if (oval_point_mesh == null) {
        let oval_point_geo = new THREE.BufferGeometry();
        let oval_line_geo = new LineGeometry();
        const num_oval_points = FACEMESH_FACE_OVAL.length;
        const oval_vertices = [];
        for (let i = 0; i < num_oval_points; i++) {
          const index = FACEMESH_FACE_OVAL[i][0];
          const pos_ns = landmarks[index];
          const pos_ps = new THREE.Vector3(
            (pos_ns.x - 0.5) * 2,
            -(pos_ns.y - 0.5) * 2,
            pos_ns.z
          );
          let pos_ws = new THREE.Vector3(
            pos_ps.x,
            pos_ps.y,
            pos_ps.z
          ).unproject(camera_ar);
          oval_vertices.push(pos_ws.x, pos_ws.y, pos_ws.z);
        }
        const oval_vertices_line = oval_vertices.slice();
        oval_vertices_line.push(
          oval_vertices_line[0],
          oval_vertices_line[1],
          oval_vertices_line[2]
        );

        const point_mat = new THREE.PointsMaterial({
          color: 0xff0000,
          size: 3,
        });

        const line_mat = new LineMaterial({
          color: 0x00ff00,
          linewidth: 0.01,
        });

        oval_point_geo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(oval_vertices, 3)
        );

        oval_line_geo.setPositions(oval_vertices_line);
        oval_point_mesh = new THREE.Points(oval_point_geo, point_mat);
        oval_line = new Line2(oval_line_geo, line_mat);
        oval_line.computeLineDistances();

        let face_geometry = new THREE.BufferGeometry();
        face_geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 3), 3) // x, y, z -> length*3
        );
        face_geometry.setAttribute(
          "normal",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 3), 3) // x, y, z -> length*3
        );
        face_geometry.setAttribute(
          "uv",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 2), 2) // x, y, z -> length*3
        );
        let face_material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          specular: new THREE.Color(0, 0, 0),
          shininess: 100,
        });
        face_mesh = new THREE.Mesh(face_geometry, face_material);
        face_mesh.geometry.setIndex(TRIANGULATION);

        scene.add(oval_point_mesh);
        scene.add(oval_line);
        scene.add(face_mesh);
      }

      const p_c = new THREE.Vector3(0, 0, 0).unproject(camera_ar);
      const vec_cam2center = new THREE.Vector3().subVectors(
        p_c,
        camera_ar.position
      );
      const center_dist = vec_cam2center.length();

      const num_oval_points = FACEMESH_FACE_OVAL.length;
      let positions = oval_point_mesh.geometry.attributes.position.array;
      let positions_line = new Float32Array(positions.length + 3);

      for (let i = 0; i < num_oval_points; i++) {
        const index = FACEMESH_FACE_OVAL[i][0];
        const pos_ns = landmarks[index];
        const pos_ps = new THREE.Vector3(
          (pos_ns.x - 0.5) * 2,
          -(pos_ns.y - 0.5) * 2,
          pos_ns.z
        );
        let pos_ws = new THREE.Vector3(pos_ps.x, pos_ps.y, pos_ps.z).unproject(
          camera_ar
        );
        pos_ws = ProjScale(pos_ws, camera_ar.position, center_dist, 100.0);
        positions[3 * i + 0] = pos_ws.x;
        positions[3 * i + 1] = pos_ws.y;
        positions[3 * i + 2] = pos_ws.z;

        positions_line[3 * i + 0] = pos_ws.x;
        positions_line[3 * i + 1] = pos_ws.y;
        positions_line[3 * i + 2] = pos_ws.z;
        if (i == num_oval_points - 1) {
          positions_line[3 * i + 3] = positions_line[0];
          positions_line[3 * i + 4] = positions_line[1];
          positions_line[3 * i + 5] = positions_line[2];
        }
      }
      oval_point_mesh.geometry.attributes.position.needsUpdate = true;
      oval_line.geometry.setPositions(positions_line);

      const num_points = landmarks.length;
      for (let i = 0; i < num_points; i++) {
        const pos_ns = landmarks[i];
        const pos_ps = new THREE.Vector3(
          (pos_ns.x - 0.5) * 2,
          -(pos_ns.y - 0.5) * 2,
          pos_ns.z
        );
        let pos_ws = new THREE.Vector3(pos_ps.x, pos_ps.y, pos_ps.z).unproject(
          camera_ar
        );
        pos_ws = ProjScale(pos_ws, camera_ar.position, center_dist, 100.0);

        face_mesh.geometry.attributes.position.array[3 * i + 0] = pos_ws.x;
        face_mesh.geometry.attributes.position.array[3 * i + 1] = pos_ws.y;
        face_mesh.geometry.attributes.position.array[3 * i + 2] = pos_ws.z;
        face_mesh.geometry.attributes.uv.array[2 * i + 0] = pos_ns.x;
        face_mesh.geometry.attributes.uv.array[2 * i + 1] = 1.0 - pos_ns.y;
      }
      face_mesh.geometry.attributes.position.needsUpdate = true;
      face_mesh.geometry.attributes.uv.needsUpdate = true;
      face_mesh.geometry.computeVertexNormals();

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
