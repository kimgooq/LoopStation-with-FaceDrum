const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

import "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
import "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js";
import "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
import "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";

import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.133.1/examples/jsm/loaders/GLTFLoader.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
const render_w = videoElement.videoWidth;
const render_h = videoElement.videoHeight;
// const render_w = 640;
// const render_h = 480;
console.log(renderer);
renderer.setSize(render_w, render_h);
renderer.setViewport(0, 0, render_w, render_h);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const camera_ar = new THREE.PerspectiveCamera(
  45,
  render_w / render_h,
  0.1,
  1000
);
camera_ar.position.set(-1, 2, 3);
camera_ar.up.set(0, 1, 0);
camera_ar.lookAt(0, 1, 0);

const camera_world = new THREE.PerspectiveCamera(
  45,
  render_w / render_h,
  1,
  1000
);
camera_world.position.set(0, 1, 3);
camera_world.up.set(0, 1, 0);
camera_world.lookAt(0, 1, 0);
camera_world.updateProjectionMatrix();

const controls = new OrbitControls(camera_ar, renderer.domElement);
controls.enablePan = true;
controls.enableZoom = true;
controls.target.set(0, 1, -1);
controls.update();

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 5;
dirLight.shadow.camera.bottom = -5;
dirLight.shadow.camera.left = -5;
dirLight.shadow.camera.right = 5;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 500;
scene.add(dirLight);

const ground_mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
);
ground_mesh.rotation.x = -Math.PI / 2;
ground_mesh.receiveShadow = true;
scene.add(ground_mesh);

const grid_helper = new THREE.GridHelper(1000, 1000);
grid_helper.rotation.x = Math.PI / 2;
ground_mesh.add(grid_helper);

let model,
  skeleton = null,
  skeleton_helper,
  mixer,
  numAnimations;
let axis_helpers = [];
const loader = new GLTFLoader();
loader.load("./Xbot.glb", function (gltf) {
  model = gltf.scene;
  scene.add(model);

  let bones = [];
  model.traverse(function (object) {
    if (object.isMesh) object.castShadow = true;

    //console.log(object.isBone);
    if (object.isBone) {
      // https://stackoverflow.com/questions/13309289/three-js-geometry-on-top-of-another
      bones.push(object);
      //console.log(object);
      //if(object.name == "mixamorigLeftToeBase") {
      //let axis_helper = new THREE.AxesHelper(20);
      //axis_helper.material.depthTest = false;
      //object.add(new THREE.AxesHelper(20));
      //}
      //let axis_helper = new THREE.AxesHelper(20);
      //axis_helper.material.depthTest = false;
      //object.add(axis_helper);
      //axis_helpers.push(axis_helper);
    }
  });

  bones.forEach(function (bone) {
    console.log(bone.name);
  });

  skeleton = new THREE.Skeleton(bones);

  skeleton_helper = new THREE.SkeletonHelper(model);
  skeleton_helper.visible = true;

  scene.add(skeleton_helper);

  //const animations = gltf.animations;
  //mixer = new THREE.AnimationMixer( model );

  //numAnimations = animations.length;

  //console.log(model.position);
  //console.log(model.scale);
});

let name_to_index = {
  nose: 0,
  left_eye_inner: 1,
  left_eye: 2,
  left_eye_outer: 3,
  right_eye_inner: 4,
  right_eye: 5,
  right_eye_outer: 6,
  left_ear: 7,
  right_ear: 8,
  mouse_left: 9,
  mouse_right: 10,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_pinky: 17,
  right_pinky: 18,
  left_index: 19,
  right_index: 20,
  left_thumb: 21,
  right_thumb: 22,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
  left_heel: 29,
  right_heel: 30,
  left_foot_index: 31,
  right_foot_index: 32,
};
let index_to_name = {};
for (const [key, value] of Object.entries(name_to_index)) {
  //console.log(key, value);
  index_to_name[value] = key;
}

let axis_helper_root = new THREE.AxesHelper(1);
axis_helper_root.position.set(0, 0.001, 0);
scene.add(axis_helper_root);

