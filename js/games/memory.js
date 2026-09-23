/* Pairs Memory Match Classic Nokia Puzzle Game */

class MemoryGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.icons = ['[A]', '[B]', '[C]', '[X]', '[Y]', '[Z]'];
    this.reset();
  }

  reset() {
    this.cards = [];
    const deck = [...this.icons, ...this.icons];
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    deck.forEach((icon, idx) => {
      this.cards.push({
        id: idx,
        icon: icon,
        flipped: false,
        matched: false
      });
    });

    this.cursor = 0;
    this.firstSelected = null;
    this.moves = 0;
    this.matchedPairs = 0;
    this.score = 0;
    this.lockBoard = false;
    this.gameOver = false;
  }

  handleInput(key) {
    if (this.gameOver || this.lockBoard) return;

    if (key === 'UP' || key === '2') {
      if (this.cursor >= 4) this.cursor -= 4;
    } else if (key === 'DOWN' || key === '8') {
      if (this.cursor < 8) this.cursor += 4;
    } else if (key === 'LEFT' || key === '4') {
      if (this.cursor % 4 > 0) this.cursor--;
    } else if (key === 'RIGHT' || key === '6') {
      if (this.cursor % 4 < 3) this.cursor++;
    } else if (key === 'SELECT' || key === '5' || key === 'SPACE' || key === 'ENTER') {
      this.flipCard(this.cursor);
    }
  }

  flipCard(index) {
    const card = this.cards[index];
    if (card.flipped || card.matched || this.lockBoard) return;

    card.flipped = true;
    window.nokiaAudio.playRotateSFX();

    if (!this.firstSelected) {
      this.firstSelected = card;
    } else {
      this.moves++;
      if (this.firstSelected.icon === card.icon) {
        // Match found!
        this.firstSelected.matched = true;
        card.matched = true;
        this.firstSelected = null;
        this.matchedPairs++;
        this.score += 50;
        window.nokiaAudio.playPointSFX();

        if (this.matchedPairs === this.icons.length) {
          this.gameOver = true;
          this.score += Math.max(100, 300 - this.moves * 10);
          if (this.onGameOver) this.onGameOver(this.score);
        }
      } else {
        // Not a match
        this.lockBoard = true;
        window.nokiaAudio.playBackBeep();
        setTimeout(() => {
          this.firstSelected.flipped = false;
          card.flipped = false;
          this.firstSelected = null;
          this.lockBoard = false;
        }, 800);
      }
    }
  }

  update() {}

  render(pixelColor = '#1a3409', bgColor = '#97ba30') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = pixelColor;
    ctx.font = '16px "VT323", monospace';
    ctx.fillText(`MEMORY MATCH MOVES:${this.moves} PAIRS:${this.matchedPairs}/6`, 6, 20);

    const startX = 20;
    const startY = 35;
    const cardW = 52;
    const cardH = 65;
    const gap = 8;

    this.cards.forEach((card, i) => {
      const r = Math.floor(i / 4);
      const c = i % 4;
      const x = startX + c * (cardW + gap);
      const y = startY + r * (cardH + gap);

      // Highlight cursor
      if (i === this.cursor && !this.gameOver) {
        ctx.strokeStyle = pixelColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 2, y - 2, cardW + 4, cardH + 4);
      }

      if (card.flipped || card.matched) {
        ctx.fillStyle = pixelColor;
        ctx.fillRect(x, y, cardW, cardH);
        ctx.fillStyle = bgColor;
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.icon, x + cardW / 2, y + cardH / 2);
      } else {
        ctx.fillStyle = pixelColor;
        ctx.fillRect(x, y, cardW, cardH);
        // Retro pattern on back
        ctx.fillStyle = bgColor;
        ctx.fillRect(x + 6, y + 6, cardW - 12, cardH - 12);
        ctx.fillStyle = pixelColor;
        ctx.fillRect(x + 12, y + 12, cardW - 24, cardH - 24);
      }
    });

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    if (this.gameOver) {
      ctx.fillStyle = pixelColor;
      ctx.fillRect(20, 90, this.canvas.width - 40, 50);
      ctx.fillStyle = bgColor;
      ctx.font = '20px "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ALL MATCHED! WIN!', this.canvas.width / 2, 115);
      ctx.font = '14px "VT323", monospace';
      ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, 132);
      ctx.textAlign = 'left';
    }
  }
}
