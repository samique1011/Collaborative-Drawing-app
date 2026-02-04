import express from "express";
import type { Request , Response , NextFunction } from "express";
import cors from "cors"
import signupValidator from "./middlewares/signupValidator";
import signinValidator from "./middlewares/signinValidator";
import userAuthentication from "./middlewares/userAuthentication";

const app = express();
app.use(express.json());
app.use(cors());
const port = 4000

app.post("/signup" , signupValidator , (req : Request , res : Response) => {
    
})

app.post("/signin" , signinValidator , (req : Request , res : Response , next : NextFunction) => {
    //put username as well as userId into the jwtToken
})

app.post("/create-room" , userAuthentication , (req : Request , res : Response , next : NextFunction) => {

})

app.listen(port , () => {
    console.log("App is listening on port" + port);
})