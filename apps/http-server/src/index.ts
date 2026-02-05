import express from "express";
import type { Request , Response , NextFunction } from "express";
import cors from "cors"
import signupValidator from "./middlewares/signupValidator";
import signinValidator from "./middlewares/signinValidator";
import userAuthentication from "./middlewares/userAuthentication";
import prisma from "@repo/db/db";
import bcrypt from "bcrypt"

const app = express();
app.use(express.json());
app.use(cors());
const port = 4000

app.post("/signup" , signupValidator , async (req : Request , res : Response) => {
    try{
        const {username , password} = req.body;
        const user = await prisma.user.findUnique({
            where : {username} , 
            select : {
                id : true , 
                username : true
            }
        })

        if(user){
            res.status(409).json({
                msg : "User with such username already exists"
            })
            return
        }
        else{
            //hash the password
            const hashedPassword = await bcrypt.hash(password , 5);
            await prisma.user.create({
                data : {
                    username : username , 
                    password : hashedPassword
                }
            })
            res.status(200).json({
                msg : "User registered Successfully"
            })
        }
    }catch(e){
        res.status(500).json({
            msg : "Registration error"
        })
    } 
})

app.post("/signin" , signinValidator , (req : Request , res : Response , next : NextFunction) => {
    //put username as well as userId into the jwtToken
})

app.post("/create-room" , userAuthentication , (req : Request , res : Response , next : NextFunction) => {

})

app.listen(port , () => {
    console.log("App is listening on port" + port);
})