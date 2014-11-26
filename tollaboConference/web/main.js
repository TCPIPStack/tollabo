/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
'use strict';

var isChannelReady = true;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true}};

/////////////////////////////////////////////

var wsUri = "ws://" + document.location.host + document.location.pathname + "confereceEndpoint";
var socket = new WebSocket(wsUri);

socket.onerror = function (evt) {
    onError(evt);
};

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

socket.onopen = function (evt) {
    onOpen(evt);
};

function iniFunction() {
    isInitiator = true;
    var constraints = {video: true, audio: true};
    getUserMedia(constraints, handleUserMedia, handleUserMediaError);
    console.log('Getting user media with constraints', constraints);

    if (location.hostname !== "localhost") {
        requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    }
}

function awFunction() {
    console.log('readyCLick')
    isInitiator = false;
    var constraints = {video: true, audio: true};
    getUserMedia(constraints, handleUserMedia, handleUserMediaError);
    console.log('Getting user media with constraints', constraints);

    if (location.hostname !== "localhost") {
        requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    }
}

function onOpen() {
    writeToScreen("Connected to " + wsUri);
}
function writeToScreen(message) {
    output.innerHTML += message + "<br>";
}
////////////////////////////////////////////////

function sendMessage(message) {
    console.log('Client sending message: ', message);
    // if (typeof message === 'object') {
    //   message = JSON.stringify(message);
    // }
    socket.send(message);
}

socket.onmessage = function (message) {
    console.log('Client received message:', message);
    if (message.data === 'got user media') {
        maybeStart();
    } else if (message.data.toString().indexOf('offer') !== -1) {
        console.log('!!!!got an offer');
        if (!isInitiator && !isStarted) {
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(message.data)));
        doAnswer();
    } else if (message.data.toString().indexOf('answer') !== -1 && isStarted) {
        console.log('!!!!got an answer');
        pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(message.data)));
    } else if (message.data.toString().indexOf('canditade') !== -1 && isStarted) {
        console.log('!!!!got an canditade');
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: JSON.parse(message.data).label,
            candidate: JSON.parse(message.data).candidate
        });
        pc.addIceCandidate(candidate);
    } else if (message.label === 'bye' && isStarted) {
        handleRemoteHangup();
    }
};

////////////////////////////////////////////////////

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

function handleUserMedia(stream) {
    console.log('Adding local stream.', stream);
    localVideo.src = window.URL.createObjectURL(stream);
    localStream = stream;
    sendMessage('got user media');
    if (isInitiator) {
        maybeStart();
    }
}

function handleUserMediaError(error) {
    console.log('getUserMedia error: ', error);
}

function maybeStart() {
    console.log("maybe start", (!isStarted && typeof localStream !== 'undefined' && isChannelReady));
    if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
        createPeerConnection();
        pc.addStream(localStream);
        isStarted = true;
        console.log('isInitiator', isInitiator);
        if (isInitiator) {
            doCall();
        }
    }
}

window.onbeforeunload = function (e) {
    sendMessage('bye');
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcreate PeerConnection');
    try {
        pc = new RTCPeerConnection(null);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log('Created RTCPeerConnnection');
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

function handleIceCandidate(event) {
    console.log('handleIceCandidate event: ', event);
    if (event.candidate) {
        sendMessage(JSON.stringify({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate}));
    } else {
        console.log('End of candidates.');
    }
}

function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
    remoteStream = event.stream;
}

function handleCreateOfferError(event) {
    console.log('createOffer() error: ', e);
}

function doCall() {
    console.log('Sending offer to peer');
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer(setLocalAndSendMessageAnswer, null, sdpConstraints);
}

function setLocalAndSendMessageAnswer(sessionDescription) {
    // Set Opus as the preferred codec in SDP if Opus is present.
    sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(JSON.stringify(sessionDescription));
}

function setLocalAndSendMessage(sessionDescription) {
    // Set Opus as the preferred codec in SDP if Opus is present.
    sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(JSON.stringify(sessionDescription));
}

function requestTurn(turn_url) {
    var turnExists = false;
    for (var i in pc_config.iceServers) {
        if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
            turnExists = true;
            turnReady = true;
            break;
        }
    }
    if (!turnExists) {
        console.log('Getting TURN server from ', turn_url);
        // No TURN server. Get one from computeengineondemand.appspot.com:
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var turnServer = JSON.parse(xhr.responseText);
                console.log('Got TURN server: ', turnServer);
                pc_config.iceServers.push({
                    'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                    'credential': turnServer.password
                });
                turnReady = true;
            }
        };
        console.log('before open');
        xhr.open('GET', turn_url, true);
        console.log('after open');
        xhr.send();
        console.log('send');
    }
}

function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
    remoteStream = event.stream;
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

function hangup() {
    console.log('Hanging up.');
    stop();
    sendMessage('bye');
}

function handleRemoteHangup() {
//  console.log('Session terminated.');
    // stop();
    // isInitiator = false;
}

function stop() {
    isStarted = false;
    // isAudioMuted = false;
    // isVideoMuted = false;
    pc.close();
    pc = null;
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
    var sdpLines = sdp.split('\r\n');
    var mLineIndex;
    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('m=audio') !== -1) {
            mLineIndex = i;
            break;
        }
    }
    if (mLineIndex === null) {
        return sdp;
    }

    // If Opus is available, set it as the default in m line.
    for (i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayload) {
                sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
            }
            break;
        }
    }

    // Remove CN in m line and sdp.
    sdpLines = removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n');
    return sdp;
}

function extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = [];
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
        if (index === 3) { // Format of media starts from the fourth.
            newLine[index++] = payload; // Put target payload to the first.
        }
        if (elements[i] !== payload) {
            newLine[index++] = elements[i];
        }
    }
    return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
    var mLineElements = sdpLines[mLineIndex].split(' ');
    // Scan from end for the convenience of removing an item.
    for (var i = sdpLines.length - 1; i >= 0; i--) {
        var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
        if (payload) {
            var cnPos = mLineElements.indexOf(payload);
            if (cnPos !== -1) {
                // Remove CN payload from m line.
                mLineElements.splice(cnPos, 1);
            }
            // Remove CN line in sdp
            sdpLines.splice(i, 1);
        }
    }

    sdpLines[mLineIndex] = mLineElements.join(' ');
    return sdpLines;
}



