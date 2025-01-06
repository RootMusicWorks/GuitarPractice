
let tempo = 120;
let bpmInput = document.getElementById("bpmInput");
const alarmAudio = new Audio('alarm.mp3');  
let alarmTriggered = false;

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

// ✅ Create a new AudioContext and Oscillator each time
function createAudioContextAndClick() {
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, audioContext.currentTime);
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.2);
    logMessage("New AudioContext created and click sound played.");
}

// ✅ Timer Section
let timerTimeRemaining = 600;
let timerRunning = false;
let timerInterval = null;

function startTimer() {
    alarmTriggered = false;  
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
                if (timerTimeRemaining <= 0 && !alarmTriggered) {
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
    try {
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
            logMessage("Timer paused.");
        } else {
            startTimer();
        }
    } catch (error) {
        logMessage("Error pausing timer: " + error);
    }
}

function resetTimer() {
    try {
        clearInterval(timerInterval);
        timerRunning = false;
        timerTimeRemaining = 600;
        updateTimerDisplay();
        alarmTriggered = false;  
        logMessage("Timer reset.");
    } catch (error) {
        logMessage("Error resetting timer: " + error);
    }
}

function updateTimerDisplay() {
    try {
        const minutes = Math.floor(timerTimeRemaining / 60);
        const seconds = timerTimeRemaining % 60;
        document.getElementById("timerDisplay").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        logMessage(`Timer updated: ${minutes}:${seconds}`);
    } catch (error) {
        logMessage("Error updating timer display: " + error);
    }
}

// ✅ Alarm Sound Section
function playAlarmSound() {
    alarmTriggered = true;
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

// ✅ Metronome Section using New Context Each Click
function toggleMetronome() {
    createAudioContextAndClick();
}

// ✅ BPM Adjustment with Debug
function adjustBPM(change) {
    tempo += change;
    bpmInput.value = tempo;
    logMessage(`BPM adjusted to: ${tempo}`);
}

// ✅ Preload Alarm on Page Load
window.onload = () => {
    alarmAudio.preload = "auto";
    alarmAudio.load();
    logMessage("Page loaded and alarm preloaded.");
};
