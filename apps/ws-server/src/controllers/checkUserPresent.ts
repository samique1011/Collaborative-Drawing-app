import type { WebSocket } from "ws"
interface allSocketsType {
    socket : WebSocket , 
    username : string , 
    roomId : string
}
export default function checkUserPresent(socket : WebSocket , allSockets : allSocketsType[]) : boolean{
    const userFound = allSockets.filter((obj : allSocketsType) =>{
        return obj.socket === socket
    })
    if(userFound.length > 0)   return true;
    else    return false;
}