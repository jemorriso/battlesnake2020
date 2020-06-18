const util = require('util');

function getTurnStrategy({ you: { body, head }, board }, { corners }) {
  // if not in corner, go to nearest corner
  if (!isInCorner(body, corners)) {
    let targetCorner = getNearestCorner(head, corners);
  }

  return function random(moves) {
    // fails if there are no safe moves
    try {
      return moves[Math.floor(Math.random() * moves.length)];
    } catch (e) {
      console.log('Snake is trapped!');
    }
  };
}

// if any part of my snake's body is touching a corner, return true
function isInCorner(body, corners) {
  for (let el of body) {
    for (let corner of corners) {
      if (corner.x == el.x && corner.y == el.y) {
        console.log(`body: ${util.inspect(body)}`);
        console.log('snake is in a corner');
        return true;
      }
    }
  }
  return false;
}

function getNearestCorner(head, corners) {
  // return function to freeze values
  const minManhattan = (head) => {
    const manhattanDistance = ({ x: cx, y: cy }, { x: hx, y: hy }) =>
      Math.abs(cx - hx) + Math.abs(cy - hy);

    return (minCorner, currCorner) => {
      minDistance = manhattanDistance(minCorner, head);
      currDistance = manhattanDistance(currCorner, head);

      if (currDistance < minDistance) {
        return currCorner;
      } else {
        return minCorner;
      }
    };
  };

  const nearestCorner = corners.reduce(minManhattan(head));
  console.log(`nearest corner: ${nearestCorner}`);
  return nearestCorner;
}

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
