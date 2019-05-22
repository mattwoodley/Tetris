const canvas = document.querySelector('#tetris');
const context = canvas.getContext('2d');

//Increase size of the context within the canvas (the tetris pieces)
context.scale(20, 20);

//chooses the colour for the background of the canvas (black)
context.fillStyle = '#000';
//Draws a filled rectangle whose starting point is at (x, y) and whose size is specified by width and height. The fill style is determined by the current fillStyle attribute.
context.fillRect(0, 0, canvas.width, canvas.height);

//this matrix is a T piece
const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

function draw() {
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

function update() {
  draw();
  requestAnimationFrame(update);
}

//Player object that includes the player's position
const player = {
  pos: {x: 5, y: 5},
  matrix: matrix
}

update()
