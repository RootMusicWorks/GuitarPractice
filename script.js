let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let beatCounter = 0;
const alarmAudio = new Audio('alarm.mp3');  
let alarmTriggered = false;  // Prevent double execution

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

// ✅ Forced AudioContext Activation with User Interaction and Pointerdown Event
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        logMessage("AudioContext initialized.");
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => logMessage("AudioContext resumed due to forced interaction."));
    }
    logMessage("AudioContext state: " + audioContext.state);
}

// ✅ Alarm Sound Preloading with Debug Logs
function preloadAlarmSound() {
    try {
        alarmAudio.preload = "auto";
        alarmAudio.load();
        logMessage("Alarm sound preloaded.");
    } catch (error) {
        logMessage("Error preloading alarm sound: " + error);
    }
}

// ✅ Alarm Playback with Explicit Debugging
function playAlarmSound() {
    initializeAudioContext();
    logMessage("playAlarmSound() called! Attempting to play alarm.");
    if (alarmTriggered) {
        logMessage("Alarm already triggered. Skipping duplicate call.");
        return;
    }
    alarmTriggered = true;
    try {
        stopMetronome();  
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        alarmAudio.play().then(() => {
            logMessage("Alarm sound played successfully.");
            alert("タイマーが終了しました");
        }).catch(error => {
            logMessage("Error playing alarm sound: " + error);
        });
    } catch (error) {
        logMessage("Unexpected error during alarm playback: " + error);
    }
}

// ✅ Stop Metronome with Debug Logs
function stopMetronome() {
    try {
        isPlaying = false;
        nextNoteTime = 0;
        logMessage("Metronome force stopped.");
    } catch (error) {
        logMessage("Error stopping metronome: " + error);
    }
}

// Timer Section with Explicit Condition Check and Debug Logs
let timerTimeRemaining = 600;
let timerRunning = false;
let timerInterval = null;

function startTimer() {
    initializeAudioContext();
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
                    logMessage("Timer reached zero. Triggering playAlarmSound().");
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

// ✅ Metronome Section with Forced AudioContext Resume and Fixed Gain
function playClick() {
    try {
        initializeAudioContext();  
        const osc = audioContext.createOscillator();
        const envelope = audioContext.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, nextNoteTime);
        
        // ✅ Adjusted gain to be louder and duration to be slightly longer
        envelope.gain.setValueAtTime(1.0, nextNoteTime);  // Full volume initially
        envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.3);  // Extended fadeout time

        osc.connect(envelope);
        envelope.connect(audioContext.destination);
        // ✅ Delaying the start by a slight margin
        osc.start(nextNoteTime + 0.1);  
        osc.stop(nextNoteTime + 0.3);  // Extended sound duration
    } catch (error) {
        logMessage("Error playing metronome click: " + error);
    }
}

function scheduler() {
    try {
        while (nextNoteTime < audioContext.currentTime + 0.1) {
            playClick();
            nextNoteTime += 60.0 / tempo;
        }
        if (isPlaying) {
            requestAnimationFrame(scheduler);
        }
    } catch (error) {
        logMessage("Error in metronome scheduler: " + error);
    }
}

function toggleMetronome() {
    initializeAudioContext();
    try {
        if (!isPlaying) {
            nextNoteTime = audioContext.currentTime + 0.1;
            isPlaying = true;
            scheduler();
            logMessage("Metronome started.");
        } else {
            stopMetronome();
        }
    } catch (error) {
        logMessage("Error toggling metronome: " + error);
    }
}

function adjustBPM(change) {
    try {
        tempo += change;
        bpmInput.value = tempo;
        logMessage(`BPM adjusted: ${tempo}`);
    } catch (error) {
        logMessage("Error adjusting BPM: " + error);
    }
}

// ✅ Preload Alarm and Initialize Context on Page Load
window.onload = () => {
    preloadAlarmSound();
    document.body.addEventListener('pointerdown', () => initializeAudioContext());
    logMessage("Page loaded and ready. Pointer event listener added.");
};
