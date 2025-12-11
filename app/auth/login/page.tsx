"use client";

import { Suspense, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Zap } from "lucide-react";
import Image from "next/image";
// import Link from "next/link";

const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.";

const IMAGES = ["/images/image-background.png", "/images/image-mobile.png"];

function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();
  const { update } = useSession();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah.");
        return;
      }

      await update();

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white flex-col-reverse md:flex-row">
      {/* Left: Login Form */}
      <div className="flex z-20 bg-white rounded-t-4xl w-full md:w-1/2 flex-col items-center justify-center px-6 py-10 md:rounded-tl-[60px] md:rounded-bl-[60px]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-widest text-yellow-600">
            PSAK-413
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            Sign In
          </h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 w-full max-w-sm">
          <div>
            <label className="mb-2 block text-sm text-yellow-800">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-yellow-300 bg-white px-3 py-3 text-sm text-yellow-900 placeholder:text-yellow-500 outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-500" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-yellow-800">
              Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-yellow-300 bg-white px-3 py-3 pr-10 text-sm text-yellow-900 placeholder:text-yellow-500 outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="button"
                onClick={() => setShow((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-yellow-500 hover:bg-yellow-100"
                aria-label="Toggle password"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-500" />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Masuk</span>
              </>
            )}
          </button>

          {/* <p className="text-center text-xs text-yellow-600">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-yellow-600 underline-offset-4 hover:underline"
            >
              Daftar sekarang
            </Link>
          </p> */}
        </form>
      </div>

      {/* Right: Hero Image */}
      <div className="md:flex hidden w-1/2 items-center justify-center relative">
        <div className="absolute inset-0">
          <Image
            src={IMAGES[0]}
            alt="auth-hero"
            layout="fill"
            objectFit="cover"
            className="rounded-tl-full rounded-bl-full"
          />
        </div>
      </div>

      {/* Mobile Image: Full-width */}
      <div className="md:hidden w-full">
        <Image src={IMAGES[1]} alt="auth-hero" fill />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
          Loading…
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}