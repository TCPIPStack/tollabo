/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package de.tubs.tollabo.ws;

import java.util.ArrayList;
import java.util.List;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 *
 * @author Benni
 */
@ServerEndpoint(value = "/ws")
public class Endpoint {
    
    private final List<Session> sessions = new ArrayList<>();
    
    @OnOpen
    public void connect(Session session){
        this.sessions.add(session);
    }
    
    @OnClose
    public void dissconect(Session session){
        this.sessions.remove(session);
    }
    
    @OnMessage
    public void onMessage(String msg){
        for (Session session : sessions) {
            session.getAsyncRemote().sendText(msg+" your mom!");
        }
    }
    
}
