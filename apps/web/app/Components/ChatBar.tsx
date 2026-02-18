"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ChatBubble from "./ChatBubble";
interface ChatBarProps {
  className: string;
  socketRef: MutableRefObject<WebSocket | null>;
  roomName: string;
  usernameRef: MutableRefObject<string>;
}
interface Messages {
  username: string;
  text: string;
}
export default function ChatBar(props: ChatBarProps) {
  const [messages, setMessages] = useState<Messages[]>([]);
  const router = useRouter();
  const typedMsgRef = useRef<HTMLInputElement>(null);

  function sendMsgHandler() {
    const msg = typedMsgRef.current?.value;
    if (msg == "") {
      alert("msg cannot be empty");
    } else {
      props.socketRef.current?.send(
        JSON.stringify({
          type: "chat",
          payload: {
            username: "",
            text: msg,
          },
        }),
      );
    }
  }

  function JoinRoomHandler(socket: WebSocket) {
    socket.send(
      JSON.stringify({
        type: "join-room",
        payload: {
          roomId: props.roomName,
        },
      }),
    );
  }

  async function getRoomChats() {
    console.log(props.roomName);
    try {
      const result = await axios.post(
        "http://localhost:4000/get-chats/" + props.roomName,
        {
          roomName: props.roomName,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        },
      );
      let previousMsges: Messages[] = [];
      result.data.chats.forEach((x: any) => {
        previousMsges.push({
          username: x.user.username,
          text: x.message,
        });
      });

      setMessages(previousMsges);
      console.log(previousMsges);
    } catch (e: any) {
      console.log(e.response);
    }
  }

  useEffect(() => {
    console.log("My username is", props.usernameRef.current);
    const socket = props.socketRef.current;
    function handleOnClose() {
      alert("SOCKET_CLOSED");
      router.push("/home");
    }
    function handleOnMessage(msg: MessageEvent) {
      const parsedMessage = JSON.parse(msg.data);
      console.log(parsedMessage);
      if (parsedMessage.type === "chat") {
        setMessages((x) => [...x, parsedMessage.payload]);
      }
    }
    const initSocket = async () => {
      await getRoomChats();
      if (!socket) {
        return;
      }
      socket.addEventListener("close", handleOnClose);
      socket.addEventListener("message", handleOnMessage);
      console.log("socket state", socket.readyState);

      if (socket.readyState === WebSocket.OPEN) {
        JoinRoomHandler(socket);
      } else {
        socket.addEventListener("open", () => JoinRoomHandler(socket), {
          once: true,
        });
      }
    };
    initSocket();
    return () => {
      socket?.removeEventListener("close", handleOnClose);
      socket?.removeEventListener("message", handleOnMessage);
    };
  }, []);

  return (
    <div className={`${props.className} flex flex-col h-full`}>
      {/* Chat messages (scrollable) */}
      <div className="flex-1 w-full bg-gray-300 overflow-y-auto px-2 py-3">
        {messages.map((val: Messages, idx: number) => {
          return (
            <ChatBubble
              key={idx}
              username={val.username}
              text={val.text}
              usernameRef={props.usernameRef}
            />
          );
        })}
      </div>

      {/* Input bar (fixed) */}
      <div className="p-3 border-t bg-white h-16 flex items-center">
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 text-sm rounded-full border
                   focus:outline-none focus:ring-2 focus:ring-slate-400"
            ref={typedMsgRef}
          />
          <button
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium
                   hover:bg-slate-800 active:scale-95 transition"
            onClick={sendMsgHandler}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
