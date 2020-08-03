const path = require('path') //this is a core node module so there is no need to install it
const http = require('http')
const express = require('express')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('../src/utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('../src/utils/users')

const socketio = require('socket.io')

const app= express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//=======
let message = 0
io.on('connection',(socket)=>{
    //console.log('new chat has started')
    
    // socket.emit('newMessage',generateMessage('welcome'))

    // socket.broadcast.emit('newMessage',generateMessage('A new user has join'))

    socket.on('join',(options, callback)=>{
        const {error, user} = addUser({id: socket.id, ...options})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('newMessage',generateMessage('Admin',`${user.username} welcome`))
        socket.broadcast.to(user.room).emit('newMessage',generateMessage('Admin',`${user.username} has joined the ${user.room}`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message, callback)=>{
        const user = getUser(socket.id) //socket id is the unique id given to the user by socket
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        //console.log(message)
        //socket.emit('countUpdated',count) to single connection
        io.to(user.room).emit('newMessage',generateMessage(user.username,message))
        callback('Delivered') //used for the aknowledgement function
    })

    socket.on('sendLocation',(cords,callback)=>{
        //io.emit('newMessage',`Location: ${cords.latitude}, ${cords.longitude}.`)
        const user = getUser(socket.id)
        io.to(user.room).emit('messageLocation',generateLocationMessage(user.username,`https://google.com/maps?q=${cords.latitude},${cords.longitude}`))

    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port,()=>{
    console.log(`server is up on port ${port}!`)
})









// let count = 0

// io.on('connection',(socket)=>{
//     console.log('new web socket connection')
//     socket.emit('countUpdated',count)

//     socket.on('increment',()=>{
//         count++
//         //socket.emit('countUpdated',count) to single connection
//         io.emit('countUpdated',count)
//     })
// })