const util = require('util');

function getTurnStrategy({ you: { body }, board }) {
  // if not in corner, go to nearest corner
  isInCorner();
  // if (!isInCorner(body, board)) {
  //   let targetCorner = getNearestCorner();
  // }

  return function random(moves) {
    try {
      return moves[Math.floor(Math.random() * moves.length)];
    } catch {
      console.log('Snake is trapped!');
    }
  };
}

// if any part of my snake's body is touching a corner, return true
function isInCorner(body, { height, width }) {
  const corners = [
    { x: 0, y: 0 },
    { x: 0, y: height - 1 },
    { x: width - 1, y: height - 1 },
    { x: width - 1, y: 0 },
  ];

  for (let el of body) {
    for (let corner of corners) {
      if (corner.x == el.x && corner.y == el.y) {
        console.log('snake is in a corner');
        return true;
      }
    }
  }
  return false;
}

function getNearestCorner() {}

function getNextHead(currHead, move) {
  let nextHead = { ...currHead };
  // if miss 'break' statement, script runs cases after, regardless of if criterion is met :'(
  switch (move) {
    case 'up':
      nextHead.y++;
      break;
    case 'down':
      nextHead.y--;
      break;
    case 'left':
      nextHead.x--;
      break;
    case 'right':
      nextHead.x++;
  }
  console.log(`move: ${move}`);
  console.log(`nextHead: ${util.inspect(nextHead)}`);
  return nextHead;
}

function avoidWalls({ height, width }, nextHead) {
  return (
    nextHead.x >= 0 &&
    nextHead.x < width &&
    nextHead.y >= 0 &&
    nextHead.y < height
  );
}

function avoidSelf({ body }, nextHead) {
  // TODO: check for food / tail
  // TODO: check for tail exit square
  console.log(
    `next head in body: ${body.some(
      (el) => nextHead.x == el.x && nextHead.y == el.y
    )}`
  );
  // use array.some instead of array.includes because includes just compares the reference and always returns false
  return !body.some((el) => nextHead.x == el.x && nextHead.y == el.y);
}

function avoidSnakes({ snakes }, nextHead) {
  // TODO: need to watch out for other snake heads, and remember that I can go into tail position
  for (snake of snakes) {
    const { body } = snake;
    if (body.some((el) => nextHead.x == el.x && nextHead.y == el.y)) {
      return false;
    }
  }
  return true;
}

function validateMove(gameState, move) {
  const { head } = gameState.you;
  const nextHead = getNextHead(head, move);
  return (
    avoidWalls(gameState.board, nextHead) &&
    avoidSnakes(gameState.board, nextHead)
  );
}

module.exports = { validateMove, getTurnStrategy };
