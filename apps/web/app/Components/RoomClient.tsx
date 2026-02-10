"use client";

import { useEffect, useRef, useState } from "react";
import checkUserAuthenticated from "../../controllers/checkUserAuthenticated";
import { useRouter } from "next/navigation";
import CanvaComponent from "./CanvaComponent";
import ChatBar from "./ChatBar";

interface RoomClientProps {
  roomName: string;
}
type loader = "loading" | "not authenticated" | "authenticated";

export default function RoomClient(props: RoomClientProps) {
  const [pageState, setPageState] = useState<loader>("loading");
  const socketRef = useRef<WebSocket>(null);
  const router = useRouter();
  const username = useRef<string>("");
  const [isChatOpen , setChatOpen] = useState<boolean>(false);

  function leaveRoomHandler() {
    socketRef.current?.send(
      JSON.stringify({
        type: "leave-room",
        payload: {
          roomId: props.roomName,
        },
      }),
    );
  }

  async function checkUser() {
    const token = localStorage.getItem("token") || "";
    const result = await checkUserAuthenticated(token);
    if (result) {
      username.current = result;
      setPageState("authenticated");
      const ws = new WebSocket("ws://localhost:8080?token=" + token);
      socketRef.current = ws;
    } else {
      setPageState("not authenticated");
      alert("not loggedin yet");
      router.push("/auth/signin");
    }
  }

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-100">
      {pageState === "loading" && (
        <div className="flex-1 flex items-center justify-center text-slate-600">
          Loading...
        </div>
      )}

      {pageState === "authenticated" && (
        <>
          <div className="h-14 w-full px-6 flex items-center justify-between bg-white border-b shadow-sm">
            <div className="text-lg font-semibold text-slate-800">
              Room: <span className="text-slate-600">{props.roomName}</span>
            </div>

            <button
            className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 active:scale-95 transition"
            onClick={() => setChatOpen(x => !x)}
            >
                {isChatOpen ? "Close Chat" : "Open Chat"}
            </button>

            <button
              onClick={leaveRoomHandler}
              className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 active:scale-95 transition"
            >
              Leave Room
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <CanvaComponent className={`${isChatOpen ? "w-[75%]" : "w-screen"} h-full bg-white border-r
            transition-all duration-300 ease-in-out
            `} />

            <ChatBar
              className={` ${isChatOpen ? "w-[25%]" : "w-0"} h-full bg-slate-50
              transition-all duration-300 ease-in-out`}
              socketRef={socketRef}
              roomName={props.roomName}
              usernameRef={username}
            />
          </div>
        </>
      )}
    </div>
  );
}
