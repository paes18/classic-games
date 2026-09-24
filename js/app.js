/* Nokia Retro Operating System & Application Manager - Fixed Speeds & Clean Screens */

class NokiaApp {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Canvas native LCD size (340x340)
    this.canvas.width = 340;
    this.canvas.height = 340;

    this.currentTheme = 'green';
    this.themeColors = {
      green: { bg: '#97ba30', pixel: '#1a3409' },
      color: { bg: '#0f172a', pixel: '#38bdf8' },
      amber: { bg: '#ff9900', pixel: '#2b1400' },
      ngage: { bg: '#090d16', pixel: '#10b981' }
    };

    this.activeScreen = 'menu';
    this.menuIndex = 0;

    this.games = [
      { id: 'snake', name: 'Snake II', icon: '[SNK]' },
      { id: 'space-impact', name: 'Space Impact', icon: '[SPC]' },
      { id: 'bounce', name: 'Bounce', icon: '[BNC]' },
      { id: 'rapid-roll', name: 'Rapid Roll', icon: '[RLL]' },
      { id: 'stacker', name: 'Block Cascade', icon: '[BLK]' },
      { id: 'racer', name: 'Pocket Racer', icon: '[RAC]' },
      { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '[X-O]' },
      { id: 'memory', name: 'Memory Pairs', icon: '[MEM]' },
      { id: 'scores', name: 'High Scores', icon: '[SCR]' },
      { id: 'settings', name: 'Settings', icon: '[SET]' }
    ];

    this.currentGame = null;
    this.keysPressed = {};
    this.highScores = this.loadScores();
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.difficulty = 'easy'; // Default to Easy mode
    this.diffMultipliers = { easy: 1.4, medium: 1.0, hard: 0.7 };

