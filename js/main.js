const videoElement = document.getElementsByClassName("input_webcam")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

// LoopStation Audio Source
var audioArray = [
  new Audio("./sound/drum/1_808.wav"),
  new Audio("./sound/drum/2_808.wav"),
  new Audio("./sound/drum/3_Clap.wav"),
  new Audio("./sound/drum/4_Cym.wav"),
  new Audio("./sound/drum/5_Kick.wav"),
  new Audio("./sound/drum/6_Snap.wav"),
  new Audio("./sound/drum/7_Stomp.wav"),
  new Audio("./sound/drum/8_Vox.wav"),
];
var audio_metronome = new Audio("./sound/metronome/metro.wav");

let isPlay = false;
let count = 1;
let ends = null,
  timestarter = null;
let interval;

function startDrum() {
  if (isPlay == false) {
    timestarter = new Date();
    interval = setInterval(function () {
      console.log(count);
      audio_metronome.currentTime = 0;
      audio_metronome.play();
      if (count === 8) {
        // 8 rythm
        count = 0;
        timestarter = new Date();
        pushPadDict();
      }
      count++;
    }, (60 * 1000) / 80); // 80 bpm
    isPlay = !isPlay;
  }
}

function StopDrum() {
  if (isPlay == true) {
    clearInterval(interval);
    isPlay = !isPlay;
  }
}

function DrumPlay(index) {
  audioArray[index].currentTime = 0;
  audioArray[index].play();
  ends = new Date();
  const timegap = ends - timestarter;
  console.log(timegap);
  if (isPlay) {
    padDict[index].push(timegap);
  }
}
let padDict = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
};
let clpadDict = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
};
function pushPadDict() {
  for (const [key, value] of Object.entries(padDict)) {
    clpadDict[key] = _pushPad(value, clpadDict[key], key);
  }
}
function _pushPad(pad, clpad, soundIdx) {
  if (pad[0] != undefined) {
    for (let i = 0; i < pad.length; i++) {
      clpad.push(
        setTimeout(function () {
          // consider if sound is not finished.. user would think it should be recorded
          audioArray[soundIdx].currentTime = 0;
          audioArray[soundIdx].play();
        }, pad[i])
      );
    }
  }

  return clpad;
}
function ResetDrumSound() {
  padDict[0] = [];
  padDict[1] = [];
  padDict[2] = [];
  padDict[3] = [];
  padDict[4] = [];
  padDict[5] = [];
  padDict[6] = [];
  padDict[7] = [];
}

THREE.Cache.enabled = true;

import * as THREE from "three";
import { TRIANGULATION } from "./triangulation.js";
import { OrbitControls } from "https://unpkg.com/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "https://unpkg.com/three@0.133.1/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://unpkg.com/three@0.133.1/examples/jsm/geometries/TextGeometry.js";
import { getGesture } from "./gesture.js";

const renderer = new THREE.WebGLRenderer();
// 640/480
const r_width = (window.innerWidth * 5) / 6;
const r_height = ((window.innerWidth * 5) / 6 / 640) * 480;
const c_width = 640;
const c_height = 480;
renderer.setSize(r_width, r_height);
renderer.setViewport(0, 0, r_width, r_height);
document.body.appendChild(renderer.domElement);

