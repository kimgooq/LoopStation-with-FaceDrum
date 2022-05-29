let count = 1;
let interval;
let ends = null, timestarter = null;
let isPlay = false;

export function startDrum() {
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
                padtest();
            }
            count++;
        }, realBpm(100));
    }
    isPlay = !isPlay;
}

export function pushPad(sounds, index) {
    sounds[index].currentTime = 0;
    sounds[index].play();
    ends = new Date();
    const timegap = ends - timestarter;
    console.log(timegap);
    if(index == 0){
        pad_A.push(timegap);
    } else if(index == 1){
        pad_B.push(timegap);
    } else if(index == 2){
        pad_C.push(timegap);
    } else if(index == 3){
        pad_D.push(timegap);
    } else if(index == 4){
        pad_E.push(timegap);
    } else if(index == 5){
        pad_F.push(timegap);
    } else if(index == 6){
        pad_G.push(timegap);
    } else if(index == 7){
        pad_H.push(timegap);
    } 
    // else if(index == 5){
    //     pad_F.push(timegap);
    // } 
    //만약 사운드 더 추가해야하는경우 해당 부분 복사해서 진행하면 됩니다. (인덱스값과 pad알파벳으로 수정 진행)
}
