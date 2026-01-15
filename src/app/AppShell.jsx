import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTeacherAuth } from "../state/TeacherAuthContext";

export default function AppShell() {
  const { teacher, logout } = useTeacherAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const isLogin = loc.pathname === "/login";

  const doLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/25 blur-[120px]" />
        <div className="absolute top-40 -left-32 h-[420px] w-[420px] rounded-full bg-amber-400/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <main className="relative mx-auto min-h-screen max-w-6xl px-6 py-10">
        {/* Top bar */}
        {!isLogin && (
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10 shadow-[0_10px_30px_rgba(249,115,22,0.25)]">
                <span className="text-xl font-extrabold text-orange-200">
                  U
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  UzStudents
                </div>
                <div className="text-xs text-slate-400">
                  Teacher Panel{" "}
                  {teacher?.full_name ? `• ${teacher.full_name}` : ""}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07]"
              >
                Dashboard
              </Link>
              <Link
                to="/groups"
                className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07]"
              >
                Groups
              </Link>
              <button
                onClick={doLogout}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)] transition hover:opacity-95 active:opacity-90"
              >
                Logout
              </button>
            </div>
          </header>
        )}

        <Outlet />

        <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} UzStudents</span>
          <span className="text-slate-400">
            teacher.uzstudents.uz • Premium build
          </span>
        </footer>
      </main>
    </div>
  );
}
