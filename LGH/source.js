const videoElement = document.getElementsByClassName('input_webcam')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

const myGesture = {
    gesture: ""
};

function onResults(results) {
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
                color: '#00FF00',
                lineWidth: 5,
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 2,
            });

            if ( myGesture.gesture != getGesture(landmarks) ) {
                if (getGesture(landmarks) != ""){
                    console.log(getGesture(landmarks));
                    myGesture.gesture = getGesture(landmarks);
                
                }
            }
        }
    }
    canvasCtx.restore();
}

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
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
});
camera.start();


function getGesture(landmarks) {
    if ( detectFive(landmarks) ) {
        return "Five"
    }
    if ( detectFour(landmarks) ) {
        return "Four"
    }
    if ( detectThree(landmarks) ) {
        return "Three"
    }
    if ( detectTwo(landmarks) ) {
        return "Two"
    }
    if ( detectOne(landmarks) ) {
        return "One"
    }
    if ( detectZero(landmarks) ) {
        return "Zero"
    }
    return ""
}


function compareAB(a, b) {
    if (a > b) {
        return true
    }
    return false
}

//좌우 반전
function detectFive(landmarks) {
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


function detectFour(landmarks) {
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


function detectThree(landmarks) {
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


function detectTwo(landmarks) {
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


function detectOne(landmarks) {
    if (compareAB(landmarks[3].y, landmarks[4].y)
        && compareAB(landmarks[8].y, landmarks[6].y)
        && compareAB(landmarks[12].y, landmarks[10].y)
        && compareAB(landmarks[16].y, landmarks[14].y)
        && compareAB(landmarks[18].y, landmarks[20].y)
        && compareAB(landmarks[5].x, landmarks[4].x)) {
            return true
    }
    return false
}


function detectZero(landmarks) {
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

