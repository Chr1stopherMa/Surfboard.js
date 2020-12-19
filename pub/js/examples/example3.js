/*
    Example 3: Video Player
    Showcases the custom function (user defined callbacks)
*/

const surf = Surfboard();

const video = document.getElementById("example3-video");
video.allowFullscreen = false;

// Play/Pause when "P" is pressed
const play = () => {video.play(); document.getElementById("example3-p").innerText = "Pause"};
const pause = () => {video.pause(); document.getElementById("example3-p").innerText = "Play"};
video.addEventListener('ended', pause, false);
surf.custom("P", play, {toggle: true}, pause);

// Fullscreen when "F" is pressed
const fullScreen = () => { setTimeout(() => video.requestFullscreen(), 200);};
surf.custom("F", fullScreen);


// Increase/Decrease volume when up/down arrow keys are pressed
video.volume = 0.5;
let volume = 50;
const changeVolume = delta => {
    const newVolume = volume + delta;
    if (newVolume >= 0 && newVolume <= 100) {
        volume = newVolume;
        video.volume = newVolume / 100;
        document.getElementById("example3-volume").style.height = `${volume*0.9}%`;
    }
}

surf.custom("hold+Up",  () => changeVolume(5));
surf.custom("hold+Down", () => changeVolume(-5));


// Fast-forward/Rewind video when right/left arrow keys are pressed
const changeTime = delta => video.currentTime += delta;
surf.custom("hold+Left", () => changeTime(-2));
surf.custom("hold+Right", () => changeTime(2));


// Update the video timestamp every 200 ms
setInterval(() => {
    const seconds = Math.floor(video.currentTime);
    document.getElementById("example3-time").innerText = new Date(seconds * 1000).toISOString().substr(11, 8)
}, 200)


// Return to the examples page when "H" is pressed
surf.redirect("H", "more-examples.html")