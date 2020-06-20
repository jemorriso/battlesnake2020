const util = require('util');
const TinyQueue = require('tinyqueue');
const { throws } = require('assert');

class Node {
  constructor(parent, position, g, h) {
    this.parent = parent;
    this.position = position;

    this.g = g;
    this.h = h;
    this.f = g + h;
  }

  equals({ position: { x, y } }) {
    return this.position.x === x && this.position.y === y;
  }
}

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

// const aStarSearch = (gameState, h, startPos, endPos) => {
//     const {
//       you: { head },
//       board: { snakes, height, width },
//     } = gameState;

//   }

const aStarSearch = (gameState, h, startPos, endPos) => {
  const {
    you: { head, body },
    board: { snakes, height, width },
  } = gameState;

  // save snake body to restore after aStarSearch
  // TODO: fix this so I'm not mutating the game state
  // yourBody = { body }

  // g = manhattanDistance;

  // let obstacles = [];
  // for ({ body } of snakes) {
  //   obstacles.push(body);
  // }
  // obstacles = obstacles.flat();

  const open = [];
  const closed = [];

  // goal node
  const end = new Node(null, endPos, 0, 0);

  // push start node onto open list
  open.push(new Node(null, startPos, 0, 0));

  while (open.length > 0) {
    console.log('a-star open array length: ' + open.length);
    // need to remember to keep array sorted in reverse order
    open.sort((a, b) => {
      // ** reverse order **
      if (a.f < b.f) return 1;
      if (a.f > b.f) return -1;
      return 0;
    });
    let curr = open.pop();
    closed.push(curr);

    // found goal node, return path from start to end
    if (curr.equals(end)) {
      const path = [];
      while (curr !== null) {
        path.push(curr.position);
        curr = curr.parent;
      }
      // don't include start node
      // path.pop();
      return path.reverse();
    }
    // test current node's neighbours for addition to open list
    for (let move of ['up', 'down', 'left', 'right']) {
      // TODO: consolidate validateMoves
      // test that the move doesn't go out of bounds or run into obstacles (other snakes)
      if (validateMove2(gameState, curr.position, move)) {
        // create new Node and test if in open and closed lists already
        const neighbourPos = getNextHead(curr.position, move);
        const neighbour = new Node(
          curr,
          neighbourPos,
          curr.g + 1,
          h(neighbourPos, endPos)
        );

        // if in closed, already processed
        if (closed.some((el) => el.equals(neighbour))) {
          continue;
        }
        // if in open, but has smaller g value (shorter path from start), continue
        // TODO: this is slow
        // const sorted = [];
        // while (open.length) {
        //   sorted.push(open.pop());
        // }
        const openNode = open.find((el) => el.equals(neighbour));

        if (openNode !== undefined) {
          // already have a better path to the neighbour
          if (openNode.g < neighbour.g) {
            continue;
          }
          // found a better path, so remove the old one
          else {
            open.filter((el) => el.equals(openNode));
          }
        }
        // add the neighbour
        open.push(neighbour);
      }
    }
  }
};

function getTurnStrategy(gameState, { corners }) {
  const {
    you: { body, head, health },
    board: { food },
  } = gameState;

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
    const targetCornerIndex = corners
      .map(
        (corner) =>
          aStarSearch(gameState, manhattanDistance, head, corner).length
      )
      .reduce(
        (bestIndex, curr, i, arr) => (curr < arr[bestIndex] ? i : bestIndex),
        0
      );

    // const path = aStarSearch(gameState, manhattanDistance, head, corners[2]);
    // let targetCorner = getNearestCorner(head, corners);

    let targetCorner = corners[targetCornerIndex];

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
      const goodMoves = moves.filter(
        (move) =>
          manhattanDistance(targetCorner, getNextHead(head, move)) <
          currDistance
      );
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

function validateMove2(gameState, curr, move) {
  const { board } = gameState;
  const nextHead = getNextHead(curr, move);
  return avoidWalls(board, nextHead) && avoidSnakes(gameState, nextHead);
}

module.exports = {
  validateMove,
  getTurnStrategy,
  getPotentialSnakeHeads,
  getNextHead,
  invertGetNextHead,
};
