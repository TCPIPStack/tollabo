var socket = new WebSocket('ws://localhost:8080/tollabo/ws');
socket.onmessage = function (event) {
    alert(event.data);
};


function send(){
    var input = document.getElementById('textField').value;
    socket.send(input);
}