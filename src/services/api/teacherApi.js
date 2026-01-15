const BASE =
  import.meta.env.VITE_TEACHER_API_BASE ||
  "https://694fc8f1e1918.myxvest1.ru/uzstudents/api/teacher";

async function req(path, options = {}) {
  const r = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok || data?.ok === false)
    throw new Error(data?.message || "Request failed");
  return data;
}

export const teacherApi = {
  // auth
  login: (body) =>
    req("/auth/login.php", { method: "POST", body: JSON.stringify(body) }),
  me: () => req("/auth/me.php", { method: "GET" }),
  logout: () => req("/auth/logout.php", { method: "POST" }),

  // groups
  groups: () => req("/groups/list.php", { method: "GET" }),
  createGroup: (body) =>
    req("/groups/create.php", { method: "POST", body: JSON.stringify(body) }),
  groupDetail: (id) => req(`/groups/detail.php?id=${id}`, { method: "GET" }),
  rotateCode: (body) =>
    req("/groups/rotate_code.php", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // join requests
  joinRequests: (group_id, status = "pending") =>
    req(`/groups/join_requests.php?group_id=${group_id}&status=${status}`, {
      method: "GET",
    }),

  approveStudent: (body) =>
    req("/groups/approve_student.php", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  denyStudent: (body) =>
    req("/groups/deny_student.php", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
