const bodyParser = require('body-parser');
const express = require('express');
const strategy = require('./strategy');

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

function handleMove(request, response) {
  var gameState = request.body;

  var possibleMoves = ['up', 'down', 'left', 'right'];
  var move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

  head = request.body.you.body[0];
  console.log(request.body.you.body);

  console.log(head);

  // while (!strategy.avoid_walls(gameState, head, move)) {
  //   move = possibleMoves[move];
  // }

  console.log('MOVE: ' + move);
  response.status(200).send({
    move,
  });
}

function handleEnd(request, response) {
  var gameData = request.body;

  console.log('END');
  response.status(200).send('ok');
}
