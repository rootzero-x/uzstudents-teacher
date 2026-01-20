const BASE =
  import.meta.env.VITE_TEACHER_API_BASE ||
  "https://694fc8f1e1918.myxvest1.ru/uzstudents/api/teacher";

  async function jfetch(url, opts = {}) {
  const r = await fetch(url, {
    credentials: "include", // 🔑 cookie session
    ...opts,
  });

  const ct = r.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const j = isJson ? await r.json().catch(() => ({})) : {};

  if (!r.ok || j?.ok === false) {
    throw new Error(j?.message || `Request failed (${r.status})`);
  }
  return j;
}

/** --------- Helpers --------- */
function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeError(data, fallback = "Request failed") {
  const msg =
    (data && typeof data.message === "string" && data.message.trim()) || "";
  return msg || fallback;
}

/**
 * PRO request:
 * - timeout + abort
 * - retry for GET only (network/5xx)
 * - safe JSON parse
 * - credentials include
 */
async function req(path, options = {}) {
  const {
    method = "GET",
    headers,
    body,
    timeoutMs = 15000,
    retries = 1,
    retryDelayMs = 450,
    signal,
  } = options;

  const isGet = String(method).toUpperCase() === "GET";
  const maxAttempts = isGet ? Math.max(1, retries + 1) : 1;

  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const onAbort = () => controller.abort();
    if (signal) signal.addEventListener("abort", onAbort, { once: true });

    try {
      const r = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(headers || {}),
        },
        body,
        credentials: "include",
        signal: controller.signal,
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok || data?.ok === false) {
        const msg = normalizeError(data, "Request failed");
        const shouldRetry = isGet && (r.status >= 500 || r.status === 0);

        if (shouldRetry && attempt < maxAttempts) {
          lastErr = new Error(msg);
          await sleep(retryDelayMs * attempt);
          continue;
        }
        throw new Error(msg);
      }

      return data;
    } catch (e) {
      const aborted =
        e?.name === "AbortError" ||
        String(e?.message || "")
          .toLowerCase()
          .includes("aborted");

      if (aborted) throw new Error("Timeout or cancelled");

      lastErr = e instanceof Error ? e : new Error("Network error");

      if (isGet && attempt < maxAttempts) {
        await sleep(retryDelayMs * attempt);
        continue;
      }
      throw lastErr;
    } finally {
      clearTimeout(t);
      if (signal) signal.removeEventListener("abort", onAbort);
    }
  }

  throw lastErr || new Error("Request failed");
}

/**
 * Upload with progress (XHR) — premium UX uchun.
 * Backend: /assignments/upload.php
 * Returns: { ok:true, upload:{ attachment_path, attachment_name, attachment_mime, ... } }
 */
