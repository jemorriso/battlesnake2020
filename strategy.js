function getNextHead(currHead, move) {
  let nextHead = { ...currHead };
  switch (move) {
    case 'up':
      nextHead.y++;
    case 'down':
      nextHead.y--;
    case 'left':
      nextHead.x--;
    case 'right':
      nextHead.x++;
  }
  console.log(`move: ${move}`);
  console.log(`nextHead: ${nextHead}`);
  return nextHead;
}

function avoidWalls({ height, width }, { head }, move) {
  const nextHead = getNextHead(head, move);
  return (
    nextHead.x >= 0 &&
    nextHead.x < width &&
    nextHead.y >= 0 &&
    nextHead.y < height
  );
}

module.exports = { avoidWalls };
