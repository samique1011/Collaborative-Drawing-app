import express from "express";
import type { Request , Response , NextFunction } from "express";
import cors from "cors"
import signupValidator from "./middlewares/signupValidator";
import signinValidator from "./middlewares/signinValidator";
import userAuthentication from "./middlewares/userAuthentication";
import prisma from "@repo/db/db";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/config/config";

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

app.post("/signin" , signinValidator , async (req : Request , res : Response , next : NextFunction) => {
    const {username , password} = req.body;
    try{
        const user = await prisma.user.findUnique({
            where : {
                username : username
            }, select : {
                id : true ,
                password : true
            }
        })
        
        if(user){
            const passwordCompareSuccess = await bcrypt.compare(password , user.password);
            if(passwordCompareSuccess){
                const token = jwt.sign({username : username , userId : user.id} , JWT_SECRET);
                res.status(200).json({
                    token : token
                })
            }
            else    throw new Error("WRONG_CREDENTIALS");
        }
        else{
            throw new Error("USER_WITH_SUCH_USERNAME_DOESNT_EXIST");
        }
    }catch(error){
        //@ts-ignore
        const errorMsg = error.message;
        res.status(404).json({
            msg : errorMsg
        })
    }
})

app.post("/create-room" , userAuthentication , async (req : Request , res : Response , next : NextFunction) => {
    try{
        //@ts-ignore
        const userId = req.userId;
        //@ts-ignore
        const username = req.username;
        const roomName = req.body.roomName;
        const isRoomPresent = await prisma.room.findUnique({
            where : {
                name : roomName
            }
        })

        if(!isRoomPresent){
            const roomCreated = await prisma.room.create({
                data : {
                name : roomName , 
                userId : userId
                } , select : {
                    id : true
                }
            })
            if(roomCreated){
                await prisma.chat.create({
                    data : {
                        roomId : roomCreated.id ,
                        message : `${username} created this room`,
                        userId : userId
                    }
                })
                res.status(200).json({
                    msg : "Room created successfully" , 
                    output : roomCreated
                })
            }
            else{
                throw new Error("ERROR_IN_CREATING_ROOM")
            }
        }else   throw new Error("ROOM_ALREADY_EXISTS");
        
    }catch(e){
        //@ts-ignore
        const errorMsg = e.message;
        res.status(404).json({
            msg : errorMsg
        })
    }
})

app.delete("/delete-room" , userAuthentication , async(req : Request , res  :Response) => {
    try{
        //@ts-ignore
        const userId = req.userId;
        //@ts-ignore
        const username = req.username;
        const roomName = req.body.roomName
        const isRoomPresent = await prisma.room.findUnique({
            where : {
                name : roomName
            } , select : {
                id : true
            }
        })

        if(isRoomPresent){
            await prisma.chat.deleteMany({
                where : {
                    roomId : isRoomPresent.id
                }
            })
            await prisma.room.delete({
                where : {
                    id : isRoomPresent.id
                }
            })
            res.status(200).json({
                msg : "Room deleted successfully"
            })
        }else   throw new Error("ROOM_DOESN'T EXIST")
    }catch(e){
        //@ts-ignore
        const errorMsg = e.message;
        res.status(403).json({
            msg : errorMsg
        })
    }
})

app.get("/get-chats/:roomId" , userAuthentication , async(req : Request<{roomId : string}> , res : Response) => {
    try{
        const allChats = prisma.chat.findMany({
            where : {
                roomId : Number(req.params.roomId)
            } , 
            select : {
                id : true , 
                userId : true , 
                message : true
            }
        })
        res.status(200).json({
            chats : allChats
        })
    }catch(e){
        res.status(404).json({
            msg : "Failed to get chats"
        })
    }
})

app.listen(port , () => {
    console.log("App is listening on port" + port);
})