    this.initClock();
    this.initEventListeners();
    this.showStartupScreen();
  }

  loadScores() {
    try {
      const saved = localStorage.getItem('nokia_retro_scores');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  saveScore(gameId, score) {
    if (!this.highScores[gameId] || score > this.highScores[gameId]) {
      this.highScores[gameId] = score;
      try {
        localStorage.setItem('nokia_retro_scores', JSON.stringify(this.highScores));
      } catch (e) {}
      this.updateScoresUI();
    }
  }

  initClock() {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const clockEl = document.getElementById('phoneClock');
      if (clockEl) clockEl.textContent = `${hrs}:${mins}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  showStartupScreen() {
    const startup = document.getElementById('startupScreen');
    if (startup) {
      startup.classList.add('active');
      window.nokiaAudio.playNokiaTune();
      setTimeout(() => {
        startup.classList.remove('active');
        this.openMenu();
      }, 1800);
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.activeScreen = 'menu';
    this.currentGame = null;

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.classList.remove('active');

    this.renderMenu();
    this.startLoop();
  }

  renderMenu() {
    const menuList = document.getElementById('menuList');
    if (!menuList) return;

    menuList.innerHTML = '';
    this.games.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `menu-item ${idx === this.menuIndex ? 'selected' : ''}`;
      div.innerHTML = `<span class="icon">${item.icon}</span> <span class="name">${item.name}</span>`;
      div.addEventListener('click', () => {
        this.menuIndex = idx;
        this.selectMenuItem();
      });
      menuList.appendChild(div);
    });

    const selectedEl = menuList.children[this.menuIndex];
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  selectMenuItem() {
    window.nokiaAudio.playSelectBeep();
    const item = this.games[this.menuIndex];

    if (item.id === 'scores') {
      this.activeScreen = 'scores';
      this.canvas.classList.remove('active');
    } else if (item.id === 'settings') {
      this.activeScreen = 'settings';
      this.canvas.classList.remove('active');
    } else {
      this.launchGame(item.id);
    }
  }

  launchGame(gameId) {
    this.activeScreen = 'game';
    this.canvas.classList.add('active');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const mult = this.diffMultipliers[this.difficulty] || 1.0;
    const onOver = (score) => {
      this.saveScore(gameId, score);
    };

    switch (gameId) {
      case 'snake':
        this.currentGame = new SnakeGame(this.canvas, onOver, mult);
        break;
      case 'space-impact':
        this.currentGame = new SpaceImpactGame(this.canvas, onOver, mult);
        break;
      case 'bounce':
        this.currentGame = new BounceGame(this.canvas, onOver, mult);
        break;
      case 'rapid-roll':
        this.currentGame = new RapidRollGame(this.canvas, onOver, mult);
        break;
      case 'stacker':
        this.currentGame = new StackerGame(this.canvas, onOver, mult);
        break;
      case 'racer':
        this.currentGame = new RacerGame(this.canvas, onOver, mult);
        break;
      case 'tictactoe':
        this.currentGame = new TicTacToeGame(this.canvas, onOver, mult);
        break;
      case 'memory':
        this.currentGame = new MemoryGame(this.canvas, onOver, mult);
        break;
    }
  }

  handleInput(key) {
    this.triggerHaptic();

    if (key === 'BACK' || key === 'Escape' || key === 'Backspace') {
      window.nokiaAudio.playBackBeep();
      if (this.activeScreen === 'game' || this.activeScreen === 'scores' || this.activeScreen === 'settings') {
        this.openMenu();
        return;
      }
    }

    if (this.activeScreen === 'menu') {
      if (key === 'UP' || key === 'w') {
        this.menuIndex = (this.menuIndex - 1 + this.games.length) % this.games.length;
        window.nokiaAudio.playKeyBeep();
        this.renderMenu();
      } else if (key === 'DOWN' || key === 's') {
        this.menuIndex = (this.menuIndex + 1) % this.games.length;
        window.nokiaAudio.playKeyBeep();
        this.renderMenu();
      } else if (key === 'SELECT' || key === 'SPACE' || key === 'ENTER') {
        this.selectMenuItem();
      }
    } else if (this.activeScreen === 'game' && this.currentGame) {
      if (this.currentGame.gameOver && (key === 'SELECT' || key === 'SPACE' || key === 'ENTER')) {
        this.currentGame.reset();
        window.nokiaAudio.playSelectBeep();
      } else {
        this.currentGame.handleInput(key);
      }
    }
  }

  triggerHaptic() {
    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch (e) {}
    }
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Backspace'].includes(e.key)) {
        e.preventDefault();
      }

      let mappedKey = null;
      if (e.key === 'ArrowUp') mappedKey = 'UP';
      else if (e.key === 'ArrowDown') mappedKey = 'DOWN';
      else if (e.key === 'ArrowLeft') mappedKey = 'LEFT';
      else if (e.key === 'ArrowRight') mappedKey = 'RIGHT';
      else if (e.key === 'Enter' || e.key === ' ') mappedKey = 'SELECT';
      else if (e.key === 'Backspace' || e.key === 'Escape') mappedKey = 'BACK';
      else mappedKey = e.key;

      if (mappedKey) this.handleInput(mappedKey);
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.key] = false;
    });

    document.querySelectorAll('.ctrl-btn').forEach(btn => {
      const key = btn.dataset.key;
      const handlePress = (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        if (key) this.handleInput(key);
      };
      const handleRelease = () => btn.classList.remove('pressed');

      btn.addEventListener('pointerdown', handlePress);
      btn.addEventListener('pointerup', handleRelease);
      btn.addEventListener('pointerleave', handleRelease);
    });

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setTheme(btn.dataset.theme);
      });
    });

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.dataset.diff;
        window.nokiaAudio.playSelectBeep();
      });
    });
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    document.body.className = '';
    if (themeName !== 'green') {
      document.body.classList.add(`theme-${themeName}`);
    }
  }

  startLoop() {
    const loop = (timestamp) => {
      const elapsed = timestamp - this.lastFrameTime;
      if (elapsed >= this.frameInterval) {
        this.lastFrameTime = timestamp - (elapsed % this.frameInterval);
        this.update(timestamp);
        this.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(timestamp) {
    if (this.activeScreen === 'game' && this.currentGame) {
      if (this.currentGame.updateInput) {
        this.currentGame.updateInput(this.keysPressed);
      }
      this.currentGame.update(timestamp);
    }
  }

  render() {
    const theme = this.themeColors[this.currentTheme];

    const menuScreen = document.getElementById('menuScreen');
    const scoresScreen = document.getElementById('scoresScreen');
    const settingsScreen = document.getElementById('settingsScreen');

    if (menuScreen) menuScreen.classList.toggle('active', this.activeScreen === 'menu');
    if (scoresScreen) scoresScreen.classList.toggle('active', this.activeScreen === 'scores');
    if (settingsScreen) settingsScreen.classList.toggle('active', this.activeScreen === 'settings');

    if (this.activeScreen === 'game' && this.currentGame) {
      this.currentGame.render(theme.pixel, theme.bg);
    }
  }

  updateScoresUI() {
    const container = document.getElementById('scoreListContainer');
    if (!container) return;

    container.innerHTML = '';
    this.games.forEach(g => {
      if (['scores', 'settings'].includes(g.id)) return;
      const score = this.highScores[g.id] || 0;
      const row = document.createElement('div');
      row.className = 'menu-item';
      row.innerHTML = `<span class="icon">${g.icon}</span> <span class="name">${g.name}</span> <span style="margin-left:auto; font-weight:bold;">${score}</span>`;
      container.appendChild(row);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.nokiaApp = new NokiaApp();
  window.nokiaApp.updateScoresUI();
});
