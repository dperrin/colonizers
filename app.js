var http = require('http');
var express = require('express');
var socketio = require('socket.io');
const generateUUID = require('uuid/v1');

var app = express();
var server = http.createServer(app);
var io = socketio(server);

app.use(express.static(__dirname + '/public'))

var games = {};

function createStarterBoard() {
  return [
    { "position": 0, "resource": "ore", "number": 9 },
    { "position": 1, "resource": "wool", "number": 12 },
    { "position": 2, "resource": "wood", "number": 10 },
    { "position": 3, "resource": "wheat", "number": 2 },
    { "position": 4, "resource": "clay", "number": 9 },
    { "position": 5, "resource": "wool", "number": 10 },
    { "position": 6, "resource": "clay", "number": 8 },
    { "position": 7, "resource": "wheat", "number": 5 },
    { "position": 8, "resource": "wood", "number": 11 },
    { "position": 9, "resource": "desert", "number": 6 },
    { "position": 10, "resource": "wood", "number": 5 },
    { "position": 11, "resource": "ore", "number": 8 },
    { "position": 12, "resource": "wood", "number": 11 },
    { "position": 13, "resource": "ore", "number": 6 },
    { "position": 14, "resource": "wheat", "number": 4 },
    { "position": 15, "resource": "wool", "number": 3 },
    { "position": 16, "resource": "clay", "number": 4 },
    { "position": 17, "resource": "wheat", "number": 3 },
    { "position": 18, "resource": "wool", "number": NaN }
  ];
}

function validRoad(start, end, game) {

  return true;
}

function hasRoad(start, end, game) {

}

function validTownLocation(index, game) {

}

function hasTown(index, game) {

}

function validCityLocation(index, game) {

}

function hasCity(index, game) {

}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/:gameId', function(req, res) {
  if (!games[req.params.gameId]) {
    res.status(404);
    res.type('txt').send('Game Not found');
    return;
  }

  res.sendFile(__dirname + '/game.html');
});

app.post('/create', function(req, res) {
  var gameId = generateUUID();

  games[gameId] = {
    gameId: gameId,
    board: createStarterBoard(),
    towns: [{position: [3,2], color: "white"}, {position: [8,2], color: "orange"}, {position: [5,1], color: "red"},
      {position: [8,1], color: "orange"}, {position: [6,0], color: "red"}, {position: [3,-1], color: "blue"},
      {position: [7,-1], color: "white"}, {position: [6,-2], color: "blue"}],
    roads: [{start: [3,2], end: [4,2], color: "white"}, {start: [7,2], end: [8,2], color: "orange"}, {start: [5,1], end: [5,2], color: "red"},
      {start: [6,0], end: [6,1], color: "red"}, {start: [8.0], end: [8,1], color: "red"}, {start: [3,-1], end: [3,0], color: "blue"},
      {start: [6,-1], end: [7,-1], color: "white"}, {start: [5,-2], end: [6,-2], color: "blue"}]
  };
  
  res.statusCode = 201;
  var location = req.protocol + '://' + req.get('host') + '/' + gameId;
  res.setHeader('Location', location);
  res.send();
});

io.on('connection', function(socket) {
  var socketId = socket.id;
  var gameId = socket.handshake.query.gameId;

  console.log('user: ' + socketId + ' connected to game: ' + gameId);
  getSocket(socketId).emit('game_state', games[gameId]);

  socket.on('disconnect', function() {
    console.log('user: ' + socketId + ' disconnected from game: ' + gameId);
  });
});

function getSocket(socketId) {
  return io.of('/').connected[socketId];
};

server.listen(3000, function() {
  console.log('listening on port 3000');
});