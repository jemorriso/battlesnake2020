const util = require('util');

const manhattanDistance = ({ x: cx, y: cy }, { x: hx, y: hy }) =>
  Math.abs(cx - hx) + Math.abs(cy - hy);

const invertGetNextHead = (currHead, nextHead) => {
  const vectorDiff = (n, c) => ({ x: n.x - c.x, y: n.y - c.y });
  const v = vectorDiff(nextHead, currHead);

  return v.x == 1 ? 'right' : v.y == -1 ? 'down' : v.x == -1 ? 'left' : 'up';
};

const squareHasNoFood = (head, move, foodSquares) => {
  const square = getNextHead(head, move);
  return !foodSquares.some(
    (foodSquare) => square.x == foodSquare.x && square.y == foodSquare.y
  );
};

const moveCloserToTail = (head, move, tail) => {
  const nextHead = getNextHead(head, move);
  return manhattanDistance(nextHead, tail) < manhattanDistance(head, tail);
};

const scoreMove = (move, check1, check2) => {
  const isGood1 = check1(move);
  const isGood2 = check2(move);

  return isGood1 && isGood2
    ? 1
    : isGood1 && !isGood2
    ? 2
    : !isGood1 && isGood2
    ? 3
    : 4;
};

function getTurnStrategy(
  { you: { body, head, health }, board: { food } },
  { corners }
) {
  // if hungry, go eat
  if (health < 30) {
    let targetFood = getNearestFood(head, food);

    return function goEat(moves) {
      currDistance = manhattanDistance(targetFood, head);
      // any move is either 1 closer, or 1 further away
      best = moves.findIndex(
        (move) =>
          manhattanDistance(targetFood, getNextHead(head, move)) < currDistance
      );
      if (best !== -1) {
        return moves[best];
      } else {
        // fails if there are no safe moves
        try {
          // no safe moves get closer to target corner, so just pick one of the remaining moves
          return moves[0];
        } catch (e) {
          console.log('Snake is trapped!');
        }
      }
    };
  } else {
    let targetCorner = getNearestCorner(head, corners);

    return function goToCorner(moves) {
      // there are no possible moves for the snake to make.
      if (moves.length == 0) {
        return console.log('Snake is trapped!');
      }

      const currDistance = manhattanDistance(targetCorner, head);

      // wrap up helper functions with board state
      const foodGood = (move) => squareHasNoFood(head, move, food);
      const tailGood = (move) =>
        moveCloserToTail(head, move, body.slice(-1).pop());

      // any move is either 1 closer, or 1 further away - good moves are closer to corner
      // const goodMoves = moves.filter(
      //   (move) =>
      //     manhattanDistance(targetCorner, getNextHead(head, move)) <
      //     currDistance
      // );
      const goodMoves = moves;
      if (goodMoves.length > 0) {
        const bestMove = goodMoves.reduce((best, curr) => {
          if (
            scoreMove(curr, foodGood, tailGood) <
            scoreMove(best, foodGood, tailGood)
          ) {
            return curr;
          } else {
            return best;
          }
        });
        return bestMove;
        // All moves are further away
      } else {
        const bestMove = moves.reduce((best, curr) => {
          if (
            scoreMove(curr, foodGood, tailGood) <
            scoreMove(best, foodGood, tailGood)
          ) {
            return curr;
          } else {
            return best;
          }
        });
        return bestMove;
      }
      // // bestMoves using findAll
      // // if there are multiple bestMoves, then choose the one that is closest to its own tail
      // const best = moves.findIndex(
      //   (move) =>
      //     manhattanDistance(targetCorner, getNextHead(head, move)) <
      //     currDistance
      // );
      // if (best !== -1) {
      //   return moves[best];
      // } else {
      //   // fails if there are no safe moves
      //   try {
      //     // no safe moves get closer to target corner, so just pick one of the remaining moves
      //     return moves[0];
      //   } catch (e) {
      //     console.log('Snake is trapped!');
      //   }
      // }
    };
  }
  // }

  // // if in a corner, move randomly
  // return function random(moves) {
  //   // fails if there are no safe moves
  //   try {
  //     return moves[Math.floor(Math.random() * moves.length)];
  //   } catch (e) {
  //     console.log('Snake is trapped!');
  //   }
  // };
}

// if any part of my snake's body is touching a corner, return true
// function isInCorner(body, corners) {
//   for (let el of body) {
//     for (let corner of corners) {
//       if (corner.x == el.x && corner.y == el.y) {
//         console.log(`body: ${util.inspect(body)}`);
//         console.log('snake is in a corner');
//         return true;
//       }
//     }
//   }
//   return false;
// }

function getNearestCorner(head, corners) {
  // return function to freeze values
  const minManhattan = (head) => {
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

function getNearestFood(head, food) {
  // return function to freeze values
  const minManhattan = (head) => {
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

  const nearestFood = food.reduce(minManhattan(head));
  console.log(`nearest food: ${nearestFood}`);
  return nearestFood;
}

function getNextHead(currHead, move) {
  const nextHead = { ...currHead };
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

// function avoidSelf({ body }, nextHead) {
//   // TODO: check for food / tail
//   // TODO: check for tail exit square
//   console.log(
//     `next head in body: ${body.some(
//       (el) => nextHead.x == el.x && nextHead.y == el.y
//     )}`
//   );
//   // use array.some instead of array.includes because includes just compares the reference and always returns false
//   return !body.some((el) => nextHead.x == el.x && nextHead.y == el.y);
// }

function avoidSnakes(gameState, nextHead) {
  const {
    board: { snakes },
  } = gameState;
  // TODO: need to watch out for other snake heads, and remember that I can go into tail position
  for (snake of snakes) {
    const { body } = snake;
    // can move into tail, unless snake is about to eat
    // TODO: handle about to eat case
    if (
      body.slice(0, -1).some((el) => nextHead.x == el.x && nextHead.y == el.y)
    ) {
      return false;
    }
  }
  return true;
}

function getPotentialSnakeHeads(gameState) {
  const {
    board: { snakes },
    you: { id },
  } = gameState;
  const potentialHeads = [];

  for (snake of snakes) {
    const { id: snakeID } = snake;
    if (id !== snakeID) {
      const { head } = snake;
      const safeMoves = getSafeMoves(gameState, snake);
      const safeHeads = safeMoves.map((move) => getNextHead(head, move));
      potentialHeads.push(safeHeads);
    }
  }
  return potentialHeads;
}

// get safe moves for a given snake
function getSafeMoves(gameState, snake) {
  const possibleMoves = ['up', 'down', 'left', 'right'];
  return possibleMoves.filter((move) => validateMove(gameState, snake, move));
}

function validateMove(gameState, { head }, move) {
  const { board } = gameState;
  const nextHead = getNextHead(head, move);
  return avoidWalls(board, nextHead) && avoidSnakes(gameState, nextHead);
}

module.exports = {
  validateMove,
  getTurnStrategy,
  getPotentialSnakeHeads,
  getNextHead,
  invertGetNextHead,
};
