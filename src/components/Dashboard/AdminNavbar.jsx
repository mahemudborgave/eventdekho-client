import {
  AlignRight,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  School,
  Menu,
  X,
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
  const [isMobileTopNavOpen, setIsMobileTopNavOpen] = useState(false);
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

  const toggleMobileTopNav = () => {
    setIsMobileTopNavOpen(!isMobileTopNavOpen);
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

  const mobileTopNavLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 py-3 px-4 font-medium transition border-b border-gray-200 ${
      isActive ? 'bg-[#FFD600]/40 text-black' : 'hover:bg-gray-50'
    }`;

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-amber-700">EventApply</h1>
            <span className="ml-2 text-sm text-white bg-amber-700 px-2 py-1 rounded">Admin</span>
          </div>

          {/* Right side - User info and menu button */}
          <div className="flex items-center gap-3">
            {/* User info */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span className="truncate max-w-20">{user}</span>
              </div>
            )}

            {/* Hamburger menu button */}
            <button
              onClick={toggleMobileTopNav}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileTopNavOpen ? <X size={24} color='#BB4D00'/> : <Menu size={24} color='#BB4D00'/>}
            </button>
          </div>
        </div>

        {/* Mobile Top Navbar Dropdown Menu */}
        {isMobileTopNavOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="py-2">
              <NavLink 
                to="dashboard" 
                onClick={() => setIsMobileTopNavOpen(false)} 
                className={mobileTopNavLinkClasses}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </NavLink>
              
              <NavLink 
                to="addevent" 
                onClick={() => setIsMobileTopNavOpen(false)} 
                className={mobileTopNavLinkClasses}
              >
                <PlusCircle size={20} />
                Host Events
              </NavLink>
              
              <NavLink 
                to="showeventsadmin" 
                onClick={() => setIsMobileTopNavOpen(false)} 
                className={mobileTopNavLinkClasses}
              >
                <CalendarDays size={20} />
                Show Events
              </NavLink>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* User section */}
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                    Logged in as: {user}
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileTopNavOpen(false);
                      navigate('/admin/profile');
                    }}
                    className="w-full flex items-center gap-3 py-3 px-4 font-medium hover:bg-gray-50 transition"
                  >
                    <User size={20} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileTopNavOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 py-3 px-4 font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileTopNavOpen(false);
                    handleLogin();
                  }}
                  className="w-full flex items-center gap-3 py-3 px-4 font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  <User size={20} />
                  Login
                </button>
              )}

              {/* Client Portal Link */}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileTopNavOpen(false)}
                  className="flex items-center gap-3 py-3 px-4 font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  <School size={20} />
                  Client Portal
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={`text-sm fixed top-0 left-0 z-40 bg-gray-200 border-r border-gray-200 p-4 flex flex-col justify-between h-screen transition-transform duration-300
        hidden md:flex
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
