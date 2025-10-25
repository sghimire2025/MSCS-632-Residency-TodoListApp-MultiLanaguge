import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err.message || "Request failed";
    console.error("[API ERROR]", msg, err?.response);
    return Promise.reject(new Error(msg));
  }
);

export default client;
