"use client";

import { useRouter } from "next/navigation";

interface NavBarProps {
  userLoggedIn: boolean;
  setUserLoggedIn : (value : boolean) => void
}

export default function NavBar( props : NavBarProps) {
  const router = useRouter();

  return (
    <nav className="w-full h-16 px-6 bg-white border-b flex items-center justify-between">
      <div
        className="text-lg font-semibold text-slate-800 cursor-pointer"
        onClick={() => router.push("/")}
      >
        Collaborative Drawing
      </div>

      <div className="flex items-center gap-3">
        {!props.userLoggedIn ? (
          <>
            <button
              onClick={() => router.push("/auth/signin")}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition cursor-pointer"
            >
              Log in
            </button>

            <button
              onClick={() => router.push("/auth/signup")}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition cursor-pointer"
            >
              Sign up
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              localStorage.removeItem("token");
              props.setUserLoggedIn(false)
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 cursor-pointer transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
