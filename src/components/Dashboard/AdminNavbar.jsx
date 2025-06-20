import {
  AlignRight,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  School,
} from 'lucide-react';
import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserContext from '../../context/UserContext';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

function AdminNavbar({ onToggle }) {
  const { user, setUser, setToken, setEmail, setRole, email, role } = useContext(UserContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebarCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle(newState);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
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
      navigate('/admin/dashboard');
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
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden fixed top-10 right-8 z-50"> 
        <button onClick={toggleMobileSidebar} className="bg-gray-300 p-2 rounded">
          <AlignRight size={22} />
        </button>
      </div>

      <aside
        className={`text-sm fixed top-0 left-0 z-40 bg-gray-200 border-r border-gray-200 p-4 flex flex-col justify-between h-screen transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div>
          <div className={`flex ${isMobileOpen ? 'justify-between' : 'justify-center'} items-center mb-8`}>
            {!isCollapsed && <p className="font-bold px-4">ADMIN</p>}
            <button onClick={toggleSidebarCollapse} className={`hidden md:block`}>
              <AlignRight size={22} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <NavLink to="dashboard" onClick={() => setIsMobileOpen(false)} className={linkClasses}>
              <LayoutDashboard size={20} />
              {!isCollapsed && 'Dashboard'}
            </NavLink>
            {/* <NavLink to="registercollege" onClick={() => setIsMobileOpen(false)} className={linkClasses}>
              <School size={20} />
              {!isCollapsed && 'Register College'}
            </NavLink> */}
            <NavLink to="addevent" onClick={() => setIsMobileOpen(false)} className={linkClasses}>
              <PlusCircle size={20} />
              {!isCollapsed && 'Host Events'}
            </NavLink>
            <NavLink to="showeventsadmin" onClick={() => setIsMobileOpen(false)} className={linkClasses}>
              <CalendarDays size={20} />
              {!isCollapsed && 'Show Events'}
            </NavLink>    
          </nav>
        </div>

        <div className="flex flex-col items-center mb-6">
          <Link className="text-red-600 underline" to='/'>Client Portal</Link>
          {user && !isCollapsed && (
            <button
              className="mb-3 flex items-center justify-center text-blue-700 font-semibold hover:underline"
              onClick={() => navigate('/admin/profile')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <User style={{ marginRight: '10px' }} /> {user}
            </button>
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
    </>
  );
}

export default AdminNavbar;
