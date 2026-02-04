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
            const result = userAuthenticationSchema.safeParse(req.headers.authorization);
            if(!result.success){
                res.status(403).json({
                    msg : "Wrong token provided in the header"
                })
                return
            }
            const token = req.headers.authorization;
            const decoded = jwt.verify(token , JWT_SECRET);
            //@ts-ignore
            req.userId = decoded.userId;
            next();
        }  
    }catch(e){
        res.status(404).json({
            msg : "Wrong Token"
        })
    } 
}