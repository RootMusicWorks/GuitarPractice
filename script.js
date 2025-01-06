let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let timerInput = document.getElementById("timerInput");
let timerDisplay = document.getElementById("timerDisplay");
let timerDuration = 600; // 10 minutes default in seconds
let timerInterval;
let remainingTime = timerDuration;
let isTimerRunning = false;

// タイマーの開始
function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    remainingTime = parseInt(timerInput.value) * 60;
    updateTimerDisplay(remainingTime);
    timerInterval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            updateTimerDisplay(remainingTime);
        } else {
            clearInterval(timerInterval);
            isTimerRunning = false;
            stopMetronomeIfPlaying();
            playAlarm();
            showTimerEndDialog();
        }
    }, 1000);
}

// タイマーの一時停止
function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

// タイマーのリセット
function resetTimer() {
    clearInterval(timerInterval);
    remainingTime = parseInt(timerInput.value) * 60;
    updateTimerDisplay(remainingTime);
    isTimerRunning = false;
}

// タイマーの表示更新
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDisplay.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// タイマー終了時のアラーム音再生
function playAlarm() {
    const alarm = new Audio('alarm.mp3'); 
    alarm.play();
}

// タイマー終了時のメトロノーム停止
function stopMetronomeIfPlaying() {
    if (isPlaying) {
        isPlaying = false;
    }
}

// タイマー終了後のダイアログ表示（EndとRe-Startの2択）
function showTimerEndDialog() {
    const dialog = confirm("タイマー終了！
Endを押すと終了し、Re-Startで再度タイマーを開始します。");
    if (dialog) {
        resetTimer();
    } else {
        startTimer();
    }
}

// メトロノーム制御（修正済み）
bpmInput.addEventListener("input", () => {
    tempo = parseInt(bpmInput.value);
});

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

function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
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

function playClick() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(1, nextNoteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(nextNoteTime);
    osc.stop(nextNoteTime + 0.1);
}
