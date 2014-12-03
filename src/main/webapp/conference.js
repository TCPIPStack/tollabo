/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
            var wsUri = "ws://" + document.location.host + document.location.pathname + "confereceEndpoint";
            var socket = new WebSocket(wsUri);
            var sourcevid = document.getElementById('sourcevid');
            var remotevid = document.getElementById('remotevid');
            var localStream = null;
            var peerConn = null;
            var started = false;
            var caller = false;

            var logg = function (s) {
                console.log(s);
            };

            // when PeerConn is created, send setup data to peer via WebSocket
            function onSignal(message) {
                logg("Sending setup signal");
                socket.send(message);
            }
            // when remote adds a stream, hand it on to the local video element
            function onRemoteStreamAdded(event) {
                logg("Added remote stream" + event.stream);
                logg("remote stream tracks" + JSON.stringify(event.stream.getVideoTracks()));
                remotevid = document.getElementById('remotevid');
                remotevid.src = window.URL.createObjectURL(event.stream);
                remotevid.play();
                for (index = 0; index < candidates.length; index++) {
                    try {
                        if (!candidates[index] || candidates[index] !== null) {
                            peerConn.addIceCandidate(candidates[index]);
                            candidates[index] = null;
                        }
                    } catch (e) {
                        logg('Exception' + JSON.stringify(e))
                    }
                }
            }

            // when remote removes a stream, remove it from the local video element
            function onRemoteStreamRemoved(event) {
                logg("Remove remote stream");
                remotevid.src = "";
            }

            var pc_config = {
                'iceServers': [
                    {
                        'url': 'turn:192.158.29.39:3478?transport=udp',
                        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                        'username': '28224511:1379330808'
                    },
                    {
                        'url': 'turn:192.158.29.39:3478?transport=tcp',
                        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                        'username': '28224511:1379330808'
                    }
                ]
            };
            function createPeerConnection() {
                try {
                    logg("Creating peer connection");
                    peerConn = new webkitRTCPeerConnection(pc_config);
                    peerConn.onicecandidate = onIceCandidate;
                    console.log("Created RTCPeerConnnection with config:\n" + "  \"" +
                            JSON.stringify(pc_config) + "\".");
                } catch (e) {
                    logg(e.message);
                }
                peerConn.onaddstream = onRemoteStreamAdded;
                peerConn.onremovestream = onRemoteStreamRemoved;
            }

            function onIceCandidate(event) {
                if (event.candidate) {
                    sendMessage({
                        type: 'candidate',
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate});
                } else {
                    console.log("End of candidates.");
                }
            }

            // start the connection upon user request
            function connectToChat() {
                if (!started && lStreamStarted) {
                    createPeerConnection();
                    logg('Adding local stream...');
                    peerConn.addStream(localStream);
                    doCall();
                    started = true;
                    caller = true;
                    logg('started');
                } else {
                    alert("Local Stream not started!")
                }
            }

            // accept connection request
            var gotAnswer = false;
            var candidates = [];
            socket.addEventListener("message", onMessage, false);
            function onMessage(evt) {
                var msg = JSON.parse(evt.data);
                logg("RECEIVED: " + evt.data);
                if (!started && msg.type === 'offer') {
                    createPeerConnection();
                    peerConn.setRemoteDescription(new RTCSessionDescription(msg));
                    peerConn.addStream(localStream);
                    logg('Adding local stream...');
                    started = true;
                    logg('SEND ANSWER...');
                    doAnswer();
                }
                if (evt.data.toString().indexOf('candidate') !== -1) {
                    logg("Candidates: " + candidates.length);
                    logg("Candidate: " + JSON.stringify(msg));

                    /*peerConn.addIceCandidate(new RTCIceCandidate({
                     sdpMLineIndex: candidate.sdpMLineIndex,
                     candidate: candidate.candidate
                     }));*/
                    if (gotAnswer) {
                        peerConn.addIceCandidate(new RTCIceCandidate({
                            sdpMLineIndex: msg.label,
                            candidate: msg.candidate
                        }));
                    } else {
                        candidates[candidates.length] = new RTCIceCandidate({
                            sdpMLineIndex: msg.label,
                            candidate: msg.candidate
                        });
                    }

                }
                if (msg.type === 'answer') {
                    logg('RECIEVED ANSWER...');
                    peerConn.setRemoteDescription(new RTCSessionDescription(msg));
                    gotAnswer = true;
                    var index;
                    for (index = 0; index < candidates.length; index++) {
                        try {
                            if (!candidates[index] || candidates[index] !== null) {
                                peerConn.addIceCandidate(candidates[index]);
                                candidates[index] = null;
                            }
                        } catch (e) {
                            logg('Exception' + JSON.stringify(e))
                        }
                    }
                }
            }

            function hangUp() {
                logg("Hang up.");
                peerConn.close();
                peerConn = null;
                started = false;
            }
            
            var lStreamStarted = false;
            function startVideo() {
                // Replace the source of the video element with the stream from the camera
                logg("startVideo")
                try { //try it with spec syntax
                    navigator.webkitGetUserMedia({audio: true, video: true}, successCallback, errorCallback);
                } catch (e) {
                    navigator.webkitGetUserMedia("video,audio", successCallback, errorCallback);
                }
                lStreamStarted = true;
                function successCallback(stream) {
                                    sourcevid = document.getElementById('sourcevid');
                    sourcevid.src = window.webkitURL.createObjectURL(stream);
                    localStream = stream;
                }
                function errorCallback(error) {
                    console.error('An error occurred: [CODE ' + error.code + ']');
                }
            }
            function stopVideo() {
                sourcevid.src = "";
            }

            function handleCreateOfferError(event) {
                console.log('createOffer() error: ', e);
            }

            function doCall() {
                console.log('Sending offer to peer');
                peerConn.createOffer(function (offerSDP) {
                    peerConn.setLocalDescription(new RTCSessionDescription(offerSDP), function () {
                        sendMessage(offerSDP);
                    });
                }, null, sdpConstraints);
            }
            // Set up audio and video regardless of what devices are present.
            var sdpConstraints = {'mandatory': {
                    'OfferToReceiveAudio': true,
                    'OfferToReceiveVideo': true}};
            function doAnswer() {
                console.log('Sending answer to peer.');
                peerConn.createAnswer(function (answerSDP) {
                    peerConn.setLocalDescription(new RTCSessionDescription(answerSDP), function () {
                        sendMessage(answerSDP);
                        var index;
                        logg('LATER ADDING ANSWER' + candidates.length);
                        for (index = 0; index < candidates.length; index++) {
                            try {
                                if (!candidates[index] || candidates[index] !== null) {
                                    peerConn.addIceCandidate(candidates[index]);
                                    candidates[index] = null;
                                }
                            } catch (e) {
                                logg('Exception' + JSON.stringify(e))
                            }
                        }
                    });
                }, null, sdpConstraints);
            }

            function sendMessage(message) {
                var msgString = JSON.stringify(message);
                console.log('CLIENT sending ', msgString);
                socket.send(msgString);
            }

