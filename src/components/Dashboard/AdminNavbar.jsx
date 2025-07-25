import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserContext from '../../context/UserContext';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { Button } from '../ui/button';
import { NavigationMenu } from '../ui/navigation-menu';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '../ui/sheet';
import {
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  School,
  Menu,
  MessageCircle,
  LogIn,
  X,
  FileText,
} from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle, DialogDescription } from '../ui/dialog';

function AdminNavbar({ onToggle }) {
  const { user, setUser, setToken, setEmail, setRole, role } = useContext(UserContext);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('theme');
      setToken(null);
      setUser(null);
      setEmail(null);
      setRole(null);
      // Reset theme to light and reload the app
      localStorage.setItem('theme', 'light');
      toast.success('Logged Out!', { autoClose: 2000 });
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Desktop Navigation Links
  const navLinks = [
    { to: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: 'addevent', label: 'Host Events', icon: <PlusCircle size={20} /> },
    { to: 'showeventsadmin', label: 'Show Events', icon: <CalendarDays size={20} /> },
    { to: 'queries', label: 'Queries', icon: <MessageCircle size={20} /> },
    // { to: 'transactions', label: 'Transactions', icon: <FileText size={20} /> },
  ];

  return (
    <>
      {/* Mobile Navbar with Sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo/Brand */}
          <Link to="/admin/dashboard" className="flex items-center group">
            <h1 className="text-lg font-bold text-amber-700 dark:text-amber-500 group-hover:underline">EventApply</h1>
            <span className="ml-2 text-sm text-white bg-amber-700 dark:bg-amber-900/50 dark:text-amber-600 px-2 py-1 rounded">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu" className="dark:border-gray-600 dark:text-gray-200">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent
                className="dark:bg-gray-900 dark:text-gray-100 transition-transform duration-300 ease-in-out transform data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full p-4"
                style={{ willChange: 'transform' }}
              >
                <VisuallyHidden>
                  <DialogTitle>Admin Navigation Menu</DialogTitle>
                  <DialogDescription>Mobile navigation for admin panel</DialogDescription>
                </VisuallyHidden>
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <div className='pb-3'>
                    <Link to="/admin/dashboard" className="flex items-center group">
                      <h1 className="text-lg font-bold text-amber-700 dark:text-amber-500 group-hover:underline">EventApply</h1>
                      <span className="ml-2 text-sm text-white bg-amber-700 dark:bg-amber-900/50 dark:text-amber-600 px-2 py-1 rounded">Admin</span>
                    </Link>
                  </div>
                  <SheetClose asChild>
                    <button
                      aria-label="Close menu"
                      className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none pb-3"
                    >
                      <X size={24} />
                    </button>
                  </SheetClose>
                </div>
                <div className={`flex flex-col mt-4 gap-2`}>
                  {navLinks.map(link => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 py-2 px-6 w-full rounded-none font-medium transition text-left ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-amber-700 dark:text-amber-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200'} `
                      }
                      onClick={() => {
                        setMobileNavOpen(false);
                        document.activeElement.blur();
                      }}
                    >
                      {link.icon}
                      {link.label}
                    </NavLink>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <SheetClose asChild>
                    <Link to="/" className="flex items-center gap-3 py-2 px-3 rounded font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800" target="_blank">
                      <School size={20} /> Client Portal
                    </Link>
                  </SheetClose>
                  {user ? (
                    <>
                      <Button variant="outline" className="w-full justify-start dark:text-gray-200 py-7 mb-1" onClick={() => navigate('/admin/profile')}>
                        <span className="break-words whitespace-normal text-center">{user}</span>
                      </Button>
                      <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut size={20} className="mr-2" /> Logout
                      </Button>
                    </>
                  ) : (
                    <Button variant="default" className="w-full justify-start dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800" onClick={handleLogin}>
                      <User size={20} className="mr-2" /> Login
                    </Button>
                  )}
                </div>
                <div className="mt-8 flex justify-center">
                  <ThemeSwitcher />
                </div>
                <SheetClose />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      {role === 'organizer' && (
        <aside className={`hidden md:flex flex-col fixed top-0 left-0 h-full z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">

            {!isSidebarCollapsed && (
              <Link to="/admin/dashboard" className="flex items-center group">
                <h1 className="text-lg font-bold text-amber-700 dark:text-amber-500 group-hover:underline">EventApply</h1>
                <span className="ml-2 text-sm text-white bg-amber-700 dark:bg-amber-900/50 dark:text-amber-600 px-2 py-1 rounded">Admin</span>
              </Link>
            )}

            <Button variant="outline" size="icon" className={`dark:text-gray-200 ${isSidebarCollapsed ? 'ml-0' : 'ml-4'}`} onClick={() => { setIsSidebarCollapsed(v => !v); onToggle && onToggle(!isSidebarCollapsed); }}>
              {isSidebarCollapsed ? <Menu size={22} /> : <X size={22} />}
            </Button>
          </div>
          <nav className="flex-1 flex flex-col gap-1 mt-6 px-0">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-6 w-full rounded-none font-medium transition text-left ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-amber-700 dark:text-amber-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200'} `
                }
                style={{ minWidth: 0 }}
                title={isSidebarCollapsed ? link.label : undefined}
              >
                {link.icon}
                {!isSidebarCollapsed && <span className="truncate">{link.label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <Link className="text-red-600 dark:text-red-400 underline mb-1 text-center" to='/' target="_blank">Client Portal</Link>
            {user && !isSidebarCollapsed && (
              <Button variant="outline" className="mb-3 py-8 w-full justify-start dark:text-gray-200 break-words whitespace-normal text-left" onClick={() => navigate('/admin/profile')}>
                <span className="break-words whitespace-normal text-center">{user}</span>
              </Button>
            )}
            {user ? (
              <Button variant="destructive" className="w-full justify-center" onClick={handleLogout} title={isSidebarCollapsed ? 'Logout' : undefined}>
                <LogOut className="mr-2" /> {!isSidebarCollapsed && 'Logout'}
              </Button>
            ) : (
              <Button variant="default" className="w-full justify-center dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800" onClick={handleLogin} title={isSidebarCollapsed ? 'Login' : undefined}>
                <User className="mr-2" /> {!isSidebarCollapsed && 'Login'}
              </Button>
            )}
            <div className="mt-4 flex justify-center">
              <ThemeSwitcher />
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

export default AdminNavbar;
