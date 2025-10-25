import { useEffect, useState } from "react";
import client from "../api/client";
import Spinner from "../components/Spinner";

export default function Categories() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
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
    try {
      const res = await client.post("/categories", { name });
      // service returns existing if duplicate
      const exists = list.some((c) => c.id === res.data.id);
      setList(exists ? list : [res.data, ...list]);
      setName("");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <form onSubmit={create} className="bg-white rounded-xl shadow p-4 flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bg-gray-900 text-white px-4 py-2 rounded">Add</button>
      </form>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">All Categories</h2>
        {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
        {loading ? (
          <Spinner />
        ) : (
          <ul className="list-disc ml-6">
            {list.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
            {list.length === 0 && <li className="text-gray-500 list-none">No categories.</li>}
          </ul>
        )}
      </section>
    </div>
  );
}
