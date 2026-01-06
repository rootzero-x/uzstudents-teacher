// src/App.jsx
const TERMS_URL = "https://uzstudents.uz/terms"; // xohlasang: "https://uzstudents.uz/uzstudents/terms"

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Orange glow */}
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/25 blur-[120px]" />
        {/* Amber glow */}
        <div className="absolute top-40 -left-32 h-[420px] w-[420px] rounded-full bg-amber-400/15 blur-[120px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <section className="w-full max-w-3xl">
          {/* Brand row */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10 shadow-[0_10px_30px_rgba(249,115,22,0.25)]">
              <span className="text-xl font-extrabold text-orange-200">U</span>
            </div>

            <div className="text-left">
              <div className="text-sm font-semibold text-slate-200">
                UzStudents
              </div>
              <div className="text-xs text-slate-400">Teacher Panel</div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-10">
            {/* Header */}
            <h1 className="text-balance text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                Teacher Panel
              </span>{" "}
              ishga tayyorlanmoqda
            </h1>

            <p className="mt-3 text-center text-sm leading-relaxed text-slate-300 sm:text-base">
              O‘qituvchilar uchun mo‘ljallangan boshqaruv paneli ustida faol ish
              olib borilmoqda. Tez orada kurslarni boshqarish, topshiriqlarni
              tekshirish va talabalar bilan ishlash imkoniyatlari to‘liq ishga
              tushiriladi.
            </p>

            {/* Status */}
            <div className="mt-8 rounded-2xl border border-orange-500/15 bg-slate-950/40 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-200">
                    🚧
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">
                      Ishlab chiqilmoqda
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      Panel yaqin vaqt ichida tayyor bo‘ladi.
                    </div>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-orange-300" />
                  Under development
                </span>
              </div>

              {/* Progress (visual) */}
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-orange-500 to-amber-300" />
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Build status: stable • UI polishing in progress
              </div>
            </div>

            {/* Notice */}
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm leading-relaxed text-slate-300">
                Agar siz hozircha{" "}
                <span className="font-semibold text-slate-100">o‘qituvchi</span>{" "}
                bo‘lmasangiz, UzStudents platformasidan foydalanish qoidalarini
                ko‘rib chiqing.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <a
                  href={TERMS_URL}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)] transition hover:opacity-95 active:opacity-90"
                >
                  Talablar sahifasi →
                </a>

                <a
                  href="https://uzstudents.uz"
                  className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07] active:bg-white/[0.05]"
                >
                  Student platforma
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
              <span>© {new Date().getFullYear()} UzStudents</span>
              <span className="text-slate-400">
                teacher.uzstudents.uz • Premium build
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
