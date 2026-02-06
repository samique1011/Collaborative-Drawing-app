import z, { strictObject, string } from "zod";
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

export const ChatMessageInputType = z.object({
    type : z.enum(["join-room" , "info" , "chat" , "leave-room"]) , 
    payload : z.union([
        z.object({
            text : z.string()
        }) ,
        z.object({
            roomId : z.string()
        }) ,
        z.object({
            info : z.string()
        })
    ])
})

export const JWT_SECRET = "123123123"