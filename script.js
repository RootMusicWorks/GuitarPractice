
let tempo = 120;
let bpmInput = document.getElementById("bpmInput");
const clickAudio = new Audio('click.mp3');  
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

// ✅ Metronome using HTMLAudioElement
function toggleMetronome() {
    try {
        clickAudio.currentTime = 0;
        clickAudio.play();
        logMessage("Click sound played using HTMLAudioElement.");
    } catch (error) {
        logMessage("Error playing click sound: " + error);
    }
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

// ✅ Alarm Sound using HTMLAudioElement
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

// ✅ BPM Adjustment with Debug
function adjustBPM(change) {
    tempo += change;
    bpmInput.value = tempo;
    logMessage(`BPM adjusted to: ${tempo}`);
}

// ✅ Preload Alarm and Click Sound on Page Load
window.onload = () => {
    alarmAudio.preload = "auto";
    clickAudio.preload = "auto";
    alarmAudio.load();
    clickAudio.load();
    logMessage("Page loaded and sounds preloaded.");
};
