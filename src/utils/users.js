const users = [];

//addUser, removeUser , getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    //clean the data 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return{
            error: 'Username and Room are required'
        }
    }
    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return{
            error:'Username already exists!'
        }
    }
    //store user
    const user = {id, username, room};
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id === id;
    })
    //if match then 0 or greater , if no match then -1
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

// addUser({
//     id:2,
//     username:'aab',
//     room:'web'
// })
// addUser({
//     id:3,
//     username:'aabcc',
//     room:'web1'
// })
// addUser({
//     id:4,
//     username:'aabccdd',
//     room:'web1'
// })

 //console.log(users)

// const add = addUser({
//     id:3,
//     username:'aabc',
//     room:'web'
// })
// console.log(add)

// const removedUser = removeUser(2)
// console.log(removedUser)
// console.log(users)


const getUser = (id) => {
    const userIndex = users.findIndex((user)=>{
        return user.id === id
    })

    if(userIndex !== -1){
        return users[userIndex]
    }
}


const getUsersInRoom = (room) => {
    const arr = [];
    users.find((user)=>{
         if(user.room === room){
            arr.push(user)
         }
    })
    return arr;
}
// const getUserdata = getUser(2)
// console.log(getUserdata);
// console.log(users)

// const allUsers = getUsersInRoom('web')
// console.log(allUsers)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}