let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let beatCounter = 0;
let alarmBuffer = null;  // AudioBuffer for MP3 playback

bpmInput.addEventListener("input", () => {
    tempo = parseInt(bpmInput.value);
});

// ✅ Explicitly create and activate AudioContext with user interaction
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        document.body.addEventListener('click', () => audioContext.resume(), { once: true });
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// ✅ Load alarm sound into AudioBuffer and ensure it is ready
async function loadAlarmSound() {
    try {
        initializeAudioContext();
        const response = await fetch('alarm.mp3');
        const arrayBuffer = await response.arrayBuffer();
        alarmBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log("Alarm sound loaded successfully");
    } catch (error) {
        console.error("Error loading alarm sound:", error);
    }
}

// ✅ Play the MP3 alarm sound using AudioBufferSourceNode and stop metronome
function playAlarmSound() {
    if (!audioContext || !alarmBuffer) {
        alert("アラーム音がロードされていません");
        return;
    }

    stopMetronomeIfRunning();  // Ensure metronome stops
    const source = audioContext.createBufferSource();
    source.buffer = alarmBuffer;
    source.connect(audioContext.destination);
    source.start();
    source.onended = () => {
        alert("タイマーが終了しました");
    };
}

// ✅ Ensure metronome stops completely
function stopMetronomeIfRunning() {
    if (isPlaying) {
        isPlaying = false;
        nextNoteTime = 0;
        console.log("メトロノームを停止しました");
    }
}

// Timer Section
let timerTimeRemaining = 600;
let timerRunning = false;
let timerInterval = null;

function startTimer() {
    if (!timerRunning) {
        const minutes = parseInt(document.getElementById("minutesInput").value) || 0;
        const seconds = parseInt(document.getElementById("secondsInput").value) || 0;
        timerTimeRemaining = minutes * 60 + seconds;
        updateTimerDisplay();

        timerRunning = true;
        timerInterval = setInterval(() => {
            if (timerTimeRemaining > 0) {
                timerTimeRemaining--;
                updateTimerDisplay();
            } else {
                stopTimer();
                playAlarmSound();
            }
        }, 1000);
    }
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
    timerRunning = false;
    timerTimeRemaining = 600;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTimeRemaining / 60);
    const seconds = timerTimeRemaining % 60;
    document.getElementById("timerDisplay").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Metronome Section
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

// ✅ Ensure the alarm sound is preloaded on page load
window.onload = () => {
    loadAlarmSound();
};
