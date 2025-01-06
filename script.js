
let audioContext;
let clickSoundBuffer;
let metronomeInterval;
let timerInterval;

// Initialize audio
async function initializeAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const response = await fetch('click.mp3');
    const arrayBuffer = await response.arrayBuffer();
    clickSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);
    log('Audio initialized and click sound loaded.');
}

// Play click sound
function playClickSound() {
    const source = audioContext.createBufferSource();
    source.buffer = clickSoundBuffer;
    source.connect(audioContext.destination);
    source.start(0);
}

// Log function for debugging
function log(message) {
    const logDiv = document.getElementById('log');
    logDiv.textContent += message + '\n';
}

// Metronome controls
document.getElementById('startMetronome').addEventListener('click', () => {
    const bpm = parseInt(document.getElementById('bpm').value);
    if (isNaN(bpm) || bpm <= 0) {
        alert('Please enter a valid BPM value.');
        return;
    }
    if (!audioContext) initializeAudio();
    const interval = 60000 / bpm;
    clearInterval(metronomeInterval);
    metronomeInterval = setInterval(playClickSound, interval);
    log('Metronome started at ' + bpm + ' BPM.');
});

document.getElementById('stopMetronome').addEventListener('click', () => {
    clearInterval(metronomeInterval);
    log('Metronome stopped.');
});

// Timer controls
document.getElementById('startTimer').addEventListener('click', () => {
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    let totalSeconds = minutes * 60 + seconds;
    if (totalSeconds <= 0) {
        alert('Please set a valid timer duration.');
        return;
    }
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            playClickSound();
            log('Timer finished and click sound played.');
        } else {
            totalSeconds--;
            const displayMinutes = Math.floor(totalSeconds / 60);
            const displaySeconds = totalSeconds % 60;
            document.getElementById('timeDisplay').textContent = 
                displayMinutes + ':' + (displaySeconds < 10 ? '0' : '') + displaySeconds;
        }
    }, 1000);
    log('Timer started.');
});

document.getElementById('pauseResumeTimer').addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        log('Timer paused.');
    } else {
        document.getElementById('startTimer').click();
        log('Timer resumed.');
    }
});

document.getElementById('stopTimer').addEventListener('click', () => {
    clearInterval(timerInterval);
    document.getElementById('timeDisplay').textContent = '0:00';
    log('Timer stopped.');
});
