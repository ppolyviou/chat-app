const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username taken!'
        }
    }

    //store User
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    //Commented is my solution
    // const index = users.findIndex((user)=>{
    //     return user.id === id
    // })

    // if (index !== -1) {
    //     return users[index]
    // }

    return users.find((user)=>user.id === id)

}

const getUsersInRoom = (room) => {
    // var usersInRoom = []
    // users.forEach((user)=>{
    //     if (user.room === room) {
    //         usersInRoom.push(user)
    //     }
    // })
    // return usersInRoom
    room = room.trim().toLowerCase()
    return users.filter((user) => {
        return user.room === room
    })

}




//Testing scripts
/////////
// addUser({
//     id: 22,
//     username: 'Panagiotis',
//     room: 'boom'
// })

// addUser({
//     id: 23,
//     username: 'Mike',
//     room: 'boom'
// })

// addUser({
//     id: 24,
//     username: 'Chris',
//     room: 'boom1'
// })

// console.log(users)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
