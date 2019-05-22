const canvas = document.querySelector('#tetris');
const context = canvas.getContext('2d');

//Increase size of the context within the canvas (the tetris pieces)
context.scale(20, 20);

/*
//chooses the colour for the background of the canvas (black)
{moved context.fillStyle to draw() function in order to wipe clean the frame before drawMatrix() is called}
context.fillStyle = '#000';
*/

/*
//Draws a filled rectangle whose starting point is at (x, y) and whose size is specified by width and height. The fill style is determined by the current fillStyle attribute.
{moved context.fillRect to draw() function in order to wipe clean the frame before drawMatrix() is called}
context.fillRect(0, 0, canvas.width, canvas.height);
*/

//this matrix is a T piece
const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(player.matrix, player.pos);
}

//this takes in a piece (matrix) and fills each 'rectangle' red

//!!!offset needs more explanation!!!
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'red';
        context.fillRect(
          x + offset.x,
          y + offset.y,
          1,
          1
        );
      }
    });
  });
}

//playerDrop is the function for moving a player down 1 space.
function playerDrop() {
  player.pos.y++;
  dropCounter = 0;
}

let dropCounter = 0;
//1000 ms is 1 second, and that is what is used to determine how quickly the tetris piece drops
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    player.pos.y++;
    dropCounter = 0;
  }

  draw();
  requestAnimationFrame(update);
}

//Player object that includes the player's position
const player = {
  pos: {x: 5, y: 5},
  matrix: matrix
}

//key presses on arrowkeys result in moving tetris piece.
document.addEventListener('keydown', event => {
  //if left arrow key is pressed down, move tetris piece 1 position to the left
  if (event.keyCode === 37) {
      player.pos.x--;
  } //if right arrow key is pressed down, move tetris piece 1 position to the right
    else if (event.keyCode === 39) {
      player.pos.x++;
  } //if down arrow key is pressed down, move tetris piece 1 position down and reset dropCounter to reset 1 second drop. This prevents a player attempting to move the piece down 1 space and accidentally moving down 2 spaces due to the dropCounter ticking to 1000ms and dropping.
    else if (event.keyCode === 40) {
      playerDrop();
  }
});

/*
//this logs button presses that can be used to determine player movement
document.addEventListener('keydown', evt => {
  console.log(evt);
})
*/

update()
