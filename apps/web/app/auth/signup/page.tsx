"use client";
import { useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(Boolean);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function onSubmitHandler(e : any) {
    e.preventDefault();
        axios.post("http://localhost:4000/signup" , {
            username : usernameRef.current?.value , 
            password : passwordRef.current?.value
        }).then((res) => {
            console.log(res.data)
            router.push("./signin");
        }).catch((err) => {
            console.log(err.response.data)
        })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-200">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-300 shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-black">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-slate-600">Sign up to get started</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              ref={usernameRef}
              className="w-full rounded-lg bg-white border border-slate-300 px-4 py-2.5 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                ref={passwordRef}
                className="w-full rounded-lg bg-white border border-slate-300 px-4 py-2.5 pr-11 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-black focus:outline-none"
                onClick={() => {
                  setShowPassword((p) => !p);
                }}
              >
                <img src="../eye-password-hide.svg" alt="hide password" width={20} height={20} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-lg bg-black text-white font-medium py-2.5 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white"
            onClick={(e) => {onSubmitHandler(e)}}
          >
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?
          <a href="./signin" className="ml-1 text-black underline hover:no-underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
