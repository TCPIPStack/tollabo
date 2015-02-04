
var ws;

window.onload = function (){
    var tmpl = document.querySelector('#tmpl');
    tmpl.addEventListener('template-bound', function () {
        conferenceInit();
        connect();
        drawInit();
        var url = 'pdf/test.pdf';
    });    
};

function connect(){
    ws = new WebSocket("ws://tollabo.ibr.cs.tu-bs.de:8080/tollabo/ws/"+collabID);
    //ws = new WebSocket('ws://192.168.0.2:8080/tollabo/ws/'+collabID);
    ws.onmessage = function(evt) {
        var data = JSON.parse(evt.data);
        var fct;
        var val;
        for (var key in data) {
          if (key === 'canvas') {
            fct = data[key][0];
            val = data[key][1];
            color = data[key][2];
            canvas[fct](val, color);
          }
          else if (key === 'color'){
              canvas.color = (data[key]);
          }
          else if (key === 'document'){
                displayPDF(data[key]);
          }
          console.log(data);
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

function handleDocumentChange(url){
    var document = {
        document : url
    };
    send(document);
    displayPDF(url);
}
