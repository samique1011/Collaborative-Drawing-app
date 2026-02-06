import {WebSocketServer} from "ws";
import checkUserAuthorized from "./controllers/checkUserAuthorized.js";
interface allSocketsType {
    socket : WebSocket , 
    username : string , 
    roomId : string
}

const ws = new WebSocketServer({port : 8080});


let allSockets : allSocketsType[] = [];



ws.on('connection' , function connection(socket , request){
    const url = request.url;
    if(!url)    return;

    const checkAuthorized = checkUserAuthorized(url);
    if(!checkAuthorized){
        socket.send("YOU_AREN'T_AUTHORIZED");
        socket.close();
        return
    }
    const username = checkAuthorized;



})

