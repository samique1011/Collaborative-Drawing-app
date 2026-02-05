import z from "zod";
export const signinSchema = z.object({
    username : z.string() , 
    password : z.string().min(5)
})
export const signUpSchema = z.object({  
    username : z.string() ,
    password : z.string().min(5)
})
export const userAuthenticationSchema = z.object({
    token : z.string()  ,
    roomName : z.string()
})

export const JWT_SECRET = "123123123"