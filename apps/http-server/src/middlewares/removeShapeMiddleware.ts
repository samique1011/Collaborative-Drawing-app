import type { Request , Response , NextFunction } from "express";
import { removeShapeSchema } from "@repo/config/config";
export default function removeShapeMiddleware(req : Request , res : Response , next : NextFunction){
    const result = removeShapeSchema.safeParse(req.body);
    if(result.success){
        next();
    }
    else{
        res.status(403).json({
            msg: "Wrong body request for removing a shape"
        })
    }
}