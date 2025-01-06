let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let beatCounter = 0;

let timerInput = document.getElementById("timerInput");
let timerDisplay = document.getElementById("timerDisplay");
let timerSeconds = 600;
let timerInterval = null;
let alarmSound = new Audio("https://www.soundjay.com/button/beep-07.mp3");

bpmInput.addEventListener("input", () => {
    tempo = parseInt(bpmInput.value);
});

function playClick() {
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    osc.frequency.value = 1000;
    envelope.gain.setValueAtTime(1, nextNoteTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);
    osc.connect(envelope);
    envelope.connect(audioContext.destination);
    osc.start(nextNoteTime);
    osc.stop(nextNoteTime + 0.1);
}

function scheduler() {
    while (nextNoteTime < audioContext.currentTime + 0.1) {
        playClick();
        nextNoteTime += 60.0 / tempo;
    }
    if (isPlaying) {
        requestAnimationFrame(scheduler);
    }
}

function toggleMetronome() {
    if (!isPlaying) {
        nextNoteTime = audioContext.currentTime;
        isPlaying = true;
        scheduler();
    } else {
        isPlaying = false;
    }
}

function adjustBPM(change) {
    tempo += change;
    bpmInput.value = tempo;
}

// Timer Functions
function startTimer() {
    clearInterval(timerInterval);
    timerSeconds = parseInt(timerInput.value) * 60;
    updateTimerDisplay();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
    } else {
        clearInterval(timerInterval);
        if (isPlaying) {
            toggleMetronome();
        }
        alarmSound.play();
        alert("タイマー終了！");
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerSeconds = parseInt(timerInput.value) * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    let minutes = Math.floor(timerSeconds / 60);
    let seconds = timerSeconds % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}