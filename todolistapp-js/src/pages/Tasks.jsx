import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import Spinner from "../components/Spinner";

const STATUS = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export default function Tasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  // form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    assigneeId: "",
    dueDate: "",
  });

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );
  const catsById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [t, c, u] = await Promise.all([
          client.get("/tasks"),
          client.get("/categories"),
          client.get("/users"),
        ]);
        setTasks(t.data);
        setCategories(c.data);
        setUsers(u.data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createTask(e) {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) {
      setErr("Title is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
      dueDate: form.dueDate || null, // "YYYY-MM-DD" is fine if backend expects LocalDate
    };

    try {
      const res = await client.post("/tasks", payload, {
        headers: { "X-User-Id": 1 }, // creator; remove if you pass it differently
      });
      setTasks((cur) => [res.data, ...cur]);
      setForm({ title: "", description: "", categoryId: "", assigneeId: "", dueDate: "" });
    } catch (e) {
      setErr(e.message);
    }
  }

  async function updateStatus(id, nextStatus, version) {
    try {
      const res = await client.put(`/tasks/${id}`, {
        status: nextStatus,
        version: version,
      });
      setTasks((cur) => cur.map((t) => (t.id === id ? res.data : t)));
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-sm text-gray-600">Create tasks and manage status.</p>
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
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={form.assigneeId}
            onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
          >
            <option value="">Select Assignee</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
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
                    <td className="py-2 pr-2">{t.assigneeName ?? usersById[t.assigneeId]?.name ?? "-"}</td>
                    <td className="py-2 pr-2">{t.categoryName ?? catsById[t.categoryId]?.name ?? "-"}</td>
                    <td className="py-2 pr-2">{t.status}</td>
                    <td className="py-2 pr-2">{t.dueDate ?? "-"}</td>
                    <td className="py-2 flex gap-2">
                      {STATUS.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(t.id, s, t.version)}
                          className={`px-2 py-1 rounded border ${t.status === s ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
                          title={`Set ${s}`}
                        >
                          {s}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr><td className="py-4 text-gray-500" colSpan={6}>No tasks yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
