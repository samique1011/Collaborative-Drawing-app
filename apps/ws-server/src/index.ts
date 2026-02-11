import {WebSocketServer} from "ws";
import type { WebSocket } from "ws";
import checkUserAuthorized from "./controllers/checkUserAuthorized.js";
import checkUserPresent from "./controllers/checkUserPresent.js";
import { ChatMessageInputType } from "@repo/config/config";
import axios from "axios";
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
        username : string
        text: string;
      };
    };
const ws = new WebSocketServer({port : 8080});
let allSockets : allSocketsType[] = [];

ws.on('connection' , function connection(socket , request){
    try{
    console.log(allSockets);
    const url = request.url;
    if(!url)    return;

    console.log(url);
    const queryParam = new URLSearchParams(url.split("?")[1]);
    const token = queryParam.get('token') || "";

    const checkAuthorized = checkUserAuthorized(url);
    console.log(checkAuthorized);
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
    
    socket.on('message' ,  async (msg) => {
        const result = ChatMessageInputType.safeParse(JSON.parse(msg.toString()));
        if(!result.success){
            socket.send(JSON.stringify({
                type : "info" , 
                payload : {
                    info : "WRONG_MESSAGE_TYPE"
                }
            }))
            return;
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
                return
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
                        username : username ,
                        text : `${username} joined the room`
                    }
                }

                await axios.post("http://localhost:4000/save-chats" , {
                    roomName : message.payload.roomId ,
                    text : `${username} joined the room`
                } , {
                    headers : {
                        Authorization : token
                    }
                })


                allSockets.forEach((obj : allSocketsType) => {
                    if(obj.roomId == message.payload.roomId && obj.socket !== socket){
                        obj.socket.send(JSON.stringify(sendMessage))
                    }
                })
            }
        }
        else if(message.type == 'leave-room'){
            const roomId = message.payload.roomId;

            await axios.post("http://localhost:4000/save-chats" , {
                    roomName : message.payload.roomId ,
                    text : `${username} just left the room`
                } , {
                    headers : {
                        Authorization : token
                    }
            })
            
            allSockets.forEach((x : allSocketsType) => {
                if(x.roomId == roomId && x.socket !== socket){
                    x.socket.send(JSON.stringify({
                    type : "chat" ,
                    payload : {
                        roomId : message.payload.roomId,
                        username : username,
                        text : `${username} just left the room`
                    }
                    }))
                }
                
            })

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
            }

            let sendMessage : ChatMessage = {
                type : "chat" , 
                payload : {
                    username : username ,
                    text : message.payload.text
                }
            }

            await axios.post("http://localhost:4000/save-chats" , {
                    roomName : roomId ,
                    text : message.payload.text
                } , {
                    headers : {
                        Authorization : token
                    }
                })
            allSockets.forEach((x : allSocketsType) => {
                if(x.roomId == roomId){
                    x.socket.send(JSON.stringify(sendMessage))
                }
            }) 
            
        }
    })
    }catch(e){
        console.log(e);
    }

})