const poselandmarks_points = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    color: 0xff0000,
    size: 0.1,
    sizeAttenuation: true,
  })
);
const Newposelandmarks_points = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    color: 0x0000ff,
    size: 0.1,
    sizeAttenuation: true,
  })
);
poselandmarks_points.geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(33 * 3), 3)
);
Newposelandmarks_points.geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(7 * 3), 3)
);
scene.add(poselandmarks_points);
scene.add(Newposelandmarks_points);

function computeR(A, B) {
  // get unit vectors
  const uA = A.clone().normalize();
  const uB = B.clone().normalize();

  // get products
  const idot = uA.dot(uB);
  const cross_AB = new THREE.Vector3().crossVectors(uA, uB);
  const cdot = cross_AB.length();

  // get new unit vectors
  const u = uA.clone();
  const v = new THREE.Vector3()
    .subVectors(uB, uA.clone().multiplyScalar(idot))
    .normalize();
  const w = cross_AB.clone().normalize();

  // get change of basis matrix
  const C = new THREE.Matrix4().makeBasis(u, v, w).transpose();

  // get rotation matrix in new basis
  const R_uvw = new THREE.Matrix4().set(
    idot,
    -cdot,
    0,
    0,
    cdot,
    idot,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );

  // full rotation matrix
  //const R = new Matrix4().multiplyMatrices(new Matrix4().multiplyMatrices(C, R_uvw), C.clone().transpose());
  const R = new THREE.Matrix4().multiplyMatrices(
    C.clone().transpose(),
    new THREE.Matrix4().multiplyMatrices(R_uvw, C)
  );
  return R;
}

