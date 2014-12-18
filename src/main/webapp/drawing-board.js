Polymer({    
    
    canvasElement : null,
    width: 800,
    height: 600,
    ctx: null,
    penDown: false,
    fingerUp : true,
    showGrid: true,

    init: function() {
      this.canvasElement = this.$.canvas;
      this.ctx = this.canvasElement.getContext("2d");
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = "round";
      this.ctx.canvas.width = this.width;
      this.ctx.canvas.height = this.height;
      this.setColor('red');
      this.lineWidth(7);
    },

    clear: function() {
      this.ctx.canvas.width = this.width;
      this.ctx.canvas.height = this.height;
      if (!this.showGrid) {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0 ,0 , this.width, this.height);
      }
    },

    paint: function(pos) {
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
    
});    