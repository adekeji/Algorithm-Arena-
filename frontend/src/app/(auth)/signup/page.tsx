"use client";

import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-arena-purple/8 blur-[100px] animate-float" />
        <div className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] rounded-full bg-arena-cyan/6 blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <AuthForm mode="signup" />
    </div>
  );
}