function onResults2(results) {
  if (!results.poseLandmarks) {
    return;
  }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  {
    // Only overwrite existing pixels.
    // canvasCtx.globalCompositeOperation = 'source-in';
    // canvasCtx.fillStyle = '#00FF00';
    // canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = "destination-atop";
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    //console.log(results.poseLandmarks);

    canvasCtx.globalCompositeOperation = "source-over";
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 2,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      radius: 1,
    });
    canvasCtx.restore();
  }

  function update3dpose(camera, dist_from_cam, offset, poseLandmarks) {
    // if the camera is orthogonal, set scale to 1
    const ip_lt = new THREE.Vector3(-1, 1, -1).unproject(camera);
    const ip_rb = new THREE.Vector3(1, -1, -1).unproject(camera);
    const ip_diff = new THREE.Vector3().subVectors(ip_rb, ip_lt);
    const x_scale = Math.abs(ip_diff.x);

    function ProjScale(p_ms, cam_pos, src_d, dst_d) {
      let vec_cam2p = new THREE.Vector3().subVectors(p_ms, cam_pos);
      return new THREE.Vector3().addVectors(
        cam_pos,
        vec_cam2p.multiplyScalar(dst_d / src_d)
      );
    }

    let pose3dDict = {};
    for (const [key, value] of Object.entries(poseLandmarks)) {
      let p_3d = new THREE.Vector3(
        (value.x - 0.5) * 2.0,
        -(value.y - 0.5) * 2.0,
        0
      ).unproject(camera);
      p_3d.z = -value.z * x_scale - camera.near + camera.position.z;
      //console.log(p_3d.z);
      p_3d = ProjScale(p_3d, camera.position, camera.near, dist_from_cam);
      pose3dDict[key] = p_3d.add(offset);
    }

    return pose3dDict;
  }

  {
    let pose_landmarks_dict = {};
    let newJoints3D = {};
    results.poseLandmarks.forEach((landmark, i) => {
      //console.log(i, landmark);
      //console.log(index_to_name[i]);
      pose_landmarks_dict[index_to_name[i]] = landmark;
    });

    let pos_3d_landmarks = update3dpose(
      camera_world,
      1.5,
      new THREE.Vector3(1, 0, -1.5),
      pose_landmarks_dict
    );
    //console.log(pos_3d_landmarks["left_heel"]);

    let i = 0;
    for (const [key, value] of Object.entries(pos_3d_landmarks)) {
      poselandmarks_points.geometry.attributes.position.array[3 * i + 0] =
        value.x;
      poselandmarks_points.geometry.attributes.position.array[3 * i + 1] =
        value.y;
      poselandmarks_points.geometry.attributes.position.array[3 * i + 2] =
        value.z;
      i++;
    }
    poselandmarks_points.geometry.attributes.position.needsUpdate = true;

    // add landmarks for spine
    const center_hips = new THREE.Vector3()
      .addVectors(pos_3d_landmarks["left_hip"], pos_3d_landmarks["right_hip"])
      .multiplyScalar(0.5);
    // center_hips.multiplyScalar(0.5);
    const center_shoulders = new THREE.Vector3()
      .addVectors(
        pos_3d_landmarks["left_shoulder"],
        pos_3d_landmarks["right_shoulder"]
      )
      .multiplyScalar(0.5);
    const center_ear = new THREE.Vector3()
      .addVectors(pos_3d_landmarks["left_ear"], pos_3d_landmarks["right_ear"])
      .multiplyScalar(0.5);

    const dir_spine = new THREE.Vector3().subVectors(
      center_shoulders,
      center_hips
    );
    const length_spine = dir_spine.length();
    dir_spine.normalize();

    const dir_shoulders = new THREE.Vector3().subVectors(
      pos_3d_landmarks["right_shoulder"],
      pos_3d_landmarks["left_shoulder"]
    );

    newJoints3D["hips"] = new THREE.Vector3().addVectors(
      center_hips,
      dir_spine.clone().multiplyScalar(length_spine / 9.0)
    );
    newJoints3D["spine0"] = new THREE.Vector3().addVectors(
      center_hips,
      dir_spine.clone().multiplyScalar((length_spine / 9.0) * 3)
    );
    newJoints3D["spine1"] = new THREE.Vector3().addVectors(
      center_hips,
      dir_spine.clone().multiplyScalar((length_spine / 9.0) * 5)
    );
    newJoints3D["spine2"] = new THREE.Vector3().addVectors(
      center_hips,
      dir_spine.clone().multiplyScalar((length_spine / 9.0) * 7)
    );
    const neck = new THREE.Vector3().addVectors(
      center_shoulders,
      dir_spine.clone().multiplyScalar(length_spine / 9.0)
    );
    newJoints3D["neck"] = neck;
    newJoints3D["shoulder_left"] = new THREE.Vector3().addVectors(
      pos_3d_landmarks["left_shoulder"],
      dir_shoulders.clone().multiplyScalar(1 / 3.0)
    );
    newJoints3D["shoulder_right"] = new THREE.Vector3().addVectors(
      pos_3d_landmarks["left_shoulder"],
      dir_shoulders.clone().multiplyScalar(2 / 3.0)
    );
    const dir_head = new THREE.Vector3().subVectors(center_ear, neck);
    newJoints3D["head"] = new THREE.Vector3().addVectors(
      neck,
      dir_head.clone().multiplyScalar(0.5)
    );
    // let new_pos_3d_landmarks = update3dpose(
    //   camera_world,
    //   1.5,
    //   new THREE.Vector3(1, 0, -1.5),
    //   newJoints3D
    // );
    i = 0;
    // console.log(new_pos_3d_landmarks);
    for (const [key, value] of Object.entries(newJoints3D)) {
      Newposelandmarks_points.geometry.attributes.position.array[3 * i + 0] =
        value.x;
      Newposelandmarks_points.geometry.attributes.position.array[3 * i + 1] =
        value.y;
      Newposelandmarks_points.geometry.attributes.position.array[3 * i + 2] =
        value.z;
      i++;
    }
    Newposelandmarks_points.geometry.attributes.position.needsUpdate = true;
    // for (const [key, value] of Object.entries(newJoints3D)) {
    //   pose3dDict[key] = value;
    // }
    // rigging //
    //mixamorigLeftArm : left_shoulder
    //mixamorigLeftForeArm : left_elbow
    //mixamorigLeftHand : left_wrist
    let jointLeftShoulder = pos_3d_landmarks["left_shoulder"]; // p0
    let jointLeftElbow = pos_3d_landmarks["left_elbow"]; // p1
    let boneLeftArm = skeleton.getBoneByName("mixamorigLeftArm"); // j1
    let v01 = new THREE.Vector3()
      .subVectors(jointLeftElbow, jointLeftShoulder)
      .normalize();
    let j1 = boneLeftArm.position.clone().normalize();
    let R0 = computeR(j1, v01);
    boneLeftArm.setRotationFromMatrix(R0);

    let jointLeftWrist = pos_3d_landmarks["left_wrist"]; // p2
    let boneLeftForeArm = skeleton.getBoneByName("mixamorigLeftForeArm"); // j2
    let v12 = new THREE.Vector3()
      .subVectors(jointLeftWrist, jointLeftElbow)
      .normalize();
    let j2 = boneLeftForeArm.position.clone().normalize();
    let Rv12 = v12.clone().applyMatrix4(R0.clone().transpose());
    let R1 = computeR(j2, Rv12);
    boneLeftForeArm.setRotationFromMatrix(R1);
    //console.log(boneLeftArm);

    // Right shoulder-elbow-wrist
    let jointRightShoulder = pos_3d_landmarks["right_shoulder"]; // p0_rightshoulder
    let jointRightElbow = pos_3d_landmarks["right_elbow"]; // p1_rightelbow
    let boneRightArm = skeleton.getBoneByName("mixamorigRightArm"); // j1
    let v01_rightupper = new THREE.Vector3()
      .subVectors(jointRightElbow, jointRightShoulder)
      .normalize();
    let j1_rightupper = boneRightArm.position.clone().normalize();
    // let R0_rightupper = computeR(j1_rightupper, v01_rightupper);
    let R0_rightupper = computeR(
      skeleton
        .getBoneByName("mixamorigRightForeArm")
        .position.clone()
        .normalize(),
      v01_rightupper
    );
    boneRightArm.setRotationFromMatrix(R0_rightupper);

    let jointRightWrist = pos_3d_landmarks["right_wrist"]; // p2_rightwrist
    let boneRightForeArm = skeleton.getBoneByName("mixamorigRightForeArm"); // j2
    let v12_rightupper = new THREE.Vector3()
      .subVectors(jointRightWrist, jointRightElbow)
      .normalize();
    let j2_rightupper = boneRightForeArm.position.clone().normalize();
    let Rv12_rightupper = v12_rightupper
      .clone()
      .applyMatrix4(R0_rightupper.clone().transpose());
    // let R1_rightupper = computeR(j2_rightupper, Rv12_rightupper);
    let R1_rightupper = computeR(
      skeleton.getBoneByName("mixamorigRightHand").position.clone().normalize(),
      Rv12_rightupper
    );
    boneRightForeArm.setRotationFromMatrix(R1_rightupper);

    // left upleg-leg-foot
    // let jointLeftUpLeg = pos_3d_landmarks["left_hip"]; // p0_lefthip
    // let jointLeftKnee = pos_3d_landmarks["left_knee"]; // p1_leftknee
    // let boneLeftUpLeg = skeleton.getBoneByName("mixamorigLeftUpLeg"); // j1
    // let v01_leftlower = new THREE.Vector3()
    //   .subVectors(jointLeftKnee, jointLeftUpLeg)
    //   .normalize();
    // let j1_leftlower = boneLeftUpLeg.position.clone().normalize();
    // let R0_leftlower = computeR(j1_leftlower, v01_leftlower);
    // boneLeftUpLeg.setRotationFromMatrix(R0_leftlower);

    // console.log(
    //   "mixamorigLeftLeg",
    //   skeleton.getBoneByName("mixamorigLeftLeg").position
    // );
    // console.log(
    //   "mixamorigRightLeg",
    //   skeleton.getBoneByName("mixamorigRightLeg").position
    // );
    // console.log(
    //   "mixamorigRightForeArm",
    //   skeleton.getBoneByName("mixamorigRightForeArm").position
    // );
    // console.log(
    //   "mixamorigRightArm",
    //   skeleton.getBoneByName("mixamorigRightArm").position
    // );
    // console.log(
    //   "mixamorigHips",
    //   skeleton.getBoneByName("mixamorigHips").position
    // );
    // console.log(
    //   "mixamorigNeck",
    //   skeleton.getBoneByName("mixamorigNeck").position
    // );

    // hip
    let boneHip = skeleton.getBoneByName("mixamorigHips"); // j1
    let j0_hip = boneHip.position.clone().normalize();

    // left upleg-leg-foot
    let jointLeftUpLeg = pos_3d_landmarks["left_hip"]; // p0_lefthip
    let jointLeftKnee = pos_3d_landmarks["left_knee"]; // p1_leftknee
    let boneLeftUpLeg = skeleton.getBoneByName("mixamorigLeftUpLeg"); // j1
    let v01_leftlower = new THREE.Vector3()
      .subVectors(jointLeftKnee, jointLeftUpLeg)
      .normalize();
    let j1_leftlower = boneLeftUpLeg.position.clone().normalize();
    let R0_leftlower = computeR(
      skeleton.getBoneByName("mixamorigLeftLeg").position.clone().normalize(),
      v01_leftlower
    );
    boneLeftUpLeg.setRotationFromMatrix(R0_leftlower);

    let jointLeftAnkle = pos_3d_landmarks["left_ankle"]; // p2_leftankle
    let boneLeftLeg = skeleton.getBoneByName("mixamorigLeftLeg"); // j2
    let v12_leftlower = new THREE.Vector3()
      .subVectors(jointLeftAnkle, jointLeftKnee)
      .normalize();
    let j2_leftlower = boneLeftLeg.position.clone().normalize();
    let Rv12_leftlower = v12_leftlower
      .clone()
      .applyMatrix4(R0_leftlower.clone().transpose());
    let R1_leftlower = computeR(
      skeleton.getBoneByName("mixamorigLeftFoot").position.clone().normalize(),
      Rv12_leftlower
    );
    boneLeftLeg.setRotationFromMatrix(R1_leftlower);

    // Right upleg-leg-foot
    let jointRightUpLeg = pos_3d_landmarks["right_hip"]; // p0_lefthip
    let jointRightKnee = pos_3d_landmarks["right_knee"]; // p1_leftknee
    let boneRightUpLeg = skeleton.getBoneByName("mixamorigRightUpLeg"); // j1
    let v01_rightlower = new THREE.Vector3()
      .subVectors(jointRightKnee, jointRightUpLeg)
      .normalize();
    let j1_rightlower = boneRightUpLeg.position.clone().normalize();
    let R0_rightlower = computeR(
      skeleton.getBoneByName("mixamorigRightLeg").position.clone().normalize(),
      v01_rightlower
    );
    boneRightUpLeg.setRotationFromMatrix(R0_rightlower);

    let jointRightAnkle = pos_3d_landmarks["right_ankle"]; // p2_leftankle
    let boneRightLeg = skeleton.getBoneByName("mixamorigRightLeg"); // j2
    let v12_rightlower = new THREE.Vector3()
      .subVectors(jointRightAnkle, jointRightKnee)
      .normalize();
    let j2_rightlower = boneRightLeg.position.clone().normalize();
    let Rv12_rightlower = v12_rightlower
      .clone()
      .applyMatrix4(R0_rightlower.clone().transpose());
    let R1_rightlower = computeR(
      skeleton.getBoneByName("mixamorigRightFoot").position.clone().normalize(),
      Rv12_rightlower
    );
    let test_matrix = new THREE.Matrix4().makeRotationX(1.9);
    // let test_matrix2 = new THREE.Matrix4().makeRotationX(0.1);
    boneRightLeg.setRotationFromMatrix(R1_rightlower);
    // console.log("R1_rightlower", R1_rightlower);
    // console.log(
    //   "R_matrix",
    //   new THREE.Matrix4().makeRotationFromEuler(boneRightLeg.rotation)
    // );

    // skeleton
    //   .getBoneByName("mixamorigHips")
    //   .quaternion.setFromRotationMatrix(test_matrix);
  }

  renderer.render(scene, camera_ar);
  canvasCtx.restore();
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
pose.onResults(onResults2);

// video
videoElement.play();
async function detectionFrame() {
  await pose.send({ image: videoElement });
  videoElement.requestVideoFrameCallback(detectionFrame);
}
detectionFrame();

// webcam
// const camera = new Camera(videoElement, {
//   onFrame: async () => {
//     await pose.send({ image: videoElement });
//   },
//   width: 640,
//   height: 480,
// });
// camera.start();
