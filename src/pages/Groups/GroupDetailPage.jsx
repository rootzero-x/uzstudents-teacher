import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { teacherApi } from "../../services/api/teacherApi";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

export default function GroupDetailPage() {
  const { id } = useParams();
  const groupId = Number(id);

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);

  const [tab, setTab] = useState("pending"); // "pending" | "approved"
  const [reqs, setReqs] = useState([]); // current tab requests list

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // local counts for tabs (optional, agar backend status filter bo‘lsa - bu real tab listdan hisoblaydi)
  const counts = useMemo(() => {
    return {
      pending: tab === "pending" ? reqs.length : group?.pending_count ?? 0,
      approved: tab === "approved" ? reqs.length : 0,
    };
  }, [reqs.length, tab, group?.pending_count]);

  const loadGroup = async () => {
    const gd = await teacherApi.groupDetail(groupId);
    setGroup(gd.group);
  };

  const loadRequests = async (status) => {
    // backend: { ok:true, requests:[...] }
    const jr = await teacherApi.joinRequests(groupId, status);
    const list = Array.isArray(jr?.requests) ? jr.requests : [];
    setReqs(list);
  };

  const loadAll = async () => {
    setErr("");
    setLoading(true);
    try {
      await loadGroup();
      await loadRequests(tab);
    } catch (e) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // tab almashganda faqat requests yangilansin (tezroq)
  useEffect(() => {
    if (!groupId) return;
    (async () => {
      setErr("");
      try {
        await loadRequests(tab);
      } catch (e) {
        setErr(e?.message || "Failed");
        setReqs([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, groupId]);

  const copy = async () => {
    if (!group?.code) return;
    try {
      await navigator.clipboard.writeText(group.code);
    } catch {}
  };

  const rotate = async () => {
    if (!groupId) return;
    setBusy(true);
    setErr("");
    try {
      const res = await teacherApi.rotateCode({ group_id: groupId });
      setGroup((g) => ({ ...g, code: res.code }));
      // rotate bo‘lsa ham listni qayta olish shart emas, lekin xohlasangiz:
      // await loadRequests(tab);
    } catch (e) {
      setErr(e?.message || "Rotate failed");
    } finally {
      setBusy(false);
    }
  };

  const approveOne = async (student_id) => {
    setBusy(true);
    setErr("");
    try {
      await teacherApi.approveStudent({ group_id: groupId, student_id });
      // ✅ tabdagi listni qayta yuklaymiz
      await loadGroup(); // pending_count ham yangilansin
      await loadRequests(tab);
    } catch (e) {
      setErr(e?.message || "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const denyOne = async (student_id) => {
    setBusy(true);
    setErr("");
    try {
      await teacherApi.denyStudent({ group_id: groupId, student_id });
      await loadGroup();
      await loadRequests(tab);
    } catch (e) {
      setErr(e?.message || "Deny failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {err && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {err}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {loading ? (
          <div className="space-y-3">
            <div className="h-5 w-52 rounded bg-white/10" />
            <div className="h-3 w-40 rounded bg-white/10" />
            <div className="mt-4 h-10 w-full rounded-2xl bg-white/10" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                    {group?.name}
                  </span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Pill>Students: {group?.students_count}</Pill>
                  <Pill>Pending: {group?.pending_count}</Pill>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copy}
                  className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07]"
                >
                  Copy code
                </button>
                <button
                  disabled={busy}
                  onClick={rotate}
                  className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
                >
                  Rotate code
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-orange-500/15 bg-slate-950/40 p-5">
              <div className="text-xs font-semibold text-slate-300">
                Join Code
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="text-2xl font-extrabold tracking-[0.28em] text-orange-200">
                  {group?.code}
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Active
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-400">
                Studentlar shu code bilan join request yuboradi. Siz
                approve/deny qilasiz.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setTab("pending")}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            tab === "pending"
              ? "bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)]"
              : "border border-white/12 bg-white/[0.04] text-slate-100 hover:bg-white/[0.07]"
          }`}
        >
          Pending ({counts.pending})
        </button>
        <button
          onClick={() => setTab("approved")}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            tab === "approved"
              ? "bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)]"
              : "border border-white/12 bg-white/[0.04] text-slate-100 hover:bg-white/[0.07]"
          }`}
        >
          Approved ({counts.approved})
        </button>
      </div>

      {/* List */}
      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : reqs.length === 0 ? (
          <div className="text-sm text-slate-300">
            {tab === "pending"
              ? "Pending requestlar yo‘q."
              : "Hozircha approved studentlar yo‘q."}
          </div>
        ) : tab === "pending" ? (
          <div className="space-y-3">
            {reqs.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.avatar_url || "/default.jpg"}
                    onError={(e) => (e.currentTarget.src = "/default.jpg")}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">
                      {p.full_name || `Student #${p.student_id}`}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-400">
                      {p.email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={busy}
                    onClick={() => approveOne(Number(p.student_id))}
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.25)] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => denyOne(Number(p.student_id))}
                    className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07] disabled:opacity-60"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {reqs.map((s) => (
              <div
                key={s.id || s.student_id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={s.avatar_url || "/default.jpg"}
                    onError={(e) => (e.currentTarget.src = "/default.jpg")}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">
                      {s.full_name || `Student #${s.student_id}`}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-400">
                      {s.email || "—"}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                  ✅ Approved
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
