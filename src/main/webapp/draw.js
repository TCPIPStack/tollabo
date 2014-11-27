function drawInit() {
    canvas.init();
    
    var startDraw = function(evt) {
       var offset = $(this).offset();
       var pos = {
         x: evt.clientX - offset.left,
         y: evt.clientY - offset.top
       };
       canvas.moveTo(pos);
       canvas.paint(pos);
       send({"canvas": ["moveTo", pos]});
       send({"canvas": ["paint", pos]});
       canvas.penDown = true;
     };
   
     var draw = function(evt) {
         evt.preventDefault();
       if (canvas.penDown) {
         var offset = $(this).offset();
         var pos = {
           x: evt.clientX - offset.left,
           y: evt.clientY - offset.top
         };
         canvas.paint(pos);
         send({"canvas": ["paint", pos]});
       }
     };
     
     var endDraw = function(evt) {
       canvas.penDown = false;
     };
     
     document.getElementById('canvas').addEventListener('touchstart', startDraw);
     $('#canvas').mousedown(startDraw);

     document.getElementById('canvas').addEventListener('touchmove', draw);
     $('#canvas').mousemove(draw);
     
     document.getElementById('canvas').addEventListener('touchend', endDraw);
     $('#canvas').mouseup(endDraw);
    
};