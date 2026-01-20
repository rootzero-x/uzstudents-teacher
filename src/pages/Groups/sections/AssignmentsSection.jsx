import { useEffect, useMemo, useState } from "react";
import { teacherApi } from "../../../services/api/teacherApi";
import ToastLite from "../../../components/ui/ToastLite";
import { useIntervalWhenVisible } from "../../../utils/useIntervalWhenVisible";

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-300">{label}</div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

function SoftBtn({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)]"
          : "border border-white/12 bg-white/[0.04] text-slate-100 hover:bg-white/[0.07]"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonLines({ n = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-12 w-full rounded-2xl bg-white/10" />
      ))}
    </div>
  );
}

function SubmissionCard({ s, onGrade, onOverride, busy, toast, setToast }) {
  const max = Number(s.max_score || 100);
  const finalScore =
    s.teacher_score !== null && s.teacher_score !== undefined
      ? Number(s.teacher_score)
      : s.ai_score !== null && s.ai_score !== undefined
        ? Number(s.ai_score)
        : null;

  const [tScore, setTScore] = useState(
    s.teacher_score !== null && s.teacher_score !== undefined
      ? String(s.teacher_score)
      : "",
  );
  const [tFeedback, setTFeedback] = useState(s.teacher_feedback || "");

  useEffect(() => {
    setTScore(
      s.teacher_score !== null && s.teacher_score !== undefined
        ? String(s.teacher_score)
        : "",
    );
    setTFeedback(s.teacher_feedback || "");
  }, [s.teacher_score, s.teacher_feedback]);

  const statusLabel = s.status === "graded" ? "✅ Graded" : "🕒 Submitted";

  // Student submission file
  const hasStudentFile = s.file_url || s.download_url;
  const studentFileUrl = s.file_url || s.download_url;
  const studentFileName = s.file_name || "submission_file";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={s.student?.avatar_url || "/default.jpg"}
            onError={(e) => (e.currentTarget.src = "/default.jpg")}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-100">
              {s.student?.full_name || `Student #${s.student_id}`}
            </div>
            <div className="mt-1 truncate text-xs text-slate-400">
              {s.student?.email || "—"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip>{statusLabel}</Chip>
          <Chip>
            Score:{" "}
            <span className="ml-1 text-slate-100">
              {finalScore === null ? "—" : `${finalScore}/${max}`}
            </span>
          </Chip>

          <button
            disabled={busy}
            onClick={() => {
              navigator.clipboard
                .writeText(String(s.student_id))
                .then(() =>
                  setToast({ open: true, text: "Student ID nusxalandi ✅" }),
                )
                .catch(() =>
                  setToast({ open: true, text: "Clipboard xato ❗" }),
                );
            }}
            className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.07] disabled:opacity-60"
          >
            Copy ID
          </button>
        </div>
      </div>

      {/* Student submission file download */}
      {hasStudentFile && (
        <div className="mt-3 rounded-2xl border border-emerald-500/15 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-300">
              📎 Student submission file
            </div>
            <a
              href={studentFileUrl}
              download={studentFileName}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-white/[0.07]"
            >
              Download
            </a>
          </div>
          <div className="mt-1 text-xs text-slate-400">{studentFileName}</div>
        </div>
      )}

      {(s.ai_feedback || (s.ai_breakdown || []).length > 0) && (
        <div className="mt-4 rounded-2xl border border-orange-500/15 bg-white/[0.03] p-4">
          <div className="text-xs font-semibold text-slate-300">
            AI Feedback
          </div>
          {s.ai_feedback ? (
            <div className="mt-2 text-sm text-slate-200 leading-relaxed">
              {s.ai_feedback}
            </div>
          ) : null}

          {(s.ai_breakdown || []).length > 0 ? (
            <div className="mt-3 grid gap-2">
              {(s.ai_breakdown || []).slice(0, 8).map((b, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-slate-950/40 p-3"
                >
                  <div className="text-xs font-semibold text-slate-100">
                    {b.criterion || "Criterion"}{" "}
                    <span className="text-slate-400">
                      ({b.points_awarded}/{b.max_points})
                    </span>
                  </div>
                  {b.notes ? (
                    <div className="mt-1 text-xs text-slate-400">{b.notes}</div>
                  ) : null}
                </div>
              ))}
              {(s.ai_breakdown || []).length > 8 ? (
                <div className="text-xs text-slate-500">+ more…</div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {/* Teacher override */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Teacher score" hint={`0..${max}`}>
          <input
            value={tScore}
            onChange={(e) => setTScore(e.target.value)}
            type="number"
            min={0}
            max={max}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-500/30"
          />
        </Field>

        <Field label="Teacher feedback" hint="optional">
          <input
            value={tFeedback}
            onChange={(e) => setTFeedback(e.target.value)}
            placeholder="Qisqa izoh..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-orange-500/30"
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={() =>
            onOverride(s.id, {
              teacher_score: tScore === "" ? null : Number(tScore),
              teacher_feedback: tFeedback,
            })
          }
          className="rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.08] disabled:opacity-60"
        >
          {busy ? "..." : "Save override"}
        </button>

        {finalScore !== null ? (
          <div className="text-xs text-slate-400 self-center">
            Final score:{" "}
            <span className="text-slate-200 font-semibold">
              {finalScore}/{max}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AssignmentsSection({ groupId }) {
  const [toast, setToast] = useState({ open: false, text: "" });

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // ✅ FILE REQUIRED
  const [file, setFile] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const [creating, setCreating] = useState(false);

  // Submissions UI
  const [openAssignmentId, setOpenAssignmentId] = useState(null);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subs, setSubs] = useState([]);
  const [busySubId, setBusySubId] = useState(null);

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setErr("");
    try {
      const res = await teacherApi.assignments(groupId);
      setList(res.assignments || []);
    } catch (e) {
      setErr(e?.message || "Failed");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId, { silent = false } = {}) => {
    if (!silent) setSubsLoading(true);
    try {
      const res = await teacherApi.submissions(assignmentId);
      setSubs(res.submissions || []);
    } catch (e) {
      setErr(e?.message || "Submissions load failed");
      setSubs([]);
    } finally {
      if (!silent) setSubsLoading(false);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Realtime: submissions panel ochiq bo'lsa update
  useIntervalWhenVisible(
    async () => {
      if (!openAssignmentId) return;
      try {
        await loadSubmissions(openAssignmentId, { silent: true });
      } catch {}
    },
    7000,
    { runOnFocus: true },
  );

  const canAnalyze = useMemo(() => title.trim().length >= 3, [title]);

  // ✅ Analyze endi optional (file bo'lsa zo'r)
  const analyze = async () => {
    if (!canAnalyze) return;
    setErr("");
    setAnalyzing(true);
    try {
      const res = await teacherApi.analyzeAssignment({
        title: title.trim(),
        description: desc.trim(),
      });
      setAnalysis(res.analysis || null);
      setToast({ open: true, text: "AI analysis tayyor ✅" });
    } catch (e) {
      setErr(e?.message || "AI analyze failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setErr("");

    const t = title.trim();
    const d = desc.trim();

    if (t.length < 3) return setErr("Title kamida 3 ta belgi bo'lsin.");
    if (d.length < 10) return setErr("Description kamida 10 ta belgi bo'lsin.");
    if (!file) return setErr("Assignment file majburiy ✅ (upload qiling)");

    setCreating(true);
    try {
      const res = await teacherApi.createAssignmentWithFile({
        group_id: groupId,
        title: t,
        description: d,
        file,
      });

      // ✅ backend analysis qaytaradi
      if (res?.analysis) setAnalysis(res.analysis);

      setTitle("");
      setDesc("");
      setFile(null);

      setToast({
        open: true,
        text: "Assignment yaratildi ✅ (AI max_score + rubric)",
      });
      await load({ silent: true });
    } catch (e2) {
      setErr(e2?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const deleteOne = async (assignmentId) => {
    const ok = window.confirm("Assignmentni o'chirishni tasdiqlaysizmi?");
    if (!ok) return;

    setErr("");
    try {
      await teacherApi.deleteAssignment({ assignment_id: assignmentId });
      setToast({ open: true, text: "Assignment o'chirildi ✅" });
      // agar ochiq bo'lsa yopamiz
      setOpenAssignmentId((prev) => (prev === assignmentId ? null : prev));
      await load({ silent: true });
    } catch (e) {
      setErr(e?.message || "Delete failed");
    }
  };

  const openSubs = async (assignmentId) => {
    setOpenAssignmentId((prev) =>
      prev === assignmentId ? null : assignmentId,
    );
    if (openAssignmentId === assignmentId) return; // closing
    await loadSubmissions(assignmentId, { silent: false });
  };

  const gradeOne = async (submissionId) => {
    setBusySubId(submissionId);
    setErr("");
    try {
      await teacherApi.gradeSubmission({ submission_id: submissionId });
      setToast({ open: true, text: "AI grade tayyor ✅" });
      await loadSubmissions(openAssignmentId, { silent: true });
    } catch (e) {
      setErr(e?.message || "AI grade failed");
    } finally {
      setBusySubId(null);
    }
  };

  const overrideOne = async (
    submissionId,
    { teacher_score, teacher_feedback },
  ) => {
    setBusySubId(submissionId);
    setErr("");
    try {
      await teacherApi.overrideGrade({
        submission_id: submissionId,
        teacher_score,
        teacher_feedback,
      });
      setToast({ open: true, text: "Override saqlandi ✅" });
      await loadSubmissions(openAssignmentId, { silent: true });
    } catch (e) {
      setErr(e?.message || "Override failed");
    } finally {
      setBusySubId(null);
    }
  };

  return (
    <div className="space-y-4">
      <ToastLite
        open={toast.open}
        text={toast.text}
        onClose={() => setToast({ open: false, text: "" })}
      />

      {err ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {err}
        </div>
      ) : null}

      {/* Create */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Create Assignment (Group #{groupId})
            </div>
            <div className="mt-1 text-sm text-slate-400">
              AI rubric + feedback uchun "AI Analyze" qiling (recommended).
            </div>
          </div>

          <button
            disabled={!canAnalyze || analyzing}
            onClick={analyze}
            className="rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07] disabled:opacity-60"
          >
            {analyzing ? "Analyzing..." : "AI Analyze"}
          </button>
        </div>

        <form onSubmit={create} className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" hint="3..120">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Algebra Homework #3"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-orange-500/30"
              />
            </Field>

            <Field label="Assignment file" hint="required ✅">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3 transition hover:border-orange-500/30">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100">
                    {file ? file.name : "Fayl tanlang"}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    PDF/DOCX/TXT/PNG/JPG
                  </div>
                </div>

                <span className="shrink-0 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-100">
                  Browse
                </span>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </Field>
          </div>

          <Field label="Description" hint="10..5000">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              placeholder="Vazifa sharti..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-orange-500/30"
            />
          </Field>

          {analysis ? (
            <div className="rounded-2xl border border-orange-500/15 bg-slate-950/40 p-5">
              <div className="text-xs font-semibold text-slate-300">
                AI Analysis
              </div>
              {analysis.raw ? (
                <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-200">
                  {analysis.raw}
                </pre>
              ) : (
                <>
                  <div className="mt-2 text-sm text-slate-200">
                    <span className="font-semibold text-slate-100">Type:</span>{" "}
                    {analysis.type || "—"}
                  </div>
                  <div className="mt-1 text-sm text-slate-200">
                    <span className="font-semibold text-slate-100">
                      Suggested Max:
                    </span>{" "}
                    {analysis.suggested_max_score ?? "—"}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {analysis.summary || "—"}
                  </div>

                  <div className="mt-3 grid gap-2">
                    {(analysis.rubric || []).slice(0, 8).map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <div className="text-sm font-semibold text-slate-100">
                          {r.criterion}{" "}
                          <span className="text-slate-400">({r.points})</span>
                        </div>
                        {r.notes ? (
                          <div className="mt-1 text-xs text-slate-400">
                            {r.notes}
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {(analysis.rubric || []).length > 8 ? (
                      <div className="text-xs text-slate-500">+ more…</div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              disabled={creating}
              className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(249,115,22,0.35)] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Assignment (AI auto)"}
            </button>

            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDesc("");
                setFile(null);
                setAnalysis(null);
              }}
              className="rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07]"
            >
              Reset
            </button>
          </div>

          <div className="text-xs text-slate-500">
            ✅ Max score tanlanmaydi — AI assignment file'dan rubric + max_score
            beradi.
          </div>
        </form>
      </div>

      {/* List */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-100">
            Assignments
          </div>
          <button
            onClick={() => load({ silent: true })}
            className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07]"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-4">
            <SkeletonLines n={5} />
          </div>
        ) : list.length === 0 ? (
          <div className="mt-4 text-sm text-slate-300">
            Hozircha assignment yo'q.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {list.map((a) => {
              const opened = openAssignmentId === a.id;
              const hasTeacherFile = a.attachment_url || a.download_url;
              const teacherFileUrl = a.attachment_url || a.download_url;
              const teacherFileName = a.attachment_name || "assignment_file";

              return (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        {a.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Max:{" "}
                        <span className="text-slate-200 font-semibold">
                          {a.max_score}
                        </span>
                        {a.ai_type ? (
                          <>
                            {" "}
                            • Type:{" "}
                            <span className="text-slate-200 font-semibold">
                              {a.ai_type}
                            </span>
                          </>
                        ) : null}
                      </div>

                      {hasTeacherFile && (
                        <a
                          href={teacherFileUrl}
                          download={teacherFileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20"
                        >
                          📎 Download assignment file
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openSubs(a.id)}
                        className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.07]"
                      >
                        {opened ? "Hide submissions" : "View submissions"}
                      </button>
                      <button
                        onClick={() => deleteOne(a.id)}
                        className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {opened ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-slate-300">
                          Submissions (real-time)
                        </div>
                        <button
                          onClick={() =>
                            loadSubmissions(a.id, { silent: false })
                          }
                          className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.07]"
                        >
                          Refresh
                        </button>
                      </div>

                      {subsLoading ? (
                        <div className="mt-3">
                          <SkeletonLines n={4} />
                        </div>
                      ) : subs.length === 0 ? (
                        <div className="mt-3 text-sm text-slate-300">
                          Hozircha submission yo'q.
                        </div>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {subs.map((s) => (
                            <SubmissionCard
                              key={s.id}
                              s={s}
                              busy={busySubId !== null}
                              onGrade={gradeOne}
                              onOverride={overrideOne}
                              toast={toast}
                              setToast={setToast}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
