document.addEventListener('DOMContentLoaded', () => {

  // SELECTORS

  const canvas = document.querySelector('#tetris');
  const context = canvas.getContext('2d');
  const startButton = document.querySelector('.tetris__start');
  const titleScreen = document.querySelector('.tetris__title-screen');
  const borderGrid = document.querySelector('.tetris__grid');
  const pauseMessage = document.querySelector('.tetris__paused');
  const greyBg = document.querySelector('.tetris__grey-bg');
  const gameOverMessage = document.querySelector('.tetris__game-over');
  const replayButton = document.querySelector('.tetris__replay');

  // getContext allows us to use methods and access properties in JavaScript.
  // Increase size of the context within the canvas (the tetris pieces)
  context.scale(20, 20);

  // FUNCTIONS

  // When tetris pieces form a horizontal line, clear said line and add points
  const arenaSweep = () => {
    let lines = 1;
    outer: for (let y = arena.length - 1; y > 0; y--) {
      for (let x = 0; x < arena[y].length; x++) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }
      // remove the completed line
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      y++;
      
      player.score += lines * 10;
      lines *= 2;
      player.lines += 1;
      levelUp();
    }
  }

  const between = (score, min, max) => {
    return score >= min && score <= max;
  }

  const collision = (arena, player) => {
    const [board, offset] = [player.board, player.pos];
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] != 0 && // if player position is not 0,0 then the player has moved and might collide
          (arena[y + offset.y] && // if arena row doesn't exist then potential collision
          arena[y + offset.y][x + offset.x]) !== 0) { // if arena row and column don't exist and aren't 0, then must collide
          // return true if collision found.
          return true;
        }
      }
    }
    // return false if no collision found.
    return false;
  }
  
  const createBoard = (width, height) => {
    const board = [];
    while (height--) {
      board.push(new Array(width).fill(0))
    }
    return board;
  }
  
  const createPiece = (type) => {
    if (type === 'I') {
      return [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ]
    } else if (type === 'J') {
      return [
        [0, 2, 0],
        [0, 2, 0],
        [2, 2, 0]
      ]
    } else if (type === 'L') {
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3]
      ]
    } else if (type === 'O') {
      return [
        [4, 4],
        [4, 4]
      ]
    } else if (type === 'S') {
      return [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
      ]
    } else if (type === 'T') {
      return [
        [0, 0, 0],
        [6, 6, 6],
        [0, 6, 0],
      ]
    } else if (type === 'Z') {
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
      ]
    }
  }
  
  const draw = () => {
    context.fillStyle = '#cffffb';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    drawBoard(arena, {x: 0, y: 0});
    drawBoard(player.board, player.pos);
  }

  const drawBoard = (board, offset) => {
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.strokeStyle = '#000'
          context.lineWidth = 0.1;
          context.fillStyle = colors[value];
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
  // gameOver stops the board from drawing and displays the gameOverMessage and replayButton
  const gameOver = () => {
    gameOverMessage.classList.remove('is-hidden');
    replayButton.classList.remove('is-hidden');
    greyBg.classList.remove('is-hidden');
    replayGame();
  }

  const levelUp = () => {
    if (player.score <= 19) {
      dropInterval = 1000;
    } else if (between(player.score, 20, 49)) {
      dropInterval = 900;
      player.level = 2;
    } else if (between(player.score, 50, 99)) {
      dropInterval = 800;
      player.level = 3;
    } else if (between(player.score, 100, 149)) {
      dropInterval = 700;
      player.level = 4;
    } else if (between(player.score, 150, 249)) {
      dropInterval = 600;
      player.level = 5;
    } else if (between(player.score, 250, 399)) {
      dropInterval = 500;
      player.level = 6;
    } else if (player.score >= 400) {
      dropInterval = 450;
      player.level = 7;
    }
  }

  // this function merges the player's position into the arena's empty table of arrays - so all of the arena's arrays of 0s will have tetrimino pieces of 1s, 2s, 3s etc.
  const merge = (arena, player) => {
    player.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  // upon tetris piece being placed, placeNewPiece() chooses a new piece at random and places it at the top of the arena.
  const placeNewPiece = () => {
    const pieces = 'IJLOSTZ';
    player.board = createPiece(pieces[Math.floor(Math.random() * Math.floor(pieces.length))]);
    player.pos.y = 0;
    player.pos.x = (Math.floor(arena[0].length / 2)) - (Math.floor(player.board[0].length / 2));
    
    // if collision during placeNewPiece() then the game is over, the arena is cleared of tetris pieces and the player's stats are reset.
    if (collision(arena, player)) {
      gameOver();
    }
  }

  // playerDrop is the function for moving a player down 1 space.
  const playerDrop = () => {
    player.pos.y++;
    if (collision(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      placeNewPiece();
      arenaSweep();
      updateStat('level', player.level);
      updateStat('score', player.score);
      updateStat('lines', player.lines);
    }
    dropCounter = 0;
  }

  const playerDropAll = () => {
    while (!collision(arena, player)) {
      player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    placeNewPiece();
    arenaSweep();
    updateStat('level', player.level);
    updateStat('score', player.score);
    updateStat('lines', player.lines);
    dropCounter = 0;
  }

  const playerMove = (dir) => {
    player.pos.x += dir;
    if (collision(arena, player)) {
      player.pos.x -= dir;
    }
  }
  
  // rotate tetris piece depending on direction chosen. Collision() prevents tetris pieces from rotating into other pieces or outside of arena.
  const playerRotate = (dir) => {
    const pos = player.pos.x; // Store player's X position before rotation.
    let offset = 1;
    rotate(player.board, dir); // Perform the piece rotation.

    // If there is a collision immediately after rotating then the rotation is illegal.
    // But allow rotation if the piece can fit when moved out from the wall.
    while (collision(arena, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1)); // Produces 1, -2, 3, -4, 5 etc. to move the piece back away from the wall
      if (offset > player.board[0].length) { // If we have tried to offset more than the piece width, the rotation is unsuccessful.
        rotate(player.board, -dir); // Reset rotation.
        player.pos.x = pos; // Reset position.
        return;
      }
    }
  }

  const replayGame = () => {
    replayButton.addEventListener('click', () => {
      gameOverMessage.classList.add('is-hidden');
      replayButton.classList.add('is-hidden');
      greyBg.classList.add('is-hidden');

      // Clear the arena of tetris pieces
      arena.forEach(row => row.fill(0));

      resetStats();
      draw();
      requestAnimationFrame(update);
    });
  }

  // Reset player stats
  const resetStats = () => {
    player.level = 1;
    updateStat('level', player.level);
    player.score = 0;
    updateStat('score', player.score);
    player.lines = 0;
    updateStat('lines', player.lines);
  }

  // rotation by transposing and then reversing.
  const rotate = (board, dir) => {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < y; x++) {
        [
          board[x][y],
          board[y][x],
        ] = [
          board[y][x],
          board[x][y],
        ];
      }
    }
    if (dir > 0) {
      board.forEach(row => row.reverse());
    } else {
      board.reverse();
    }
  }

  const startGame = () => {
    startButton.classList.add('is-hidden');
    titleScreen.classList.add('is-hidden');
    borderGrid.classList.remove('is-hidden');
    placeNewPiece();
    update();
  }

  const updateStat = (cssClass, stat) => {
    document.querySelector(`.tetris__${cssClass.toString()}`).textContent = `${cssClass}: ${stat}`;
  }

  // GLOBAL VARIABLES

  let dropCounter = 0;
  // 1000 ms is 1 second, and that is what is used to determine how quickly the tetris piece drops
  let dropInterval = 1000;
  let lastTime = 0;

  let pause = false;

  const update = (time = 0) => {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (pause === false) {
      // if dropCounter increases beyond 1000ms then move player position down 1 and reset dropCounter back to 0.
      if (dropCounter > dropInterval) {
        playerDrop();
      }
    }
    
    if (gameOverMessage.classList.contains('is-hidden')) {
      draw();
      requestAnimationFrame(update);
    }
  }

  // colors: cyan, blue, orange, yellow, green, pink, red
  const colors = [
    null,
    '#00FFFF',
    '#0084ff',
    '#FFA500',
    '#FFFF00',
    '#00e800',
    '#f200f2',
    '#FF0000'
  ]

  const arena = createBoard(10, 20);
  // console.log(arena); [Array(10) /*repeated 20 times with each array simply holding a 0*/]
  // console.table(arena); this shows the same result but in a nice table format

  // Player object that includes the player's position
  const player = {
    pos: {x: 0, y: 0},
    board: null,
    level: 1,
    score: 0,
    lines: 0
  }

  // EVENT LISTENERS

  // key presses down result in moving or rotating tetris piece.
  document.addEventListener('keydown', evt => {
    // If game hasn't started or has finished, don't allow input
    if (player.board === null || !gameOverMessage.classList.contains('is-hidden')) {
      return;
    } else {
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

  document.addEventListener('keyup', evt => {
    // If game hasn't started or has finished, don't allow input
    if (player.board === null || !gameOverMessage.classList.contains('is-hidden')) {
      return;
    } else {
      if (evt.code === 'KeyF') {
        playerDropAll();
      }
    }
  });

  document.addEventListener('keyup', evt => {
    if (evt.code === 'KeyP') {
      greyBg.classList.toggle('is-hidden');
      pauseMessage.classList.toggle('is-hidden');
      // toggle paused element
      (pause === false) ? pause = true : pause = false;
    }
  });
  
  startButton.addEventListener('click', () => {
    startGame()
  });

});