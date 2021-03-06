function conferenceInit() {
    var connection = new RTCMultiConnection();
    connection.session = {
        audio: true,
        video: true
    };
    var wsUri = "ws://tollabo.ibr.cs.tu-bs.de:8080/tollabo/confereceEndpoint";
//var wsUri = "ws://192.168.0.2:8080/tollabo/confereceEndpoint";
    var socket = new WebSocket(wsUri);
    connection.socket = socket;
    var closeRoomButton = document.getElementById('close');
    var sessions = {};
    var videosContainer = document.getElementById('videos-container') || document.body;
    var roomsList = document.getElementById('rooms-list');
    connection.onstream = function (e) {
        if (e.type === 'local')
            return;
        e.mediaElement.width = 600;
        videosContainer.insertBefore(e.mediaElement, videosContainer.firstChild);
        rotateVideo(e.mediaElement);
        scaleVideos();
    };
    function rotateVideo(mediaElement) {
        mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
        setTimeout(function () {
            mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
        }, 1000);
    }
    connection.onstreamended = function (e) {
        e.mediaElement.style.opacity = 0;
        rotateVideo(e.mediaElement);
        setTimeout(function () {
            if (e.mediaElement.parentNode) {
                e.mediaElement.parentNode.removeChild(e.mediaElement);
            }
            scaleVideos();
        }, 1000);
        var toast = document.querySelector('#toast');
        toast.text = "User has left video session";
        toast.show();
    };

    connection.onNewSession = function (session) {
        if (sessions[session.sessionid]) {
            return;
        } else if ((session.sessionid.indexOf(collabID) === -1))
            return;
        sessions[session.sessionid] = session;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + session.extra['session-name'] + '</strong> is running a conference!</td>' +
                '<td><button class="join">Join</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);
        var joinRoomButton = tr.querySelector('.join');
        joinRoomButton.setAttribute('data-sessionid', session.sessionid);
        var toast = document.querySelector('#toast');
        toast.text = "New video session "+session.extra['session-name']+" available.";
        toast.show();
        joinRoomButton.onclick = function () {
            this.disabled = true;
            var sessionid = this.getAttribute('data-sessionid');
            session = sessions[sessionid];
            if (!session)
                throw 'No such session exists.';
            connection.join(session);
            closeRoomButton.disabled = false;
            var toast = document.querySelector('#toast');
            toast.text = "Joined video session.";
            toast.show();
        };

    };

    closeRoomButton.onclick = function () {
        connection.close();
        this.disabled = true;
        document.getElementById('setup-new-conference').disabled = false;
    };

    document.getElementById('setup-new-conference').onclick = function () {
        this.disabled = true;
        connection.extra = {
            'session-name': document.getElementById('conference-name').value || 'Anonymous'
        };
        connection.open();
        closeRoomButton.disabled = false;
    };

    (function () {
        var uniqueToken = document.getElementById('unique-token');
        if (uniqueToken)
            if (location.hash.length > 2)
                uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
            else
                uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
    })();
    function scaleVideos() {
        var videos = document.querySelectorAll('video'),
                length = videos.length,
                video;
        var minus = 130;
        var windowHeight = 700;
        var windowWidth = 600;
        var windowAspectRatio = windowWidth / windowHeight;
        var videoAspectRatio = 4 / 3;
        var blockAspectRatio;
        var tempVideoWidth = 0;
        var maxVideoWidth = 0;
        for (var i = length; i > 0; i--) {
            blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
            if (blockAspectRatio <= windowAspectRatio) {
                tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
            } else {
                tempVideoWidth = windowWidth / i;
            }
            if (tempVideoWidth > maxVideoWidth)
                maxVideoWidth = tempVideoWidth;
        }
        for (var i = 0; i < length; i++) {
            video = videos[i];
            if (video)
                video.width = maxVideoWidth - minus;
        }
    }
    window.onresize = scaleVideos;
// setup signaling to search existing sessions
    connection.connect();
}
;
