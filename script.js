let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let timerInput = document.getElementById("timerInput");
let timerDisplay = document.getElementById("timerDisplay");
let timerDuration = 600; // 10 minutes in seconds
let timerRunning = false;
let timerPaused = false;
let timerInterval;
let beatCounter = 0;

// Timer Functions
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDisplay.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    timerPaused = false;
    timerDuration = parseInt(timerInput.value) * 60;
    updateTimerDisplay(timerDuration);
    timerInterval = setInterval(() => {
        if (timerDuration > 0) {
            timerDuration--;
            updateTimerDisplay(timerDuration);
        } else {
            stopTimer();
            playAlarm();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerPaused = true;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerPaused = false;
    updateTimerDisplay(parseInt(timerInput.value) * 60);
}

// Alarm Sound and Metronome Stop on Timer End
function playAlarm() {
    if (isPlaying) {
        isPlaying = false;
        stopMetronome();
    }

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.5;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    setTimeout(() => {
        osc.stop();
        setTimeout(() => {
            alert("タイマーが終了しました！");
        }, 100);
    }, 3000);
}

// Metronome Functions
bpmInput.addEventListener("input", () => {
    tempo = parseInt(bpmInput.value);
});

function playClick() {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    osc.frequency.value = 1000;
    envelope.gain.setValueAtTime(beatCounter === 0 ? 1 : 0.7, nextNoteTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);
    osc.connect(envelope);
    envelope.connect(audioContext.destination);
    osc.start(nextNoteTime);
    osc.stop(nextNoteTime + 0.1);
    beatCounter++;
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

async function toggleMetronome() {
    if (!isPlaying) {
        nextNoteTime = audioContext.currentTime + 0.1;
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