function uploadWithProgress(path, formData, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}${path}`, true);
    xhr.withCredentials = true;

    // Abort support
    const abort = () => {
      try {
        xhr.abort();
      } catch {}
    };
    if (signal) {
      if (signal.aborted) abort();
      signal.addEventListener("abort", abort, { once: true });
    }

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return;
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress({ percent: pct, loaded: e.loaded, total: e.total });
      } else {
        onProgress({ percent: null, loaded: e.loaded, total: null });
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.ontimeout = () => reject(new Error("Upload timeout"));
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText || "{}");
      } catch {
        data = {};
      }

      if (xhr.status < 200 || xhr.status >= 300 || data?.ok === false) {
        reject(new Error(data?.message || "Upload failed"));
        return;
      }
      resolve(data);
    };

    xhr.send(formData);
  });
}

/** --------- API --------- */
export const teacherApi = {
  // auth
  login: (body) =>
    req("/auth/login.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 20000,
    }),
  me: (opts) => req("/auth/me.php", { method: "GET", ...opts }),
  logout: () => req("/auth/logout.php", { method: "POST" }),

  // groups
  groups: (opts) => req("/groups/list.php", { method: "GET", ...opts }),
  createGroup: (body) =>
    req("/groups/create.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 20000,
    }),
  groupDetail: (id, opts) =>
    req(`/groups/detail.php${buildQuery({ id })}`, { method: "GET", ...opts }),

  rotateCode: (body) =>
    req("/groups/rotate_code.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 20000,
    }),

  // join requests
  joinRequests: (group_id, status = "pending", opts) =>
    req(`/groups/join_requests.php${buildQuery({ group_id, status })}`, {
      method: "GET",
      ...opts,
    }),

  approveStudent: (body) =>
    req("/groups/approve_student.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 20000,
    }),

  denyStudent: (body) =>
    req("/groups/deny_student.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 20000,
    }),

  // AI
  analyzeAssignment: (body) =>
    req("/ai/analyze_assignment.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 30000,
    }),

  deleteAssignment: ({ assignment_id }) =>
  jfetch(`${BASE}/assignments/delete/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignment_id }),
  }),



  // submissions
  submissions: (assignment_id, opts) =>
    req(`/submissions/list.php${buildQuery({ assignment_id })}`, {
      method: "GET",
      ...opts,
    }),

  gradeSubmission: (body) =>
    req("/submissions/grade.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 35000,
    }),

  overrideGrade: (body) =>
    req("/submissions/override.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 20000,
    }),

  // assignments
  assignments: (group_id, opts) =>
    req(`/assignments/list.php${buildQuery({ group_id })}`, {
      method: "GET",
      ...opts,
    }),

createAssignmentWithFile: async ({ group_id, title, description, file }) => {
  const fd = new FormData();
  fd.append("group_id", String(group_id));
  fd.append("title", String(title));
  fd.append("description", String(description));
  fd.append("file", file);

  const r = await fetch(`${BASE}/assignments/create_with_file/index.php`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  const ct = r.headers.get("content-type") || "";
  const j = ct.includes("application/json")
    ? await r.json().catch(() => ({}))
    : {};

  if (!r.ok || j?.ok === false) {
    throw new Error(j?.message || `Request failed (${r.status})`);
  }
  return j;
},


  /**
   * Create assignment
   * ✅ file OPTIONAL: attachment_* bo‘lsa backend tmp->final qiladi
   */
  createAssignment: (body) =>
    req("/assignments/create.php", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 25000,
    }),

  /**
   * Upload to TMP (NO assignment_id)
   * Usage:
   *  const up = await teacherApi.uploadAssignmentFile(file, { onProgress })
   *  // up.upload.attachment_path ...
   */
  uploadAssignmentFile: (file, opts = {}) => {
    const fd = new FormData();
    fd.append("file", file);

    // progress callback optional
    const onProgress =
      typeof opts.onProgress === "function" ? opts.onProgress : null;

    return uploadWithProgress("/assignments/upload.php", fd, {
      onProgress,
      signal: opts.signal,
    });
  },

  /**
   * Convenience: create with optional file in one go (premium helper)
   * - Agar file bo‘lsa: upload -> create (attachment_* bilan)
   * - file bo‘lmasa: faqat create
   */
  createAssignmentSmart: async (
    {
      group_id,
      title,
      description,
      max_score,
      ai_type,
      ai_summary,
      ai_rubric_json,
    },
    { file, onUploadProgress, signal } = {},
  ) => {
    let uploadMeta = null;

    // 1) file bo‘lsa -> avval upload (TMP)
    if (file) {
      const up = await teacherApi.uploadAssignmentFile(file, {
        onProgress: onUploadProgress,
        signal,
      });
      uploadMeta = up?.upload || null;
    }

    // 2) create payload (file optional)
    const payload = {
      group_id,
      title,
      description,
      max_score,
      ai_type,
      ai_summary,
      ai_rubric_json,
      ...(uploadMeta
        ? {
            attachment_path: uploadMeta.attachment_path,
            attachment_name: uploadMeta.attachment_name,
            attachment_mime: uploadMeta.attachment_mime,
          }
        : {}),
    };

    // 3) create assignment
    return teacherApi.createAssignment(payload);
  },
};
