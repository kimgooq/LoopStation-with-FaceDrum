const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/Line2.js";
import { LineMaterial } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/LineGeometry.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(640, 480);
renderer.setViewport(0, 0, 640, 480);
document.body.appendChild(renderer.domElement);

const camera_ar = new THREE.PerspectiveCamera(45, 480 / 640, 1, 500);
camera_ar.position.set(0, 0, 100);
camera_ar.lookAt(0, 0, 0);
camera_ar.up.set(0, 1, 0);

// const controls = new OrbitControls(camera_ar, renderer.domElement);
// controls.update();

const scene = new THREE.Scene();
const texture_bg = new THREE.VideoTexture(videoElement);
scene.background = texture_bg;
let point_mesh = null;

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

      if (point_mesh == null) {
        let oval_point_geo = new THREE.BufferGeometry();
        const num_oval_points = FACEMESH_FACE_OVAL.length;
        const oval_vertices = []; //new Float32Array(num_oval_points);
        for (let i = 0; i < num_oval_points; i++) {
          const index = FACEMESH_FACE_OVAL[i][0];
          const pos_ns = landmarks[index];
          // 0 ~ 1 -> -1 ~ 1
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
          //oval_vertices[i] = pos_ws;
          oval_vertices.push(pos_ws.x, pos_ws.y, pos_ws.z);
        }
        const point_mat = new THREE.PointsMaterial({
          color: 0xff0000,
          size: 0.07,
        });
        const line_mat = new THREE.LineBasicMaterial({
          color: 0xff0000,
          linewidth: 0.1,
        });
        // oval_point_geo.setFromPoints(oval_vertices);
        oval_point_geo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(oval_vertices, 3)
        );

        point_mesh = new THREE.Points(oval_point_geo, point_mat);
        // point_mesh = new THREE.Line(oval_point_geo, line_mat);
        scene.add(point_mesh);
      }
      const num_oval_points = FACEMESH_FACE_OVAL.length;
      let positions = point_mesh.geometry.attributes.position.array;
      console.log(point_mesh.geometry.attributes.position.array);
      for (let i = 0; i < num_oval_points; i++) {
        const index = FACEMESH_FACE_OVAL[i][0];
        const pos_ns = landmarks[index];
        // 0 ~ 1 -> -1 ~ 1
        const pos_ps = new THREE.Vector3(
          (pos_ns.x - 0.5) * 2,
          -(pos_ns.y - 0.5) * 2,
          pos_ns.z
        );
        let pos_ws = new THREE.Vector3(pos_ps.x, pos_ps.y, pos_ps.z).unproject(
          camera_ar
        );
        //oval_vertices[i] = pos_ws;
        positions[3 * i + 0] = pos_ws.x;
        positions[3 * i + 1] = pos_ws.y;
        positions[3 * i + 2] = pos_ws.z;
        console.log(pos_ws.z);
      }
      point_mesh.geometry.attributes.position.needsUpdate = true;
    }
  }
  renderer.render(scene, camera_ar);
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

/*const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});*/
// camera.start();

videoElement.muted = true;
videoElement.play();

async function detectFrame(now, metadata) {
  await faceMesh.send({ image: videoElement });
  videoElement.requestVideoFrameCallback(detectFrame);
}
detectFrame();
