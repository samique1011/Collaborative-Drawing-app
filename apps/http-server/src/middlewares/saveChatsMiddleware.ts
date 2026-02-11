import type { Request , Response , NextFunction } from "express";
import { saveChatSchema } from "@repo/config/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/config/config";
export default function saveChatsMiddleware(req : Request , res : Response , next : NextFunction){
    try{
        if(!req.headers.authorization){
            throw new Error("EMPTY_TOKEN");
        }
        const reqBody = {
            roomName : req.body.roomName ,
            text : req.body.text ,
            token : req.headers.authorization
        }
        
        const result = saveChatSchema.safeParse(reqBody);
        if(result.success){
            const decoded = jwt.verify(req.headers.authorization , JWT_SECRET);
            //@ts-ignore
            req.userId = (decoded as JwtPayload).userId;
            //@ts-ignore
            req.username = (decoded as JwtPayload).username;
            next();
        }
        else    throw new Error("INVALID_REQUEST_BODY");
    }catch(e : any){
        const errorMessage = e.message;
        res.status(403).json({
            msg : errorMessage
        })
    }  
}