const express = require('express');
const path = require('path');
const http = require('http')
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirPath = path.join(__dirname,'../public')
console.log(publicDirPath);

app.use(express.static(publicDirPath));

const port = process.env.PORT || 3000;

//let count = 0;
io.on('connection',(socket)=>{
    console.log("new web socket connection")
    // socket.emit('countUpdated',count)

    // socket.on('incCount',()=>{
    //     count++;
    //     //socket.emit('countUpdated',count) for specific client
    //     io.emit('countUpdated',count) // for wvery client connected
    // })

    socket.on('join',({username, room}, callback)=>{

        const {error, user} = addUser({id:socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`)) //msg send to everyone in the room because we used to()
    
        //add room name and all users active in sidebar
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })

   
    socket.on('sendMsg',(textMessage,callback)=>{
        const user = getUser(socket.id);

        const filter = new Filter();

        if(filter.isProfane(textMessage)){
            return callback('Profane is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,textMessage))
    
        callback()
    })

    socket.on('disconnect',()=>{

        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
            
            //remove room name and all users active in sidebar
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('send-location',(data,callback)=>{

        const user = getUser(socket.id);

        //io.emit('message', `https://google.com/maps?q=${data.lat},${data.long}`)
        io.to(user.room).emit('sendLoc',generateMessage(user.username,`https://google.com/maps?q=${data.lat},${data.long}`))
        callback();
    })
    
})



server.listen(port,()=>{
    console.log(`server running on port ${port}`)
});