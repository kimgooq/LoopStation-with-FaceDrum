import { getGesture } from "./gesture/index.js";
import { playSound, realBpm } from "./drum/_utils.js";


// Drum Element
const sound = document.getElementById('sound');
const resetBtn = document.getElementById('resetBtn');

let isPlay = false;
let count = 1;
let ends = null, timestarter = null;
let interval;


function startDrum() {
    if (isPlay) {
        clearInterval(interval); 
    } else {
        // changeBtn();
        timestarter = new Date();
        interval = setInterval(function(){
            console.log(count);
            playSound(sound);
            if(count === 4) {
                count = 0;
                timestarter = new Date();
                pushPadDict();
            }
            count++;
        }, realBpm(100));
    }
    isPlay = !isPlay;
}

let padDict = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: []
}
window.addEventListener("load", () => {
    const sounds = document.querySelectorAll(".sound");
    const pads = document.querySelectorAll(".pads div");
    pads.forEach((pad, index) => {
        pad.addEventListener("click", function() {
            sounds[index].currentTime = 0;
            sounds[index].play();
            ends = new Date();
            const timegap = ends - timestarter;
            console.log(timegap);
            if (isPlay){
                padDict[index].push(timegap);
            }
        });
    });
});
 
const sounds = document.querySelectorAll(".sound");
let clpadDict = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: []
}
function pushPadDict(){
    for (const [key, value] of Object.entries(padDict)) {
        clpadDict[key] = _pushPad(value, clpadDict[key], key)
    }
}
function _pushPad(pad, clpad, soundIdx){
    if(pad[0] != undefined){
        for(let i = 0; i < pad.length ; i ++ ){
            clpad.push(setTimeout(function(){
                sounds[soundIdx].currentTime = 0;
                sounds[soundIdx].play();
            }, pad[i]));
        }
    }

    return clpad
}

resetBtn.addEventListener('click',() => {
    padDict[0] = [];
    padDict[1] = [];
    padDict[2] = [];
    padDict[3] = [];
    padDict[4] = [];
    padDict[5] = [];
    padDict[6] = [];
    padDict[7] = [];
});

// Hands Element
const videoElement = document.getElementsByClassName('input_webcam')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');


const myGesture = {
    gesture: ""
}


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
                    if ( myGesture.gesture == "One"){
                        startDrum()
                    }
                
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

