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

function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: '',
    color: '#600080',
    head: 'beluga',
    tail: 'hook',
  };
  response.status(200).json(battlesnakeInfo);
}

function handleStart(request, response) {
  var gameData = request.body;

  console.log('START');
  response.status(200).send('ok');
}

function handleMove({ body: gameState }, response) {
  const possibleMoves = ['up', 'down', 'left', 'right'];
  const safeMoves = possibleMoves.filter((move) =>
    strategy.validateMove(gameState, move)
  );

  const turnStrategy = strategy.getTurnStrategy();
  const move = turnStrategy(safeMoves);

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
  response.status(200).send({
    move,
  });
}

function handleEnd(request, response) {
  var gameData = request.body;

  console.log('END');
  response.status(200).send('ok');
}
