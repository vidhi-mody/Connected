const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getaUsersInRoom } = require('./users.js')

const PORT = process.env.PORT || 5000;

const router = require('./router')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error) return callback(error);

        socket.emit('message', {user:'admin', text:`${user.name}, Welcome to the ${user.room}` });
        socket.broadcast.to(user.room).emit('message', {user:'admin', text: `${user.name}, has joined. Say hi!`});

        socket.join(user.room);

        

        callback();

    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user:user.name, text:message})

        callback();

    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left the chat.`})
        }
    })
});

app.use(router);

server.listen(PORT, () => console.log('Server is up and running!'));