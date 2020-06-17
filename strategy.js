const util = require('util');

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

function validateMove(gameState, move) {
  const { head } = gameState.you;
  const nextHead = getNextHead(head, move);
  return (
    avoidWalls(gameState.board, nextHead) && avoidSelf(gameState.you, nextHead)
  );
}

module.exports = { validateMove };
