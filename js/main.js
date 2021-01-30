import { createTetromino, tetrominoColors } from './modules/tetrominos.js';

// SELECTORS
const canvas = document.querySelector('#tetris');
const context = canvas.getContext('2d');
const gameModeStandard = document.querySelector('.game-mode--standard');
const gameModeSandbox = document.querySelector('.game-mode--sandbox');
const startBtn = document.querySelector('.menu__start');
const titleScreen = document.querySelector('.tetris__title-screen');
const borderGrid = document.querySelector('.tetris__grid');
const pauseBtn = document.querySelector('.btn-belt__pause-btn');
// Select the fontAwesome <i> within pauseBtn
const pauseBtnIcon = pauseBtn.children[0];
const pauseMessage = document.querySelector('.tetris__pause-message');
const levelDownBtn = document.querySelector('.stats__level-down');
const levelUpBtn = document.querySelector('.stats__level-up');
const greyBg = document.querySelector('.tetris__grey-bg');
const gameOverMessage = document.querySelector('.tetris__game-over');
const replayBtn = document.querySelector('.tetris__replay');
const mainMenuBtn = document.querySelector('.btn-belt__menu-btn');
const mainMenuBtnIcon = mainMenuBtn.children[0];
const mainMenu = document.querySelector('.tetris__menu');
const controlsBtn = document.querySelector('.menu__controls-btn');
const controls = document.querySelector('.tetris__controls');

// dropInterval determines how quickly the tetromino drops (1000ms = 1 second).
// 2 game modes - standard and sandbox. Standard offers level progression based on score. Sandbox allows user to increase and decrease the speed of the dropInterval. Default game mode is standard.
const game = {
  mode: "Standard",
  playing: false,
  pause: false,
  menu: true,
  playfield: [],
  dropInterval: 1000
}

const player = {
  pos: { x: 0, y: 0 },
  level: 1,
  lines: 0,
  score: 0
}

// keep track of the animation frame so we can cancel it
let rAF = null;
let dropCounter = 0;
let lastTime = 0;

// getContext allows us to use methods and access properties in JavaScript.
// Increase size of the context within the canvas (the tetrominos)
context.scale(20, 20);

// FUNCTIONS

// helper function.
const between = (score, min, max) => {
  return score >= min && score <= max;
}

// When tetrominos form a horizontal line, clear said line and add points
const lineClear = () => {
  let lines = 1;
  outer: for (let y = game.playfield.length - 1; y > 0; y--) {
    for (let x = 0; x < game.playfield[y].length; x++) {
      if (game.playfield[y][x] === 0) {
        continue outer;
      }
    }
    // remove the completed line
    const row = game.playfield.splice(y, 1)[0].fill(0);
    game.playfield.unshift(row);
    y++;

    player.score += lines * 10;
    lines *= 2;
    player.lines += 1;

    // because player.score increased, check whether player.level needs updating.
    // if updatedLevel returns false then don't set the level.
    if (game.playing && game.mode === 'Standard') {
      levelStandard(player.score, player.level);
      updateStat('level', player.level);
    }
  }
}

const collision = (arena, player) => {
  const [tetromino, playerPos] = [game.tetromino, player.pos];
  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      if (tetromino[y][x] != 0 && ( // if player position is not 0,0 then the player has moved and might collide
        arena[y + playerPos.y] && // if arena row doesn't exist then potential collision
        arena[y + playerPos.y][x + playerPos.x]) !== 0) { // if arena row and column don't exist and aren't 0, then must collide
        // return true if collision found.
        return true;
      }
    }
  }
  // return false if no collision found.
  return false;
}

// keep track of what is in every cell of the game using a 2d array
// tetris playfield is 10x20, with 2 rows offscreen
// populate the empty state
const createBoard = () => {
  for (let row = -2; row < 20; row++) {
    game.playfield[row] = [];

    for (let col = 0; col < 10; col++) {
      game.playfield[row][col] = 0;
    }
  }
  return game.playfield;
}

const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayfield(game.playfield, { x: 0, y: 0 });
  drawPlayfield(game.tetromino, player.pos);
}

