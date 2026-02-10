import { MutableRefObject } from "react";
interface ChatBubbleProps {
  username: string;
  text: string;
  usernameRef : MutableRefObject<string>
}

export default function ChatBubble({ username, text , usernameRef }: ChatBubbleProps) {
  return (
    <div className={usernameRef.current == username ? "w-full flex justify-start m-2 " : "w-full flex justify-end mb-2"}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow ${usernameRef.current == username ? "bg-green-300" : "bg-white"}`}>
        <div className={`text-xs font-semibold text-slate-600 mb-1`}>
          {usernameRef.current == username ? "me" : username}
        </div>
        <div className="text-sm text-slate-900 break-words">
          {text}
        </div>
      </div>
    </div>
  );
}
