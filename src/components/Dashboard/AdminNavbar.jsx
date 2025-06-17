import {
  AlignRight,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
} from 'lucide-react';
import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserContext from '../../context/UserContext';

function AdminNavbar({ onToggle }) {
  const {
    user,
    setUser,
    setToken,
    setEmail,
    setRole,
  } = useContext(UserContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle(newState);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("email");

      setToken(null);
      setUser(null);
      setEmail(null);
      setRole(null);

      toast.success("Logged Out!", { autoClose: 2000 });
      navigate('/admin/dashboard'); // Redirect to login page
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 py-2 font-medium transition ${
      isActive ? 'bg-[#FFD600]/40 text-black' : 'hover:bg-[#FFD600]/20'
    } ${isCollapsed ? 'justify-center' : 'px-3'}`;

  return (
    <aside
      className={`text-sm ${
        isCollapsed ? 'w-20' : 'w-64'
      } min-h-screen bg-gray-200 border-r border-gray-200 p-4 flex flex-col justify-between fixed top-0 left-0 transition-all duration-300`}
    >
      <div>
        <div className="flex justify-between items-center mb-8">
          {!isCollapsed && <p className="font-bold px-2">ADMIN</p>}
          <button
            onClick={toggleSidebar}
            className={`ml-auto ${isCollapsed ? 'mx-auto' : ''}`}
          >
            <AlignRight size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="dashboard" className={linkClasses}>
            <LayoutDashboard size={20} />
            {!isCollapsed && 'Dashboard'}
          </NavLink>
          <NavLink to="addevent" className={linkClasses}>
            <PlusCircle size={20} />
            {!isCollapsed && 'Add Events'}
          </NavLink>
          <NavLink to="showeventsadmin" className={linkClasses}>
            <CalendarDays size={20} />
            {!isCollapsed && 'Show Events'}
          </NavLink>
        </nav>
      </div>

      <div className="flex flex-col items-center mb-6">
        <Link className="text-red-600 underline" to='/'>Client Portal</Link>
        {user && !isCollapsed && (
          <p className="mb-3 flex items-center justify-center">
            <User style={{ marginRight: '10px' }} /> {user}
          </p>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className={`flex gap-2 items-center justify-center w-full text-white bg-red-600 px-3 py-2 font-medium hover:bg-[#FFD600]/20 transition ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} />
            {!isCollapsed && 'Logout'}
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className={`flex gap-2 items-center justify-center w-full text-white bg-blue-600 px-3 py-2 font-medium hover:bg-blue-500 transition ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <User size={20} />
            {!isCollapsed && 'Login'}
          </button>
        )}
      </div>
    </aside>
  );
}

export default AdminNavbar;