const drawPlayfield = (playfield, offset) => {
  playfield.forEach((row, y) => {
    row.forEach((value, x) => {
      // Ignore any 0s in arrays and use value to add color to the tetromino
      if (value !== 0) {
        context.strokeStyle = '#000'
        context.lineWidth = 0.1;
        context.fillStyle = tetrominoColors[value];
        context.fillRect(
          x + offset.x,
          y + offset.y,
          1,
          1
        );
        context.strokeRect(
          x + offset.x,
          y + offset.y,
          1,
          1
        );
      }
    });
  });
}

// if placeNewPiece() triggers a collision() then the game is over.
// gameOver stops the playfield from drawing and displays the gameOverMessage and replayBtn
const gameOver = () => {
  cancelAnimationFrame(rAF);
  game.playing = false;
  gameOverMessage.classList.remove('is-hidden');
  replayBtn.classList.remove('is-hidden');
  greyBg.classList.remove('is-hidden');
}

// this function merges the player's position into the game.playfield's empty table of arrays - so all of the game.playfield's arrays of 0s will have tetrimino tetrominos of 1s, 2s, 3s etc.
const merge = (arena, player) => {
  game.tetromino.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

// pauseGame toggles the pause variable between false and true, which affects whether time pauses or not, and whether the user can move tetrominos. It brings up an overlay indicating that the game is paused.
const pauseGame = () => {
  if (game.playing) {
    greyBg.classList.toggle('is-hidden');
    pauseMessage.classList.toggle('is-hidden');
    if (game.pause) {
      pauseBtnIcon.classList.remove('fa-play');
      pauseBtnIcon.classList.add('fa-pause');
    } else {
      pauseBtnIcon.classList.remove('fa-pause');
      pauseBtnIcon.classList.add('fa-play');
    }
    // toggle pause variable
    (game.pause) ? game.pause = false : game.pause = true;
  } else {
    console.error("An error has occurred and the game was unable to pause.");
  }
}

// When the mainMenu is opened, the game is paused and the pauseBtn is removed. The game should not play whilst the menu is open.
// When the mainMenu is closed, the game remains paused but the pauseBtn returns.
const mainMenuToggle = () => {
  if (game.menu) {
    mainMenu.classList.toggle('is-hidden');
    mainMenuBtnIcon.classList.remove('fa-bars');
    mainMenuBtnIcon.classList.add('fa-times-circle');
    pauseBtn.classList.add('disable-click');
    pauseBtnIcon.classList.add('grey-out');
    replayBtn.classList.add('is-hidden');
    game.menu = false;
    if (!game.pause) {
      pauseGame();
    }
  } else {
    mainMenu.classList.toggle('is-hidden');
    mainMenuBtnIcon.classList.add('fa-bars');
    mainMenuBtnIcon.classList.remove('fa-times-circle');
    pauseBtn.classList.remove('is-hidden');
    pauseBtn.classList.remove('disable-click');
    pauseBtnIcon.classList.remove('grey-out');
    game.menu = true;
  }
}

// upon tetromino being placed, placeNewPiece() chooses a new tetromino at random and places it at the top of the game.playfield.
const placeNewPiece = () => {
  if (game.playing) {
    const tetrominos = 'IJLOSTZ';
    game.tetromino = createTetromino(tetrominos[Math.floor(Math.random() * Math.floor(tetrominos.length))]);

    // position the tetromino just above the playfield 
    player.pos.y = -2;

    // position game.tetromino into the middle of the arena.
    player.pos.x = (Math.floor(game.playfield[0].length / 2)) - (Math.floor(game.tetromino[0].length / 2));

    // if collision during placeNewPiece() then the game is over, the game.playfield is cleared of tetrominos and the player's stats are reset.
    if (collision(game.playfield, player)) {
      gameOver();
    }
  } else {
    console.error("An error has occurred and the game cannot place a new tetromino as a game isn't being played.");
  }
}

// playerDrop is the function for moving a player down 1 space.
const playerDrop = () => {
  player.pos.y++;
  if (collision(game.playfield, player)) {
    player.pos.y--;
    merge(game.playfield, player);
    placeNewPiece();
    lineClear();
    if (game.mode === 'Standard') {
      updateStat('level', player.level);
    }
    updateStat('score', player.score);
    updateStat('lines', player.lines);
  }
  dropCounter = 0;
}

const playerDropAll = () => {
  while (!collision(game.playfield, player)) {
    player.pos.y++;
  }
  player.pos.y--;
  merge(game.playfield, player);
  placeNewPiece();
  lineClear();
  if (game.mode === 'Standard') {
    updateStat('level', player.level);
  }
  updateStat('score', player.score);
  updateStat('lines', player.lines);
  dropCounter = 0;
}

const playerMove = (dir) => {
  player.pos.x += dir;
  if (collision(game.playfield, player)) {
    player.pos.x -= dir;
  }
}

// rotate tetromino depending on direction chosen. Collision() prevents tetrominos from rotating into other tetrominos or outside of game.playfield.
const playerRotate = (dir) => {
  const pos = player.pos.x; // Store player's X position before rotation.
  let offset = 1;
  rotate(game.tetromino, dir); // Perform the tetromino rotation.

  // If there is a collision immediately after rotating then the rotation is illegal.
  // But allow rotation if the tetromino can fit when moved out from the wall.
  while (collision(game.playfield, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1)); // Produces 1, -2, 3, -4, 5 etc. to move the tetromino back away from the wall
    if (offset > game.tetromino[0].length) { // If we have tried to offset more than the tetromino width, the rotation is unsuccessful.
      rotate(game.tetromino, -dir); // Reset rotation.
      player.pos.x = pos; // Reset position.
      return;
    }
  }
}

