let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let beatCounter = 0;

// Timer variables with separate context
let timerAudioContext = null;
let timerDuration = 600;
let timerTimeRemaining = timerDuration;
let timerInterval = null;
let timerRunning = false;
let alarmAudio = document.getElementById('alarmSound');

bpmInput.addEventListener("input", () => {
    tempo = parseInt(bpmInput.value);
});

// Initialize Audio Context for Metronome
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Timer Functions
function startTimer() {
    if (timerRunning) return;
    timerRunning = true;

    const minutes = parseInt(document.getElementById("minutesInput").value) || 0;
    const seconds = parseInt(document.getElementById("secondsInput").value) || 0;
    timerTimeRemaining = minutes * 60 + seconds;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (timerTimeRemaining > 0) {
            timerTimeRemaining--;
            updateTimerDisplay();
        } else {
            stopTimer();
            playTimerAlarm();
        }
    }, 1000);
}

function pauseTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
    } else {
        startTimer();
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerTimeRemaining = timerDuration;
    updateTimerDisplay();
    timerRunning = false;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTimeRemaining / 60);
    const seconds = timerTimeRemaining % 60;
    document.getElementById("timerDisplay").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ✅ Fixed Timer Alarm with Proper Handling
function playTimerAlarm() {
    if (isPlaying) {
        toggleMetronome(); // Stop metronome if running
    }
    alarmAudio.pause();  // Ensure previous sound is stopped
    alarmAudio.currentTime = 0;  // Reset playback to the start
    alarmAudio.play().then(() => {
        setTimeout(() => {
            alert("タイマーが終了しました");
        }, 100);  // Delay dialog slightly after audio starts
    }).catch(error => {
        console.error("Audio playback error:", error);
    });
}

// Metronome Functions
function playClick() {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, nextNoteTime);
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
    initializeAudioContext();
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