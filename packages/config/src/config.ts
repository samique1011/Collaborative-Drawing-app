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

export const tokenSchema = z.object({
  token : z.string()
})

export const saveChatSchema = z.object({
  roomName : z.string() , 
  text : z.string(),
  token : z.string()
})

export const shapesSchema = z.object({
  roomName : z.string() , 
  message : z.string()
})

export const ChatMessageInputType = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join-room"),
    payload: z.object({
      roomId: z.string(),
    }),
  }),

  z.object({
    type: z.literal("chat"),
    payload: z.object({
      username : z.string(),
      text: z.string(),
    }),
  }),

  z.object({
    type: z.literal("info"),
    payload: z.object({
      info: z.string(),
    }),
  }),

  z.object({
    type: z.literal("leave-room"),
    payload: z.object({
        roomId : z.string()
    }), // or whatever you want here
  }),
]);

export const JWT_SECRET = "123123123"