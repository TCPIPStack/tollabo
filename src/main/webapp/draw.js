function drawInit() {
    canvas.init();
    
    var startMouseDraw = function(evt) {
       var offset = $(this).offset();
       var pos = {
         x: evt.pageX - offset.left,
         y: evt.pageY - offset.top
       };
       canvas.moveTo(pos);
       canvas.paint(pos);
       send({"canvas": ["moveTo", pos]});
       send({"canvas": ["paint", pos]});
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
         send({"canvas": ["paint", pos]});
       }
     };
     
     var touchDraw = function(evt) {
        evt.preventDefault();
        var offset = $(this).offset();
        var pos = {
          x: evt.touches[0].pageX - offset.left,
          y: evt.touches[0].pageY - offset.top
        };
        canvas.paint(pos);
        send({"canvas": ["paint", pos]});
     };
     
     var endMouseDraw = function(evt) {
       canvas.penDown = false;
     };
     
     var canvasElement = document.getElementById('canvas');
     canvasElement.addEventListener('touchstart', startMouseDraw, false);
     $('#canvas').mousedown(startMouseDraw);

     canvasElement.addEventListener('touchmove', touchDraw, false);
     $('#canvas').mousemove(mouseDraw);
     
     canvasElement.addEventListener('touchend', endMouseDraw, false);
     $('#canvas').mouseup(endMouseDraw);
    
};