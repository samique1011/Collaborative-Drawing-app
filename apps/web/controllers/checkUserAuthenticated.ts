import axios from "axios";
export default async function checkUserAuthenticated(token : string){
    try{
        const result = await axios.post("http://localhost:4000/checkUserAuthenticated" , {
            token : token
        })
        return result.data.msg;
    }catch(e){
        return null
    }
}