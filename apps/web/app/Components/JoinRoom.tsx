"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function JoinRoom() {
  const router = useRouter();
  const roomInputRef = useRef<HTMLInputElement>(null);
  async function onClickHandler() {
    const roomName = roomInputRef?.current?.value;
    axios
      .post(
        "http://localhost:4000/join-room",
        {
          roomName: roomName,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        },
      )
      .then((res) => {
        alert(res.data.msg);
        setTimeout(() => {
            router.push("/room/" + roomName);
        } , 3000)
      })
      .catch((e) => {
        alert(e.response.data.msg);
      });
  }
  return (
    <div className="w-full flex flex-col gap-4 ">
      <div className="flex flex-col gap-1 ">
        <label className="text-sm font-medium text-slate-600">Room Name</label>
        <input
          type="text"
          ref={roomInputRef}
          placeholder="Enter room name"
          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm
                   focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                   placeholder:text-slate-400"
        />
      </div>

      <button
        onClick={() => {
          onClickHandler();
        }}
        className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold
                 hover:bg-slate-800 active:scale-[0.98] transition"
      >
        Join Room
      </button>
    </div>
  );
}
