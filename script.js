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
    const alarm = new Audio('alarm.mp3'); // アラーム音のファイル
    alarm.play();
}

// タイマー終了時のメトロノーム停止
function stopMetronomeIfPlaying() {
    if (isPlaying) {
        isPlaying = false;
    }
}

// タイマー終了後のダイアログ表示
function showTimerEndDialog() {
    const result = confirm("タイマー終了！End または Re-Startを選択してください。");
    if (result) {
        resetTimer();
    } else {
        startTimer();
    }
}

// メトロノーム制御（既存のコード維持）
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