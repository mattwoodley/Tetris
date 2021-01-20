document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.querySelector('#tetris');
  const context = canvas.getContext('2d');
  const startButton = document.querySelector('.tetris__start');
  const borderGrid = document.querySelector('.tetris__grid');

  //getContext allows us to use methods and access properties in JavaScript.
  //Increase size of the context within the canvas (the tetris pieces)
  context.scale(20, 20);

  /*
  //chooses the colour for the background of the canvas (black)
  {moved context.fillStyle to draw() function in order to wipe clean the frame before drawBoard() is called}
  context.fillStyle = '#000';
  */

  /*
  //Draws a filled rectangle whose starting point is at (x, y) and whose size is specified by width and height. The fill style is determined by the current fillStyle attribute.
  {moved context.fillRect to draw() function in order to wipe clean the frame before drawBoard() is called}
  context.fillRect(0, 0, canvas.width, canvas.height);
  */

  //FUNCTIONS

  const arenaSweep = () => {
    let lines = 1;
    outer: for (let y = arena.length - 1; y > 0; y--) {
      for (let x = 0; x < arena[y].length; x++) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }
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

  const collide = (arena, player) => {
    const [board, offset] = [player.board, player.pos];
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] != 0 && //if player position is not 0,0 then the player has moved and might collide
          (arena[y + offset.y] && //if arena row doesn't exist then potential collision
          arena[y + offset.y][x + offset.x]) !== 0) { //if arena row and column don't exist and aren't 0, then must collide
          //return true if collision found.
          return true;
        }
      }
        }
        //return false if no collision found.
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

  //!!!offset needs more explanation!!!
  const drawBoard = (board, offset) => {
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.strokeStyle = '#000'
          context.lineWidth = 0.1;
          context.fillStyle = colours[value];
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

  //this function merges the player's position into the arena's empty table of arrays - so all of the arena's arrays of 0s will have a tetris piece of 1s within the table after they merge.
  const merge = (arena, player) => {
    player.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  //playerDrop is the function for moving a player down 1 space.
  const playerDrop = () => {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      playerReset();
      arenaSweep();
      updateLevel();
      updateScore();
      updateLines();
    }
    dropCounter = 0;
  }

  const playerDropAll = () => {
    while (!collide(arena, player)) {
      player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateLevel();
    updateScore();
    updateLines();
    dropCounter = 0;
  }

  const playerMove = (dir) => {
    player.pos.x += dir;
    if (collide(arena, player)) {
      player.pos.x -= dir;
    }
  }

  //upon tetris piece being placed, playerReset() chooses a new piece at random and starts at the top of the arena.
  const playerReset = () => {
    const pieces = 'IJLOSTZ';
    player.board = createPiece(pieces[Math.floor(Math.random() * Math.floor(pieces.length))]);
    player.pos.y = 0;
    player.pos.x = (Math.floor(arena[0].length / 2)) - (Math.floor(player.board[0].length / 2));
    //if collide upon a reset then the game is over and the arena is cleared of tetris pieces.
    if (collide(arena, player)) {
      arena.forEach(row => row.fill(0));
      player.level = 1;
      updateLevel();
      player.score = 0;
      updateScore();
      player.lines = 0;
      updateLines();
    }
  }

  //rotate tetris piece depending on direction chosen. Collision prevents tetris pieces from rotating into other pieces or outside of arena.
  const playerRotate = (dir) => {
    const pos = player.pos.x; //Store player's X position before rotation.
    let offset = 1; //Assign an offset to use for later.
    rotate(player.board, dir); //Perform the actual board rotation.

    //If there is a collision immediately after rotating then the rotation was illegal.
    //But we allow rotation if the piece can fit when moved out from the wall.
    while (collide(arena, player)) {
      //Thus we try and move the piece left/right until it no longer collides.
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1)); //Produces 1, -2, 3, -4, 5 etc.
      if (offset > player.board[0].length) { //If we have tried to offset more than the piece width, we deem the rotation unsuccessful.
        rotate(player.board, -dir); //Reset rotation.
        player.pos.x = pos; //Reset position.
        return;
      }
    }
  }

  //rotation by transposing and then reversing.
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

  const updateLevel = () => {
    document.querySelector('.tetris__level').textContent = `Level: ${player.level}`;
  }

  const updateScore = () => {
    document.querySelector('.tetris__score').textContent = `Score: ${player.score}`;
  }

  const updateLines = () => {
    document.querySelector('.tetris__lines').textContent = `Lines: ${player.lines}`;
  }

  //GLOBAL VARIABLES

  let dropCounter = 0;
  //1000 ms is 1 second, and that is what is used to determine how quickly the tetris piece drops
  let dropInterval = 1000;

  let lastTime = 0;
  const update = (time = 0) => {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    //if dropCounter increases beyond 1000ms then move player position down 1 and reset dropCounter back to 0.
    if (dropCounter > dropInterval) {
      playerDrop();
    }
    draw();
    requestAnimationFrame(update);
  }

  const colours = [
    null,
    'cyan',
    'blue',
    'orange',
    'yellow',
    'green',
    'purple',
    'red'
  ]

  const arena = createBoard(10, 20);
  // console.log(arena); [Array(10) /*repeated 20 times with each array simply holding a 0*/]
  // console.table(arena); this shows the same result but in a nice table format

  //Player object that includes the player's position
  const player = {
    pos: {x: 0, y: 0},
    board: null,
    level: 1,
    score: 0,
    lines: 0
  }

  /*
  //This logs the board of tetris pieces so that I can see the column arrays and row arrays of the pieces.
  console.table(player.board);
  console.log(player.board);
  console.table(player.board[0]);
  console.log(player.board[0]);
  console.log(player.board);
  console.log(player.board[0].length);
  console.log(player.board[1].length);
  console.log(player.board[2].length);
  */

  //key presses down result in moving or rotating tetris piece.
  document.addEventListener('keydown', event => {
    //if left arrow key is pressed down, move tetris piece 1 position to the left
    if (event.code === 'KeyQ') {
        playerRotate(-1);
    } else if (event.code === 'KeyE') {
        playerRotate(1);
    } else if (event.code === 'KeyA') {
        playerMove(-1);
    } else if (event.code === 'KeyD') {
        playerMove(1);
    } else if (event.code === 'KeyS') {
        playerDrop();
    }
    //console.log(player.pos.x); This ranges from -1 to 10 from left-to-right.

  });

  document.addEventListener('keyup', event => {
    if (event.code === 'KeyF') {
        playerDropAll();
    }
  });

  /*
  //this logs button presses that can be used to determine player movement
  document.addEventListener('keydown', evt => {
    console.log(evt);
  });
  */

  playerReset();

  startButton.addEventListener('click', () => {
    startButton.classList.add('is-hidden');
    borderGrid.classList.remove('is-hidden');
    update();
  });

});