
let tempo = 120;
let bpmInput = document.getElementById("bpmInput");
const clickAudio = new Audio('click.mp3');  
const alarmAudio = new Audio('alarm.mp3');  
clickAudio.preload = 'auto';
alarmAudio.preload = 'auto';

let metronomeRunning = false;

// ✅ Debug Log Display Setup
const debugLog = document.createElement('div');
debugLog.style.border = "1px solid red";
debugLog.style.padding = "10px";
debugLog.style.marginTop = "20px";
document.body.appendChild(debugLog);

function logMessage(message) {
    console.log(message);
    debugLog.innerHTML += message + "<br>";
}

// ✅ iOS Click Sound Fix using Immediate Interaction
function playClickSound() {
    try {
        clickAudio.pause();  // Stop any ongoing playback
        clickAudio.currentTime = 0;  // Reset audio for immediate replay
        clickAudio.play();
        logMessage("Click sound played using HTMLAudioElement.");
    } catch (error) {
        logMessage("Error playing click sound: " + error);
    }
}

// ✅ Metronome Toggle with Explicit Preload
function toggleMetronome() {
    if (!metronomeRunning) {
        metronomeRunning = true;
        playClickSound();
        metronomeInterval = setInterval(playClickSound, (60 / tempo) * 1000);
    } else {
        metronomeRunning = false;
        clearInterval(metronomeInterval);
        logMessage("Metronome stopped.");
    }
}

// ✅ Timer Section
let timerTimeRemaining = 600;
let timerRunning = false;
let timerInterval = null;

function startTimer() {
    try {
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
                } 
                if (timerTimeRemaining <= 0) {
                    clearInterval(timerInterval);  
                    timerRunning = false;
                    playAlarmSound();  
                }
            }, 1000);
            logMessage("Timer started.");
        }
    } catch (error) {
        logMessage("Error starting timer: " + error);
    }
}

function pauseTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        logMessage("Timer paused.");
    } else {
        startTimer();
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerTimeRemaining = 600;
    updateTimerDisplay();
    logMessage("Timer reset.");
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTimeRemaining / 60);
    const seconds = timerTimeRemaining % 60;
    document.getElementById("timerDisplay").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ✅ Alarm Sound using HTMLAudioElement (no AudioContext)
function playAlarmSound() {
    try {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        alarmAudio.play().then(() => {
            alert("タイマーが終了しました");
            logMessage("Alarm sound played successfully.");
        }).catch(error => {
            logMessage("Error playing alarm sound: " + error);
        });
    } catch (error) {
        logMessage("Error playing alarm: " + error);
    }
}

// ✅ BPM Adjustment
function adjustBPM(change) {
    tempo += change;
    bpmInput.value = tempo;
    logMessage(`BPM adjusted to: ${tempo}`);
}

// ✅ Preload Audio on User Interaction
window.addEventListener('pointerdown', () => {
    clickAudio.load();
    alarmAudio.load();
    logMessage("Audio preloaded on user interaction.");
}, { once: true });
