const startBtn = document.querySelector('#startBtn');
const sound = document.getElementById('sound');
const resetBtn = document.getElementById('resetBtn');
const bpm = document.querySelector('#bpm');
const title = document.querySelector('h1');

let isPlay = false;
let count = 1;
let interval;
let ends = null, timestarter = null;

startBtn.addEventListener('click', () => {
    if (isPlay) {
        clearInterval(interval);
        changeBtn();  
        for(let j=0; j< pada.length;j++){
            clearTimeout(clpada[j]);
        };
        for(let j=0; j< padb.length;j++){
            clearTimeout(clpadb[j]);
        };
        for(let j=0; j< padc.length;j++){
            clearTimeout(clpadc[j]);
        };
        for(let j=0; j< padd.length;j++){
            clearTimeout(clpadd[j]);
        };
        for(let j=0; j< pade.length;j++){
            clearTimeout(clpade[j]);
        };
        for(let j=0; j< padf.length;j++){
            clearTimeout(clpadf[j]);
        };         
    } else {
        changeBtn();
        timestarter = new Date();
        interval = setInterval(function(){
        console.log(count);
        playSound();
        if(count === 12) {
            count = 0;
            timestarter = new Date();
            padtest();
        }
        count++;
    },realBpm(100));
   }
   isPlay = !isPlay;
});


// playSount : 메트로놈 소리 플레이
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

let pada = [], padb = [], padc = [], padd = [], pade = [], padf = [];
window.addEventListener("load", () => {
  const sounds = document.querySelectorAll(".sound");
  const pads = document.querySelectorAll(".pads div");
  pads.forEach((pad, index) => {
    pad.addEventListener("click", function() {
        sounds[index].currentTime = 0;
        sounds[index].play();
        ends = new Date();
        timegap = ends - timestarter;
        if(index == 0){
            pada.push(timegap);
        } else if(index == 1){
            padb.push(timegap);
        } else if(index == 2){
            padc.push(timegap);
        } else if(index == 3){
            padd.push(timegap);
        } else if(index == 4){
            pade.push(timegap);
        } else if(index == 5){
            padf.push(timegap);
        } 
        // else if(index == 5){
        //     padf.push(timegap);
        // } 
        //만약 사운드 더 추가해야하는경우 해당 부분 복사해서 진행하면 됩니다. (인덱스값과 pad알파벳으로 수정 진행)
    });
  });
});

const sounds = document.querySelectorAll(".sound");
let clpada = [], clpadb = [], clpadc = [], clpadd = [], clpade = [], clpadf = [];
function padtest(){
    if(pada[0] != undefined){
        for(let i = 0; i < pada.length ; i ++ ){
            clpada.push(setTimeout(function(){
                sounds[0].currentTime = 0;
                sounds[0].play();
            },pada[i]));
        }
    } 
    if(padb[0] != undefined){
        for(let i = 0; i < padb.length ; i ++ ){
            clpadb.push(setTimeout(function(){
                sounds[1].currentTime = 0;
                sounds[1].play();
            },padb[i]));
        }
    } 
    if(padc[0] != undefined){
        for(let i = 0 ; i < padc.length ; i ++ ){
            clpadc.push(setTimeout(function(){
                sounds[2].currentTime = 0;
                sounds[2].play();
            },padc[i]));
        }
    }
    if(padd[0] != undefined){
        for(let i = 0; i < padd.length ; i ++ ){
            clpadd.push(setTimeout(function(){
                sounds[3].currentTime = 0;
                sounds[3].play();
            },padd[i]));
        }
    } 
    if(pade[0] != undefined){
        for(let i = 0; i < pade.length ; i ++ ){
            clpade.push(setTimeout(function(){
                sounds[4].currentTime = 0;
                sounds[4].play();
            },pade[i]));
        }
    } 
    if(padf[0] != undefined){
        for(let i = 0; i < padf.length ; i ++ ){
            clpadf.push(setTimeout(function(){
                sounds[5].currentTime = 0;
                sounds[5].play();
            },padf[i]));
        }
    } 
    // if(padf[0] != undefined){
    //     for(let i = 0; i < padf.length ; i ++ ){
    //         clpadf.push(setTimeout(function(){
    //             sounds[5].currentTime = 0;
    //             sounds[5].play();
    //         },padf[i]));
    //     }
    // }
    //패드 추가했을 경우 해당부분 복사해서 진행하면 됩니다.
  }

  resetBtn.addEventListener('click',() => {
    for(let j=0; j< pada.length;j++){
        clearTimeout(clpada[j]);
    };
    for(let j=0; j< padb.length;j++){
        clearTimeout(clpadb[j]);
    };
    for(let j=0; j< padc.length;j++){
        clearTimeout(clpadc[j]);
    };
    for(let j=0; j< padd.length;j++){
        clearTimeout(clpadd[j]);
    };
    for(let j=0; j< pade.length;j++){
        clearTimeout(clpade[j]);
    };
    for(let j=0; j< padf.length;j++){
        clearTimeout(clpadf[j]);
    };
    pada.length = 0;
    padb.length = 0;
    padc.length = 0;
    padd.length = 0;
    pade.length = 0;
    padf.length = 0;

});
