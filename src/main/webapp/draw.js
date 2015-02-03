function drawInit() {
    canvas.init();
    var canvasElement = canvas.canvasElement;
    
    var startMouseDraw = function(evt) {
        var offset = $(this).offset();
        var pos = {
          x: evt.pageX - offset.left,
          y: evt.pageY - offset.top
        };
        canvas.moveTo(pos);
        canvas.paint(pos, canvas.color);
        send({"canvas": ["moveTo", pos]});
        send({"canvas": ["paint", pos, canvas.color]});
        if(evt.type === 'mousedown'){
            canvas.penDown = true;
        }
    };

    var mouseDraw = function(evt) {
      if (canvas.penDown) {
        var offset = $(this).offset();
        var pos = {
          x: evt.pageX - offset.left,
          y: evt.pageY - offset.top
        };
        canvas.paint(pos);
        send({"canvas": ["paint", pos, canvas.color]});
      }
    };

    var touchDraw = function(evt) {
        evt.preventDefault();
        var offset = $(this).offset();
        var pos = {
          x: evt.touches[0].pageX - offset.left,
          y: evt.touches[0].pageY - offset.top
        };
        if(canvas.fingerUp){
            canvas.moveTo(pos);
            send({"canvas": ["moveTo", pos]});
            canvas.fingerUp = false;
        }
        canvas.paint(pos);
        send({"canvas": ["paint", pos, canvas.color]});
    };
     
    var touchEnd = function(evt) {
        canvas.fingerUp = true;
    };
     
    var endMouseDraw = function(evt) {
        canvas.penDown = false;
    };
     
    canvasElement.addEventListener('mousedown', startMouseDraw);

    canvasElement.addEventListener('touchmove', touchDraw, false);
    canvasElement.addEventListener('mousemove', mouseDraw);

    canvasElement.addEventListener('touchend', touchEnd);
    canvasElement.addEventListener('mouseup', endMouseDraw);
    
};