"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import checkUserAuthenticated from "../../../controllers/checkUserAuthenticated";
import NavBar from "../../Components/NavBar";
import CreateRoom from "../../Components/CreateRoom";
import JoinRoom from "../../Components/JoinRoom";
import Image from "next/image";

type swtichType = "create_room" | "join_room";

export default function HomePage() {
  const router = useRouter();
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [swtich , setSwitch] = useState<swtichType>("create_room");

  async function checkUser() {
    const token = localStorage.getItem("token") || "";
    const result = await checkUserAuthenticated(token);
    if (result) {
      setUserLoggedIn(true);
    }
  }

  //going to check if the user is signed in or not
  useEffect(() => {
    checkUser();
  }, []);

  return (
    <div className="max-h-screen min-h-screen overflow-hidden">
      <NavBar userLoggedIn={userLoggedIn} setUserLoggedIn={setUserLoggedIn} />
      <div className="w-full min-h-screen flex items-center justify-center relative ">
        <div className="absolute inset-0 ">
            <Image src={"/Gemini_Generated_Image_iaw8stiaw8stiaw8.png"}
            fill
            alt=""
            quality={100}
            className="object-cover opacity-20"
            priority />
        </div>
        <div className="w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden h-[50%] z-10">
        <div>
          <div className="flex border-b ">
            <button className={`flex-1 py-3 text-sm font-semibold ${swtich == "create_room" ? "bg-slate-900 text-white" : "bg-white text-slate-900"} `} onClick={() => setSwitch("create_room")}>
              Create Room
            </button>
            <button className={`flex-1 py-3 text-sm font-semibold ${swtich == "join_room" ? "bg-slate-900 text-white" : "bg-white text-slate-900"} `} onClick={() => setSwitch("join_room")}>
              Join Room
            </button>
          </div>
          <div className="p-6 space h-[82%] flex  items-center justify-center ">
            {swtich == "create_room" ? <CreateRoom/> : <JoinRoom/>}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
