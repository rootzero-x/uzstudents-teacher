import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { teacherApi } from "../../services/api/teacherApi";

function badge(text) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
      <span className="h-2 w-2 rounded-full bg-orange-300" />
      {text}
    </span>
  );
}

export default function GroupsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return groups;
    return groups.filter(
      (g) =>
        String(g.name || "")
          .toLowerCase()
          .includes(s) ||
        String(g.code || "")
          .toLowerCase()
          .includes(s)
    );
  }, [groups, q]);

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    const n = name.trim();
    if (!n) return setErr("Group nomini kiriting.");

    setCreating(true);
    try {
      await teacherApi.createGroup({ name: n });
      setName("");
      await load();
    } catch (e2) {
      setErr(e2?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-200 bg-clip-text text-transparent">
              Groups
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Guruh yarating, code orqali studentlarni qabul qiling.
          </p>
        </div>

        <div className="w-full sm:w-[340px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: name or code…"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-orange-500/30"
          />
        </div>
      </div>

      {err && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {err}
        </div>
      )}

      {/* Create */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Create new group
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Group nomi beriladi, code avtomatik yaratiladi.
            </div>
          </div>

          <form onSubmit={create} className="flex w-full gap-2 sm:w-[420px]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Physics-11A"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-orange-500/30"
            />
            <button
              disabled={creating}
              className="shrink-0 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
            >
              {creating ? "..." : "Create"}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
            >
              <div className="h-4 w-40 rounded bg-white/10" />
              <div className="mt-3 h-3 w-28 rounded bg-white/10" />
              <div className="mt-6 h-9 w-full rounded-xl bg-white/10" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-sm text-slate-300 backdrop-blur-xl sm:col-span-2">
            Hech narsa topilmadi.
          </div>
        ) : (
          filtered.map((g) => (
            <Link
              key={g.id}
              to={`/groups/${g.id}`}
              className="group rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-bold text-slate-100">
                    {g.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Code:{" "}
                    <span className="font-semibold text-slate-200">
                      {g.code}
                    </span>
                  </div>
                </div>
                {Number(g.pending_count) > 0
                  ? badge(`${g.pending_count} pending`)
                  : null}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs text-slate-400">Students</div>
                  <div className="mt-1 text-xl font-extrabold text-slate-100">
                    {g.students_count}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs text-slate-400">Pending</div>
                  <div className="mt-1 text-xl font-extrabold text-slate-100">
                    {g.pending_count}
                  </div>
                </div>
              </div>

              <div className="mt-5 text-sm font-semibold text-orange-200 opacity-0 transition group-hover:opacity-100">
                Open group →
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
