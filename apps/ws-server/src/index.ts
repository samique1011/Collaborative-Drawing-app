import {WebSocketServer} from "ws";
import type { WebSocket } from "ws";
import checkUserAuthorized from "./controllers/checkUserAuthorized.js";
import checkUserPresent from "./controllers/checkUserPresent.js";
import { ChatMessageInputType } from "@repo/config/config";
interface allSocketsType {
    socket : WebSocket , 
    username : string , 
    roomId : string
}
interface InformationType{
    type : "info" , 
    payload : {
        info : string
    }
}
type ChatMessage = {
      type: "join-room";
      payload: {
        roomId: string;
      };
    }
  | {
      type: "leave-room";
      payload: {
        roomId: string;
      };
    }
  | {
      type: "chat";
      payload: {
        text: string;
      };
    };
const ws = new WebSocketServer({port : 8080});
let allSockets : allSocketsType[] = [];

ws.on('connection' , function connection(socket , request){
    const url = request.url;
    if(!url)    return;

    const checkAuthorized = checkUserAuthorized(url);
    if(!checkAuthorized){
        let sendMessage : InformationType = {
            type : "info" , 
            payload : {
                info : "YOU_AREN'T_AUTHORIZED"
            }
        }
        socket.send(JSON.stringify(sendMessage));
        socket.close();
        return
    }
    const username = checkAuthorized;
    
    socket.on('message' ,  (msg) => {
        const result = ChatMessageInputType.safeParse(JSON.parse(msg.toString()));
        if(!result.success){
            socket.send(JSON.stringify({
                type : "info" , 
                payload : {
                    info : "WRONG_MESSAGE_TYPE"
                }
            }))
            return
        }
        const message : ChatMessage  = JSON.parse(msg.toString());
        if(message.type == 'join-room'){
            //first we will check if the user belongs to a room or not
            if(checkUserPresent(socket , allSockets)){
                socket.send(JSON.stringify({
                    type : "info" ,
                    payload : {
                        info : "YOU_CANNOT_JOIN_ANOTHER_ROOM_AS_YOU_ARE_ALREADY_IN_ONE"
                    }
                }));
            }
            else{
                allSockets.push({
                    socket : socket , 
                    username : username , 
                    roomId : message.payload.roomId
                })
                //broadCast this message to the chatroom
                const sendMessage : ChatMessage = {
                    type : "chat" , 
                    payload : {
                        text : `${username} joined the room`
                    }
                }
                allSockets.forEach((obj : allSocketsType) => {
                    if(obj.roomId == message.payload.roomId){
                        obj.socket.send(JSON.stringify(sendMessage))
                    }
                })
            }
        }
        else if(message.type == 'leave-room'){
            allSockets = allSockets.filter((x : allSocketsType) => {
                return x.socket !== socket
            })
            socket.send(JSON.stringify({
                type : "info" , 
                payload : {
                    info : "YOU_LEFT_THE_ROOM"
                }
            }));
            socket.close();
        }
        else{
            const chatText = message.payload.text;
            const roomId = (allSockets.find((x : allSocketsType) => {
                if(x.socket === socket){
                    return x
                }
            }))?.roomId

            if(!roomId){
                socket.send(JSON.stringify({
                    type : "info" , 
                    payload : {
                        info : "YOU_ARE_NOT_PRESENT_IN_ANY_ROOM"
                    }
                }));
                socket.close();
                return
            }

            let sendMessage : ChatMessage = {
                type : "chat" , 
                payload : {
                    text : message.payload.text
                }
            }
            allSockets.forEach((x : allSocketsType) => {
                if(x.roomId == roomId){
                    x.socket.send(JSON.stringify(sendMessage))
                }
            }) 
        }
    })

})

