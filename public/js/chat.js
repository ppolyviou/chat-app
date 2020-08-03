const socket = io()

// Elements
const $messageForm = document.querySelector('#messageForm')  // $ signifies that this is a selector from the DOM
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const messageLocationTemplate = document.querySelector('#messageLocation').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin //this does not calculate margin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('newMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
    console.log(room)
    console.log(users)
})

socket.on('messageLocation',(location)=>{
    console.log(location)
    const html = Mustache.render(messageLocationTemplate,{
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

document.querySelector('#messageForm').addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    // disable
    const message = e.target.elements.message.value //e.target.elements tagets the elements of #messageForm by their name |||initial code: document.querySelector('input').value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled','disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        // enable
        if (error) {
            return console.log(error)
        }
        console.log('the message was delivered')
    })
})


document.querySelector('#sendLocation').addEventListener('click',()=>{
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    //disable
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
        
        //enable
        $sendLocationButton.removeAttribute('disabled','disabled')
    })

})


socket.emit('join',{username,room}, (error)=>{
    if (error) {
        alert(error)
        location.href = '/' //redirect to home page
    }
})




// socket.on('countUpdated',(count)=>{
//     console.log('the count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })