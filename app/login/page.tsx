"use client";

import Image from "next/image";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "@/app/_server/action";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("Login successful");
      router.push("/");
    } else if (state?.success === false) {
      toast.error(state.error || "Invalid credentials");
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden bg-bg-primary">
      <div className="w-full max-w-md relative z-10 space-y-10">
        <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="group relative size-22 sm:size-18 p-1 rounded-full overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md shadow-2xl transition-all duration-500 hover:border-white/40 hover:scale-105 active:scale-95 flex items-center justify-center mt-0 sm:-mt-5">
            <div className="absolute inset-0 bg-linear-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -inset-full bg-linear-to-tr from-transparent via-white/5 to-transparent rotate-45 translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative size-full">
              <Image
                src="/logo.avif"
                alt="Shabuj Global Logo"
                fill
                sizes="100px"
                className="object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)] transition-transform duration-500 group-hover:scale-110 brightness-150 contrast-130"
                priority
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold tracking-tight text-white/90 drop-shadow-lg leading-tight">
              Welcome to Shabuj Global
            </h1>
          </div>
        </div>

        <div className="bg-primary/30 backdrop-blur-md rounded-2xl overflow-hidden shadow border border-white/10 p-6">
          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="example@shabujglobal.com"
                  className="flex h-12 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/90 shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="flex h-12 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/90 shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-white/90 hover:bg-primary/90 h-12 w-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] cursor-pointer"
            >
              {isPending ? "Signing in..." : "Sign in securely"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
