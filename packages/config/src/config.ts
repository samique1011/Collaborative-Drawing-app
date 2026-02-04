import z from "zod";
export const signinSchema = z.object({
    email : z.string().email() , 
    password : z.string().min(5)
})
export const signUpSchema = z.object({  
    username : z.string() ,
    email : z.string().email() , 
    password : z.string().min(5)
})
export const userAuthenticationSchema = z.object({
    token : z.string()
})

export const JWT_SECRET = "123123123"