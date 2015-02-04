var canvas = {    

    canvasElement : null,
    width: 800,
    height: 600,
    ctx: null,
    penDown: false,
    fingerUp : true,
    color: 'red',

    init: function() {
      this.canvasElement = document.querySelector('#canvas');
      this.ctx = this.canvasElement.getContext("2d");
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = "round";
      this.ctx.canvas.width = this.width;
      this.ctx.canvas.height = this.height;
      this.setColor(this.color);
      this.lineWidth(7);
    },

    clear: function() {
        this.ctx.fillStyle = "#E5E5E5";
        this.ctx.fillRect(0 ,0 , this.width, this.height);
    },

    paint: function(pos, color) {
      this.setColor(color);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, 3, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    },

    moveTo: function(pos) {
      this.ctx.moveTo(pos.x, pos.y);
    },

    setColor: function(color) {
      this.ctx.strokeStyle = color;
      this.ctx.fillStyle = color;
    },

    lineWidth: function(width) {
      this.thickness = width;
      this.ctx.lineWidth = width;
    }

};    

   