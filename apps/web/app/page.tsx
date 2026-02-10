"use client";
import { useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


export default function Home(){
  const createRoomValueRef = useRef<HTMLInputElement>(null);
  const joinRoomValueRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function createRoomHandler(){
    const roomName = createRoomValueRef.current?.value;
    axios.post("http://localhost:4000/create-room" , {
      roomName : roomName , 
    } , {
      headers : {
        Authorization : localStorage.getItem('token')
      }
    }).then(() => {
      router.push("/room/" + roomName);
    }).catch((e) => {
      console.log(e.response.data)
    })

    // console.log(response);
  }

  return <div>
    <input type="text" ref={createRoomValueRef}></input>
    <button
      onClick={() => {
        createRoomHandler()
      }}
    >Create room</button>

    <input type="text" ref={joinRoomValueRef}></input>
    <button
      onClick={() => {}}
    >Join room</button>
  </div>
}