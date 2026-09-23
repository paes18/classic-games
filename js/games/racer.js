/* Pocket Racer Classic Nokia Driving Game */

class RacerGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.lanes = [55, 125, 195];
    this.reset();
  }

  reset() {
    this.currentLane = 1; // Middle lane
    this.playerY = this.canvas.height - 40;
    this.carW = 24;
    this.carH = 36;
    this.speed = 4;

    this.traffic = [];
    this.coins = [];
    this.roadOffset = 0;
    this.score = 0;
    this.coinsCollected = 0;
    this.gameOver = false;
    this.spawnTimer = 0;
  }

  handleInput(key) {
    if (this.gameOver) return;
    if ((key === 'LEFT' || key === '4' || key === 'a') && this.currentLane > 0) {
      this.currentLane--;
      window.nokiaAudio.playRotateSFX();
    } else if ((key === 'RIGHT' || key === '6' || key === 'd') && this.currentLane < 2) {
      this.currentLane++;
      window.nokiaAudio.playRotateSFX();
    }
  }

  updateInput(keysPressed) {
    // Left and right handled via handleInput
  }

  update() {
    if (this.gameOver) return;

    this.roadOffset = (this.roadOffset + this.speed) % 30;

    // Spawn traffic cars
    this.spawnTimer++;
    if (this.spawnTimer > 35) {
      this.spawnTimer = 0;
      const lane = Math.floor(Math.random() * 3);
      if (Math.random() < 0.75) {
        this.traffic.push({
          lane: lane,
          y: -50,
          speed: 2 + Math.random() * 2
        });
      } else {
        this.coins.push({
          lane: lane,
          y: -30
        });
      }

      this.speed += 0.003; // speed up over time
    }

    const playerX = this.lanes[this.currentLane] - this.carW / 2;

    // Update traffic
    this.traffic.forEach((t, i) => {
      t.y += this.speed + t.speed;
      if (t.y > this.canvas.height) {
        this.traffic.splice(i, 1);
        this.score += 10;
      }

      // Check Collision with player
      const tx = this.lanes[t.lane] - this.carW / 2;
      if (
        playerX < tx + this.carW &&
        playerX + this.carW > tx &&
        this.playerY < t.y + this.carH &&
        this.playerY + this.carH > t.y
      ) {
        this.gameOver = true;
        window.nokiaAudio.playDieSFX();
        if (this.onGameOver) this.onGameOver(this.score);
      }
    });

    // Update coins
    this.coins.forEach((c, i) => {
      c.y += this.speed;
      if (c.y > this.canvas.height) {
        this.coins.splice(i, 1);
      }

      const cx = this.lanes[c.lane];
      if (
        Math.abs(playerX + this.carW / 2 - cx) < 18 &&
        Math.abs(this.playerY + this.carH / 2 - c.y) < 20
      ) {
        this.coins.splice(i, 1);
        this.coinsCollected++;
        this.score += 50;
        window.nokiaAudio.playEatSFX();
      }
    });
  }

  render(pixelColor = '#1a3409', bgColor = '#97ba30') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = pixelColor;

    // Draw Road Borders & Lane Dividers
    ctx.fillRect(20, 0, 4, this.canvas.height);
    ctx.fillRect(this.canvas.width - 24, 0, 4, this.canvas.height);

    // Dotted Lane Markings
    for (let y = -30 + this.roadOffset; y < this.canvas.height; y += 30) {
      ctx.fillRect(90, y, 2, 16);
      ctx.fillRect(160, y, 2, 16);
    }

    // Draw Coins
    this.coins.forEach(c => {
      ctx.beginPath();
      ctx.arc(this.lanes[c.lane], c.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Traffic Cars
    this.traffic.forEach(t => {
      const tx = this.lanes[t.lane] - this.carW / 2;
      ctx.fillRect(tx, t.y, this.carW, this.carH);
      ctx.fillStyle = bgColor;
      ctx.fillRect(tx + 4, t.y + 8, this.carW - 8, 8); // Windshield
      ctx.fillStyle = pixelColor;
    });

    // Draw Player Car
    const px = this.lanes[this.currentLane] - this.carW / 2;
    ctx.fillRect(px, this.playerY, this.carW, this.carH);
    ctx.fillStyle = bgColor;
    ctx.fillRect(px + 4, this.playerY + 8, this.carW - 8, 8); // Windshield
    ctx.fillRect(px + 6, this.playerY + 22, this.carW - 12, 6);
    ctx.fillStyle = pixelColor;

    // HUD Header
    ctx.font = '16px "VT323", monospace';
    ctx.fillText(`RACER COINS:${this.coinsCollected} PTS:${this.score}`, 6, 16);

    if (this.gameOver) {
      ctx.fillStyle = pixelColor;
      ctx.fillRect(20, 90, this.canvas.width - 40, 50);
      ctx.fillStyle = bgColor;
      ctx.font = '20px "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CRASH! GAME OVER', this.canvas.width / 2, 115);
      ctx.font = '14px "VT323", monospace';
      ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, 132);
      ctx.textAlign = 'left';
    }
  }
}
