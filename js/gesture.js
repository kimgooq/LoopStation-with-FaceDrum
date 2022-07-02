export function getGesture(landmarks) {
  if (_detectThumbUP(landmarks)) {
    return "ThumbUP";
  }
  if (_detectThumbDOWN(landmarks)) {
    return "ThumbDOWN";
  }
  if (_detectOne(landmarks)) {
    return "One";
  }
  if (_detectTwo(landmarks)) {
    return "Two";
  }
  if (_detectThree(landmarks)) {
    return "Three";
  }
  return "";
}

function compareAB(a, b) {
  if (a > b) {
    return true;
  }
  return false;
}

//좌우 반전
function _detectThumbUP(landmarks) {
  if (
    compareAB(landmarks[2].y, landmarks[4].y) &&
    compareAB(landmarks[5].y, landmarks[2].y) &&
    compareAB(landmarks[6].x, landmarks[5].x) &&
    compareAB(landmarks[10].x, landmarks[9].x) &&
    compareAB(landmarks[14].x, landmarks[13].x) &&
    compareAB(landmarks[18].x, landmarks[17].x) &&
    compareAB(landmarks[6].x, landmarks[8].x) &&
    compareAB(landmarks[10].x, landmarks[12].x) &&
    compareAB(landmarks[14].x, landmarks[16].x) &&
    compareAB(landmarks[18].x, landmarks[20].x)
  ) {
    return true;
  }
  return false;
}

function _detectThumbDOWN(landmarks) {
  if (
    compareAB(landmarks[4].y, landmarks[2].y) &&
    compareAB(landmarks[2].y, landmarks[5].y) &&
    compareAB(landmarks[5].x, landmarks[6].x) &&
    compareAB(landmarks[9].x, landmarks[10].x) &&
    compareAB(landmarks[13].x, landmarks[14].x) &&
    compareAB(landmarks[17].x, landmarks[18].x) &&
    compareAB(landmarks[8].x, landmarks[6].x) &&
    compareAB(landmarks[12].x, landmarks[10].x) &&
    compareAB(landmarks[16].x, landmarks[14].x) &&
    compareAB(landmarks[20].x, landmarks[18].x)
  ) {
    return true;
  }
  return false;
}

function _detectOne(landmarks) {
  if (
    compareAB(landmarks[3].y, landmarks[4].y) &&
    compareAB(landmarks[6].y, landmarks[8].y) &&
    compareAB(landmarks[12].y, landmarks[10].y) &&
    compareAB(landmarks[16].y, landmarks[14].y) &&
    compareAB(landmarks[20].y, landmarks[18].y) &&
    compareAB(landmarks[5].x, landmarks[4].x)
  ) {
    return true;
  }
  return false;
}

function _detectTwo(landmarks) {
  if (
    compareAB(landmarks[3].y, landmarks[4].y) &&
    compareAB(landmarks[6].y, landmarks[8].y) &&
    compareAB(landmarks[10].y, landmarks[12].y) &&
    compareAB(landmarks[16].y, landmarks[14].y) &&
    compareAB(landmarks[20].y, landmarks[18].y) &&
    compareAB(landmarks[5].x, landmarks[4].x)
  ) {
    return true;
  }
  return false;
}

function _detectThree(landmarks) {
  if (
    compareAB(landmarks[3].y, landmarks[4].y) &&
    compareAB(landmarks[6].y, landmarks[8].y) &&
    compareAB(landmarks[10].y, landmarks[12].y) &&
    compareAB(landmarks[14].y, landmarks[16].y) &&
    compareAB(landmarks[20].y, landmarks[18].y) &&
    compareAB(landmarks[5].x, landmarks[4].x)
  ) {
    return true;
  }
  return false;
}
