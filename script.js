

    document.addEventListener('DOMContentLoaded', () => {
    
    
    const startScreen = document.getElementById('start-screen'), startButton = document.getElementById('start-button'), gameContainer = document.querySelector('.game-container'), homeBestScore = document.getElementById('home-best-score'), tabSuma = document.getElementById('tabSuma'), tabEncontrarX = document.getElementById('tabEncontrarX'), operando1Elem = document.getElementById('operando1'), operadorElem = document.getElementById('operador'), operando2Elem = document.getElementById('operando2'), resultadoElem = document.getElementById('resultado'), respuestaUsuarioInput = document.getElementById('respuestaUsuario'), btnComprobar = document.getElementById('btnComprobar'), feedbackElem = document.getElementById('feedback'), scoreElem = document.getElementById('score'), marcador = document.getElementById('marcador'), vidasElem = document.getElementById('vidas'), nivelBadge = document.getElementById('nivelBadge'), comboBadge = document.getElementById('comboBadge'), soundToggle = document.getElementById('soundToggle'), pauseBtn = document.getElementById('pauseBtn'), resetBtn = document.getElementById('resetBtn'), themeToggle = document.getElementById('themeToggle'), diffSelect = document.getElementById('difficulty'), hintBtn = document.getElementById('hintBtn'), explainBtn = document.getElementById('explainBtn'), numpadToggle = document.getElementById('numpadToggle'), timePill = document.getElementById('timePill'), timeBaseBig = document.getElementById('timeBaseBig'), timeBonusSmall = document.getElementById('timeBonusSmall'), gameOverModalElem = document.getElementById('gameOverModal'), finalScoreElem = document.getElementById('finalScore'), bestScoreElem = document.getElementById('bestScore'), statAciertos = document.getElementById('statAciertos'), statRacha = document.getElementById('statRacha'), statPromedio = document.getElementById('statPromedio'), statMejor = document.getElementById('statMejor'), hitosList = document.getElementById('hitosList'), btnReiniciar = document.getElementById('btnReiniciar'), mentorText = document.getElementById('mentorText'), panelDidactico = document.getElementById('panelDidactico'), explicacion = document.getElementById('explicacion'), levelLabel = document.getElementById('levelLabel'), levelFill = document.getElementById('levelFill'), toastEl = document.getElementById('toast'), numpad = document.getElementById('numpad'), confettiCanvas = document.getElementById('confettiCanvas');
    const achievementsButton = document.getElementById('achievements-button'), achievementsModalElem = document.getElementById('achievementsModal'), achievementsGrid = document.getElementById('achievements-grid');
    const powerupButtons = { time: document.getElementById('powerup-time'), x2: document.getElementById('powerup-x2'), skip: document.getElementById('powerup-skip') };
    const gameOverModal = new bootstrap.Modal(gameOverModalElem), achievementsModal = new bootstrap.Modal(achievementsModalElem);
    const ctxConfetti = confettiCanvas.getContext('2d');
    
    
    const FRENZY_STREAK_TRIGGER = 7, FRENZY_DURATION = 10, POWERUP_CHARGE_PER_CORRECT = 15;
    const BASE_TIME_INITIAL = 20, BONUS_TIME = 5, BASE_POINTS = 100, BONUS_BASE = 50, BONUS_INC = 15, START_LIVES = 3;
    let minBaseTime = 8, maxNStart = 10;
    const DIFFS = { facil: { baseTime:24, minTime:10, maxN:10 }, normal:  { baseTime:20, minTime:8,  maxN:12 }, dificil: { baseTime:16, minTime:8,  maxN:16 }, extremo: { baseTime:14, minTime:6,  maxN:20 } };
        const ACHIEVEMENTS = {
      'novato': { title: 'Al menos empieza', desc: 'Completa tu primera partida.', icon: '🚀' },
      'racha3': { title: 'Un llamón', desc: 'Alcanza una racha de 3 aciertos.', icon: '🔥' },
      'racha7': { title: 'Bestia', desc: 'Alcanza una racha de 7 y activa el modo frenesí.', icon: '⚡' },
      'racha15': { title: 'Adicto a la Racha', desc: 'Alcanza una racha de 15 aciertos.', icon: '👑' },
      'puntos1k': { title: 'Club de los 1000', desc: 'Supera los 1000 puntos.', icon: '💯' },
      'puntos5k': { title: 'Cinco grandes', desc: 'Supera los 5000 puntos.', icon: '💎' },
      'aciertos20': { title: 'Aguanta Mucho', desc: 'Acierta 20 preguntas en una partida.', icon: '🏃' },
      'velocidad': { title: 'Un Rashin', desc: 'Responde correctamente en menos de 2 segundos.', icon: '⏱️' },
      'estratega': { title: 'Absorbe Mentes', desc: 'Usa un power-up para salvarte.', icon: '🧠' },
      'coleccionista': { title: 'Farming', desc: 'Usa los 3 power-ups en una misma partida.', icon: '🗂️' },
      'frenetico': { title: 'Freshinyin', desc: 'Acierta más de 5 preguntas en un solo modo frenesí.', icon: '🤯' },
      'maestro': { title: 'Gran Maestro', desc: 'Desbloquea todos los demás hitos.', icon: '🎓' }
    };

    
    let modoJuego = 'suma', respuestaCorrecta = null, score = 0, bonusStreak = 0, maxBonusStreak = 0, totalCorrectas = 0, mejorTiempo = Infinity, sumaTiempos = 0, qStart = 0, tick = null, lives = START_LIVES, level = 1, soundOn = true, paused = false, hintUsedThisRound = false, timeOffsetExtra = 0, currentNumbers = { a:0, b:0, r:0 };
    let isFrenzy = false, frenzyTimer = null, frenzyEnd = 0, frenzyCorrect = 0;
    let powerups = { time: { charge: 0, ready: false }, x2: { charge: 0, ready: false }, skip: { charge: 0, ready: false }};
    let pointMultiplier = 1;
    let unlockedAchievements = new Set(), newAchievementsThisRound = new Set(), playerStats = {};

    
    const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
    const SOUNDS = { correct: {f:880, d:90, t:'triangle'}, incorrect: {f:220, d:120, t:'square'}, levelup: {f:1046, d:150, t:'triangle'}, hint: {f:520, d:90, t:'sine'}, powerupReady: {f:1200, d:100, t:'sine'}, powerupUse: {f:660, d:120, t:'sawtooth'}, frenzyStart: {f:1500, d:200, t:'square'}, achievement: {f:1318, d:180, t:'sine'} };
    function playSound(type) { if (!soundOn || !audioCtx) return; const s = SOUNDS[type]; const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = s.t; o.frequency.value = s.f; g.gain.value = 0.05; o.connect(g); g.connect(audioCtx.destination); o.start(); setTimeout(()=> { o.stop(); o.disconnect(); g.disconnect(); }, s.d); }

    
    function startGame(){
      score = 0; bonusStreak = 0; maxBonusStreak = 0; totalCorrectas = 0; mejorTiempo = Infinity; sumaTiempos = 0; lives = START_LIVES; level = 1; paused = false; isFrenzy = false; pointMultiplier = 1;
      playerStats = { maxStreak: 0, fastestTime: Infinity, score: 0, correctAnswers: 0, powerupsUsed: new Set(), frenzyAnswers: 0 };
      newAchievementsThisRound.clear();
      resetPowerups();
      pauseBtn.textContent = 'Pausar'; hintUsedThisRound = false; scoreElem.textContent = '0'; renderCombo(); renderLives(); nivelBadge.textContent = '1'; levelLabel.textContent = 'Nivel 1'; levelFill.style.width = '0%'; feedbackElem.textContent = '';
      generarOperacion();
    }

    function generarOperacion() {
      resetUI();
      if(isFrenzy) {
          const num1 = Math.floor(Math.random() * 10);
          const num2 = Math.floor(Math.random() * 10);
          respuestaCorrecta = num1 + num2;
          operando1Elem.textContent = num1; operando2Elem.textContent = num2;
          operadorElem.textContent = '+'; resultadoElem.textContent = '?';
          return;
      }
      computeLevel();
      const maxN = maxNStart + (level-1)*5;
      const num1 = Math.floor(Math.random() * (maxN+1));
      if (modoJuego === 'suma') {
        const num2 = Math.floor(Math.random() * (maxN+1));
        respuestaCorrecta = num1 + num2;
        currentNumbers = { a:num1, b:num2, r:respuestaCorrecta };
        operando1Elem.textContent = num1; operando2Elem.textContent = num2; operadorElem.textContent = '+'; resultadoElem.textContent = '?'; resultadoElem.classList.add('slot-x'); operando2Elem.classList.remove('slot-x');
      } else {
        const resultado = Math.floor(Math.random() * (maxN+1)) + num1;
        respuestaCorrecta = resultado - num1;
        currentNumbers = { a:num1, b:NaN, r:resultado };
        operando1Elem.textContent = num1; operando2Elem.textContent = 'X'; operadorElem.textContent = '+'; resultadoElem.textContent = resultado; operando2Elem.classList.add('slot-x'); resultadoElem.classList.remove('slot-x');
      }
      iniciarRonda();
    }

    function comprobarRespuesta() {
      const val = respuestaUsuarioInput.value.trim();
      if (val === '') return;
      const respuestaUsuario = parseInt(val, 10);
      const elapsed = (performance.now() - qStart)/1000 - timeOffsetExtra;
      if (respuestaUsuario === respuestaCorrecta) {
        if (isFrenzy) {
            frenzyCorrect++; playerStats.frenzyAnswers = Math.max(playerStats.frenzyAnswers, frenzyCorrect);
            addScore(200, false);
            playSound('correct');
            generarOperacion();
            return;
        }
        detenerTick();
        let finalMultiplier = multiplierByStreak() * pointMultiplier;
        addScore(Math.round(BASE_POINTS * finalMultiplier), pointMultiplier > 1);
        pointMultiplier = 1;
        totalCorrectas++;
        sumaTiempos += Math.max(0, elapsed);
        mejorTiempo = Math.min(mejorTiempo, Math.max(0, elapsed));
        playerStats.fastestTime = mejorTiempo;
        playerStats.correctAnswers = totalCorrectas;
        if (elapsed <= BONUS_TIME) {
          bonusStreak++;
          const bonusPoints = BONUS_BASE + Math.max(0, bonusStreak - 1) * BONUS_INC;
          addScore(bonusPoints, true);
          feedbackElem.textContent = `Correcto. Tiempo: ${elapsed.toFixed(1)}s · Bonus +${bonusPoints} (racha ${bonusStreak})`;
        } else {
          bonusStreak = 0;
          feedbackElem.textContent = `Correcto. Tiempo: ${elapsed.toFixed(1)}s`;
        }
        maxBonusStreak = Math.max(maxBonusStreak, bonusStreak);
        playerStats.maxStreak = maxBonusStreak;
        renderCombo();
        chargePowerups();
        playSound('correct');
        feedbackElem.className = 'feedback-container text-center feedback-correcto anim-pulse';
        checkAchievements();
        if(bonusStreak > 0 && bonusStreak % FRENZY_STREAK_TRIGGER === 0){
            startFrenzyMode();
        } else {
            setTimeout(generarOperacion, 700);
        }
      } else {
        if(isFrenzy) return;
        detenerTick();
        perderPartida('Respuesta incorrecta');
      }
    }

    function perderPartida(motivo){
      lives = Math.max(0, lives - 1);
      bonusStreak = 0;
      renderCombo();
      renderLives();
      playSound('incorrect');
      if (lives > 0) {
        feedbackElem.textContent = `${motivo}. Te quedan ${lives} vidas`;
        feedbackElem.className = 'feedback-container text-center feedback-incorrecto anim-shake';
        setTimeout(generarOperacion, 900);
        return;
      }
      checkAchievements(true);
      gameOver();
    }
    
    function gameOver() {
        const finalScoreVal = score;
        feedbackElem.textContent = 'Fin de la partida.';
        finalScoreElem.textContent = finalScoreVal;
        statAciertos.textContent = totalCorrectas;
        statRacha.textContent = maxBonusStreak;
        statPromedio.textContent = totalCorrectas > 0 ? (sumaTiempos/totalCorrectas).toFixed(1) + 's' : '--';
        statMejor.textContent = isFinite(mejorTiempo) ? mejorTiempo.toFixed(1) + 's' : '--';
        hitosList.innerHTML = '';
        if (newAchievementsThisRound.size > 0) {
             newAchievementsThisRound.forEach(id => {
                 const ach = ACHIEVEMENTS[id];
                 hitosList.innerHTML += `<span class="badge rounded-pill bg-warning text-dark">${ach.icon} ${ach.title}</span>`;
             });
        } else {
            hitosList.innerHTML = `<span class="badge rounded-pill text-bg-secondary">Nada, A seguir</span>`;
        }
        try{ const best = parseInt(localStorage.getItem('bestScore')||'0',10); if (finalScoreVal > best) localStorage.setItem('bestScore', String(finalScoreVal)); bestScoreElem.textContent = String(Math.max(finalScoreVal, best)); }catch(e){}
        gameOverModal.show();
    }

    
    function startFrenzyMode() {
        isFrenzy = true; frenzyCorrect = 0;
        playSound('frenzyStart');
        detenerTick();
        document.body.classList.add('frenzy-mode');
        feedbackElem.innerHTML = `<div id="frenzy-text">¡MODO FRENESÍ!</div>`;
        frenzyEnd = Date.now() + FRENZY_DURATION * 1000;
        frenzyTimer = setInterval(updateFrenzyTimer, 100);
        generarOperacion();
    }
    function updateFrenzyTimer() {
        const timeLeft = (frenzyEnd - Date.now()) / 1000;
        if (timeLeft <= 0) {
            endFrenzyMode();
            return;
        }
        timeBaseBig.textContent = timeLeft.toFixed(1);
        timePill.style.setProperty('--progress', `${(timeLeft/FRENZY_DURATION)*100}%`);
    }
    function endFrenzyMode() {
        isFrenzy = false;
        clearInterval(frenzyTimer);
        frenzyTimer = null;
        document.body.classList.remove('frenzy-mode');
        feedbackElem.textContent = `¡Frenesí terminado! ${frenzyCorrect} aciertos.`;
        checkAchievements();
        setTimeout(generarOperacion, 1500);
    }
    
    
    function chargePowerups(){ Object.keys(powerups).forEach(key => { if(!powerups[key].ready){ powerups[key].charge += POWERUP_CHARGE_PER_CORRECT; if (powerups[key].charge >= 100) { powerups[key].charge = 100; powerups[key].ready = true; playSound('powerupReady'); } } }); updatePowerupUI(); }
    function resetPowerups() { Object.keys(powerups).forEach(key => { powerups[key].charge = 0; powerups[key].ready = false; }); updatePowerupUI(); }
    function usePowerup(key) { if(!powerups[key] || !powerups[key].ready || isFrenzy) return;
      powerups[key].ready = false; powerups[key].charge = 0;
      playSound('powerupUse');
      playerStats.powerupsUsed.add(key);
      switch(key) {
        case 'time': timeOffsetExtra += 5; toast("Tiempo congelado +5s", "warn"); break;
        case 'x2': pointMultiplier = 2; toast("¡Puntos x2 en el siguiente acierto!", "warn"); break;
        case 'skip': addScore(-25); toast("Pregunta saltada (-25 pts)", "bad"); generarOperacion(); break;
      }
      checkAchievements();
      updatePowerupUI();
    }
    function updatePowerupUI() { Object.keys(powerups).forEach(key => { const p = powerups[key], btn = powerupButtons[key]; btn.disabled = !p.ready || isFrenzy; btn.classList.toggle('ready', p.ready); btn.querySelector('.cooldown-pie').style.setProperty('--p', p.charge); }); }

    
    function loadAchievements() { try { const saved = localStorage.getItem('unlockedAchievements'); if (saved) unlockedAchievements = new Set(JSON.parse(saved)); } catch(e){} }
    function saveAchievements() { try { localStorage.setItem('unlockedAchievements', JSON.stringify(Array.from(unlockedAchievements))); } catch(e){} }
    function unlockAchievement(id) { if (unlockedAchievements.has(id)) return;
        unlockedAchievements.add(id);
        newAchievementsThisRound.add(id);
        const ach = ACHIEVEMENTS[id];
        toast(`${ach.icon} Logro: ${ach.title}`, 'achievement');
        playSound('achievement');
        saveAchievements();
    }
    function checkAchievements(isGameOver = false) {
        playerStats.score = score;
        if (playerStats.maxStreak >= 3) unlockAchievement('racha3');
        if (playerStats.maxStreak >= 7) unlockAchievement('racha7');
        if (playerStats.maxStreak >= 15) unlockAchievement('racha15');
        if (playerStats.score >= 1000) unlockAchievement('puntos1k');
        if (playerStats.score >= 5000) unlockAchievement('puntos5k');
        if (playerStats.correctAnswers >= 20) unlockAchievement('aciertos20');
        if (playerStats.fastestTime < 2) unlockAchievement('velocidad');
        if (playerStats.powerupsUsed.size >= 1) unlockAchievement('estratega');
        if (playerStats.powerupsUsed.size === 3) unlockAchievement('coleccionista');
        if (playerStats.frenzyAnswers > 5) unlockAchievement('frenetico');
        if (isGameOver) unlockAchievement('novato');
        if (Object.keys(ACHIEVEMENTS).length - 1 === unlockedAchievements.size && !unlockedAchievements.has('maestro')) {
            unlockAchievement('maestro');
        }
    }
    function renderAchievements() {
        achievementsGrid.innerHTML = '';
        Object.entries(ACHIEVEMENTS).forEach(([id, ach]) => {
            const unlocked = unlockedAchievements.has(id);
            achievementsGrid.innerHTML += `
              <div class="achievement-card ${unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${unlocked ? ach.icon : 'â“'}</div>
                <h6 class="achievement-title">${ach.title}</h6>
                <p class="achievement-desc">${unlocked ? ach.desc : '???'}</p>
              </div>`;
        });
    }

    
    function iniciarRonda(){
      detenerTick(); qStart = performance.now(); timeOffsetExtra = 0; hintUsedThisRound = false;
      const tBase = currentBaseTime(); updateTimerUI(tBase, BONUS_TIME, tBase);
      const start = performance.now();
      tick = setInterval(() => {
        const now = performance.now();
        let elapsed = (now - start)/1000 - timeOffsetExtra;
        if(paused) return;
        const baseLeft = tBase - elapsed; const bonusLeft = BONUS_TIME - elapsed;
        updateTimerUI(baseLeft, bonusLeft, tBase);
        if (baseLeft <= 0){ detenerTick(); perderPartida('Se acabÃ³ el tiempo'); }
      }, 100);
    }
    function detenerTick(){ if (tick){ clearInterval(tick); tick = null; } }
    function resetUI() { respuestaUsuarioInput.value = ''; respuestaUsuarioInput.disabled = false; respuestaUsuarioInput.focus(); feedbackElem.textContent = ''; feedbackElem.className = 'feedback-container text-center'; }
    function updateTimerUI(baseLeft, bonusLeft, tBase){ const b = Math.max(0, baseLeft); timeBaseBig.textContent = Math.ceil(b); timeBonusSmall.classList.toggle('d-none', bonusLeft <= 0); const frac = Math.max(0, Math.min(1, tBase > 0 ? b / tBase : 0)); timePill.style.setProperty('--progress', `${frac * 100}%`); timePill.classList.toggle('crit', frac <= .3); timePill.classList.toggle('warn', frac > .3 && frac <= .6); if (frac > .6) { timePill.classList.remove('warn','crit'); } }
    function addScore(points, isBonus=false){ score += points; if (score < 0) score = 0; scoreElem.textContent = score; marcador.classList.remove('bump'); void marcador.offsetWidth; marcador.classList.add('bump'); const pop = document.createElement('div'); pop.className = 'score-pop' + (isBonus ? ' bonus' : ''); pop.textContent = (points>0?'+':'') + points; marcador.appendChild(pop); setTimeout(() => pop.remove(), 900); }
    function heartSVG(on){ const color = on ? '#ef4444' : '#cbd5e1'; return `<svg viewBox="0 0 24 24"><path fill="${color}" d="M12 21s-6.716-4.18-9.428-7.35C.69 11.22 1.08 7.96 3.515 6.3 5.26 5.1 7.66 5.38 9.2 6.9L12 9.67l2.8-2.77c1.54-1.52 3.94-1.8 5.685-.6 2.435 1.66 2.825 4.92 .943 7.35C18.716 16.82 12 21 12 21z"/></svg>`; }
    function renderLives(){ let html = ''; for (let i=0;i<START_LIVES;i++) html += heartSVG(i < lives); vidasElem.innerHTML = html; }
    function computeLevel(){ const prevLevel = level; level = Math.max(1, Math.floor(totalCorrectas/5) + 1); nivelBadge.textContent = `${level}`; levelLabel.textContent = `Nivel ${level}`; const progressInLevel = totalCorrectas % 5; levelFill.style.width = `${(progressInLevel/5)*100}%`; if (level > prevLevel){ emitConfetti(); playSound('levelup'); } }
    function currentBaseTime(){ return Math.max(minBaseTime, DIFFS[diffSelect.value].baseTime - (level-1)); }
    function multiplierByStreak(){ const steps = Math.min(4, Math.floor(Math.max(0, bonusStreak-1)/2)); return 1 + steps*0.5; }
    function renderCombo(){ const m = multiplierByStreak(); if (m > 1){ comboBadge.textContent = `x${m.toFixed(1).replace(/\.0$/, '')}`; comboBadge.classList.remove('d-none'); } else { comboBadge.classList.add('d-none'); } }
    function toast(msg, cls=''){ toastEl.innerHTML = msg; toastEl.className = 'toast-lite ' + (cls||''); requestAnimationFrame(()=>{ toastEl.classList.add('show'); }); setTimeout(()=> toastEl.classList.remove('show'), 2400); }
    
    
    function showStartScreen() { gameContainer.classList.add('hidden'); startScreen.classList.remove('hidden'); document.body.classList.remove('playing'); updateHomeScreenBestScore(); }
    function showGameScreen() { startScreen.classList.add('hidden'); gameContainer.classList.remove('hidden'); document.body.classList.add('playing'); document.body.style.alignItems = 'flex-start'; startGame(); }
    function updateHomeScreenBestScore() { try { const best = localStorage.getItem('bestScore') || '0'; homeBestScore.textContent = best; } catch(e) { homeBestScore.textContent = '0'; } }

    
    function emitConfetti(count=120, duration=1200){  }
    
    
    startButton.addEventListener('click', showGameScreen);
    achievementsButton.addEventListener('click', () => { renderAchievements(); achievementsModal.show(); });
    tabSuma.addEventListener('click', (e) => { e.preventDefault(); modoJuego = 'suma'; tabSuma.classList.add('active'); tabEncontrarX.classList.remove('active'); });
    tabEncontrarX.addEventListener('click', (e) => { e.preventDefault(); modoJuego = 'encontrarX'; tabEncontrarX.classList.add('active'); tabSuma.classList.remove('active'); });
    btnComprobar.addEventListener('click', comprobarRespuesta);
    respuestaUsuarioInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') comprobarRespuesta(); });
    btnReiniciar.addEventListener('click', () => { gameOverModal.hide(); });
    gameOverModalElem.addEventListener('hidden.bs.modal', showStartScreen);
    diffSelect.addEventListener('change', () => { applyDifficulty(diffSelect.value); startGame(); });
    Object.keys(powerupButtons).forEach(key => { powerupButtons[key].addEventListener('click', () => usePowerup(key)); });
    document.addEventListener('keydown', (e) => {
      if (document.activeElement !== respuestaUsuarioInput && !gameOverModalElem.classList.contains('show')) {
         const key = e.key.toLowerCase();
         if(key === 't') usePowerup('time'); if(key === 'd') usePowerup('x2'); if(key === 'p') usePowerup('skip');
      }
    });

    function applyDifficulty(key){ const d = DIFFS[key] || DIFFS.normal; baseTimeInitial = d.baseTime; minBaseTime = d.minTime; maxNStart = d.maxN; }
    applyDifficulty(diffSelect.value);
    loadAchievements();
    updateHomeScreenBestScore();
  });






