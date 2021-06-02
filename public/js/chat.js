const socket = io();

// socket.on('countUpdated',(count)=>{
//     console.log("count updated to", count)
// })

// document.getElementById('inc').addEventListener('click',()=>{
//     console.log("clicked");
//     socket.emit('incCount')
// })

const $message = document.getElementById('message')

//templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;


//query string parse
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

//scrolling function
const autoScrolling = () => {
  //new message
  const $NewMessage = $message.lastElementChild

  //height of new message
  const newMessageStyles = getComputedStyle($NewMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const NewMessageHeight = $NewMessage.offsetHeight + newMessageMargin

  //visible Height
  const visibleHeight = $message.offsetHeight

  //container height i.e our messages total heigth which it occupies
  const contentHeight = $message.scrollHeight

  //how far have i scrolled? how much dist left from bottom
  const scrolOffset = $message.scrollTop + visibleHeight

  //if container height < scrollOffset we are viewing last msg , when new msg is not yet added
  if((contentHeight - NewMessageHeight) <= scrolOffset){
    $message.scrollTop = $message.scrollHeight // scroll to the bottom
  }

}

socket.on('message', (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate,{
      username:msg.username,
      message:msg.text,
      createdAt: moment(msg.createdAt).format('h:mm a')
  });
  document.getElementById('message').insertAdjacentHTML('beforeend',html)
  autoScrolling();
});

socket.on('sendLoc',(msg)=>{
    console.log(msg)
    const html = Mustache.render(locationTemplate,{
        username:msg.username,
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    });
    document.getElementById('message').insertAdjacentHTML('beforeend',html)
    autoScrolling();
})

document.getElementById("myForm").addEventListener("submit", (e) => {
  e.preventDefault();

  //disable button for same msg to submit again
  document.getElementById('submit').setAttribute('disabled','disabled')

   
  const textMessage = document.getElementById("textmsg").value;

  //acknowledgement
  socket.emit("sendMsg", textMessage, (error) => {

    //enable button 
    document.getElementById('submit').removeAttribute('disabled')

     //empty the input text after acknoledgement
     document.getElementById('textmsg').value = '';
     document.getElementById('textmsg').focus();
 
    if (error) {
      return console.log(error);
    }
    console.log("msg delivered successfully!");
  });
});

document.getElementById("location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your browser do not suppoert Geolocation");
  }

  //disable button
  document.getElementById('location').setAttribute('disabled','disabled')

  navigator.geolocation.getCurrentPosition((pos) => {
    data = {
      lat: pos.coords.latitude,
      long: pos.coords.longitude,
    };
    socket.emit("send-location", data, ()=>{

        //enable after acknoledgement
        document.getElementById('location').removeAttribute('disabled')
        console.log('location shared successfully!')
    });
  });
});

socket.emit('join', {username, room}, (error)=>{
  if(error){
    alert(error)
    location.href = '/'
  }
})

socket.on('roomData',({room,users})=>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  })
  document.getElementById('sidebar').innerHTML = html;
})