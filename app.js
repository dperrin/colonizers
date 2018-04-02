var http = require('http');
var express = require('express');
var socketio = require('socket.io');
const generateUUID = require('uuid/v1');

var app = express();
var server = http.createServer(app);
var io = socketio(server);

var games = {};

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
    gameId: gameId
  };
  
  res.statusCode = 201;
  var location = req.protocol + '://' + req.get('host') + '/' + gameId;
  res.setHeader('Location', location);
  res.send();
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

server.listen(3000, function() {
  console.log('listening on port 3000');
});