import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { User, AlignRight, X, House, LogIn, LayoutDashboard, ChevronDown, Bell } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import eventdekhoLogo from '/eventapply.png';
import UserContext from '../context/UserContext';
import axios from 'axios';
import { io as socketIOClient } from 'socket.io-client';

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { user, token, role, setRole } = useContext(UserContext);
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const [isValid, setIsValid] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [resolvedQueries, setResolvedQueries] = useState([]);
    const [notifCount, setNotifCount] = useState(0);
    const { email } = useContext(UserContext);
    const notifRef = useRef();
    const menuRef = useRef();
    const socketRef = useRef(null);

    useEffect(() => {
        const verifyUser = async () => {
            setIsValid(false);
            if (token) {
                try {
                    const res = await axios.post(`${baseURL}:${port}/userauth/verifytoken`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data?.role) {
                        setRole(res.data.role);
                        setIsValid(true);
                    }
                } catch (e) {
                    console.log("Error ", e);
                }
            }
        };
        verifyUser();
    }, [token]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 0);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!email) return;
            try {
                const res = await axios.get(`${baseURL}:${port}/query/notifications/${email}`);
                setResolvedQueries(res.data);
                setNotifCount(res.data.length);
            } catch {}
        };
        fetchNotifications();
    }, [email]);

    useEffect(() => {
        // Hide notification dropdown on scroll
        const handleScroll = () => {
            setNotifOpen(false);
            setMenuOpen(false);
        };
        window.addEventListener('scroll', handleScroll);
        // Hide on click outside
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Only connect socket if user is logged in
        if (email) {
            const s = socketIOClient(baseURL + ':' + port, { transports: ['websocket'] });
            socketRef.current = s;
            s.emit('join', email);
            s.on('notification', (notif) => {
                setResolvedQueries((prev) => [notif, ...prev]);
                setNotifCount((prev) => prev + 1);
            });
            return () => {
                s.disconnect();
            };
        }
    }, [email]);

    const handleNotifClick = () => {
        setNotifOpen((prev) => !prev);
    };

    const handleMarkAsRead = async (notifId) => {
        try {
            await axios.delete(`${baseURL}:${port}/query/notifications/${notifId}`);
            setResolvedQueries((prev) => prev.filter(n => n._id !== notifId));
            setNotifCount((prev) => prev - 1);
        } catch {}
    };

    const handleMarkAllAsRead = async () => {
        try {
            await Promise.all(resolvedQueries.map(n => axios.delete(`${baseURL}:${port}/query/notifications/${n._id}`)));
            setResolvedQueries([]);
            setNotifCount(0);
        } catch {}
    };

    return (
        <>
            <div className={`2xl:px-[200px] px-4 z-50 flex justify-between py-3 lg:py-6 text-md items-center fixed top-0 left-0 w-full lg:h-25 ${scrolled ? "bg-white border-gray-400 shadow-md" : "bg-transparent"}`}>
                <Link to='/' className='font-bold text-xl'>
                    <img src={eventdekhoLogo} alt="logo" className='h-12 lg:h-16' />
                </Link>

                <div className="flex items-center lg:hidden">
                    {/* Notification Bell Icon for mobile */}
                    <div className="relative mr-2 flex items-center" ref={notifRef}>
                        <button
                            className="relative p-2 focus:outline-none"
                            onClick={handleNotifClick}
                            aria-label="Notifications"
                        >
                            <Bell size={22} />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                                    {notifCount}
                                </span>
                            )}
                        </button>
                        {notifOpen && (
                            <div className="absolute top-10 right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                                <div className="p-4 border-b font-semibold text-gray-700 flex justify-between items-center">
                                    <span>Notifications</span>
                                    {resolvedQueries.length > 0 && (
                                        <button
                                            className="text-xs text-blue-600 hover:underline"
                                            onClick={handleMarkAllAsRead}
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {resolvedQueries.length === 0 ? (
                                        <div className="p-4 text-gray-500">No new notifications.</div>
                                    ) : (
                                        resolvedQueries.map((q) => (
                                            <div key={q._id} className="p-4 border-b last:border-b-0 relative">
                                                <button
                                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-lg font-bold"
                                                    onClick={e => { e.stopPropagation(); handleMarkAsRead(q._id); }}
                                                    onTouchStart={e => { e.stopPropagation(); handleMarkAsRead(q._id); }}
                                                    title="Mark as read"
                                                >
                                                    &times;
                                                </button>
                                                <div className="font-medium text-green-700">Your query for <span className="font-bold">{q.eventName}</span> has been resolved!</div>
                                                <div className="text-gray-700 mt-1">{q.resolution}</div>
                                                <div className="text-xs text-gray-400 mt-1">{new Date(q.updatedAt).toLocaleString()}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="lg:hidden cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
                        {!menuOpen ? <AlignRight size={28} /> : <X size={28} />}
                    </button>
                </div>

                {/* Shared Menu */}
                <div className={`absolute text-start lg:static top-[70px] left-0 w-full lg:w-auto bg-white lg:bg-transparent px-6 lg:px-0 transition-all duration-300 ease-in-out overflow-hidden ${menuOpen ? 'max-h-[500px] py-4 shadow-md' : 'max-h-0 py-0'} lg:max-h-none lg:flex lg:items-center`} ref={menuRef}>
                    <ul className='flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-0 '>
                        <li>
                            <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? ' block text-[#0d0c22] px-5 py-2 lg:border-b border-l lg:border-l-0' : 'block black px-5 py-2'}>Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/events" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? ' block text-[#0d0c22] px-5 py-2 lg:border-b border-l lg:border-l-0' : 'block black px-5 py-2'}>Events</NavLink>
                        </li>
                        <li>
                            <NavLink to="/colleges" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? ' block text-[#0d0c22] px-5 py-2 lg:border-b border-l lg:border-l-0' : 'block black px-5 py-2'}>Colleges</NavLink>
                        </li>
                        <li>
                            <NavLink to="/myParticipations" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? ' block text-[#0d0c22] px-5 py-2 lg:border-b border-l lg:border-l-0' : 'block black px-5 py-2'}>My Participations</NavLink>
                        </li>
                        <li className="relative lg:static">
                            <button
                                type="button"
                                className="flex items-center gap-1 px-5 py-2 focus:outline-none"
                                onClick={() => setMoreOpen((prev) => !prev)}
                                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                            >
                                More <ChevronDown size={16} />
                            </button>
                            {moreOpen && (
                                <ul className="absolute left-0 lg:left-1/2 mt-2 bg-white border rounded shadow-lg min-w-[160px] z-50">
                                    <li>
                                        <NavLink to="/about" onClick={() => { setMenuOpen(false); setMoreOpen(false); }} className={({ isActive }) => isActive ? 'block text-[#0d0c22] px-5 py-2 bg-blue-100' : 'block black px-5 py-2'}>About</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/contactus" onClick={() => { setMenuOpen(false); setMoreOpen(false); }} className={({ isActive }) => isActive ? 'block text-[#0d0c22] px-5 py-2 bg-blue-100' : 'block black px-5 py-2'}>Contact Us</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/blogs" onClick={() => { setMenuOpen(false); setMoreOpen(false); }} className={({ isActive }) => isActive ? 'block text-[#0d0c22] px-5 py-2 bg-blue-100' : 'block black px-5 py-2'}>Blogs</NavLink>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                    <div className='mt-8 flex flex-col items-center justify-start my-5 lg:hidden'>
                        {role === "organizer" && (
                            <NavLink to="/admin/dashboard" onClick={() => setMenuOpen(false)} className='px-5 py-1 text-black border rounded-full hover:bg-[#bebdbd4f] hover:border-[#bebdbd4f]'>
                                Dashboard
                            </NavLink>
                        )}
                        {!isValid ? (
                            <div className='flex justify-center items-center'>
                                <Link to="/login" onClick={() => setMenuOpen(false)} className='flex items-center mr-1 px-5 py-1 lg:px-5 lg:py-2 bg-[#0d0c22] rounded-full border text-white'><LogIn size={18} className='mr-2'/>Log in</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)} className='px-5 py-1 lg:px-5 lg:py-2 rounded-full hover:bg-[#bebdbd4f] lg:hover:none'>Sign up</Link>
                            </div>
                        ) : (
                            <div className=''>
                                <Link to='/studentprofile' onClick={() => setMenuOpen(false)} className='hover:underline flex items-center px-5 py-2'>
                                    Welcome, <span className='text-amber-400 ml-1'>{user}</span>
                                    <User size={28} className='ml-2 bg-amber-300 p-1 rounded-full hover:outline-amber-100 hover:outline-offset-2' />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
                <div className='hidden lg:flex items-center'>
                {/* Notification Bell Icon - left of profile/user name */}
                        <div className="relative order-last lg:order-none lg:ml-0 lg:mr-5 flex items-center" ref={notifRef}>
                            <button
                                className="relative p-2 focus:outline-none bg-green-500/20 rounded-full"
                                onClick={handleNotifClick}
                                aria-label="Notifications"
                            >
                                <Bell size={22} />
                                {notifCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                                        {notifCount}
                                    </span>
                                )}
                            </button>
                            {notifOpen && (
                                <div className="absolute top-10 right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                                    <div className="p-4 border-b font-semibold text-gray-700 flex justify-between items-center">
                                        <span>Notifications</span>
                                        {resolvedQueries.length > 0 && (
                                            <button
                                                className="text-xs text-blue-600 hover:underline"
                                                onClick={handleMarkAllAsRead}
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {resolvedQueries.length === 0 ? (
                                            <div className="p-4 text-gray-500">No new notifications.</div>
                                        ) : (
                                            resolvedQueries.map((q) => (
                                                <div key={q._id} className="p-4 border-b last:border-b-0 relative">
                                                    <button
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-lg font-bold"
                                                        onClick={e => { e.stopPropagation(); handleMarkAsRead(q._id); }}
                                                        onTouchStart={e => { e.stopPropagation(); handleMarkAsRead(q._id); }}
                                                        title="Mark as read"
                                                    >
                                                        &times;
                                                    </button>
                                                    <div className="font-medium text-green-700">Your query for <span className="font-bold">{q.eventName}</span> has been resolved!</div>
                                                    <div className="text-gray-700 mt-1">{q.resolution}</div>
                                                    <div className="text-xs text-gray-400 mt-1">{new Date(q.updatedAt).toLocaleString()}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    {role === "organizer" && (
                        <NavLink to="/admin/dashboard" onClick={() => setMenuOpen(false)} className='px-5 py-1 text-black border rounded-full hover:bg-[#bebdbd4f] hover:border-[#bebdbd4f] flex gap-2'>
                            Dashboard
                        </NavLink>
                    )}
                    {!isValid ? (
                        <div className='flex justify-start items-center ml-10'>
                            <Link to="/login" className='flex items-center mr-1 px-5 py-1 lg:px-5 lg:py-2 bg-[#0d0c22] rounded-full border text-white'><LogIn size={18} className='mr-2'/>Log in</Link>
                            <Link to="/register" className='px-5 py-1 lg:px-5 lg:py-2 rounded-full hover:bg-[#bebdbd4f] lg:hover:none'>Sign up</Link>
                        </div>
                    ) : (
                        <div className='flex items-center px-5 py-2'>
                            Welcome, <span className='text-amber-400 ml-1'>{user}</span>
                            <Link to='/studentprofile'>
                                <div className='ml-2 bg-amber-300 p-2 rounded-full hover:outline-3 hover:outline-amber-100 hover:outline-offset-2'>
                                    <User size={20} />
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Tooltip id="user-tooltip" />
        </>
    );
}

export default Navbar;
