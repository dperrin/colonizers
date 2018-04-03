var http = require('http');
var express = require('express');
var socketio = require('socket.io');
const generateUUID = require('uuid/v1');

var app = express();
var server = http.createServer(app);
var io = socketio(server);

app.use(express.static(__dirname + '/public'))

var games = {};

var players = {};

function createStarterBoard() {
  return [

    { "position": 0, "resource": "ore", "number": 10, "indexes": [[3,3], [4,3], [4,2], [3,2], [2,2], [2,3]] },
    { "position": 1, "resource": "wool", "number": 2, "indexes": [[5,3], [6,3], [6,2], [5,2], [4,2], [4,3]] },
    { "position": 2, "resource": "wood", "number": 9, "indexes": [[7,3], [8,3], [8,2], [7,2], [6,2], [6,3]] },
    { "position": 3, "resource": "wheat", "number": 12, "indexes": [[2,2], [3,2], [3,1], [2,1], [1,1], [1,2]] },
    { "position": 4, "resource": "clay", "number": 6, "indexes": [[4,2], [5,2], [5,1], [4,1], [3,1], [3,2]] },
    { "position": 5, "resource": "wool", "number": 4, "indexes": [[6,2], [7,2], [7,1], [6,1], [5,1], [5,2]] },
    { "position": 6, "resource": "clay", "number": 10, "indexes": [[8,2], [9.2], [9.1], [8,1], [7,1], [7,2]] },
    { "position": 7, "resource": "wheat", "number": 9, "indexes": [[1,1], [2,1], [2,0], [1,0], [0,0], [0,1]] },
    { "position": 8, "resource": "wood", "number": 11, "indexes": [[3,1], [4,1], [4,0], [3,0], [2,0], [2,1]] },
    { "position": 9, "resource": "desert", "number": null, "indexes": [[5,1], [6,1], [6,0], [5,0], [4,0], [4,1]] },
    { "position": 10, "resource": "wood", "number": 3, "indexes": [[7,1], [8,1], [8,0], [7,0], [6,0], [6,1]] },
    { "position": 11, "resource": "ore", "number": 8, "indexes": [[9,1], [10,1], [10,0], [9.0], [8.0], [8,1]] },
    { "position": 12, "resource": "wood", "number": 8, "indexes": [[2,0], [3,0], [3,-1], [2,-1], [1,-1], [1,0]] },
    { "position": 13, "resource": "ore", "number": 3, "indexes": [[4,0], [5,0], [5,-1], [4,-1], [3,-1], [3,0]] },
    { "position": 14, "resource": "wheat", "number": 4, "indexes": [[6,0], [7,0], [7,-1], [6,-1], [5,-1], [5,0]] },
    { "position": 15, "resource": "wool", "number": 5, "indexes": [[8,0], [9,0], [9,-1], [8,-1], [7,-1], [7,0]] },
    { "position": 16, "resource": "clay", "number": 5, "indexes": [[3,-1], [4,-1], [4,-2], [3,-2], [2,-2], [2,-1]] },
    { "position": 17, "resource": "wheat", "number": 6, "indexes": [[5,-1], [6,-1], [6,-2], [5,-2], [4,-2], [4,-1]] },
    { "position": 18, "resource": "wool", "number": 11, "indexes": [[7,-1], [8,-1], [8,-2], [7,-2], [6,-2], [6,-1]] }
  ];
}

function createStarterPlayers() {
  return [
      { socketId: null, color: "red", wood: 1, wool: 1, clay: 1, wheat: 1, ore: 0},
      { socketId: null, color: "blue", wood: 1, wool: 1, clay: 1, wheat: 1, ore: 1},
      { socketId: null, color: "orange", wood: 2, wool: 0, clay: 2, wheat: 0, ore: 1},
      { socketId: null, color: "black", wood: 0, wool: 2, clay: 1, wheat: 2, ore: 1}
  ]
};

function rollDice() {
  var die1 = Math.floor(Math.random() * (6)) + 1;
  var die2 = Math.floor(Math.random() * (6)) + 1;
  return die1 + die2
};

