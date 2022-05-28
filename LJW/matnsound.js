const startBtn = document.querySelector('#startBtn');
// const sound = document.querySelector('#sound');
const sound = document.getElementById('sound');
const bpm = document.querySelector('#bpm');
const title = document.querySelector('h1');
let timer = null;
let nowBpm = 100;
let isPlay = false;
let matarray = [];


// bpm.addEventListener('change', (e) => {
//    title.innerHTML = e.target.value + ' BPM';
//    nowBpm = parseInt(e.target.value);
//    if (isPlay) {
//       clearInterval(timer);
//       timer = setInterval(playSound, realBpm(nowBpm));
//    }
// });
 
let count = 1;
let interval;
let starts = null, ends = null;
let timestarter = null;

startBtn.addEventListener('click', () => {
   if (isPlay) {
      clearInterval(interval);
      changeBtn();            
   } else {
      changeBtn();
    //   playSound();
    //   timer = setInterval(playSound, realBpm(100));
    timestarter = new Date();
    interval = setInterval(function(){
        console.log(count);
        playSound();
        if(count === 4) {
            count = 0;
            timestarter = new Date();
            padtest();
        }
        // else{
        //     playSound();
        // }
        count++;
    },realBpm(60));
   }
   isPlay = !isPlay;
});

// window.addEventListener('DOMContentLoaded',() => {
//     var interval = setInterval(function(){
//         count++;
//         // console.log(count);
//         playSound();
//         if(count === 6) {
//             count = 0;
//         }
//         console.log(count+1);
//     },realBpm(100));
// })

function playSound() {
   sound.currentTime = 0;
   sound.play();
}

//이거는 버튼 바꿔주는거
function changeBtn() {
   if(startBtn.innerHTML === 'Start') {
      startBtn.innerHTML = 'Stop';
      startBtn.classList.remove('btn-primary');
      startBtn.classList.add('btn-danger');
   } else {
      startBtn.innerHTML = 'Start';
      startBtn.classList.remove('btn-danger');
      startBtn.classList.add('btn-primary');         
   }
}
 
function realBpm(bpm) {
   return (60 * 1000) / bpm;
}

let pada = [], padb = [], padc = [];
//이거는 색 바꾸는거
window.addEventListener("load", () => {
  const sounds = document.querySelectorAll(".sound");
  const pads = document.querySelectorAll(".pads div");
  const visual = document.querySelector(".visual");
  const colors = [
    "#60d394",
    "#d36060",
    "#c060d3",
    "#d3d160",
    "#606bd3",
  ];

  pads.forEach((pad, index) => {
    pad.addEventListener("click", function() {
      sounds[index].currentTime = 0;
      sounds[index].play();
      ends = new Date();
      timegap = ends - timestarter;
      console.log(timegap);
    //   console.log(sounds[1]);
      if(index == 0 && timegap <= 2400){
          pada.push(timegap);
          console.log("패드에이 : " + pada[0])
      } 
      else if(index == 1 && timegap <= 2400){
          padb.push(timegap);
          console.log("패드비 : " + padb[0])
      } 
      else if(index == 2 && timegap <= 2400){
          padc.push(timegap);
          console.log("패드씨 : " + padc[0])

      }
    });
  });


});

const sounds = document.querySelectorAll(".sound");

function padtest(){
    if(pada[0] != undefined){
        for(let i = 0 ; i < 10 ; i++ ){
            setTimeout(function(){
                sounds[0].play();
            },pada[0]);
        }
    } 
    else if(padb[0] != undefined){
        for(let j = 0 ; j < 10 ; j++ ){
            console.log(padb[j]);
            setTimeout(function(){
                sounds[1].play();
            },padb[0]);
        }
    } 
    else if(padc[0] != undefined){
        for(let i = 0 ; i < 10 ; i++ ){
            // console.log(realBpm);
            setTimeout(function(){
                sounds[2].play();
            },padc[0]);
        }
    }
  }
