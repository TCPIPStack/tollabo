/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package de.tubs.tollabo.ws;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

/**
 *
 * @author Benni
 */
@ServerEndpoint(value = "/ws/{collabID}")
@ApplicationScoped
public class DrawingEndpoint {
    
    private List<String> colors;
    
    @PostConstruct
    public void postConstruct(){
        this.colors = new ArrayList<>();
        this.colors.add("red");
        this.colors.add("blue");
        this.colors.add("black");
        this.colors.add("green");
        this.colors.add("yellow");
        this.colors.add("grey");
        this.colors.add("orange");
        this.colors.add("pink");
    }
    
    private static final List<Session> sessions = new ArrayList<>();
    @OnOpen
    public void connect(Session session, @PathParam("collabID") final String collabID){
        sessions.add(session);
        session.getUserProperties().put("collabID", collabID);
        String color = "{color:"+colors.get(new Random().nextInt(colors.size()))+"}";
        session.getAsyncRemote().sendText(color);

        System.out.println("connection established with: "+session.getId()+ ".." + collabID);
    }
    
    @OnClose
    public void dissconect(Session session){
        this.sessions.remove(session);
        System.out.println("connection closed by: "+session.getId());
    }
    
    @OnMessage
    public void onMessage(Session session, String msg){
        String collabID = (String)session.getUserProperties().get("collabID");
        for (Session s : sessions) {
            if(session.getId().equals(s.getId())){
                continue;
            } else if(s.getUserProperties().get("collabID").equals(collabID)) {
                s.getAsyncRemote().sendText(msg);
            }
        }
    }
    
}
