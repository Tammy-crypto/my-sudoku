// ================= 數獨遊戲核心邏輯與豪華煙火引擎 =================

let board = [];
let solution = [];
let timerInterval = null;
let seconds = 0;

// 當網頁載入完成時自動初始化遊戲
window.addEventListener('DOMContentLoaded', () => {
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', startNewGame);
    }
    
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', startNewGame);
    }
    
    startNewGame();
});

// 開始新遊戲
function startNewGame() {
    resetTimer();
    generateSudoku();
    renderBoard();
    startTimer();
}

// 計時器功能
function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = "時間：00:00";
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timerEl.textContent = `時間：${mins}:${secs}`;
}

// 產生數獨題目與解答
function generateSudoku() {
    solution = Array(9).fill(0).map(() => Array(9).fill(0));
    solveSudoku(solution);

    board = solution.map(row => [...row]);
    
    const difficultySelect = document.getElementById('difficulty');
    let holes = 40;
    if (difficultySelect) {
        holes = parseInt(difficultySelect.value) || 40;
    }

    let removed = 0;
    while (removed < holes) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (board[r][c] !== 0) {
            board[r][c] = 0;
            removed++;
        }
    }
}

// 遞迴數獨解題器
function solveSudoku(grid) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) {
                let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                for (let num of nums) {
                    if (isValid(grid, r, c, num)) {
                        grid[r][c] = num;
                        if (solveSudoku(grid)) return true;
                        grid[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num && i !== col) return false;
        if (grid[i][col] === num && i !== row) return false;
    }
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let currR = startRow + r;
            let currC = startCol + c;
            if (grid[currR][currC] === num && (currR !== row || currC !== col)) return false;
        }
    }
    return true;
}

// 渲染畫布與九宮格（完美對齊 style.css 的 class 樣式）
function renderBoard() {
    const boardElement = document.getElementById('board');
    if (!boardElement) return;
    boardElement.innerHTML = '';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.inputMode = 'numeric'; // 手機上會自動跳出數字鍵盤
            input.maxLength = 1;
            input.classList.add('cell');
            input.dataset.row = r;
            input.dataset.col = c;

            // 第 3 列與第 6 列加上九宮格粗底線
            if (r === 2 || r === 5) {
                input.classList.add('bottom-border');
            }

            if (board[r][c] !== 0) {
                input.value = board[r][c];
                input.disabled = true;
                input.classList.add('fixed');
            } else {
                input.value = '';
                input.classList.add('user-input');
                input.addEventListener('input', (e) => {
                    // 只允許輸入 1~9 的單一數字
                    const val = e.target.value.replace(/[^1-9]/g, '');
                    e.target.value = val;
                    
                    // 即時錯誤紅字檢查
                    if (val && parseInt(val) !== solution[r][c]) {
                        e.target.classList.add('error');
                    } else {
                        e.target.classList.remove('error');
                    }

                    // 每次填寫完自動檢查是否全部正確過關
                    autoCheckWin();
                });
            }
            boardElement.appendChild(input);
        }
    }
}

// 自動檢查是否通關
function autoCheckWin() {
    const inputs = document.querySelectorAll('#board input');
    if (inputs.length === 0) return;
    let isComplete = true;

    inputs.forEach((input) => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const val = parseInt(input.value);

        if (!val || val !== solution[row][col]) {
            isComplete = false;
        }
    });

    if (isComplete) {
        clearInterval(timerInterval);
        
        inputs.forEach(input => input.disabled = true);
        
        launchGrandFireworks();
        
        setTimeout(() => {
            const finalTimeEl = document.getElementById('timer');
            const finalTime = finalTimeEl ? finalTimeEl.textContent : "";
            alert(`🎉 太神啦！全部正確過關！\n你的成績：${finalTime}`);
        }, 800);
    }
}

// ================= 豪華版煙火特效系統 =================
function launchGrandFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let rockets = [];
    let particles = [];
    let animationId;
    const colors = [
        ['#FF1461', '#FF758F'], // 亮粉紅漸層
        ['#18FF92', '#80FFDB'], // 翡翠綠漸層
        ['#5A87FF', '#A0C4FF'], // 寶石藍漸層
        ['#FBF38C', '#FFD166'], // 璀璨金漸層
        ['#FF9F1C', '#FFBF69'], // 琥珀橘漸層
        ['#C77DFF', '#E0AAFF']  // 夢幻紫漸層
    ];

    class Rocket {
        constructor() {
            this.x = Math.random() * (canvas.width * 0.7) + canvas.width * 0.15;
            this.y = canvas.height;
            this.targetY = Math.random() * (canvas.height * 0.35) + canvas.height * 0.1;
            this.speed = Math.random() * 4 + 9;
            this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.25;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.colorPair = colors[Math.floor(Math.random() * colors.length)];
            this.trail = [];
        }

        update() {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 6) this.trail.shift();

            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.12;

            if (this.vy >= -1 || this.y <= this.targetY) {
                createExplosion(this.x, this.y, this.colorPair);
                return false;
            }
            return true;
        }

        draw() {
            ctx.beginPath();
            if (this.trail.length > 0) {
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                ctx.lineTo(this.x, this.y);
            }
            ctx.strokeStyle = this.colorPair[0];
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    class Particle {
        constructor(x, y, color, speed, angle, size, decay) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = decay || (Math.random() * 0.015 + 0.01);
            this.gravity = 0.06;
            this.friction = 0.96;
            this.size = size || 2.5;
            this.twinkle = Math.random() > 0.5;
        }

        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
            return this.alpha > 0;
        }

        draw() {
            ctx.save();
            const currentAlpha = this.twinkle && Math.random() > 0.7 ? this.alpha * 0.3 : this.alpha;
            ctx.globalAlpha = Math.max(0, currentAlpha);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function createExplosion(x, y, colorPair) {
        const outerCount = 80;
        for (let i = 0; i < outerCount; i++) {
            const angle = (Math.PI * 2 / outerCount) * i + (Math.random() - 0.5) * 0.1;
            const speed = Math.random() * 5 + 4;
            particles.push(new Particle(x, y, colorPair[0], speed, angle, 2.8, 0.012));
        }
        const innerCount = 40;
        for (let i = 0; i < innerCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            particles.push(new Particle(x, y, colorPair[1], speed, angle, 2, 0.018));
        }
    }

    function animate() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';

        rockets = rockets.filter(rocket => {
            rocket.draw();
            return rocket.update();
        });

        particles = particles.filter(particle => {
            particle.draw();
            return particle.update();
        });

        animationId = requestAnimationFrame(animate);
    }

    animate();

    for (let i = 0; i < 3; i++) {
        setTimeout(() => rockets.push(new Rocket()), i * 250);
    }

    const launchInterval = setInterval(() => {
        rockets.push(new Rocket());
        if (Math.random() > 0.4) {
            setTimeout(() => rockets.push(new Rocket()), 150);
        }
    }, 450);

    setTimeout(() => {
        clearInterval(launchInterval);
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 2500);
    }, 4500);
}