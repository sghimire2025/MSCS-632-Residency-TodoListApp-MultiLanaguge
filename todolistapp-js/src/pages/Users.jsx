import { useEffect, useState } from "react";
import client from "../api/client";
import Spinner from "../components/Spinner";

export default function Users() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await client.get("/users");
        setList(res.data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function create(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await client.post("/users", {
        name: form.name,
        email: form.email,
      });
      setList((cur) => [res.data, ...cur]);
      setForm({ name: "", email: "" });
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <form onSubmit={create} className="bg-white rounded-xl shadow p-4 grid gap-3 md:grid-cols-3">
        <input
          className="border rounded p-2"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          className="border rounded p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <button className="bg-gray-900 text-white px-4 py-2 rounded">Create</button>
      </form>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">All Users</h2>
        {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
        {loading ? (
          <Spinner />
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Email</th>
                <th className="py-2 pr-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-2">{u.name}</td>
                  <td className="py-2 pr-2">{u.email}</td>
                  <td className="py-2 pr-2">{u.createdAt ?? "-"}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td className="py-4 text-gray-500" colSpan={3}>No users yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
