const Express = require('express')();
const Http = require('http').Server(Express);
const Socketio = require('socket.io')(Http);

Http.listen(3000, () => {
    console.log('listening at 3000');
});

const connections = [null, null];
const players = [null, null];

Socketio.on('connection', function(socket){
    /********************** handle a socket connection request from web client ***********************/
    // find an available player number
    let playerIndex = -1;
    for( let i in connections){
        if(connections[i] === null){
            playerIndex = i;
        }
    }
    console.log(`player ${playerIndex} connect`);

    // ignore player 3
    if(playerIndex == -1) return;

    connections[playerIndex] = socket;

    // tell everyone a new player just connected, so we know the game can be started
    // this is sending msg to all the clients
    if(connections[0] !== null && connections[1] !== null){
        Socketio.sockets.emit('player-connect', playerIndex);
    }

    /********************** handling moves ***********************/
    socket.on('chessMove', function(data){
        Socketio.sockets.emit('chessMove', data);
        console.log(data.newLocationX);
        console.log(data.newLocationY);
        console.log(data.id);
        socket.broadcast.emit('unFreezeScreen');
        socket.emit('freezeScreen');
    });

     /********************** handling game start ***********************/
    socket.on('gameStart', function(data){
        socket.broadcast.emit('informRole', data);
        console.log(data.player);
        if(players[0] === null){
            players[0] = data.player;
            console.log(players);
        } else {
            players[1] = data.player;
            console.log(players);
        }
    
        if(players[0] === 'black' && players[1] === 'green'){
            if(data.player === 'black'){
                socket.emit('unFreezeScreen');
            }else if(data.player === 'green') {
                socket.broadcast.emit('unFreezeScreen');
            }
        }

        if(players[1] === 'black' && players[0] === 'green'){
            if(data.player === 'black'){
                socket.emit('unFreezeScreen');
            }else if(data.player === 'green') {
                socket.broadcast.emit('unFreezeScreen');
            }
        }
    });

    /********************** handling disconnects ***********************/
    socket.on('disconnect', function(){
        socket.broadcast.emit('player-disconnect', playerIndex);
        connections[playerIndex] = null;  
        players[playerIndex] = null;  
        console.log(`player ${playerIndex} disconnect`);
    });

})

