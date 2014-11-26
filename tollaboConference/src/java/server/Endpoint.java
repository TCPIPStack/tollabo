/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.websocket.MessageHandler;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 *
 * @author Marcel
 */
@ServerEndpoint("/confereceEndpoint")
public class Endpoint {

    private static Set<Session> peers = Collections.synchronizedSet(new HashSet<Session>());

  @OnMessage
  public void onMessage(String message, Session session) 
    throws IOException {
    System.out.println("SERVER: " + message + ", " + session);
      // Iterate over the connected sessions
      // and broadcast the received message
      for(Session client : peers){
          System.out.println(message);
          if(client != session) {
            client.getBasicRemote().sendText(message);
          }
      }
    
  }

    @OnOpen
    public void onOpen(Session peer) {
        peers.add(peer);
        System.out.println(peers);
    }

    @OnClose
    public void onClose(Session peer) {
        peers.remove(peer);
    }

    @OnError
    public void onError(Throwable t) {
    }
}
