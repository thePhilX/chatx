// server.js is the entry point of the complete NodeJs Application (start app with "node server")

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var usernames = [];

// define port to listen to
var port = 3000;
server.listen(port);
console.log('Server is listening to port ' + port);

// static files (express.static)
app.use(express.static('./public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    console.log('socket connected');

    socket.on('new user', function(data, callback){
      if(usernames.indexOf(data) != -1){
        callback(false);
      }else{
        callback(true);
        socket.username = data;
        usernames.push(socket.username);
        updateUsernames();
      }
    });

    // Update usernames
    function updateUsernames(){
      io.sockets.emit('usernames', usernames);
    };

    // Send Messages
    socket.on('send message', function(data){
      io.sockets.emit('new message', {msg: data, user:socket.username});
    });

    // Disconnecting
    socket.on('disconnect', function(data){
      if(!socket.username){
        return;
      }
      // delete username from usernames array
      usernames.splice(usernames.indexOf(socket.username), 1);
    });
});
