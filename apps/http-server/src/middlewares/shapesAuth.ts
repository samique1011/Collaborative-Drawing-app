import type { Request , Response , NextFunction } from "express";
import { shapesSchema } from "@repo/config/config";
export default function ShapesAuth(req : Request , res : Response , next : NextFunction){
    const result = shapesSchema.safeParse(req.body);
    if(result.success){
        next();
    }
    else    res.status(403).json({
                msg : "BAD_INPUT_FORMAT"
            })
}