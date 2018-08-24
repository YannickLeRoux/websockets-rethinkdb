var express = require('express');
var socket = require('socket.io');

var r = require('rethinkdb');

// App setup
var app = express();
var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000,');
});

// Static files
app.use(express.static('public'));

// Initiliaze Connection with DB
var connection = null;
r.connect( {host: 'localhost', port: 28015, db:'chatapp'}, function(err, conn) {
    if (err) throw err;
    connection = conn;

    // Create DataBase
    // r.dbCreate('chatapp').run(connection, function(err, result) {
    //     if (err) throw err;
    //     console.log(JSON.stringify(result, null, 2));
    // })

    //Create Table
    // r.db('chatapp').tableCreate('messages').run(connection, function(err, result) {
    //     if (err) throw err;
    //     console.log(JSON.stringify(result, null, 2));
    // })

})





// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    // Handle chat event
    socket.on('chat', function(data){
        console.log('data: ',data);
        io.sockets.emit('chat', data);
        r.table('messages').insert(
            { message: data.message, user: data.handle, date: new Date() }
        ).run(connection, function(err, result) {
            if (err) throw err;
            console.log(JSON.stringify(result, null, 2));
        })


    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

});
