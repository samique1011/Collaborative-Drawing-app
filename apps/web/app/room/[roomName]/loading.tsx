export default function Loading() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:150ms]" />
        <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:300ms]" />
      </div>

      <p className="mt-6 text-slate-600 text-sm tracking-wide">
        Loading..
      </p>
    </div>
  );
}
