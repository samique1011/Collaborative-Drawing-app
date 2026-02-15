import express from "express";
import type { Request , Response , NextFunction } from "express";
import cors from "cors"
import signupValidator from "./middlewares/signupValidator";
import signinValidator from "./middlewares/signinValidator";
import userAuthentication from "./middlewares/userAuthentication";
import prisma from "@repo/db/db";
import bcrypt from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET , tokenSchema } from "@repo/config/config";
import saveChatsMiddleware from "./middlewares/saveChatsMiddleware";
import ShapesAuth from "./middlewares/shapesAuth";

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

        console.log(user);
        
        if(user){
            const passwordCompareSuccess = await bcrypt.compare(password , user.password);
            console.log(passwordCompareSuccess);
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

app.post("/join-room" , userAuthentication , async (req : Request , res : Response) => {
    try{
        const roomName = req.body.roomName;
        const roomExists = await prisma.room.findFirst({
            where : {
                name : roomName
            } , select : {
                id : true
            }
        })
        if(!roomExists) throw new Error("ROOM_WITH_SUCH_NAME_DOESN'T_EXIST");
        else{
            //@ts-ignore
            const userId = req.userId;
            //@ts-ignore
            const username = req.username;
            //@ts-ignore
            console.log("USer is" + req.username);
            await prisma.chat.create({
                data : {
                    roomId : roomExists.id , 
                    message : `${username} joined the room` , 
                    userId : parseInt(userId)
                }
            })
            res.status(200).json({
                msg : "Room_joined_successfully_redirecting_in_3_seconds"
            })
        }
    }catch(e){
        //@ts-ignore
        const msg = e.message;
        console.log(e);
        res.status(403).json({
            msg : msg
        })
    }
})

app.post("/get-chats/:roomName" , userAuthentication , async(req : Request<{roomName : string}> , res : Response) => {
    try{
        const allChats = await prisma.room.findFirst({
            where : {
                name : req.params.roomName
            } , 
            select : {
                id : true,
                chat : {
                    select : {
                        id : true , 
                        userId : true , 
                        message : true , 
                        user : {
                            select : {
                                username : true
                            }
                        }
                    } , 
                    take : 50
                } ,
                
            }
        })
    
        res.status(200).json({
            chats : allChats?.chat
        })
    }catch(e){
        res.status(404).json({
            msg : "Failed to get chats"
        })
    }
})

app.post("/checkUserAuthenticated" , (req : Request , res : Response) => {
    try{
        const result = tokenSchema.safeParse(req.body);
        if(!result.success) throw new Error("Invalid_request_body");
        else{
            const token = req.body.token;
            const decoded = jwt.verify(token , JWT_SECRET);
            res.status(200).json({
                msg : (decoded as JwtPayload).username
            })
        }
    }catch(e){
        //@ts-ignore
        const error = e.message;
        res.status(403).json({
            msg : error
        })
    }
})

app.post("/checkRoomExists" , async (req : Request , res : Response) => {
    const roomName = req.body.roomName;
    console.log(roomName);
    const result = await prisma.room.findFirst({
        where : {
            name : roomName
        }
    })

    console.log(result);

    if(result){
        res.status(200).json({
            msg : "Exists"
        })
    }
    else{
        res.status(403).json({
            msg : "Doesn't Exists"
        })
    }
})

app.post("/save-chats" , saveChatsMiddleware , async(req : Request , res : Response) => {
    const roomName = req.body.roomName;
    const text = req.body.text;
    //@ts-ignore
    const userId = req.userId

    try{
        const roomId = await prisma.room.findFirst({
            where : {
                name : roomName
            } , select : {
                id : true
            }
        })

        if(!roomId) throw new Error("NO_ROOM_EXISTS");

        await prisma.chat.create({
            data : {
                roomId : roomId?.id,
                message : text ,
                userId : parseInt(userId)
            }
        })

        res.status(200).json({
            msg : "Chat_inserted"
        })
    }catch(e : any){
        res.status(403).json({
            msg : e.message
        })
    }
})

app.post("/save-shapes" , userAuthentication , ShapesAuth , async (req : Request , res : Response) => {
    try{
        //@ts-ignore
        const userId = req.userId;
        const message = req.body.message;
        const room = await prisma.room.findFirst({
            where : {
                name : req.body.roomName
            } , 
            select : {
                id : true
            }
        })

        if(!room)   throw new Error("ROOM_DOESN'T EXIST");

        await prisma.shapes.create({
            data : {
                roomId : room?.id ,
                userId : userId ,
                message : message
            }
        })

        res.status(200).json({
            msg : "Shape saved successfully"
        })
    }catch(e : any){
        res.status(403).json({
            msg : e.message
        })
    }
})

app.post("/get-shapes" , userAuthentication , async (req : Request , res : Response) => {
    try{
        console.log("given the roomName " , req.body.roomName);
        const room = await prisma.room.findFirst({
            where : {
                name : req.body.roomName
            } , 
            select : {
                id : true
            }
        })

        if(!room)   throw new Error("ROOM_DOESN'T EXIST");

        const getShapes = await prisma.shapes.findMany({
            where : {
                roomId : room.id
            } ,
            select : {
                message : true
            }
        })

        res.status(200).json({
            msg : getShapes
        })
    }catch(e : any){
        res.status(403).json({
            msg : e.message
        })
    }
})

app.listen(port , () => {
    console.log("App is listening on port" + port);
})