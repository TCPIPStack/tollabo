
var ws;

window.onload = function() {
    connect();
    drawInit();
};

function connect(){
    ws = new WebSocket('ws://tollabo.ibr.cs.tu-bs.de:8080/tollabo/ws');
    
    ws.onmessage = function(evt) {
        var data = JSON.parse(evt.data);

        for (var key in data) {

          if (key === 'canvas') {
            fct = data[key][0];
            val = data[key][1];
            canvas[fct](val);
          }
        }
    };
    
    ws.onopen = function(evt) {
        console.log("WebSocket opened");
    };
    
    ws.onclose = function (evt){
        console.log("WebSocket closed");
    };
}

function send(data) {
  if (ws && ws.readyState == 1) {
    ws.send(JSON.stringify(data));
  }
}