const newGame = () => {
  game.playfield = createBoard();
  game.playing = true;
  gameOverMessage.classList.add('is-hidden');
  replayBtn.classList.add('is-hidden');
  greyBg.classList.add('is-hidden');
  resetStats();
  placeNewPiece();
  rAF = requestAnimationFrame(update);
}

// Reset player stats
const resetStats = () => {
  if (game.mode === 'Standard') {
    player.level = 1;
    updateStat('level', player.level);
  }
  player.score = 0;
  updateStat('score', player.score);
  player.lines = 0;
  updateStat('lines', player.lines);
}

// rotation by transposing and then reversing.
const rotate = (playfield, dir) => {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < y; x++) {
      [
        playfield[x][y],
        playfield[y][x],
      ] = [
          playfield[y][x],
          playfield[x][y],
        ];
    }
  }
  if (dir > 0) {
    playfield.forEach(row => row.reverse());
  } else {
    playfield.reverse();
  }
}

const setGameMode = (gameMode) => {
  if (gameMode === 'Standard') {
    game.mode = 'Standard';
    levelDownBtn.classList.add('is-hidden');
    levelUpBtn.classList.add('is-hidden');

    if (game.playing) {
      newGame();
      greyBg.classList.remove('is-hidden');
    }
  } else if (gameMode === 'Sandbox') {
    game.mode = 'Sandbox';
    levelDownBtn.classList.remove('is-hidden');
    levelUpBtn.classList.remove('is-hidden');
    if (game.playing) {
      player.level = 1;
      updateStat('level', player.level);
      newGame();
      greyBg.classList.remove('is-hidden');
    }
  } else {
    console.error('Game Mode not selected');
  }
}

const startGame = () => {
  game.playfield = createBoard();
  game.playing = true;
  mainMenu.classList.add('is-hidden');
  startBtn.classList.add('is-hidden');
  titleScreen.classList.add('is-hidden');
  pauseBtn.classList.remove('is-hidden');
  borderGrid.classList.remove('is-hidden');
  mainMenuBtn.classList.remove('is-hidden');
  placeNewPiece();
  update();
}

const updateStat = (cssClass, stat) => {
  document.querySelector(`.stats__${cssClass.toString()}`).textContent = `${cssClass}: ${stat}`;
}

