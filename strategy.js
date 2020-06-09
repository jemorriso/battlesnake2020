next_head = function (curr_head, move) {
  switch (move) {
    case 'up': return
    case 'down': return
    case 'left': return
    case 'right': return
  }
}

avoid_walls = function ({ height, width }, head, move) {
  next_head(head, move);
  return true;
};

module.exports = { avoid_walls };