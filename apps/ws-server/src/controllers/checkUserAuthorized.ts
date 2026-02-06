import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "../config/config.js";
export default function checkUserAuthorized(url : string) : string | null {
    const queryParam = new URLSearchParams(url.split("?")[1]);
    const token = queryParam.get('token') || "";
    try{
        const decoded = jwt.verify(token , JWT_SECRET);
        return (decoded as JwtPayload).username;
    }catch(e){
        return null;
    }
}