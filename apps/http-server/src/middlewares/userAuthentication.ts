import type { Request , Response , NextFunction } from "express";
import { userAuthenticationSchema , JWT_SECRET } from "@repo/config/config";
import jwt from "jsonwebtoken"

export default function userAuthentication(req : Request , res : Response , next : NextFunction){
    try{
        if(!req.headers.authorization){
            res.status(403).json({
                msg : "You are not authenticated"
            })
        }
        else{
            const reqBody = {
                token : req.headers.authorization , 
                roomName : req?.body?.roomName
            }
            console.log(reqBody);
            const result = userAuthenticationSchema.safeParse(reqBody);
            if(!result.success){
                res.status(403).json({
                    msg : "Wrong input format"
                })
                return
            }
            const token = req.headers.authorization;
            const decoded = jwt.verify(token , JWT_SECRET);
            //@ts-ignore
            console.log("Token after decoding = " + decoded.username);
            //@ts-ignore
            req.userId = decoded.userId;
            //@ts-ignore
            req.username = decoded.username;
            next();
        }  
    }catch(e){
        res.status(404).json({
            msg : "Wrong Token"
        })
    } 
}