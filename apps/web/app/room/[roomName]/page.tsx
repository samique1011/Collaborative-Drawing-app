import axios from "axios";
import { notFound } from "next/navigation";
import RoomClient from "../../Components/RoomClient";
type paramsProps = {
    params : {
        roomName : string
    }
}
export default async function RoomGuardPage({params} : paramsProps){
    try{
        const searchedParam = await params;
        const roomName = searchedParam.roomName;
        const result = await axios.post("http://localhost:4000/checkRoomExists" , {
            roomName : roomName
        })
        console.log(result);

        console.log(searchedParam);
        return <div>
            <RoomClient roomName={roomName} />
        </div>
    }catch(e){
        notFound();
    }
    
}