// camera_ar
const camera_ar = new THREE.OrthographicCamera(
  c_width / -2,
  c_width / 2,
  c_height / 2,
  c_height / -2,
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
  c_height / c_width,
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

const scene = new THREE.Scene();
const video_texture = new THREE.VideoTexture(videoElement);

// plane with video / cam
const plane_geo = new THREE.PlaneGeometry(c_width, c_height);
const plane_mat = new THREE.MeshBasicMaterial({ map: video_texture });
const video_mesh = new THREE.Mesh(plane_geo, plane_mat);
video_mesh.position.set(0, 0, camera_ar.position.z - camera_ar.far);

let textMesh_left_808,
  textMesh_right_808,
  textMesh_clap,
  textMesh_cym,
  textMesh_kick,
  textMesh_snap,
  textMesh_stomp,
  textMesh_vox;
let group_text = new THREE.Group();
let text_materials, red_text_materials;

const text_loader = new FontLoader();
text_loader.load("../json/DH_light.json", function (font) {
  const text_geometry_left808 = new TextGeometry("808　←", {
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
  const text_geometry_right808 = new TextGeometry("→　808", {
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
  const text_geometry_clap = new TextGeometry("Clap", {
    font: font,
    size: 13,
    height: 1,
    curveSegments: 3,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  });
  const text_geometry_cym = new TextGeometry("Cym\n　↑", {
    font: font,
    size: 15,
    height: 1,
    curveSegments: 3,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  });
  const text_geometry_kick = new TextGeometry("Kick　↙", {
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
  const text_geometry_stomp = new TextGeometry("↘　Stomp", {
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
  const text_geometry_snap = new TextGeometry("　↓\nSnap", {
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
  const text_geometry_vox = new TextGeometry("Vox", {
    font: font,
    size: 15,
    height: 1,
    curveSegments: 3,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  });
  const font_material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const red_font_material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  group_text.matrixAutoUpdate = true;

  scene.add(group_text);
  text_materials = [font_material, font_material];
  red_text_materials = [red_font_material, red_font_material];
  textMesh_left_808 = new THREE.Mesh(text_geometry_left808, text_materials);
  textMesh_right_808 = new THREE.Mesh(text_geometry_right808, text_materials);
  textMesh_clap = new THREE.Mesh(text_geometry_clap, text_materials);
  textMesh_cym = new THREE.Mesh(text_geometry_cym, text_materials);
  textMesh_kick = new THREE.Mesh(text_geometry_kick, text_materials);
  textMesh_stomp = new THREE.Mesh(text_geometry_stomp, text_materials);
  textMesh_snap = new THREE.Mesh(text_geometry_snap, text_materials);
  textMesh_vox = new THREE.Mesh(text_geometry_vox, text_materials);
  group_text.add(
    textMesh_left_808,
    textMesh_right_808,
    textMesh_clap,
    textMesh_cym,
    textMesh_kick,
    textMesh_stomp,
    textMesh_snap,
    textMesh_vox
  );
});

scene.add(light);
scene.add(ambientlight);
scene.add(light_helper);
scene.add(camera_helper);
scene.add(video_mesh);

let face_mesh = null;
let axis_X = null;
let axis_Y = null;

// set Origin Axis, common state
let origin_axis_X = new THREE.Vector3(1, 0, 0);
let origin_axis_Y = new THREE.Vector3(0, 25, -1);

const ip_lt = new THREE.Vector3(-1, 1, -1).unproject(camera_ar);
const ip_rb = new THREE.Vector3(1, -1, -1).unproject(camera_ar);
const ip_diff = new THREE.Vector3().subVectors(ip_rb, ip_lt);
const x_scale = Math.abs(ip_diff.x);

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

// = THREE JS Vector3.angleTo(Vector3)
function GetAngleTo(v1, v2) {
  const denominator = Math.sqrt(v1.lengthSq() * v2.lengthSq());

  if (denominator === 0) return Math.PI / 2;

  const theta = v1.dot(v2) / denominator;

  // clamp, to handle numerical problems
  // return Math.acos(clamp(theta, -1, 1));
  return theta;
}

// OrthographicCamera used, so we just need translate position by (far - near)/2
function ProjScale(p_ms, cam_pos, src_d, dst_d) {
  let vec_cam2p = new THREE.Vector3().subVectors(p_ms, cam_pos);
  return new THREE.Vector3().addVectors(
    cam_pos,
    vec_cam2p.multiplyScalar(dst_d / src_d)
  );
}

const myGesture = {
  gesture: "",
};

let state_down = false;
let state_up = false;
let state_left = false;
let state_right = false;
let state_wink = false;
let state_mouth = false;
let state_leftshake = false;
let state_rightshake = false;

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
  if (results.rightHandLandmarks) {
    const landmarks_hand = results.rightHandLandmarks;
    if (myGesture.gesture != getGesture(landmarks_hand)) {
      if (getGesture(landmarks_hand) != "") {
        console.log(getGesture(landmarks_hand));
        myGesture.gesture = getGesture(landmarks_hand);
        if (myGesture.gesture == "One") {
          startDrum();
        }
        if (myGesture.gesture == "Two") {
          StopDrum();
        }
        if (myGesture.gesture == "Three") {
          ResetDrumSound();
        }
        if (myGesture.gesture == "ThumbDOWN") {
          audio_metronome.muted = true;
        }
        if (myGesture.gesture == "ThumbUP") {
          audio_metronome.muted = false;
        }
      }
    }
  }

  if (results.faceLandmarks) {
    const landmarks_face = results.faceLandmarks;
    if (face_mesh == null) {
      // face_mesh setAttribute
      let face_geometry = new THREE.BufferGeometry();
      face_geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array(landmarks_face.length * 3),
          3
        )
      );
      face_geometry.setAttribute(
        "normal",
        new THREE.BufferAttribute(
          new Float32Array(landmarks_face.length * 3),
          3
        )
      );
      face_geometry.setAttribute(
        "uv",
        new THREE.BufferAttribute(
          new Float32Array(landmarks_face.length * 2),
          2
        )
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
      LocalAxis_X_geo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(2 * 3), 3)
      );
      LocalAxis_Y_geo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(2 * 3), 3)
      );
      const LocalAxis_X_material = new THREE.LineBasicMaterial({
        color: 0xff0000,
      });
      const LocalAxis_Y_material = new THREE.LineBasicMaterial({
        color: 0x00ff00,
      });
      axis_X = new THREE.Line(LocalAxis_X_geo, LocalAxis_X_material);
      axis_Y = new THREE.Line(LocalAxis_Y_geo, LocalAxis_Y_material);

      scene.add(face_mesh);
      scene.add(axis_X);
      scene.add(axis_Y);
    }
    // Draw face_mesh & Local Axis
    const num_points = landmarks_face.length;
    for (let i = 0; i < num_points; i++) {
      const pos_ns = landmarks_face[i];
      let pos_ws = landmark2WS(pos_ns, camera_ar);

      face_mesh.geometry.attributes.position.array[3 * i + 0] = pos_ws.x;
      face_mesh.geometry.attributes.position.array[3 * i + 1] = pos_ws.y;
      face_mesh.geometry.attributes.position.array[3 * i + 2] = pos_ws.z;
      face_mesh.geometry.attributes.uv.array[2 * i + 0] = pos_ns.x;
      face_mesh.geometry.attributes.uv.array[2 * i + 1] = pos_ns.y; // 1.0 - pos_ns.y;
    }
    // wink
    let vec_left_eye_height = new THREE.Vector3(
      landmarks_face[159].x - landmarks_face[145].x,
      landmarks_face[159].y - landmarks_face[145].y,
      landmarks_face[159].z - landmarks_face[145].z
    );
    let vec_left_eye_width = new THREE.Vector3(
      landmarks_face[133].x - landmarks_face[33].x,
      landmarks_face[133].y - landmarks_face[33].y,
      landmarks_face[133].z - landmarks_face[33].z
    );

    let vec_right_eye_height = new THREE.Vector3(
      landmarks_face[386].x - landmarks_face[374].x,
      landmarks_face[386].y - landmarks_face[374].y,
      landmarks_face[386].z - landmarks_face[374].z
    );
    let vec_right_eye_width = new THREE.Vector3(
      landmarks_face[263].x - landmarks_face[362].x,
      landmarks_face[263].y - landmarks_face[362].y,
      landmarks_face[263].z - landmarks_face[362].z
    );
    // vec_left_eye = landmark2WSwithoutTranslation(vec_left_eye, camera_ar);
    const dis_left_eye =
      vec_left_eye_height.length() / vec_left_eye_width.length();
    const dis_right_eye =
      vec_right_eye_height.length() / vec_right_eye_width.length();

    // mouth
    let vec_mouth_height = new THREE.Vector3(
      landmarks_face[0].x - landmarks_face[17].x,
      landmarks_face[0].y - landmarks_face[17].y,
      landmarks_face[0].z - landmarks_face[17].z
    );
    let vec_mouth_width = new THREE.Vector3(
      landmarks_face[291].x - landmarks_face[61].x,
      landmarks_face[291].y - landmarks_face[61].y,
      landmarks_face[291].z - landmarks_face[61].z
    );

    // make Local Axis for vector representing face_mesh local axis
    const landmark_top = landmark2WS(landmarks_face[10], camera_ar);
    const landmark_bottom = landmark2WS(landmarks_face[152], camera_ar);
    const landmark_left = landmark2WS(landmarks_face[234], camera_ar); //234 105
    const landmark_right = landmark2WS(landmarks_face[454], camera_ar); //454 334
    const pos_root = new THREE.Vector3(
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

    const vec_axis_X = new THREE.Vector3(
      landmark_right.x - landmark_left.x,
      landmark_right.y - landmark_left.y,
      landmark_right.z - landmark_left.z
    );
    const vec_axis_Y = new THREE.Vector3(
      landmark_top.x - landmark_bottom.x,
      landmark_top.y - landmark_bottom.y,
      landmark_top.z - landmark_bottom.z
    );
    // root to wink
    const pos_for_wink = landmark2WS(landmarks_face[168], camera_ar).sub(
      pos_root
    );
    // root to vox
    const pos_for_vox = landmark2WS(landmarks_face[13], camera_ar).sub(
      pos_root
    );

    const vec_axis_X_RotateY = new THREE.Vector3(
      landmark_right.x - landmark_left.x,
      0,
      landmark_right.z - landmark_left.z
    );
    const vec_axis_X_RotateZ = new THREE.Vector3(
      landmark_right.x - landmark_left.x,
      landmark_right.y - landmark_left.y,
      0
    );
    const vec_axis_Y_RotateX = new THREE.Vector3(
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

    // set Text Mesh position, textMesh width(or height) size was used as static value(int)
    textMesh_left_808.position.x = -130 - vec_axis_X.length() / 2;
    textMesh_right_808.position.x = 12 + vec_axis_X.length() / 2;
    textMesh_clap.position.set(
      pos_for_wink.x - 30,
      pos_for_wink.y + 20,
      pos_for_wink.z
    );
    textMesh_cym.position.set(-20, 30 + vec_axis_Y.length() / 2, 0);
    group_text.setRotationFromEuler(
      new THREE.Euler(orientation_X, orientation_Y, orientation_Z, "XYZ")
    );
    textMesh_kick.position.set(
      -130 - vec_axis_X.length() / 2,
      -vec_axis_Y.length() / 2,
      0
    );
    textMesh_stomp.position.set(
      12 + vec_axis_X.length() / 2,
      -vec_axis_Y.length() / 2,
      0
    );
    textMesh_snap.position.set(-35, -vec_axis_Y.length() + 65, 0);
    textMesh_vox.position.set(pos_for_vox.x - 30, pos_for_vox.y, pos_for_vox.z);

    // play drum by orientation
    if (orientation_X > 0.349 && state_down == false) {
      // console.log("down");
      state_down = true;
      DrumPlay(5);
      textMesh_snap.material = red_text_materials;
    } else if (orientation_X < 0.349) {
      state_down = false;
      textMesh_snap.material = text_materials;
    }

    if (orientation_X < -0.349 && state_up == false) {
      // console.log("up");
      state_up = true;
      DrumPlay(3);
      textMesh_cym.material = red_text_materials;
    } else if (orientation_X > -0.349) {
      state_up = false;
      textMesh_cym.material = text_materials;
    }

    if (orientation_Y > 0.52 && state_right == false) {
      // console.log("right");
      state_right = true;
      DrumPlay(0);
      textMesh_right_808.material = red_text_materials;
    } else if (orientation_Y < 0.52) {
      state_right = false;
      textMesh_right_808.material = text_materials;
    }

    if (orientation_Y < -0.52 && state_left == false) {
      // console.log("left");
      state_left = true;
      DrumPlay(1);
      textMesh_left_808.material = red_text_materials;
    } else if (orientation_Y > -0.52) {
      state_left = false;
      textMesh_left_808.material = text_materials;
    }

    if (orientation_Z > 0.66 && state_leftshake == false) {
      // console.log("left shake");
      state_leftshake = true;
      DrumPlay(4);
      textMesh_kick.material = red_text_materials;
    } else if (orientation_Z < 0.66) {
      state_leftshake = false;
      textMesh_kick.material = text_materials;
    }

    if (orientation_Z < -0.66 && state_rightshake == false) {
      // console.log("right shake");
      state_rightshake = true;
      DrumPlay(6);
      textMesh_stomp.material = red_text_materials;
    } else if (orientation_Z > -0.66) {
      state_rightshake = false;
      textMesh_stomp.material = text_materials;
    }

    const dis_mouth = vec_mouth_height.length() / vec_mouth_width.length();
    if (dis_mouth > 1.2 && state_mouth == false) {
      // console.log("A");
      state_mouth = true;
      DrumPlay(7);
      textMesh_vox.material = red_text_materials;
    } else if (dis_mouth < 1.2) {
      state_mouth = false;
      textMesh_vox.material = text_materials;
    }

    // for wink detection, consider that both eyes are closed during wink
    let lefteye_Isopened = 1;
    let righteye_Isclosed = 1;

    if (dis_right_eye < 0.2 && dis_left_eye < 0.2) {
      lefteye_Isopened = -1;
      righteye_Isclosed = -1;
    } else if (dis_left_eye < 0.09) {
      lefteye_Isopened = -1;
      righteye_Isclosed = 1;
      console.log("left closed");
    } else if (dis_right_eye < 0.09) {
      lefteye_Isopened = 1;
      righteye_Isclosed = -1;
      console.log("right closed");
    }
    if (lefteye_Isopened * righteye_Isclosed < 0 && state_wink == false) {
      // console.log("wink");
      state_wink = true;
      DrumPlay(2);
      textMesh_clap.material = red_text_materials;
    } else if (lefteye_Isopened > 0 && righteye_Isclosed > 0) {
      state_wink = false;
      textMesh_clap.material = text_materials;
    }

    face_mesh.geometry.attributes.position.needsUpdate = true;
    face_mesh.geometry.attributes.uv.needsUpdate = true;
    face_mesh.geometry.computeVertexNormals();

    axis_X.geometry.attributes.position.needsUpdate = true;
    axis_Y.geometry.attributes.position.needsUpdate = true;

    let texure_frame = new THREE.CanvasTexture(results.image);
    face_mesh.material.map = texure_frame;

    light.target = face_mesh;
  }
  scene.remove(light_helper);
  scene.remove(camera_helper);
  scene.remove(face_mesh);
  scene.remove(axis_X);
  scene.remove(axis_Y);
  renderer.render(scene, camera_ar);

  scene.add(light_helper);
  scene.add(camera_helper);
  scene.add(face_mesh);
  scene.add(axis_X);
  scene.add(axis_Y);
  renderer_world.render(scene, camera_world);
  controls.update();

  canvasCtx.restore();
}

//  Get faceMesh
const holistic = new Holistic({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
  },
});

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  refineFaceLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
holistic.onResults(onResults2);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({ image: videoElement });
  },
  width: c_width,
  height: c_height,
});
camera.start();
