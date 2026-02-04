import {WebSocketServer} from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "./config/config.js";

const ws = new WebSocketServer({port : 8080});
let allSockets = [];

ws.on('connection' , function connection(socket , request){
    const url = request.url;
    if(!url)    return;

    try{
        const queryParam = new URLSearchParams(url.split("?")[1]);
        const token = queryParam.get('token') || "";
        const decoded = jwt.verify(token , JWT_SECRET);

        if(!(decoded as JwtPayload).userId){
            socket.send("Not authorized to enter into this room");
            socket.close();
            return;
        }
    }catch(e){
        socket.send("Wrong token");
        socket.close();
    }
})

