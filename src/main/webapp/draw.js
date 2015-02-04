var direction = false;

function lineDraw(dir) {
    if (dir === direction) {
        direction = false;
        document.querySelector("#" + dir + "Button").style.backgroundColor = "#065B81"
    } else {
        if (direction) {
            document.querySelector("#" + direction + "Button").style.backgroundColor = "#065B81"
        }
        direction = dir;
        document.querySelector("#" + direction + "Button").style.backgroundColor = "#4285f4";
    }
}

function drawInit() {
    canvas.init();
    var canvasElement = canvas.canvasElement;
    var h;
    var startMouseDraw = function (evt) {
        var offset = $(this).offset();
        var pos = {
            x: evt.pageX - offset.left,
            y: evt.pageY - offset.top
        };
        if (direction === "horizontal") {
            if (!h) {
                h = pos.y;
            } else {
                pos.y = h;
            }
        } else if (direction === "vertical") {
            if (!h) {
                h = pos.x;
            } else {
                pos.x = h;
            }
        }
        canvas.moveTo(pos);
        canvas.paint(pos, canvas.color);
        send({"canvas": ["moveTo", pos]});
        send({"canvas": ["paint", pos, canvas.color]});
        if (evt.type === 'mousedown') {
            canvas.penDown = true;
        }
    };

    var mouseDraw = function (evt) {
        if (canvas.penDown) {
            var offset = $(this).offset();
            var pos = {
                x: evt.pageX - offset.left,
                y: evt.pageY - offset.top
            };
            if (direction === "horizontal") {
                if (!h) {
                    h = pos.y;
                } else {
                    pos.y = h;
                }
            } else if (direction === "vertical") {
                if (!h) {
                    h = pos.x;
                } else {
                    pos.x = h;
                }
            }
            canvas.paint(pos, canvas.color);
            send({"canvas": ["paint", pos, canvas.color]});
        }
    };

    var touchDraw = function (evt) {
        evt.preventDefault();
        var offset = $(this).offset();
        var pos = {
            x: evt.touches[0].pageX - offset.left,
            y: evt.touches[0].pageY - offset.top
        };
        if (direction === "horizontal") {
            if (!h) {
                h = pos.y;
            } else {
                pos.y = h;
            }
        } else if (direction === "vertical") {
            if (!h) {
                h = pos.x;
            } else {
                pos.x = h;
            }
        }
        if (canvas.fingerUp) {
            canvas.moveTo(pos);
            send({"canvas": ["moveTo", pos]});
            canvas.fingerUp = false;
        }
        canvas.paint(pos);
        send({"canvas": ["paint", pos, canvas.color]});
    };

    var touchEnd = function (evt) {
        canvas.fingerUp = true;
        h = false;
    };

    var endMouseDraw = function (evt) {
        canvas.penDown = false;
        h = false;
    };

    canvasElement.addEventListener('mousedown', startMouseDraw);

    canvasElement.addEventListener('touchmove', touchDraw, false);
    canvasElement.addEventListener('mousemove', mouseDraw);

    canvasElement.addEventListener('touchend', touchEnd);
    canvasElement.addEventListener('mouseup', endMouseDraw);

}
;