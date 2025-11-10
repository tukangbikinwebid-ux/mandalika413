"use client";

import { Suspense, useState } from "react";
import AuthShell from "@/components/layout/auth-layout";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const IMAGES = [
  "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimtllao8hYidk98PawCcYsQeGWzDAZKoTE27Uj",
  "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimDSp3XSfhL7C3cYxqIiQbSMGODFm6XR0TneJN",
  "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimgQsYrseQOog5Zk3ISM2KXlYf9umeLx7F0A8q",
];

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  referral_code?: string;
};

function RegisterContent() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("Silakan setujui Syarat & Ketentuan serta Kebijakan Pribadi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }

    const payload: RegisterPayload = {
      name: name.trim(),
      email: email.trim(),
      password,
      password_confirmation: confirm,
      ...(referral.trim() ? { referral_code: referral.trim() } : {}),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        type ErrorResponse = {
          message?: string;
          errors?: Record<string, string[] | string>;
        };
        const j: ErrorResponse = await res
          .json()
          .catch(() => ({} as ErrorResponse));
        const merged = j?.errors
          ? Object.values(j.errors).flat().join(", ")
          : j?.message;
        throw new Error(merged || "Registrasi gagal.");
      }

      // sukses → arahkan ke halaman login
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      images={IMAGES}
      title="Daftar"
      brand="PSAK-413"
      slideIntervalMs={3000}
    >
      <p className="mb-6 text-white/80">
        Masukkan informasi pendaftaran yang valid.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama lengkap */}
        <div>
          <label className="mb-2 block text-sm text-white/80">
            Nama lengkap
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Nama lengkap"
              required
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-rose-500/60"
            />
            <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm text-white/80">
            Alamat email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="Alamat email"
              required
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-rose-500/60"
            />
            <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          </div>
        </div>

        {/* Referral code (opsional) */}
        <div>
          <label className="mb-2 block text-sm text-white/80">
            Kode referral <span className="opacity-60">(opsional)</span>
          </label>
          <input
            type="text"
            value={referral}
            onChange={(e) => setReferral(e.currentTarget.value)}
            placeholder="Contoh: 17569669504B79BFF5C9"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-rose-500/60"
          />
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-white/80">
              Kata sandi
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="       Kata sandi"
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 pr-10 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-rose-500/60"
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 hover:bg-white/10"
                aria-label="Toggle password"
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">
              Konfirmasi kata sandi
            </label>
            <div className="relative">
              <input
                type={showConf ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.currentTarget.value)}
                placeholder="      Konfirmasi kata sandi"
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 pr-10 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-rose-500/60"
              />
              <button
                type="button"
                onClick={() => setShowConf((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 hover:bg-white/10"
                aria-label="Toggle confirm password"
              >
                {showConf ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            </div>
          </div>
        </div>

        {/* Agree */}
        <label className="mt-2 flex items-start gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.currentTarget.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent accent-rose-600"
          />
          <span>
            Saya setuju dengan{" "}
            <Link
              href="/terms"
              className="text-rose-300 underline-offset-4 hover:underline"
            >
              Syarat dan Ketentuan
            </Link>{" "}
            dan{" "}
            <Link
              href="/privacy"
              className="text-rose-300 underline-offset-4 hover:underline"
            >
              Kebijakan Pribadi
            </Link>
            .
          </span>
        </label>

        {/* Alerts */}
        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              <span>Daftar</span>
            </>
          )}
        </button>

        <p className="text-center text-sm text-white/70">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-rose-300 underline-offset-4 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#141417] text-white">
          Loading…
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
