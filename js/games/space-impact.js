/* Space Impact Classic Nokia Game - Bug Free */

class SpaceImpactGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.reset();
  }

  reset() {
    this.player = {
      x: 20,
      y: this.canvas.height / 2 - 10,
      w: 20,
      h: 14,
      speed: 2.5,
      lives: 3
    };

    this.bullets = [];
    this.enemies = [];
    this.enemyBullets = [];
    this.score = 0;
    this.spawnTimer = 0;
    this.gameOver = false;
    this.boss = null;
  }

  handleInput(key) {
    if (this.gameOver) return;
    if (key === 'SELECT' || key === '5' || key === 'SPACE' || key === 'ENTER') {
      this.shoot();
    }
  }

  updateInput(keysPressed) {
    if (this.gameOver) return;
    if (keysPressed['UP'] || keysPressed['2'] || keysPressed['w']) {
      this.player.y = Math.max(10, this.player.y - this.player.speed);
    }
    if (keysPressed['DOWN'] || keysPressed['8'] || keysPressed['s']) {
      this.player.y = Math.min(this.canvas.height - 24, this.player.y + this.player.speed);
    }
    if (keysPressed['LEFT'] || keysPressed['4'] || keysPressed['a']) {
      this.player.x = Math.max(10, this.player.x - this.player.speed);
    }
    if (keysPressed['RIGHT'] || keysPressed['6'] || keysPressed['d']) {
      this.player.x = Math.min(this.canvas.width / 2, this.player.x + this.player.speed);
    }
  }

  shoot() {
    if (this.bullets.length < 5) {
      this.bullets.push({
        x: this.player.x + this.player.w,
        y: this.player.y + this.player.h / 2,
        speed: 5
      });
      window.nokiaAudio.playShootSFX();
    }
  }

  update() {
    if (this.gameOver) return;

    // Spawn enemies
    this.spawnTimer++;
    if (this.spawnTimer > 65 && !this.boss) {
      this.spawnTimer = 0;
      this.enemies.push({
        x: this.canvas.width + 10,
        y: Math.random() * (this.canvas.height - 50) + 20,
        w: 18,
        h: 14,
        speed: 1.2 + Math.random() * 0.5,
        hp: 1
      });
    }

    // Spawn Boss at 150 points
    if (this.score >= 150 && !this.boss) {
      this.boss = {
        x: this.canvas.width - 50,
        y: this.canvas.height / 2 - 25,
        w: 36,
        h: 50,
        speed: 1.5,
        dir: 1,
        hp: 25
      };
    }

    // Boss movement
    if (this.boss) {
      this.boss.y += this.boss.speed * this.boss.dir;
      if (this.boss.y <= 15 || this.boss.y >= this.canvas.height - 65) {
        this.boss.dir *= -1;
      }
      if (Math.random() < 0.04) {
        this.enemyBullets.push({
          x: this.boss.x,
          y: this.boss.y + Math.random() * this.boss.h,
          speed: 4
        });
      }
    }

    // Update Player Bullets (backwards loop)
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      b.x += b.speed;
      if (b.x > this.canvas.width) {
        this.bullets.splice(bi, 1);
      }
    }

    // Update Enemy Bullets (backwards loop)
    for (let ebi = this.enemyBullets.length - 1; ebi >= 0; ebi--) {
      const eb = this.enemyBullets[ebi];
      eb.x -= eb.speed;
      if (eb.x < 0) {
        this.enemyBullets.splice(ebi, 1);
        continue;
      }

      // Hit Player
      if (
        eb.x < this.player.x + this.player.w &&
        eb.x + 4 > this.player.x &&
        eb.y < this.player.y + this.player.h &&
        eb.y + 4 > this.player.y
      ) {
        this.enemyBullets.splice(ebi, 1);
        this.playerHit();
      }
    }

    // Update Enemies (backwards loop)
    for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
      const e = this.enemies[ei];
      e.x -= e.speed;
      if (e.x < -20) {
        this.enemies.splice(ei, 1);
        continue;
      }

      if (Math.random() < 0.015) {
        this.enemyBullets.push({ x: e.x, y: e.y + e.h / 2, speed: 3 });
      }

      // Check bullet collisions
      for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
        const b = this.bullets[bi];
        if (
          b.x < e.x + e.w &&
          b.x + 6 > e.x &&
          b.y < e.y + e.h &&
          b.y + 3 > e.y
        ) {
          this.bullets.splice(bi, 1);
          e.hp--;
          if (e.hp <= 0) {
            this.score += 15;
            window.nokiaAudio.playHitSFX();
            this.enemies.splice(ei, 1);
            break;
          }
        }
      }

      // Check player collision
      if (
        e.x < this.player.x + this.player.w &&
        e.x + e.w > this.player.x &&
        e.y < this.player.y + this.player.h &&
        e.y + e.h > this.player.y
      ) {
        this.enemies.splice(ei, 1);
        this.playerHit();
      }
    }

    // Boss Bullet Collision
    if (this.boss) {
      for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
        const b = this.bullets[bi];
        if (
          b.x < this.boss.x + this.boss.w &&
          b.x + 6 > this.boss.x &&
          b.y < this.boss.y + this.boss.h &&
          b.y + 3 > this.boss.y
        ) {
          this.bullets.splice(bi, 1);
          this.boss.hp--;
          window.nokiaAudio.playHitSFX();
          if (this.boss.hp <= 0) {
            this.score += 200;
            this.boss = null;
            window.nokiaAudio.playPointSFX();
            break;
          }
        }
      }
    }
  }

  playerHit() {
    this.player.lives--;
    window.nokiaAudio.playDieSFX();
    if (this.player.lives <= 0) {
      this.gameOver = true;
      if (this.onGameOver) this.onGameOver(this.score);
    }
  }

  render(pixelColor = '#1a3409', bgColor = '#97ba30') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = pixelColor;

    // Player
    ctx.fillRect(this.player.x, this.player.y + 4, this.player.w, 6);
    ctx.fillRect(this.player.x + 4, this.player.y, 10, 14);

    // Bullets
    this.bullets.forEach(b => ctx.fillRect(b.x, b.y - 1, 6, 2));
    this.enemyBullets.forEach(eb => ctx.fillRect(eb.x, eb.y, 4, 2));

    // Enemies
    this.enemies.forEach(e => {
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(e.x + 4, e.y + 4, 4, 4);
      ctx.fillStyle = pixelColor;
    });

    // Boss
    if (this.boss) {
      ctx.fillRect(this.boss.x, this.boss.y, this.boss.w, this.boss.h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(this.boss.x + 6, this.boss.y + 10, 10, 30);
      ctx.fillStyle = pixelColor;
    }

    ctx.font = '16px "VT323", monospace';
    ctx.fillText(`SCORE:${this.score} HP:${Math.max(0, this.player.lives)}`, 8, 20);

    if (this.gameOver) {
      ctx.fillStyle = pixelColor;
      ctx.fillRect(20, 110, this.canvas.width - 40, 50);
      ctx.fillStyle = bgColor;
      ctx.font = '20px "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER!', this.canvas.width / 2, 132);
      ctx.font = '14px "VT323", monospace';
      ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, 148);
      ctx.textAlign = 'left';
    }
  }
}
