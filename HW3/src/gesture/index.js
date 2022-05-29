import { compareAB } from "./_utils.js";


export function getGesture(landmarks) {
    if ( _detectFive(landmarks) ) {
        return "Five"
    }
    if ( _detectFour(landmarks) ) {
        return "Four"
    }
    if ( _detectThree(landmarks) ) {
        return "Three"
    }
    if ( _detectTwo(landmarks) ) {
        return "Two"
    }
    if ( _detectOne(landmarks) ) {
        return "One"
    }
    if ( _detectZero(landmarks) ) {
        return "Zero"
    }
    return ""
}



//좌우 반전
function _detectFive(landmarks) {
    if (compareAB(landmarks[3].y, landmarks[4].y)
        && compareAB(landmarks[6].y, landmarks[8].y)
        && compareAB(landmarks[10].y, landmarks[12].y)
        && compareAB(landmarks[14].y, landmarks[16].y)
        && compareAB(landmarks[18].y, landmarks[20].y)
        && compareAB(landmarks[4].x, landmarks[5].x)) {
            return true
    }
    return false
}


function _detectFour(landmarks) {
    if (compareAB(landmarks[3].y, landmarks[4].y)
        && compareAB(landmarks[6].y, landmarks[8].y)
        && compareAB(landmarks[10].y, landmarks[12].y)
        && compareAB(landmarks[14].y, landmarks[16].y)
        && compareAB(landmarks[18].y, landmarks[20].y)
        && compareAB(landmarks[5].x, landmarks[4].x)) {
            return true
    }
    return false
}


function _detectThree(landmarks) {
    if (compareAB(landmarks[3].y, landmarks[4].y)
        && compareAB(landmarks[8].y, landmarks[6].y)
        && compareAB(landmarks[10].y, landmarks[12].y)
        && compareAB(landmarks[14].y, landmarks[16].y)
        && compareAB(landmarks[18].y, landmarks[20].y)
        && compareAB(landmarks[5].x, landmarks[4].x)) {
            return true
    }
    return false
}


function _detectTwo(landmarks) {
    if (compareAB(landmarks[3].y, landmarks[4].y)
        && compareAB(landmarks[8].y, landmarks[6].y)
        && compareAB(landmarks[12].y, landmarks[10].y)
        && compareAB(landmarks[14].y, landmarks[16].y)
        && compareAB(landmarks[18].y, landmarks[20].y)
        && compareAB(landmarks[5].x, landmarks[4].x)) {
            return true
    }
    return false
}


function _detectOne(landmarks) {
    if (compareAB(landmarks[3].y, landmarks[4].y)
        && compareAB(landmarks[6].y, landmarks[8].y)
        && compareAB(landmarks[12].y, landmarks[10].y)
        && compareAB(landmarks[16].y, landmarks[14].y)
        && compareAB(landmarks[20].y, landmarks[18].y)
        && compareAB(landmarks[5].x, landmarks[4].x)) {
            return true
    }
    return false
}


function _detectZero(landmarks) {
    if (compareAB(landmarks[3].y, landmarks[4].y)
        && compareAB(landmarks[8].y, landmarks[6].y)
        && compareAB(landmarks[12].y, landmarks[10].y)
        && compareAB(landmarks[16].y, landmarks[14].y)
        && compareAB(landmarks[20].y, landmarks[18].y)
        && compareAB(landmarks[5].x, landmarks[4].x)) {
            return true
    }
    return false
}