function doDiceRoll(game) {
  var roll = rollDice();
  game.roll = roll;
  var gamePlayers = players[game.gameId];
  console.log(roll + " was rolled");
  if(roll === 7) {
    console.log("ROBBER!")
  } else {
    var tiles = game.board.filter(tile => tile.number === roll);
    var numTiles = tiles.length;
    for (var i = 0; i < numTiles; i++) {
        console.log(tiles[i]);
        for (var j = 0; j < 6; j++) {
            var town = getTown(tiles[i].indexes[j], game);
            if(town) {
                console.log(town.color + " gets " + tiles[i].resource);
                var player = findPlayer(gamePlayers, town.color);
                var num = town.city ? 2 : 1;
                switch (tiles[i].resource) {
                    case "wood":
                        player.wood += num;
                        break;
                    case "wool":
                        player.wool += num;
                        break;
                    case "wheat":
                        player.wheat += num;
                        break;
                    case "clay":
                        player.clay += num;
                        break;
                    case "ore":
                        player.ore += num;
                        break;
                }
            }
        }
    }
    console.log(gamePlayers);
  }
};

function validRoad(start, end, game) {

  return true;
};

function hasRoad(start, end, game) {

};

function validTownLocation(index, game) {

};

function getTown(index, game) {
    return game.towns.find(town => JSON.stringify(town.position) === JSON.stringify(index));
};

function validCityLocation(index, game) {

};

function hasCity(index, game) {

};

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
    towns: [{position: [3,2], color: "black", city: false}, {position: [8,2], color: "orange", city: false}, {position: [5,1], color: "red", city: false},
      {position: [8,1], color: "orange", city: false}, {position: [6,0], color: "red", city: false}, {position: [3,-1], color: "blue", city: false},
      {position: [7,-1], color: "black", city: false}, {position: [6,-2], color: "blue", city: false}],
    roads: [{start: [4,2], end: [3,2], color: "black"}, {start: [7,2], end: [8,2], color: "orange"}, {start: [5,1], end: [5,2], color: "red"},
      {start: [6,0], end: [6,1], color: "red"}, {start: [8.0], end: [8,1], color: "orange"}, {start: [3,-1], end: [3,0], color: "blue"},
      {start: [6,-1], end: [7,-1], color: "black"}, {start: [5,-2], end: [6,-2], color: "blue"}],
    turn: "red",
    nextPlayerColor: "red",
    roll: 0
  };
  players[gameId] = createStarterPlayers();
  // startTurn(games[gameId]);
  res.statusCode = 201;
  var location = req.protocol + '://' + req.get('host') + '/' + gameId;
  res.setHeader('Location', location);
  res.send();
});

io.on('connection', function(socket) {
  var socketId = socket.id;
  var gameId = socket.handshake.query.gameId;
  var game = games[gameId];

  if (!game) {
    return;
  }

  var gamePlayers = players[gameId];
  var playerColor = game.nextPlayerColor;
  if (playerColor === "red") {
      game.nextPlayerColor = "blue";
  } else if (playerColor === "blue") {
      game.nextPlayerColor = "orange";
  } else if (playerColor === "orange") {
      game.nextPlayerColor = "black";
  }
  var player = findPlayer(gamePlayers, playerColor);
  player.socketId = socketId;
  console.log('user: ' + socketId + ' connected to game: ' + gameId);

  socket.on('disconnect', function() {
    player.socketId = null;
    console.log('user: ' + socketId + ' disconnected from game: ' + gameId);
  });

  socket.on('roll', function() {
    console.log('roll');
    doDiceRoll(game);
    // TODO update gamestate
    io.sockets.emit('game_state', games[gameId]);
    for(var i = 0; i < 4; i++){
        if(gamePlayers[i].socketId) {
            getSocket(gamePlayers[i].socketId).emit('player_state', gamePlayers[i]);
        }
    }
  });

  socket.on('get_game_state', function() {
    getSocket(socketId).emit('game_state', games[gameId]);
  });

  socket.on('get_player_state', function() {
    getSocket(socketId).emit('player_state', players[gameId].find(function(player) { return player.socketId === socketId }));
  });

  socket.on('end_turn', function() {
    console.log('end_turn');
    // TODO update gamestate
    io.sockets.emit('game_state', games[gameId]);
  });
});

function findPlayer(players, playerColor) {
    return players.find(player => player.color === playerColor);
};

function getSocket(socketId) {
  return io.of('/').connected[socketId];
};

server.listen(3000, function() {
  console.log('listening on port 3000');
});