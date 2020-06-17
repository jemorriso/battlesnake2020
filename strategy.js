function next_head(curr_head, move) {
  switch (move) {
    case 'up':
      return;
    case 'down':
      return;
    case 'left':
      return;
    case 'right':
      return;
  }
}

function avoid_walls({ height, width }, head, move) {
  next_head(head, move);
  return true;
}

module.exports = { avoid_walls };
