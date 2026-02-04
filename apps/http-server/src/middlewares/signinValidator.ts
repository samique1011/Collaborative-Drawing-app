import type { Request , Response , NextFunction } from "express";
import { signinSchema } from "@repo/config/config";
export default function signinValidator(req : Request , res : Response , next : NextFunction){
    const result = signinSchema.safeParse(req.body);
    if(result.success)  next();
    else    res.status(404).json({
        msg : "Invalid input structure"
    })
}