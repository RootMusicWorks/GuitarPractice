let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let beatCounter = 0;
const alarmAudio = new Audio('alarm.mp3');  // Directly using HTMLAudioElement

bpmInput.addEventListener("input", () => {
    tempo = parseInt(bpmInput.value);
});

// ✅ Forced AudioContext Activation with User Interaction
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        document.body.addEventListener('pointerdown', () => audioContext.resume(), { once: true });
        console.log("AudioContext initialized.");
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// ✅ Ensure Alarm is Preloaded
function preloadAlarmSound() {
    try {
        alarmAudio.preload = "auto";
        alarmAudio.load();
        console.log("Alarm sound preloaded successfully.");
    } catch (error) {
        console.error("Error preloading alarm sound:", error);
    }
}

// ✅ Play Alarm with Strict Handling
function playAlarmSound() {
    try {
        stopMetronome();  // Ensure metronome stops
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        alarmAudio.play().then(() => {
            alert("タイマーが終了しました");
        }).catch(error => {
            console.error("Error playing alarm sound:", error);
            alert("アラーム音の再生に失敗しました。");
        });
    } catch (error) {
        console.error("Unexpected error during alarm playback:", error);
    }
}

// ✅ Stop Metronome Completely
function stopMetronome() {
    try {
        isPlaying = false;
        nextNoteTime = 0;
        console.log("Metronome force stopped.");
    } catch (error) {
        console.error("Error stopping metronome:", error);
    }
}

// Timer Section with Console Logs
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
                } else {
                    stopTimer();
                    playAlarmSound();
                }
            }, 1000);
        }
    } catch (error) {
        console.error("Error starting timer:", error);
    }
}

function pauseTimer() {
    try {
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
        } else {
            startTimer();
        }
    } catch (error) {
        console.error("Error pausing timer:", error);
    }
}

function resetTimer() {
    try {
        clearInterval(timerInterval);
        timerRunning = false;
        timerTimeRemaining = 600;
        updateTimerDisplay();
    } catch (error) {
        console.error("Error resetting timer:", error);
    }
}

function updateTimerDisplay() {
    try {
        const minutes = Math.floor(timerTimeRemaining / 60);
        const seconds = timerTimeRemaining % 60;
        document.getElementById("timerDisplay").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
        console.error("Error updating timer display:", error);
    }
}

// Metronome Section with Logs and Strict Control
function playClick() {
    try {
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
    } catch (error) {
        console.error("Error playing metronome click:", error);
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
        console.error("Error in metronome scheduler:", error);
    }
}

function toggleMetronome() {
    try {
        initializeAudioContext();
        if (!isPlaying) {
            nextNoteTime = audioContext.currentTime + 0.1;
            isPlaying = true;
            scheduler();
        } else {
            stopMetronome();
        }
    } catch (error) {
        console.error("Error toggling metronome:", error);
    }
}

function adjustBPM(change) {
    try {
        tempo += change;
        bpmInput.value = tempo;
    } catch (error) {
        console.error("Error adjusting BPM:", error);
    }
}

// ✅ Preload the alarm sound on page load
window.onload = () => {
    preloadAlarmSound();
    initializeAudioContext();
};
