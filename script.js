let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let timerInterval;
let timerTimeRemaining = 600; // 10 minutes default
let timerRunning = false;

// タイマー用
function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    const timerInput = document.getElementById("timerInput").value;
    timerTimeRemaining = parseInt(timerInput) * 60;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (timerTimeRemaining > 0) {
            timerTimeRemaining--;
            updateTimerDisplay();
        } else {
            stopTimer();
            triggerAlarm();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerTimeRemaining = parseInt(document.getElementById("timerInput").value) * 60;
    updateTimerDisplay();
}

// アラーム音（オシレーターを使った警告音）
function triggerAlarm() {
    if (isPlaying) {
        stopMetronome();
    }

    const alarmDuration = 2;  // アラームの鳴動時間（秒）
    const alarmOsc = audioContext.createOscillator();
    const alarmGain = audioContext.createGain();

    alarmOsc.frequency.value = 440;  // アラーム音の周波数 (A4)
    alarmOsc.type = 'square';  // パルス音でアラームらしく
    alarmGain.gain.setValueAtTime(1, audioContext.currentTime);

    alarmOsc.connect(alarmGain);
    alarmGain.connect(audioContext.destination);

    alarmOsc.start();
    alarmOsc.stop(audioContext.currentTime + alarmDuration);  // 2秒後に自動停止

    setTimeout(() => {
        alert("タイマー終了しました！");
        alarmGain.gain.setValueAtTime(0, audioContext.currentTime);
    }, alarmDuration * 1000);
}

// タイマーカウントダウンの更新
function updateTimerDisplay() {
    const minutes = Math.floor(timerTimeRemaining / 60);
    const seconds = timerTimeRemaining % 60;
    document.getElementById("timerDisplay").textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// メトロノーム用
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playClick() {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    osc.frequency.value = 1000;
    envelope.gain.value = 1;
    osc.connect(envelope);
    envelope.connect(audioContext.destination);
    osc.start(nextNoteTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);
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