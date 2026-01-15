import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { teacherApi } from "../../services/api/teacherApi";

function StatCard({ title, value, hint, to }) {
  const Card = (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:bg-white/[0.07]">
      <div className="text-xs font-semibold text-slate-300">{title}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-100">
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </div>
  );

  return to ? <Link to={to}>{Card}</Link> : Card;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [err, setErr] = useState("");

  const stats = useMemo(() => {
    const totalGroups = groups.length;
    const totalStudents = groups.reduce(
      (a, g) => a + (Number(g.students_count) || 0),
      0
    );
    const pending = groups.reduce(
      (a, g) => a + (Number(g.pending_count) || 0),
      0
    );
    return { totalGroups, totalStudents, pending };
  }, [groups]);

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await teacherApi.groups();
        setGroups(res.groups || []);
      } catch (e) {
        setErr(e?.message || "Failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-200 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Guruhlar, join requestlar va topshiriqlarni shu yerdan boshqarasiz.
        </p>
      </div>

      {err && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {err}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Guruhlar"
          value={loading ? "…" : stats.totalGroups}
          hint="Active groups count"
          to="/groups"
        />
        <StatCard
          title="Talabalar"
          value={loading ? "…" : stats.totalStudents}
          hint="Approved students"
          to="/groups"
        />
        <StatCard
          title="Pending"
          value={loading ? "…" : stats.pending}
          hint="Join requests waiting"
          to="/groups"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Tezkor amallar
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Yangi group yarating yoki pending requestlarni tekshiring.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/groups"
              className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)] transition hover:opacity-95 active:opacity-90"
            >
              Groups →
            </Link>
            <Link
              to="/groups"
              className="rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07]"
            >
              Pending →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
