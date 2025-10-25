import { NavLink } from "react-router-dom";

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
  }`;

export default function NavBar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2">
        <NavLink to="/tasks" className={linkCls}>Tasks</NavLink>
        <NavLink to="/categories" className={linkCls}>Categories</NavLink>
        <NavLink to="/users" className={linkCls}>Users</NavLink>
      </div>
    </nav>
  );
}
