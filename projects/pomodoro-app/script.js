// PARTE I: MENU - ABRIR E FECHAR
class SettingsMenu {
    constructor() {
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsNav = document.getElementById('settingsNav');
        this.closeNav = document.getElementById('closeNav');
        this.saveSettings = document.getElementById('saveSettings');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Abrir menu
        this.settingsBtn.addEventListener('click', () => {
            console.log('Clicou no settings!');
            this.settingsNav.classList.add('active');
        });
        
        // Fechar menu
        this.closeNav.addEventListener('click', () => {
            this.settingsNav.classList.remove('active');
        });
        
        // Fechar ao guardar
        this.saveSettings.addEventListener('click', () => {
            this.settingsNav.classList.remove('active');
        });
    }
}

// PARTE II: TIMER COMPLETO
class PomodoroTimer {
    constructor() {
        this.minutes = 25;
        this.seconds = 0;
        this.isRunning = false;
        this.isBreak = false;
        this.currentCycle = 1;
        this.totalCycles = 4;
        this.interval = null;
        
        // Configurações
        this.focusTime = 25;
        this.breakTime = 5;
        this.longBreakTime = 15;
        this.cyclesUntilLongBreak = 4;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeSettings();
        this.updateDisplay();
        this.updateProgress();
    }

    initializeElements() {
        // Timer
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.modeElement = document.getElementById('mode');
        
        // Botões
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Progresso
        this.currentCycleElement = document.getElementById('currentCycle');
        this.totalCyclesElement = document.getElementById('totalCycles');
        this.cyclesLeftElement = document.getElementById('cyclesLeft');
    }

    initializeSettings() {
        // Settings
        this.focusTimeSelect = document.getElementById('focusTime');
        this.breakTimeSelect = document.getElementById('breakTime');
        this.cyclesSelect = document.getElementById('cyclesUntilLongBreak');
        this.longBreakSelect = document.getElementById('longBreakTime');
        this.saveSettings = document.getElementById('saveSettings');
        
        this.setupSettingsListeners();
        this.loadSettings();
    }

    attachEventListeners() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    setupSettingsListeners() {
        // Settings
        this.saveSettings.addEventListener('click', () => {
            this.saveSettingsToStorage();
        });
        
        this.focusTimeSelect.addEventListener('change', (e) => this.handleCustomInput(e, 'focus'));
        this.breakTimeSelect.addEventListener('change', (e) => this.handleCustomInput(e, 'break'));
        this.longBreakSelect.addEventListener('change', (e) => this.handleCustomInput(e, 'longBreak'));
    }

    // FUNÇÕES DO TIMER
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => this.tick(), 1000);
        }
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
    }

    reset() {
        this.pause();
        this.minutes = this.focusTime;
        this.seconds = 0;
        this.updateDisplay();
    }

    tick() {
        if (this.seconds === 0) {
            if (this.minutes === 0) {
                this.complete();
                return;
            }
            this.minutes--;
            this.seconds = 59;
        } else {
            this.seconds--;
        }
        this.updateDisplay();
    }

    complete() {
        this.pause();
        
        if (!this.isBreak) {
            // Foco → Pausa
            this.isBreak = true;
            const isLongBreak = this.currentCycle % this.cyclesUntilLongBreak === 0;
            this.minutes = isLongBreak ? this.longBreakTime : this.breakTime;
            this.modeElement.textContent = isLongBreak ? 'Pausa Longa' : 'Pausa';
            
            this.currentCycle++;
            if (this.currentCycle > this.cyclesUntilLongBreak) {
                this.currentCycle = 1;
            }
        } else {
            // Pausa → Foco
            this.isBreak = false;
            this.minutes = this.focusTime;
            this.modeElement.textContent = 'Foco';
        }
        
        this.seconds = 0;
        this.updateDisplay();
        this.updateProgress();
        this.playNotification();

        // INICIAR AUTOMATICAMENTE O PRÓXIMO TIMER
        this.start();
    }

    updateDisplay() {
        this.minutesElement.textContent = this.minutes.toString().padStart(2, '0');
        this.secondsElement.textContent = this.seconds.toString().padStart(2, '0');
    }

    updateProgress() {
        this.currentCycleElement.textContent = this.currentCycle;
        this.totalCyclesElement.textContent = this.cyclesUntilLongBreak;
        this.cyclesLeftElement.textContent = this.cyclesUntilLongBreak - this.currentCycle + 1;
    }

    // FUNÇÕES DAS SETTINGS
    handleCustomInput(event, type) {
        const customInput = document.getElementById(`${type}TimeCustom`);
        if (!customInput) return;
        
        if (event.target.value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
        }
    }

    saveSettingsToStorage() {
        // 1. LER OS VALORES REAIS (incluindo personalizados)
        this.focusTime = this.getActualFocusTime();
        this.breakTime = this.getActualBreakTime();
        this.longBreakTime = this.getActualLongBreakTime();
        this.cyclesUntilLongBreak = parseInt(this.cyclesSelect.value) || 4;
        
        // 2. Atualizar total de ciclos
        this.totalCycles = this.cyclesUntilLongBreak;
        
        // 3. ATUALIZAR O TEMPO ATUAL DO TIMER
        if (!this.isBreak) {
            // Se está em modo Foco, atualiza para o novo tempo de foco
            this.minutes = this.focusTime;
        } else {
            // Se está em modo Pausa, atualiza para o novo tempo de pausa
            const isLongBreak = this.currentCycle % this.cyclesUntilLongBreak === 0;
            this.minutes = isLongBreak ? this.longBreakTime : this.breakTime;
            this.modeElement.textContent = isLongBreak ? 'Pausa Longa' : 'Pausa';
        }
        
        this.seconds = 0;
        
        // 4. Atualizar o display
        this.updateDisplay();
        this.updateProgress();
        
        console.log('Settings guardados! Focus:', this.focusTime, 'Break:', this.breakTime);
    }

    // FUNÇÕES AUXILIARES PARA LER VALORES PERSONALIZADOS
    getActualFocusTime() {
        const focusCustom = document.getElementById('focusTimeCustom');
        if (this.focusTimeSelect.value === 'custom' && focusCustom.style.display !== 'none') {
            return parseInt(focusCustom.value) || 25;
        }
        return parseInt(this.focusTimeSelect.value) || 25;
    }

    getActualBreakTime() {
        const breakCustom = document.getElementById('breakTimeCustom');
        if (this.breakTimeSelect.value === 'custom' && breakCustom.style.display !== 'none') {
            return parseInt(breakCustom.value) || 5;
        }
        return parseInt(this.breakTimeSelect.value) || 5;
    }

    getActualLongBreakTime() {
        const longBreakCustom = document.getElementById('longBreakTimeCustom');
        if (this.longBreakSelect.value === 'custom' && longBreakCustom.style.display !== 'none') {
            return parseInt(longBreakCustom.value) || 15;
        }
        return parseInt(this.longBreakSelect.value) || 15;
    }

    loadSettings() {
        this.focusTimeSelect.value = this.focusTime;
        this.breakTimeSelect.value = this.breakTime;
        this.cyclesSelect.value = this.cyclesUntilLongBreak;
        this.longBreakSelect.value = this.longBreakTime;
    }

    playNotification() {
        console.log('⏰ Hora da pausa!');
    }
}

// INICIALIZAR TUDO
document.addEventListener('DOMContentLoaded', () => {
    new SettingsMenu();
    new PomodoroTimer();
});