const update = (time = 0) => {
  if (game.playing) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (game.pause === false) {
      // if dropCounter increases beyond 1000ms then move player position down 1 and reset dropCounter back to 0.
      if (dropCounter > game.dropInterval) {
        playerDrop();
      }
    }

    draw();
    rAF = requestAnimationFrame(update);
  }
}

// levelDown decreases the player.level by 1 and sets the updates the dom level stat
const levelDown = () => {
  if (player.level >= 2 && player.level <= 10) {
    player.level += -1;
    levelSpeedSandbox(player.level);
    updateStat('level', player.level);
  }
}

const levelUp = () => {
  if (player.level >= 1 && player.level <= 9) {
    player.level += 1;
    levelSpeedSandbox(player.level);
    updateStat('level', player.level);
  }
}

const levelSpeedSandbox = (level) => {
  if (level === 1) { game.dropInterval = 1000; }
  else if (level === 2) { game.dropInterval = 900; }
  else if (level === 3) { game.dropInterval = 800; }
  else if (level === 4) { game.dropInterval = 700; }
  else if (level === 5) { game.dropInterval = 600; }
  else if (level === 6) { game.dropInterval = 500; }
  else if (level === 7) { game.dropInterval = 450; }
  else if (level === 8) { game.dropInterval = 400; }
  else if (level === 9) { game.dropInterval = 350; }
  else if (level === 10) { game.dropInterval = 300; }
  else { throw console.error("Level Speed cannot change"); }
}

// when the player's score increases, check if it should update to a higher level and return the new level or false the level doesn't need to change.
const levelStandard = (score, level) => {
  if (score < 20) { player.level = 1; game.dropInterval = 1000; }
  else if (between(score, 20, 49) && level !== 2) { player.level = 2; game.dropInterval = 900 }
  else if (between(score, 50, 99) && level !== 3) { player.level = 3; game.dropInterval = 800 }
  else if (between(score, 100, 149) && level !== 4) { player.level = 4; game.dropInterval = 700 }
  else if (between(score, 150, 249) && level !== 5) { player.level = 5; game.dropInterval = 600 }
  else if (between(score, 250, 399) && level !== 6) { player.level = 6; game.dropInterval = 500 }
  else if (between(score, 350, 499) && level !== 7) { player.level = 7; game.dropInterval = 450 }
  else if (between(score, 450, 599) && level !== 8) { player.level = 8; game.dropInterval = 400 }
  else if (between(score, 550, 699) && level !== 9) { player.level = 9; game.dropInterval = 350 }
  else if (score > 699) { if (level !== 10) { player.level = 10; game.dropInterval = 300 } }
  else { false; }
}

// EVENT LISTENERS

// key presses down result in moving or rotating tetromino.
document.addEventListener('keydown', evt => {
  if (game.playing && game.pause === false) {
    if (evt.code === 'KeyQ') {
      playerRotate(-1);
    } else if (evt.code === 'KeyE') {
      playerRotate(1);
    } else if (evt.code === 'KeyA') {
      playerMove(-1);
    } else if (evt.code === 'KeyD') {
      playerMove(1);
    } else if (evt.code === 'KeyS') {
      playerDrop();
    }
  }
});

// Press F to drop tetromino to the bottom of the playfield.
document.addEventListener('keyup', evt => {
  if (game.playing && game.pause === false) {
    if (evt.code === 'KeyF') {
      playerDropAll();
    }
  }
});

document.addEventListener('keyup', evt => {
  if (evt.code === 'KeyP') {
    pauseGame();
  }
});

mainMenuBtn.addEventListener('click', () => {
  mainMenuToggle();
});

controlsBtn.addEventListener('click', () => {
  controls.classList.toggle('is-hidden');
});

gameModeStandard.addEventListener('click', () => {
  setGameMode('Standard');
});

gameModeSandbox.addEventListener('click', () => {
  setGameMode('Sandbox');
});

levelDownBtn.addEventListener('click', () => {
  levelDown();
});

levelUpBtn.addEventListener('click', () => {
  levelUp();
});

pauseBtn.addEventListener('click', () => {
  pauseGame();
});

replayBtn.addEventListener('click', () => {
  newGame();
});

startBtn.addEventListener('click', () => {
  startGame()
});
