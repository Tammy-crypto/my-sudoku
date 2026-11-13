let solution = [];
let puzzle = [];
let timerInterval = null;
let secondsElapsed = 0;

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (let num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function startTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
  const seconds = String(secondsElapsed % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `時間：${minutes}:${seconds}`;
}

function initGame() {
  solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(solution);

  puzzle = solution.map(row => [...row]);
  let holes = parseInt(document.getElementById('difficulty').value);
  
  let carved = 0;
  while (carved < holes) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      carved++;
    }
  }

  renderBoard();
  startTimer();
}

function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'cell';

      if (r === 2 || r === 5) {
        input.classList.add('bottom-border');
      }

      if (puzzle[r][c] !== 0) {
        input.value = puzzle[r][c];
        input.disabled = true;
        input.classList.add('fixed');
      } else {
        input.classList.add('user-input');
        input.dataset.row = r;
        input.dataset.col = c;
        
        input.addEventListener('input', (e) => {
          let val = e.target.value.replace(/[^1-9]/g, '');
          e.target.value = val;

          if (val === '') {
            e.target.classList.remove('error');
          } else {
            if (parseInt(val) !== solution[r][c]) {
              e.target.classList.add('error');
            } else {
              e.target.classList.remove('error');
            }
          }
        });
      }

      boardEl.appendChild(input);
    }
  }
}

function checkWin() {
  const userInputs = document.querySelectorAll('.user-input');
  for (let input of userInputs) {
    const r = input.dataset.row;
    const c = input.dataset.col;
    if (input.value === '' || parseInt(input.value) !== solution[r][c]) {
      alert('還沒填完，或是還有格子填錯哦！');
      return;
    }
  }
  
  clearInterval(timerInterval);
  launchFireworks(); // 觸發煙火特效
  alert(`太厲害了！恭喜全部答對！總共花費時間：${document.getElementById('timer').textContent.replace('時間：', '')}`);
}

// 【新增】簡易煙火特效引擎
function launchFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  
  // 建立煙火粒子
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 + (Math.random() - 0.5) * 200,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 6 + 2,
      friction: 0.95,
      gravity: 0.1,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.015,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let active = false;
    particles.forEach(p => {
      if (p.alpha > 0) {
        active = true;
        p.speed *= p.friction;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed + p.gravity;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 動畫結束清除畫面
    }
  }

  animate();
}

document.getElementById('new-game-btn').addEventListener('click', initGame);
document.getElementById('check-btn').addEventListener('click', checkWin);
document.getElementById('difficulty').addEventListener('change', initGame);

initGame();