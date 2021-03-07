const createTetromino = (type) => {
  if (type === 'I') {
    return [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  } else if (type === 'J') {
    return [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0]
    ]
  } else if (type === 'L') {
    return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0]
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
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ]
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ]
  }
}

// colors: I (cyan), J (blue), L (orange), O (yellow), S (green), T (pink), Z (red)
const tetrominoColors = [
  null,
  '#00FFFF',
  '#0084ff',
  '#FFA500',
  '#FFFF00',
  '#00e800',
  '#f200f2',
  '#FF0000'
]

export { createTetromino, tetrominoColors };