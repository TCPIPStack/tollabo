
var ws;

window.onload = function() {
    //connect();
    //drawInit();
};

//window.addEventListener('polymer-ready', function(e) {
    connect();
    drawInit();
//});

function connect(){
    ws = new WebSocket("ws://tollabo.ibr.cs.tu-bs.de:8080/tollabo/ws/"+collabID);
    //ws = new WebSocket('ws://192.168.0.2:8080/tollabo/ws')
    ws.onmessage = function(evt) {
        var data = JSON.parse(evt.data);
        var fct;
        var val;
        for (var key in data) {
          if (key === 'canvas') {
            fct = data[key][0];
            val = data[key][1];
            canvas[fct](val);
            console.log(fct+ " " + val);
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
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
}
