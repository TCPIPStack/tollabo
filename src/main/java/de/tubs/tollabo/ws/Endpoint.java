/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package de.tubs.tollabo.ws;

import java.util.ArrayList;
import java.util.List;
import javax.enterprise.context.ApplicationScoped;
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
@ApplicationScoped
public class Endpoint {
    
    private final List<Session> sessions = new ArrayList<>();
    
    @OnOpen
    public void connect(Session session){
        this.sessions.add(session);
        System.out.println("client connected:"+session.getId());
    }
    
    @OnClose
    public void dissconect(Session session){
        this.sessions.remove(session);
    }
    
    @OnMessage
    public void onMessage(Session session, String msg){
        for (Session s : sessions) {
            if(session.getId().equals(s.getId())){
                continue;
            }
            s.getAsyncRemote().sendText(msg);
        }
        System.out.println("received message: "+msg);
    }
    
}
