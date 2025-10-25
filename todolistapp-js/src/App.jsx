import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import NavBar from "./components/NavBar";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/tasks" replace />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
