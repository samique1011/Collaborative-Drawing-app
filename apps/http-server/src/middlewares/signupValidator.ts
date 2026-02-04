import type { Request , Response , NextFunction } from "express";
import { signUpSchema } from "@repo/config/config";
export default function signupValidator(req : Request , res : Response , next : NextFunction){
    const result = signUpSchema.safeParse(req.body);
    if(result.success)  next();
    else    res.status(404).json({
        msg : "Invalid input structure"
    })
}