export function realBpm(bpm) {
    return (60 * 1000) / bpm;
}


export function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}
