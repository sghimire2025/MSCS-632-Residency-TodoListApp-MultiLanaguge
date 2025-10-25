import { useEffect, useMemo, useRef, useState } from "react";
import client from "../api/client";
import Spinner from "../components/Spinner";
import { toast } from "react-hot-toast";


const STATUS = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export default function Tasks() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [tasks, setTasks] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  });
  const [statusFilter, setStatusFilter] = useState("");

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    assigneeId: "",
    dueDate: "",
  });

  // --- StrictMode guard: run the initial effect only once
  const didInit = useRef(false);

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );
  const catsById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  async function fetchAll(p = pageInfo.page, s = pageInfo.size, st = statusFilter) {
    try {
      setLoading(true);

      // Build query string
      const qs = new URLSearchParams();
      qs.set("page", p);
      qs.set("size", s);
      if (st) qs.set("status", st);

      const [t, c, u] = await Promise.all([
        client.get(`/tasks?${qs.toString()}`),
        categories.length ? Promise.resolve({ data: categories }) : client.get("/categories"),
        users.length ? Promise.resolve({ data: users }) : client.get("/users"),
      ]);

      const page = t.data;
      setTasks(page.content);
      setPageInfo({
        page: page.page,
        size: page.size,
        totalPages: page.totalPages,
        totalElements: page.totalElements,
        first: page.first,
        last: page.last,
      });

      if (!categories.length) setCategories(c.data);
      if (!users.length) setUsers(u.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Initial mount fetch (runs once even under StrictMode)
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchAll(0, pageInfo.size, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filter or page size changes (but not on first mount)
  useEffect(() => {
    if (!didInit.current) return;
    fetchAll(0, pageInfo.size, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pageInfo.size]);
async function createTask(e) {
  e.preventDefault();
  setErr("");

  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
    dueDate: form.dueDate || null,
  };
  if (!payload.title) {
    toast.error("Title is required");
    return;
  }

  const t = toast.loading("Creating task...");
  try {
    await client.post("/tasks", payload, { headers: { "X-User-Id": 1 } });
    await fetchAll(0, pageInfo.size, statusFilter);
    setForm({ title: "", description: "", categoryId: "", assigneeId: "", dueDate: "" });
    toast.success("Task created", { id: t });
  } catch (e) {
    setErr(e.message);
    toast.error(e.message || "Failed to create task", { id: t });
  }
}

async function updateStatus(id, nextStatus, version) {
  // optimistic update
  let prevRow;
  setTasks((cur) =>
    cur.map((t) => {
      if (t.id !== id) return t;
      prevRow = t;
      return { ...t, status: nextStatus };
    })
  );

  const t = toast.loading(`Updating status → ${nextStatus}...`);
  try {
    const res = await client.put(`/tasks/${id}`, { status: nextStatus, version });
    setTasks((cur) => cur.map((t) => (t.id === id ? res.data : t)));
    toast.success("Status updated", { id: t });
  } catch (e) {
    // rollback
    setTasks((cur) => cur.map((t) => (t.id === id ? prevRow : t)));

    const msg = e.message || "Failed to update";
    // try row-level refresh on conflict
    if (msg.toLowerCase().includes("conflict") || msg.toLowerCase().includes("version")) {
      try {
        const { data } = await client.get(`/tasks/${id}`);
        setTasks((cur) => cur.map((t) => (t.id === id ? data : t)));
        toast.error("Update conflict. Row reloaded with latest data.", { id: t });
        return;
      } catch {
        // ignore
      }
    }
    toast.error(msg, { id: t });
  }
}


  const prev = () => !pageInfo.first && fetchAll(pageInfo.page - 1, pageInfo.size, statusFilter);
  const next = () => !pageInfo.last && fetchAll(pageInfo.page + 1, pageInfo.size, statusFilter);
  const changeSize = (sz) => setPageInfo((pi) => ({ ...pi, size: Number(sz) }));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-gray-600">Create tasks and manage status.</p>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm">Filter:</label>
          <select
            className="border rounded p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="text-sm ml-3">Size:</label>
          <select
            className="border rounded p-2"
            value={pageInfo.size}
            onChange={(e) => changeSize(e.target.value)}
          >
            {[5, 10, 20, 50].map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Create Task</h2>
        {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
        <form onSubmit={createTask} className="grid gap-3 md:grid-cols-2">
          <input
            className="border rounded p-2"
            placeholder="Title*"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            className="border rounded p-2"
            placeholder="Due date (YYYY-MM-DD)"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <textarea
            className="border rounded p-2 md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <select
            className="border rounded p-2"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={form.assigneeId}
            onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
          >
            <option value="">Select Assignee</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          <div className="md:col-span-2">
            <button className="bg-gray-900 text-white px-4 py-2 rounded">Create</button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">All Tasks</h2>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">Title</th>
                    <th className="py-2 pr-2">Assignee</th>
                    <th className="py-2 pr-2">Category</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Due</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{t.title}</td>
                      <td className="py-2 pr-2">
                        {t.assigneeName ?? usersById[t.assigneeId]?.name ?? "-"}
                      </td>
                      <td className="py-2 pr-2">
                        {t.categoryName ?? catsById[t.categoryId]?.name ?? "-"}
                      </td>
                      <td className="py-2 pr-2">{t.status}</td>
                      <td className="py-2 pr-2">{t.dueDate ?? "-"}</td>
                      <td className="py-2 flex gap-2">
                        {STATUS.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(t.id, s, t.version)}
                            className={`px-2 py-1 rounded border ${
                              t.status === s
                                ? "bg-gray-900 text-white"
                                : "hover:bg-gray-100"
                            }`}
                            title={`Set ${s}`}
                          >
                            {s}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td className="py-4 text-gray-500" colSpan={6}>
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-600">
                Page {pageInfo.page + 1} of {pageInfo.totalPages} • {pageInfo.totalElements} items
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pageInfo.first}
                  onClick={() => prev()}
                  className={`px-3 py-1 rounded border ${
                    pageInfo.first ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
                >
                  Prev
                </button>
                <button
                  disabled={pageInfo.last}
                  onClick={() => next()}
                  className={`px-3 py-1 rounded border ${
                    pageInfo.last ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
