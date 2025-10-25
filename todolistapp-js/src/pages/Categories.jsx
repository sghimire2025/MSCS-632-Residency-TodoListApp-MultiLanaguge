import { useEffect, useState } from "react";
import client from "../api/client";
import Spinner from "../components/Spinner";
import { toast } from "react-hot-toast";

export default function Categories() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await client.get("/categories");
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
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Category name is required");
      return;
    }
    const t = toast.loading("Saving category...");
    try {
      const res = await client.post("/categories", { name: trimmed });
      setList((cur) =>
        cur.some((c) => c.id === res.data.id) ? cur : [res.data, ...cur]
      );
      setName("");
      toast.success("Category saved", { id: t });
    } catch (e) {
      setErr(e.message);
      toast.error(e.message || "Failed to save", { id: t });
    }
  }

  async function remove(id) {
    if (!confirm("Delete this category?")) return;
    const t = toast.loading("Deleting category...");
    try {
      await client.delete(`/categories/${id}`);
      setList((cur) => cur.filter((c) => c.id !== id));
      toast.success("Category deleted", { id: t });
    } catch (e) {
      setErr(e.message);
      toast.error(e.message || "Delete failed", { id: t });
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-gray-600">
          Create and manage task categories.
        </p>
      </header>

      <form
        onSubmit={create}
        className="bg-white rounded-xl shadow p-4 flex gap-2"
      >
        <input
          className="border rounded p-2 flex-1"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bg-gray-900 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">All Categories</h2>
        {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
        {loading ? (
          <Spinner />
        ) : (
          <ul className="divide-y">
            {list.map((c) => (
              <li key={c.id} className="py-2 flex items-center justify-between">
                <span>{c.name}</span>
                <button
                  onClick={() => remove(c.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
            {list.length === 0 && (
              <li className="py-4 text-gray-500">No categories.</li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
