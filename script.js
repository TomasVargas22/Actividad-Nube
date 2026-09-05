document.addEventListener('DOMContentLoaded', () => {
    const scoreEl = document.getElementById('score');
    const cardOrigin = document.getElementById('card-origin');
    const dropBoxes = document.querySelectorAll('.drop-box');
    
    const solutionModal = document.getElementById('solution-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const solutionsList = document.getElementById('solutions-list');
    
    const endGameModal = document.getElementById('FinJuego');
    const startScreenModal = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const timerDisplay = document.getElementById('timer-display');
    const resetScoresBtn = document.getElementById('reset-scores-btn');
    const progressBar = document.getElementById('progress-bar');
    const endGameTitle = document.getElementById('end-game-title');
    const endGameMessage = document.getElementById('end-game-message');
    const restartBtn = document.getElementById('restart-btn');
    const playerNameInput = document.getElementById('player-name');
    const leaderboardBody = document.getElementById('leaderboard-body');

    // Achievements modal
    const achievementsModal = document.getElementById('achievements-modal');
    const closeAchievementsBtn = document.getElementById('close-achievements');
    const achievementsList = document.getElementById('achievements-list');
    const achievementsBtn = document.getElementById('achievements-btn');

    let currentScore = 0;
    let pendingCases = [];
    let currentCard = null;
    let timerInterval = null;
    let timeLeft = 30;
    let playerName = "";
    let comboCount = 0;
    let isGameActive = false;
    let scoreMultiplier = 1;
    let isFireMode = false;
    let fireTimeout = null;
    let fireMultiplierEl = null;
    let boxShuffleInterval = null;
    let boxesShuffling = false;
    let totalErrors = 0;
    let fastCorrectCount = 0;
    let lastCorrectTime = 0;
    let sessionAchievements = {};
    
    // Precarga del audio de récord
    const victorySound = new Audio('SOUND2.mp3');
    victorySound.preload = 'auto';
    victorySound.addEventListener('error', () => {
        if (victorySound.src.includes('SOUND2.mp3')) victorySound.src = 'sound2.mp3';
    }, { once: true });

    // Precarga de música para Modo Fuego (busca 'fuego.mp3' o 'fire.mp3')
    const fireMusic = new Audio('fuego.mp3');
    fireMusic.preload = 'auto';
    fireMusic.loop = true;
    fireMusic.volume = 0.85;
    fireMusic.addEventListener('error', () => {
        if (fireMusic.src.includes('fuego.mp3')) fireMusic.src = 'fire.mp3';
    }, { once: true });

    // --- ACHIEVEMENTS SYSTEM ---
    const ACHIEVEMENTS = {
        speedster: {
            id: 'speedster',
            icon: '⚡',
            name: 'Velocista',
            desc: 'Clasifica 5 tarjetas correctas en menos de 5 segundos.',
            check: () => fastCorrectCount >= 5
        },
        flawless: {
            id: 'flawless',
            icon: '🛡️',
            name: 'Impecable',
            desc: 'Termina la partida con 0 equivocaciones.',
            check: () => totalErrors === 0 && currentScore > 0
        },
        lastSecond: {
            id: 'lastSecond',
            icon: '🕒',
            name: 'Al Límite',
            desc: 'Acierta una tarjeta cuando queda 1 segundo o menos.',
            check: () => false // Checked manually in handleDrop
        },
        fireMaster: {
            id: 'fireMaster',
            icon: '🔥',
            name: 'En Llamas',
            desc: 'Activa el Modo Fuego (combo x5).',
            check: () => false // Checked when fire mode activates
        },
        tenPoints: {
            id: 'tenPoints',
            icon: '🌟',
            name: 'Experto Cloud',
            desc: 'Alcanza 10 puntos en una sola partida.',
            check: () => currentScore >= 10
        },
        virusSurvivor: {
            id: 'virusSurvivor',
            icon: '🦠',
            name: 'Antivirus',
            desc: 'Clasifica correctamente una tarjeta Virus.',
            check: () => false // Checked manually
        }
    };

    function getUnlockedAchievements() {
        const data = localStorage.getItem('cloudClassifierAchievements');
        return data ? JSON.parse(data) : {};
    }

    function saveAchievement(id) {
        const unlocked = getUnlockedAchievements();
        if (!unlocked[id]) {
            unlocked[id] = { date: new Date().toLocaleString() };
            localStorage.setItem('cloudClassifierAchievements', JSON.stringify(unlocked));
            showAchievementPopup(ACHIEVEMENTS[id]);
        }
        sessionAchievements[id] = true;
    }

    function checkAchievements() {
        Object.values(ACHIEVEMENTS).forEach(ach => {
            if (ach.check && ach.check()) {
                saveAchievement(ach.id);
            }
        });
    }

    function showAchievementPopup(ach) {
        const popup = document.createElement('div');
        popup.classList.add('achievement-popup');
        popup.innerHTML = `
            <span class="ach-icon">${ach.icon}</span>
            <div>
                <div class="ach-text">LOGRO DESBLOQUEADO</div>
                <div class="ach-name">${ach.name}</div>
            </div>
        `;
        document.body.appendChild(popup);
        
        // Play achievement sound
        sfxAchievement();
        
        setTimeout(() => popup.remove(), 4000);
    }

    function renderAchievementsModal() {
        const unlocked = getUnlockedAchievements();
        achievementsList.innerHTML = '';
        
        Object.values(ACHIEVEMENTS).forEach(ach => {
            const isUnlocked = !!unlocked[ach.id];
            const item = document.createElement('div');
            item.classList.add('achievement-item', isUnlocked ? 'unlocked' : 'locked');
            item.innerHTML = `
                <span class="achievement-icon">${ach.icon}</span>
                <div class="achievement-info">
                    <h4>${ach.name}</h4>
                    <p>${ach.desc}</p>
                    ${isUnlocked ? `<small style="color: var(--overclock-gold); opacity: 0.7;">Desbloqueado: ${unlocked[ach.id].date}</small>` : ''}
                </div>
            `;
            achievementsList.appendChild(item);
        });
    }

    function toggleAchievements() {
        renderAchievementsModal();
        achievementsModal.classList.toggle('hidden');
    }

    // --- MOTOR DE SONIDO (Estilo Balatro - Web Audio API) ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function ensureAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    // Sonido de agarrar carta (click crujiente corto)
    function sfxGrab() {
        ensureAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.08);
    }

    // Sonido correcto (chip satisfactorio tipo Balatro - doble tono ascendente)
    function sfxCorrect() {
        ensureAudio();
        // Tono base sube con cada combo (como fichas de Balatro)
        const baseFreq = 523 + (comboCount * 40); // Sube 40Hz por combo
        const midFreq = 659 + (comboCount * 40);
        const highFreq = 784 + (comboCount * 40);
        const vol = Math.min(0.25, 0.15 + comboCount * 0.02);

        // Tono 1
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        osc1.frequency.setValueAtTime(midFreq, audioCtx.currentTime + 0.08);
        gain1.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc1.connect(gain1).connect(audioCtx.destination);
        osc1.start(); osc1.stop(audioCtx.currentTime + 0.2);
        // Tono 2 (chip/crunch)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1200 + comboCount * 80, audioCtx.currentTime + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(2400 + comboCount * 80, audioCtx.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc2.connect(gain2).connect(audioCtx.destination);
        osc2.start(audioCtx.currentTime + 0.05); osc2.stop(audioCtx.currentTime + 0.15);
        // Tono 3 - recompensa alta
        const osc3 = audioCtx.createOscillator();
        const gain3 = audioCtx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(highFreq, audioCtx.currentTime + 0.1);
        gain3.gain.setValueAtTime(vol, audioCtx.currentTime + 0.1);
        gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc3.connect(gain3).connect(audioCtx.destination);
        osc3.start(audioCtx.currentTime + 0.1); osc3.stop(audioCtx.currentTime + 0.35);
    }

    // Sonido de COMBO grande (fanfarria rápida ascendente tipo Balatro mult)
    function sfxComboFanfare(combo) {
        ensureAudio();
        const notes = [523, 659, 784, 880, 1047]; // C5 E5 G5 A5 C6
        const count = Math.min(combo, notes.length);
        for (let i = 0; i < count; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            const t = audioCtx.currentTime + i * 0.07;
            osc.frequency.setValueAtTime(notes[i], t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t); osc.stop(t + 0.15);
        }
    }

    // Sonido incorrecto (buzzer descendente)
    function sfxWrong() {
        ensureAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    }

    // Sonido virus (alerta distorsionada)
    function sfxVirus() {
        ensureAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.5);

        // Noise burst
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(60, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc2.connect(gain2).connect(audioCtx.destination);
        osc2.start(); osc2.stop(audioCtx.currentTime + 0.3);
    }

    // Sonido overclock (ascendente brillante)
    function sfxOverclock() {
        ensureAudio();
        const notes = [440, 554, 659, 880, 1108];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            const t = audioCtx.currentTime + i * 0.06;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t); osc.stop(t + 0.2);
        });
    }

    // Sonido de modo fuego activado
    function sfxFireMode() {
        ensureAudio();
        const notes = [262, 330, 392, 523, 659, 784];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            const t = audioCtx.currentTime + i * 0.05;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t); osc.stop(t + 0.18);
        });
    }

    // Sonido de logro desbloqueado
    function sfxAchievement() {
        ensureAudio();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            const t = audioCtx.currentTime + i * 0.12;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t); osc.stop(t + 0.3);
        });
    }

    // Tick del timer (bip sutil, más agudo cuando queda poco)
    function sfxTick(urgent) {
        ensureAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(urgent ? 1200 : 600, audioCtx.currentTime);
        gain.gain.setValueAtTime(urgent ? 0.1 : 0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.06);
    }

    // Game Over (descendente dramático)
    function sfxGameOver() {
        ensureAudio();
        [400, 350, 300, 200].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            const t = audioCtx.currentTime + i * 0.15;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t); osc.stop(t + 0.2);
        });
    }

    // Clic de botón (pop suave)
    function sfxClick() {
        ensureAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.08);
    }

    // --- MÚSICA DE FONDO (Procedural Cyberpunk BGM) ---
    let bgmInterval = null;
    let bgmStep = 0;
    let bgmTempo = 180; // BPM inicial
    // Notas del arpegio cyberpunk (escala menor pentatónica en E)
    const bgmNotes = [164.81, 195.99, 220.00, 261.63, 329.63, 261.63, 220.00, 195.99]; // E3, G3, A3, C4, E4...
    const bgmBass  = [82.41, 82.41, 110.00, 110.00, 98.00, 98.00, 82.41, 82.41]; // Bajo E2, A2, G2

    function startBGM() {
        ensureAudio();
        stopBGM();
        bgmStep = 0;
        bgmTempo = 180;
        scheduleBGM();
    }

    function scheduleBGM() {
        const interval = (60 / bgmTempo) * 1000 / 2; // Semicorcheas
        bgmInterval = setInterval(() => {
            playBGMNote();
            bgmStep = (bgmStep + 1) % bgmNotes.length;
        }, interval);
    }

    function playBGMNote() {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const duration = (60 / bgmTempo) / 2;

        // Arpegio principal (onda cuadrada suave)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(bgmNotes[bgmStep], now);
        gain1.gain.setValueAtTime(0.04, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.9);
        osc1.connect(gain1).connect(audioCtx.destination);
        osc1.start(now); osc1.stop(now + duration);

        // Bajo (cada 2 pasos)
        if (bgmStep % 2 === 0) {
            const oscB = audioCtx.createOscillator();
            const gainB = audioCtx.createGain();
            oscB.type = 'triangle';
            oscB.frequency.setValueAtTime(bgmBass[bgmStep], now);
            gainB.gain.setValueAtTime(0.06, now);
            gainB.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.8);
            oscB.connect(gainB).connect(audioCtx.destination);
            oscB.start(now); oscB.stop(now + duration * 2);
        }

        // Kick sutil (cada 4 pasos)
        if (bgmStep % 4 === 0) {
            const oscK = audioCtx.createOscillator();
            const gainK = audioCtx.createGain();
            oscK.type = 'sine';
            oscK.frequency.setValueAtTime(150, now);
            oscK.frequency.exponentialRampToValueAtTime(40, now + 0.08);
            gainK.gain.setValueAtTime(0.1, now);
            gainK.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            oscK.connect(gainK).connect(audioCtx.destination);
            oscK.start(now); oscK.stop(now + 0.1);
        }
    }

    function setBGMTempo(newTempo) {
        if (bgmTempo === newTempo) return;
        bgmTempo = newTempo;
        if (bgmInterval) {
            clearInterval(bgmInterval);
            scheduleBGM();
        }
    }

    function stopBGM() {
        if (bgmInterval) {
            clearInterval(bgmInterval);
            bgmInterval = null;
        }
    }

    // --- SCREEN SHAKE ---
    function shakeScreen(intensity) {
        const body = document.body;
        // Remove any existing shake
        body.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
        void body.offsetWidth; // Force reflow
        
        const cls = `shake-${intensity}`;
        body.classList.add(cls);
        
        const durations = { light: 300, medium: 400, heavy: 500 };
        setTimeout(() => body.classList.remove(cls), durations[intensity] || 400);
    }

    // --- PARTICLE EFFECTS ---
    function emitParticles(x, y, color, count) {
        const colors = color ? [color] : ['#2ecc71', '#27ae60', '#3498db', '#ffffff'];
        for (let i = 0; i < (count || 12); i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 8 + 4;
            const angle = (Math.PI * 2 * i) / (count || 12);
            const distance = Math.random() * 80 + 40;
            const px = Math.cos(angle) * distance;
            const py = Math.sin(angle) * distance;
            
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty('--px', px + 'px');
            particle.style.setProperty('--py', py + 'px');
            particle.style.animationDuration = (Math.random() * 0.5 + 0.4) + 's';
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }

    // --- FIRE MODE ---
    function activateFireMode() {
        if (isFireMode) {
            if (fireTimeout) clearTimeout(fireTimeout);
            fireTimeout = setTimeout(() => deactivateFireMode(), 5000);
            return;
        }
        isFireMode = true;
        scoreMultiplier = 2;
        
        document.body.classList.add('fire-mode');
        sfxFireMode();
        shakeScreen('light');

        // Pausar música base procedural y reproducir música de fuego
        stopBGM();
        try {
            fireMusic.currentTime = 0;
            const playPromise = fireMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Si el archivo de audio aún no existe, continuar con el BGM procedural
                    if (isGameActive && !bgmInterval) scheduleBGM();
                });
            }
        } catch (err) {
            if (isGameActive && !bgmInterval) scheduleBGM();
        }
        
        // Show multiplier badge
        fireMultiplierEl = document.createElement('div');
        fireMultiplierEl.classList.add('fire-multiplier');
        fireMultiplierEl.textContent = '🔥 x2 PUNTOS 🔥';
        document.body.appendChild(fireMultiplierEl);
        
        // Achievement
        saveAchievement('fireMaster');
        
        // Deactivate after 5 seconds
        if (fireTimeout) clearTimeout(fireTimeout);
        fireTimeout = setTimeout(() => deactivateFireMode(), 5000);
    }

    function deactivateFireMode() {
        isFireMode = false;
        scoreMultiplier = 1;
        document.body.classList.remove('fire-mode');
        
        // Detener música de fuego y volver al BGM normal
        try {
            fireMusic.pause();
            fireMusic.currentTime = 0;
        } catch (e) {}

        if (isGameActive && !bgmInterval) {
            scheduleBGM();
        }

        if (fireMultiplierEl) {
            fireMultiplierEl.remove();
            fireMultiplierEl = null;
        }
        if (fireTimeout) {
            clearTimeout(fireTimeout);
            fireTimeout = null;
        }
    }

    // --- BOX SHUFFLE (moving boxes in last 10s) ---
    function startBoxShuffle() {
        if (boxesShuffling) return;
        boxesShuffling = true;
        
        const boxes = Array.from(dropBoxes);
        boxes.forEach(b => b.classList.add('box-shuffle'));
        
        boxShuffleInterval = setInterval(() => {
            // Pick two random boxes and swap their grid positions
            const i = Math.floor(Math.random() * boxes.length);
            let j = Math.floor(Math.random() * boxes.length);
            while (j === i) j = Math.floor(Math.random() * boxes.length);
            
            const parent = boxes[i].parentNode;
            const nextSiblingI = boxes[i].nextSibling;
            const nextSiblingJ = boxes[j].nextSibling;
            
            // Swap DOM positions
            if (nextSiblingJ === boxes[i]) {
                parent.insertBefore(boxes[i], boxes[j]);
            } else if (nextSiblingI === boxes[j]) {
                parent.insertBefore(boxes[j], boxes[i]);
            } else {
                parent.insertBefore(boxes[i], nextSiblingJ);
                parent.insertBefore(boxes[j], nextSiblingI);
            }
        }, 2500);
    }

    function stopBoxShuffle() {
        boxesShuffling = false;
        if (boxShuffleInterval) {
            clearInterval(boxShuffleInterval);
            boxShuffleInterval = null;
        }
        dropBoxes.forEach(b => b.classList.remove('box-shuffle'));
    }

    // --- TIME CHANGE INDICATOR ---
    function showTimeChange(amount) {
        const el = document.createElement('div');
        el.classList.add('time-change');
        el.classList.add(amount > 0 ? 'time-bonus' : 'time-penalty');
        el.textContent = amount > 0 ? `+${amount}s` : `${amount}s`;
        
        // Position near the timer
        const timerRect = timerDisplay.getBoundingClientRect();
        el.style.left = timerRect.left + 'px';
        el.style.top = (timerRect.top + 30) + 'px';
        
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    // Inicializar juego
    function initGame() {
        isGameActive = true;
        currentScore = 0;
        timeLeft = 30;
        comboCount = 0;
        scoreMultiplier = 1;
        totalErrors = 0;
        fastCorrectCount = 0;
        lastCorrectTime = 0;
        sessionAchievements = {};
        
        deactivateFireMode();
        stopBoxShuffle();
        
        scoreEl.textContent = currentScore;
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = 'var(--neon-green)';
        progressBar.style.boxShadow = '0 0 10px var(--neon-green)';
        timerDisplay.textContent = '00:30';
        timerDisplay.classList.remove('timer-warning');
        
        if (timerInterval) clearInterval(timerInterval);
        startTimer();
        startBGM();
        
        // Copiar y mezclar los casos aleatoriamente
        pendingCases = [...cloudCases].sort(() => Math.random() - 0.5);
        
        // Limpiar cajas de respuestas anteriores
        dropBoxes.forEach(box => {
            const placedCards = box.querySelectorAll('.card');
            placedCards.forEach(c => c.remove());
        });

        endGameModal.classList.add('hidden');
        populateSolutions();
        loadNextCard();
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Actualizar barra de progreso (ahora representa el tiempo)
            const progressPercent = (timeLeft / 30) * 100;
            progressBar.style.width = `${progressPercent}%`;
            
            if (timeLeft <= 10) {
                timerDisplay.classList.add('timer-warning');
                progressBar.style.backgroundColor = 'var(--neon-red)';
                progressBar.style.boxShadow = '0 0 10px var(--neon-red)';
                sfxTick(true);
                setBGMTempo(340); // Muy rápido, desesperante
                
                // Start box shuffle in last 10 seconds
                if (!boxesShuffling) startBoxShuffle();
            } else if (timeLeft <= 15) {
                sfxTick(false);
                setBGMTempo(260); // Empieza a acelerar
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                stopBGM();
                stopBoxShuffle();
                gameOver(); // Time out
            }
        }, 1000);
    }

    // Cargar siguiente tarjeta
    function loadNextCard() {
        if (!isGameActive) return;

        if (pendingCases.length === 0) {
            // Ciclo infinito: barajar y seguir
            pendingCases = [...cloudCases].sort(() => Math.random() - 0.5);
        }

        const currentCaseData = pendingCases.shift();
        const cardType = currentCaseData.type || 'normal';
        
        // Crear elemento tarjeta
        const card = document.createElement('div');
        card.classList.add('card');
        
        // Add special card class
        if (cardType === 'virus') {
            card.classList.add('card-virus');
        } else if (cardType === 'overclock') {
            card.classList.add('card-overclock');
        }
        
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-answer', currentCaseData.respuesta);
        card.setAttribute('data-type', cardType);
        card.textContent = currentCaseData.caso;
        card.id = 'active-card';
        card.style.position = 'relative'; // For ::before pseudo-element positioning

        // Eventos Drag (Arrastrar)
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        cardOrigin.innerHTML = '';
        cardOrigin.appendChild(card);
        currentCard = card;
    }

    // Lógica Drag & Drop
    function handleDragStart(e) {
        if (!isGameActive) {
            e.preventDefault();
            return;
        }
        this.classList.add('dragging');
        sfxGrab();
        // Almacenamos la respuesta correcta en la transferencia de datos
        e.dataTransfer.setData('text/plain', this.getAttribute('data-answer'));
        e.dataTransfer.setData('card-type', this.getAttribute('data-type'));
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
    }

    // Configurar zonas de caída (drop boxes)
    dropBoxes.forEach(box => {
        box.addEventListener('dragover', handleDragOver);
        box.addEventListener('dragenter', handleDragEnter);
        box.addEventListener('dragleave', handleDragLeave);
        box.addEventListener('drop', handleDrop);
    });

    function handleDragOver(e) {
        e.preventDefault(); // Necesario para permitir el evento drop
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.stopPropagation();
        this.classList.remove('drag-over');
        
        if (!currentCard) return;

        const correctAnswer = e.dataTransfer.getData('text/plain');
        const boxCategory = this.getAttribute('data-category');
        const cardType = currentCard.getAttribute('data-type') || 'normal';

        if (correctAnswer === boxCategory) {
            // --- Respuesta Correcta ---
            const points = 1 * scoreMultiplier;
            currentScore += points;
            comboCount++;
            scoreEl.textContent = currentScore;
            sfxCorrect();
            
            // Track speed for speedster achievement
            const now = Date.now();
            if (lastCorrectTime && (now - lastCorrectTime) < 1000) {
                fastCorrectCount++;
            } else {
                fastCorrectCount = 1;
            }
            lastCorrectTime = now;

            // Emit particles at drop point
            emitParticles(e.clientX, e.clientY, null, 15);

            // Handle special card types
            if (cardType === 'virus') {
                // Virus card classified correctly — still lose time!
                timeLeft = Math.max(0, timeLeft - 3);
                showTimeChange(-3);
                sfxVirus();
                shakeScreen('medium');
                showFloatingMessage('🦠 VIRUS: -3s', false, e.clientX, e.clientY - 40);
                saveAchievement('virusSurvivor');
            } else if (cardType === 'overclock') {
                // Overclock card classified correctly — gain time!
                timeLeft += 5;
                showTimeChange(+5);
                sfxOverclock();
                emitParticles(e.clientX, e.clientY, '#ffd700', 20);
                showFloatingMessage('⚡ OVERCLOCK: +5s', true, e.clientX, e.clientY - 40);
            }

            // Check last second achievement
            if (timeLeft <= 1) {
                saveAchievement('lastSecond');
            }

            // Mensajes y efectos de combo
            let comboMsg = '¡TRANSFERENCIA EXITOSA!';
            if (comboCount >= 5) {
                comboMsg = `🔥 ¡COMBO x${comboCount}! ¡IMPARABLE!`;
                sfxComboFanfare(comboCount);
                // Activate fire mode at combo x5
                if (!isFireMode) activateFireMode();
            } else if (comboCount >= 3) {
                comboMsg = `⚡ ¡COMBO x${comboCount}!`;
                sfxComboFanfare(comboCount);
            }
            
            if (scoreMultiplier > 1) {
                comboMsg += ` (x${scoreMultiplier})`;
            }
            
            showFloatingMessage(comboMsg, true, e.clientX, e.clientY);
            
            // Efecto visual de éxito
            currentCard.classList.add('correct', 'placed');
            currentCard.classList.remove('card-virus', 'card-overclock');
            currentCard.setAttribute('draggable', 'false'); // Ya no se puede arrastrar
            
            // Mover físicamente a la caja
            this.appendChild(currentCard);
            currentCard = null;

            // Check achievements
            checkAchievements();

            // Cargar siguiente tarjeta tras una pequeña pausa para ver la animación
            setTimeout(() => {
                loadNextCard();
            }, 800);
            
        } else {
            // --- Respuesta Incorrecta ---
            comboCount = 0; // Rompe el combo
            totalErrors++;
            currentCard.classList.add('incorrect');
            sfxWrong();
            shakeScreen('medium'); // Screen shake on error
            showFloatingMessage('¡ERROR DE PROTOCOLO!', false, e.clientX, e.clientY);
            
            // Deactivate fire mode on error
            if (isFireMode) {
                deactivateFireMode();
                showFloatingMessage('🔥 Modo Fuego perdido...', false, e.clientX, e.clientY - 30);
            }
            
            // Quitar clase incorrecta después de la animación de rebote
            setTimeout(() => {
                if(currentCard) currentCard.classList.remove('incorrect');
            }, 500);
            
            // Nota: No movemos el elemento en el DOM, por lo que rebota (vuelve) 
            // a su contenedor de origen al fallar el drop.
        }
    }

    function showFloatingMessage(text, isSuccess, x, y) {
        const msg = document.createElement('div');
        msg.classList.add('floating-msg');
        msg.classList.add(isSuccess ? 'success' : 'error');
        
        // Añadir estilos de combo
        if (isSuccess && comboCount >= 5) {
            msg.classList.add('combo-fire');
        } else if (isSuccess && comboCount >= 3) {
            msg.classList.add('combo');
        }
        
        msg.textContent = text;
        
        msg.style.left = `${x}px`;
        msg.style.top = `${y}px`;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 1000);
    }

    function gameOver() {
        isGameActive = false;
        if (timerInterval) clearInterval(timerInterval);
        stopBGM();
        stopBoxShuffle();
        deactivateFireMode();
        
        // Check end-of-game achievements
        if (totalErrors === 0 && currentScore > 0) {
            saveAchievement('flawless');
        }
        checkAchievements();
        
        // Verificar si es nuevo récord ANTES de guardar
        const previousScores = getScores();
        const previousHighScore = previousScores.length > 0 ? previousScores[0].score : 0;
        const isNewRecord = currentScore > previousHighScore && currentScore > 0;
        
        // Guardar puntaje en localStorage
        saveScore(playerName, currentScore);

        if (isNewRecord) {
            // --- SECUENCIA CINEMÁTICA ESTILO FNAF ---
            playCinematicRecord(previousHighScore);
        } else {
            // Sin récord: mostrar modal normal
            sfxGameOver();
            endGameTitle.textContent = "¡TIEMPO AGOTADO!";
            endGameTitle.style.color = "var(--neon-blue)";
            endGameTitle.style.textShadow = "";
            endGameMessage.innerHTML = `Gran esfuerzo, <span class="neon-text">${playerName}</span>.<br><br>Lograste clasificar: <span id="final-score" class="neon-text" style="font-size:1.5rem">${currentScore}</span> tarjetas en 30 segundos.`;
            renderLeaderboard();
            endGameModal.classList.remove('hidden');
        }
    }

    function launchConfetti() {
        const colors = ['#ffd700', '#ff2a2a', '#2ecc71', '#ff8c00', '#3498db'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'; // 2s to 4s
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';
            document.body.appendChild(confetti);

            // Eliminar elemento después de caer
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    function playCinematicRecord(previousHighScore) {
        const fnafOverlay = document.getElementById('fnaf-overlay');
        const fnafScoreText = document.getElementById('fnaf-score-text');
        const fnafRecordText = document.getElementById('fnaf-record-text');

        // Función para transicionar al modal final
        const finishCinematic = () => {
            fnafOverlay.classList.add('hidden');
            fnafScoreText.classList.remove('visible', 'flicker');
            fnafRecordText.classList.remove('visible');

            endGameTitle.textContent = "🏆 ¡NUEVO RÉCORD! 🏆";
            endGameTitle.style.color = "#ffd700";
            endGameTitle.style.textShadow = "0 0 15px #ffd700, 0 0 30px #ff8c00";
            endGameMessage.innerHTML = `¡Increíble, <span class="neon-text">${playerName}</span>!<br><br>Nuevo récord: <span id="final-score" style="font-size:2rem; color:#ffd700; text-shadow: 0 0 15px #ffd700;">${currentScore}</span> tarjetas<br><small style="opacity:0.6">Récord anterior: ${previousHighScore}</small>`;
            
            renderLeaderboard();
            endGameModal.classList.remove('hidden');
        };

        // Reset estados
        fnafScoreText.classList.remove('visible', 'flicker');
        fnafRecordText.classList.remove('visible');
        fnafRecordText.classList.add('hidden');
        fnafScoreText.textContent = '';

        // Paso 1: Pantalla negra aparece
        fnafOverlay.classList.remove('hidden');
        
        let soundPlayed = false;

        // Paso 2: Mostrar puntaje base e iniciar cuenta
        setTimeout(() => {
            fnafScoreText.classList.add('visible');
            
            // Empezamos máximo 6 números antes para que no sea infinito.
            // Con menos tiempo por número será mucho más rápido.
            let startScore = Math.max(0, currentScore - 6);
            let displayScore = startScore;
            fnafScoreText.textContent = displayScore;
            
            const steps = currentScore - startScore;
            
            if (steps > 0) {
                const intervalTime = 300; // Mucho más rápido (300ms por número)
                
                const countInterval = setInterval(() => {
                    displayScore++;
                    fnafScoreText.textContent = displayScore;
                    // Pequeño efecto visual en cada número
                    fnafScoreText.classList.remove('flicker');
                    void fnafScoreText.offsetWidth; // Forzar reflow
                    fnafScoreText.classList.add('flicker');
                    
                    // Cuando llega al final
                    if (displayScore >= currentScore) {
                        clearInterval(countInterval);
                        
                        if (!soundPlayed) {
                            victorySound.currentTime = 0; // Iniciar desde el principio del nuevo audio
                            victorySound.play().catch(e => console.warn("Audio record warning:", e));
                            soundPlayed = true;
                        }
                        
                        // Revelar "¡NUEVO RÉCORD!" exactamente al llegar al puntaje final
                        fnafRecordText.classList.remove('hidden');
                        requestAnimationFrame(() => {
                            fnafRecordText.classList.add('visible');
                        });
                        launchConfetti();

                        // Paso 3: Transicionar 5 segundos DESPUÉS de que se muestra el récord
                        setTimeout(finishCinematic, 5000);
                    }
                }, intervalTime);
            } else {
                // Caso extremo (puntaje muy bajo, no hay conteo)
                victorySound.currentTime = 0;
                victorySound.play().catch(e => console.warn("Audio record warning:", e));
                fnafRecordText.classList.remove('hidden');
                requestAnimationFrame(() => {
                    fnafRecordText.classList.add('visible');
                });
                launchConfetti();
                setTimeout(finishCinematic, 5000);
            }
        }, 1000);
    }

    // --- LEADERBOARD (localStorage) ---
    function getScores() {
        const data = localStorage.getItem('cloudClassifierScores');
        return data ? JSON.parse(data) : [];
    }

    function saveScore(name, score) {
        const scores = getScores();
        scores.push({ name: name, score: score, date: new Date().toLocaleString() });
        // Ordenar de mayor a menor
        scores.sort((a, b) => b.score - a.score);
        // Guardar solo los top 10
        localStorage.setItem('cloudClassifierScores', JSON.stringify(scores.slice(0, 10)));
    }

    function renderLeaderboard() {
        const scores = getScores();
        leaderboardBody.innerHTML = '';
        
        if (scores.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="3" style="padding:15px; opacity:0.5;">Sin registros aún</td></tr>';
            return;
        }
        
        scores.forEach((entry, index) => {
            const tr = document.createElement('tr');
            
            // Medallas para top 3
            if (index === 0) tr.classList.add('gold');
            else if (index === 1) tr.classList.add('silver');
            else if (index === 2) tr.classList.add('bronze');
            
            // Resaltar al jugador actual (último registro que coincida)
            if (entry.name === playerName && entry.score === currentScore) {
                tr.classList.add('current-player');
            }
            
            const medalIcons = ['🥇', '🥈', '🥉'];
            const posText = index < 3 ? medalIcons[index] : (index + 1);
            
            tr.innerHTML = `
                <td>${posText}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
            `;
            leaderboardBody.appendChild(tr);
        });
    }

    restartBtn.addEventListener('click', () => {
        sfxClick();
        startScreenModal.classList.remove('hidden');
        endGameModal.classList.add('hidden');
        playerNameInput.value = '';
        playerNameInput.focus();
    });

    // --- LÓGICA DEL SOLUCIONARIO (SECRETO) ---
    function populateSolutions() {
        solutionsList.innerHTML = '';
        cloudCases.forEach((item, index) => {
            if (item.type === 'virus' || item.type === 'overclock') return; // Skip special cards
            const div = document.createElement('div');
            div.classList.add('solution-item');
            div.innerHTML = `
                <p><strong>Caso ${index + 1}:</strong> ${item.caso}</p>
                <span class="solution-category">Respuesta: ${item.respuesta}</span>
            `;
            solutionsList.appendChild(div);
        });
    }

    // Escuchar Ctrl + Shift + S para abrir/cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            solutionModal.classList.toggle('hidden');
        }
        // Ctrl + Shift + F = Cheat: activar Modo Fuego instantáneamente
        if (e.ctrlKey && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
            e.preventDefault();
            if (!isGameActive) {
                playerName = playerNameInput.value.trim() || 'Jugador';
                startScreenModal.classList.add('hidden');
                initGame();
            }
            comboCount = 5;
            activateFireMode();
        }
        // L key for achievements
        if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.shiftKey) {
            // Don't toggle if typing in input
            if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
            toggleAchievements();
        }
    });

    // Event Listeners
    closeModalBtn.addEventListener('click', () => solutionModal.classList.add('hidden'));
    closeAchievementsBtn.addEventListener('click', () => achievementsModal.classList.add('hidden'));
    achievementsBtn.addEventListener('click', () => toggleAchievements());

    
    resetScoresBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los récords? Esta acción es irreversible.')) {
            localStorage.removeItem('cloudClassifierScores');
            renderLeaderboard();
        }
    });

    solutionModal.addEventListener('click', (e) => {
        if (e.target === solutionModal) {
            solutionModal.classList.add('hidden');
        }
    });

    achievementsModal.addEventListener('click', (e) => {
        if (e.target === achievementsModal) {
            achievementsModal.classList.add('hidden');
        }
    });

    // Permitir iniciar también presionando Enter en el input de nombre
    playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            startBtn.click();
        }
    });

    // Iniciar juego al hacer clic en el botón de inicio
    startBtn.addEventListener('click', () => {
        playerName = playerNameInput.value.trim();
        if (playerName === "") {
            alert("⚠️ Por favor, ingresa tu nombre completo para comenzar la actividad.");
            playerNameInput.focus();
            return;
        }
        sfxClick();
        startScreenModal.classList.add('hidden');
        initGame();
    });
});
