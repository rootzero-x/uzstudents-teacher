import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTeacherAuth } from "../../state/TeacherAuthContext";

export default function LoginPage() {
  const { login } = useTeacherAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = useMemo(() => loc.state?.from || "/", [loc.state]);

  const [form, setForm] = useState({ login: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const l = form.login.trim();
    const p = form.password;

    if (!l || !p) {
      setErr("Login va password majburiy.");
      return;
    }

    setLoading(true);
    try {
      await login(l, p);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-3xl items-center justify-center">
      <section className="w-full">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10 shadow-[0_10px_30px_rgba(249,115,22,0.25)]">
            <span className="text-xl font-extrabold text-orange-200">U</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-slate-200">
              UzStudents
            </div>
            <div className="text-xs text-slate-400">Teacher Panel • Login</div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-10">
          <h1 className="text-balance text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-200 bg-clip-text text-transparent">
              Teacher
            </span>{" "}
            hisobiga kirish
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-300 sm:text-base">
            Teacher uchun register yo‘q. Login/parolni admin beradi.
          </p>

          {err && (
            <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Login
              </label>
              <input
                value={form.login}
                onChange={(e) =>
                  setForm((s) => ({ ...s, login: e.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-orange-500/30"
                placeholder="teacher_login"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="flex gap-2">
                <input
                  value={form.password}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, password: e.target.value }))
                  }
                  type={show ? "text" : "password"}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-orange-500/30"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="shrink-0 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07]"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
            >
              {loading ? "Kirilmoqda..." : "Login"}
            </button>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-slate-300">
              Admin bilan bog‘laning: login/parol yoki reset link olish uchun.
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
