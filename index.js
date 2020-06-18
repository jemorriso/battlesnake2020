const bodyParser = require('body-parser');
const express = require('express');
const strategy = require('./strategy');
const util = require('util');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

app.get('/', handleIndex);
app.post('/start', handleStart);
app.post('/move', handleMove);
app.post('/end', handleEnd);

app.listen(PORT, () =>
  console.log(`Example app listening at http://127.0.0.1:${PORT}`)
);

function handleIndex(req, res) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: '',
    color: '#600080',
    head: 'beluga',
    tail: 'hook',
  };
  res.status(200).json(battlesnakeInfo);
}

function handleStart({ body: gameState, app: { locals } }, res) {
  const { height, width } = gameState.board;

  locals.corners = [
    { x: 0, y: 0 },
    { x: 0, y: height - 1 },
    { x: width - 1, y: height - 1 },
    { x: width - 1, y: 0 },
  ];

  console.log('START');
  res.status(200).send('ok');
}

function handleMove({ body: gameState, app: { locals } }, res) {
  // note that I need to destructure 'you' on its own also here
  const {
    you: { head },
    you,
  } = gameState;
  const possibleMoves = ['up', 'down', 'left', 'right'];
  const safeMoves = possibleMoves.filter((move) =>
    strategy.validateMove(gameState, you, move)
  );
  const safeHeads = safeMoves.map((move) => strategy.getNextHead(head, move));
  // flatten into array of potential heads of all snakes
  const potentialHeads = strategy.getPotentialSnakeHeads(gameState).flat();

  // filter out safeHeads in potentialHeads, then turn them back into really safe moves
  // Only use safe moves if really safe moves is empty.
  const reallySafeHeads = safeHeads.filter((nextHead) => {
    // filter out any 'safe' heads that are actually risky
    return !potentialHeads.some(
      (potHead) => potHead.x == nextHead.x && potHead.y == nextHead.y
    );
  });
  const reallySafeMoves = reallySafeHeads.map((nextHead) =>
    strategy.invertGetNextHead(head, nextHead)
  );

  const turnStrategy = strategy.getTurnStrategy(gameState, locals);
  const move = turnStrategy(
    reallySafeMoves.length > 0 ? reallySafeMoves : safeMoves
  );

  // let move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

  // const attemptedMoves = [];
  // while (!strategy.validateMove(gameState, move)) {
  //   console.log(`${move} rejected`);

  //   if (!attemptedMoves.includes(move)) {
  //     console.log(`attemptedMoves: ${attemptedMoves}`);
  //     attemptedMoves.push(move);
  //   }
  //   if (attemptedMoves.length == 4) {
  //     console.log('SNAKE TRAPPED!');
  //     break;
  //   }
  //   move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  // }

  console.log('final MOVE: ' + move);
  res.status(200).send({
    move,
  });
}

function handleEnd(req, res) {
  var gameData = req.body;

  console.log('END');
  res.status(200).send('ok');
}
