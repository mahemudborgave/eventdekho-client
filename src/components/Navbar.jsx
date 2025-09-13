import React, { useEffect, useState, useContext, useRef, useCallback, useMemo } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { User, AlignRight, X, House, LogIn, LayoutDashboard, ChevronDown, Bell, Heart, Plus } from 'lucide-react';
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
    const navigate = useNavigate();

    useEffect(() => {
        const verifyUser = async () => {
            setIsValid(false);
            if (token) {
                try {
                    const res = await axios.post(`${baseURL}:${port}/auth/verify`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data?.valid && res.data?.user?.role) {
                        setRole(res.data.user.role);
                        setIsValid(true);
                    }
                } catch (e) {
                    console.log("Error ", e);
                    // Clear invalid token from localStorage and state
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('email');
                    localStorage.removeItem('role');
                    setToken(null);
                    setUser(null);
                    setEmail(null);
                    setRole(null);
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
                // console.log('Fetching notifications for:', email);
                const res = await axios.get(`${baseURL}:${port}/query/notifications/${email}`);
                // console.log('Fetched notifications:', res.data.length);
                setResolvedQueries(res.data);
                setNotifCount(res.data.length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
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

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        // Only connect socket if user is logged in
        if (email) {
            // console.log('Attempting to connect to WebSocket at:', baseURL + ':' + port);
            const s = socketIOClient(baseURL + ':' + port, {
                transports: ['websocket'],
                timeout: 5000,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            socketRef.current = s;

            s.on('connect', () => {
                // console.log('WebSocket connected successfully');
                s.emit('join', email);
            });

            s.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
            });

            s.on('disconnect', (reason) => {
                console.log('WebSocket disconnected:', reason);
            });

            s.on('notification', (notif) => {
                console.log('Received notification:', notif);
                setResolvedQueries((prev) => [notif, ...prev]);
                setNotifCount((prev) => prev + 1);
            });

            return () => {
                // console.log('Cleaning up WebSocket connection');
                s.disconnect();
            };
        }
    }, [email, baseURL, port]);

    const handleNotifClick = useCallback(() => {
        setNotifOpen((prev) => !prev);
    }, []);

    const handleMarkAsRead = useCallback(async (notifId) => {
        try {
            console.log('Marking notification as read:', notifId);
            const response = await axios.delete(`${baseURL}:${port}/query/notifications/${notifId}`);
            console.log('Delete response:', response.data);

            // Update both states in a single batch to prevent visual glitches
            setResolvedQueries((prev) => {
                const filtered = prev.filter(n => n._id !== notifId);
                console.log('Previous notifications:', prev.length, 'After filtering:', filtered.length);

                // Update count immediately to keep them in sync
                setNotifCount(filtered.length);

                return filtered;
            });

        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Don't update state if the API call failed
        }
    }, [baseURL, port]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            console.log('Marking all notifications as read');
            await Promise.all(resolvedQueries.map(n => axios.delete(`${baseURL}:${port}/query/notifications/${n._id}`)));
            console.log('All notifications marked as read');
            setResolvedQueries([]);
            setNotifCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [resolvedQueries, baseURL, port]);

    return (
        <>
            <div className={
                [
                    // Full width with small responsive paddings
                    "w-full",
                    "px-4",
                    "sm:px-4",
                    "2xl:px-30",
                    // Existing classes
                    "z-50 flex justify-between py-3 lg:py-6 text-md items-center fixed top-0 left-0 w-full lg:h-25 transition-all duration-300",
                    scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
                ].join(' ')
            }>
                <Link to='/' className='font-bold text-xl transition-transform duration-200'>
                    <img src={eventdekhoLogo} alt="logo" className='h-11 lg:h-13 drop-shadow-lg' />
                </Link>

                <div className="flex items-center xl:hidden">
                    {/* Notification Bell Icon for mobile */}
                    <div className="relative mr-2 flex items-center" ref={notifRef}>
                        <button
                            className="relative p-2 focus:outline-none bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            onClick={handleNotifClick}
                            aria-label="Notifications"
                        >
                            <Bell size={22} />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 animate-pulse">
                                    {notifCount}
                                </span>
                            )}
                        </button>
                        {notifOpen && (
                            <div className="absolute top-10 right-0 mt-2 w-80 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-2xl z-50 transform transition-all duration-300 ease-out">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span className="font-semibold text-gray-800 text-sm">Notifications here</span>
                                        </div>
                                        {resolvedQueries.length > 0 && (
                                            <button
                                                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded-full transition-all duration-200 font-medium"
                                                onClick={handleMarkAllAsRead}
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto bg-white">
                                    {resolvedQueries.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Bell size={20} className="text-blue-500" />
                                            </div>
                                            <div className="text-gray-500 text-sm font-medium">No new notifications</div>
                                            <div className="text-gray-400 text-xs mt-1">We'll notify you when there's something new</div>
                                        </div>
                                    ) : (
                                        resolvedQueries.map((q) => (
                                            <div key={q._id} className="p-4 pb-0 relative transition-all duration-200 border-b border-gray-100 last:border-b-0">
                                                <button
                                                    className="absolute top-6 right-6 text-gray-400 hover:text-red-500 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-sm font-bold"
                                                    onClick={e => { e.stopPropagation(); handleMarkAsRead(q._id); }}
                                                    onTouchStart={e => { e.stopPropagation(); handleMarkAsRead(q._id); }}
                                                    title="Mark as read"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <div className="flex items-start gap-3 border border-gray-300 p-2 rounded-lg">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-500 text-sm leading-tight">
                                                            Query for <span className="font-bold text-gray-700">{q.eventName}</span> resolved!
                                                        </div>
                                                        <div className="text-blue-600 text-sm leading-relaxed bg-gray-50 p-1">
                                                            {q.resolution}
                                                        </div>
                                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                                            {new Date(q.updatedAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                    <button
                                        className="w-full text-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 py-2 px-4 rounded-lg transition-all duration-200 font-medium text-sm"
                                        onClick={handleNotifClick}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="xl:hidden cursor-pointer p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-200" onClick={() => setMenuOpen(!menuOpen)}>
                        {!menuOpen ? <AlignRight size={24} /> : <X size={24} />}
                    </button>
                </div>

                {/* Shared Menu */}
                <div className={`absolute text-start xl:static top-[70px] left-0 w-full xl:w-auto bg-white/95 backdrop-blur-md xl:bg-transparent px-6 xl:px-0 transition-all duration-300 ease-in-out overflow-hidden ${menuOpen ? 'max-h-[500px] py-4 shadow-lg' : 'max-h-0 py-0'} xl:max-h-none xl:flex xl:items-center`} ref={menuRef}>
                    <ul className='flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-0'>
                        <li>
                            <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 lg:border-b-2 lg:border-blue-500 transition-all duration-200' : 'block text-gray-700 hover:text-blue-600 px-5 py-2 hover:bg-blue-50 lg:hover:bg-transparent rounded-lg lg:rounded-none transition-all duration-200'}>Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/events" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 lg:border-b-2 lg:border-blue-500 transition-all duration-200' : 'block text-gray-700 hover:text-blue-600 px-5 py-2 hover:bg-blue-50 lg:hover:bg-transparent rounded-lg lg:rounded-none transition-all duration-200'}>Events</NavLink>
                        </li>
                        <li>
                            <NavLink to="/organizations" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 lg:border-b-2 lg:border-blue-500 transition-all duration-200' : 'block text-gray-700 hover:text-blue-600 px-5 py-2 hover:bg-blue-50 lg:hover:bg-transparent rounded-lg lg:rounded-none transition-all duration-200'}>Clubs</NavLink>
                        </li>
                        <li>
                            <NavLink to="/myParticipations" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 lg:border-b-2 lg:border-blue-500 transition-all duration-200' : 'block text-gray-700 hover:text-blue-600 px-5 py-2 hover:bg-blue-50 lg:hover:bg-transparent rounded-lg lg:rounded-none transition-all duration-200'}>My Participations</NavLink>
                        </li>
                        {/* Wishlist link for mobile only */}
                        <li className="block lg:hidden">
                            <NavLink to="/wishlist" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'block text-pink-600 font-semibold px-5 py-2 transition-all duration-200' : 'block text-gray-700 hover:text-pink-600 px-5 py-2 hover:bg-pink-50 rounded-lg transition-all duration-200'}>
                                <span className="inline-flex items-center gap-2"><Heart size={18} /> Wishlist</span>
                            </NavLink>
                        </li>
                        <li className="relative xl:hidden">
                            <button
                                type="button"
                                className="flex items-center gap-1 px-5 py-2 focus:outline-none text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                onClick={() => setMoreOpen((prev) => !prev)}
                                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                            >
                                More <ChevronDown size={16} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {moreOpen && (
                                <ul className="absolute left-22 top-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[160px] z-[60] py-2">
                                    <li>
                                        <NavLink to="/about" onClick={() => { setMenuOpen(false); setMoreOpen(false); }} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 bg-blue-50' : 'block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-5 py-2 transition-all duration-200'}>About Us</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/contactus" onClick={() => { setMenuOpen(false); setMoreOpen(false); }} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 bg-blue-50' : 'block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-5 py-2 transition-all duration-200'}>Contact Us</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/blogs" onClick={() => { setMenuOpen(false); setMoreOpen(false); }} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 bg-blue-50' : 'block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-5 py-2 transition-all duration-200'}>Blogs</NavLink>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                    <div className='my-8 flex flex-col items-center justify-start my-5 xl:hidden'>
                        {role === "organizer" && (
                            <NavLink to="/admin/dashboard" onClick={() => setMenuOpen(false)} className='mb-2 px-5 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium' target="_blank">
                                Dashboard
                            </NavLink>
                        )}
                        {!isValid ? (
                            <div>
                                <div className='flex justify-center items-center gap-2'>
                                    <Link to="/login" onClick={() => setMenuOpen(false)} className='flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'><LogIn size={18} className='mr-2' />Log in</Link>
                                    <Link to="/signup" onClick={() => setMenuOpen(false)} className='px-5 py-2 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium'>Sign up</Link>
                                </div>
                                <Link 
                                    to="/signup" 
                                    onClick={() => setMenuOpen(false)} 
                                    className="px-5 py-2 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-medium flex items-center  justify-center gap-2"
                                >
                                    <span className="inline-flex items-center gap-2"><Plus size={18} /> Host Event</span>
                                </Link>
                            </div>
                        ) : (
                            <div className=''>
                                {role === "student" && (
                                    <Link to='/studentprofile' onClick={() => setMenuOpen(false)} className='hover:underline flex items-center px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                                        Welcome, <span className='font-semibold ml-1'>{user}</span>
                                        <User size={24} className='ml-2 bg-white/20 p-1 rounded-full' />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                <div className='hidden xl:flex items-center gap-4'>
                    {/* Desktop More Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            className="flex items-center gap-1 px-5 py-2 focus:outline-none text-gray-700 hover:text-blue-600 transition-all duration-200"
                            onClick={() => setMoreOpen((prev) => !prev)}
                        >
                            More <ChevronDown size={16} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {moreOpen && (
                            <ul className="absolute right-0 top-12 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[160px] z-[60] py-2">
                                <li>
                                    <NavLink to="/about" onClick={() => setMoreOpen(false)} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 bg-blue-50' : 'block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-5 py-2 transition-all duration-200'}>About Us</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/contactus" onClick={() => setMoreOpen(false)} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 bg-blue-50' : 'block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-5 py-2 transition-all duration-200'}>Contact Us</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/blogs" onClick={() => setMoreOpen(false)} className={({ isActive }) => isActive ? 'block text-blue-600 font-semibold px-5 py-2 bg-blue-50' : 'block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-5 py-2 transition-all duration-200'}>Blogs</NavLink>
                                </li>
                            </ul>
                        )}
                    </div>
                    {/* Notification Bell Icon - left of profile/user name */}
                    <div className="relative order-last lg:order-none lg:ml-0 lg:mr-5 flex items-center" ref={notifRef}>
                        {/* Wishlist Icon */}
                        <button
                            className="relative p-2 focus:outline-none bg-gradient-to-r from-pink-400 to-orange-400 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 mr-2"
                            aria-label="Wishlist"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/wishlist')}
                            title="Wishlist"
                        >
                            <Heart size={22} />
                        </button>
                        {/* Notification Bell Icon */}
                        <button
                            className="relative p-2 focus:outline-none bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            onClick={handleNotifClick}
                            aria-label="Notifications"
                        >
                            <Bell size={22} />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 animate-pulse">
                                    {notifCount}
                                </span>
                            )}
                        </button>
                        {notifOpen && (
                            <div className="absolute top-10 right-0 mt-2 w-80 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-2xl z-50 transform transition-all duration-300 ease-out">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                                        </div>
                                        {resolvedQueries.length > 0 && (
                                            <button
                                                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded-full transition-all duration-200 font-medium"
                                                onClick={handleMarkAllAsRead}
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto bg-white">
                                    {resolvedQueries.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Bell size={20} className="text-blue-500" />
                                            </div>
                                            <div className="text-gray-500 text-sm font-medium">No new notifications</div>
                                            <div className="text-gray-400 text-xs mt-1">We'll notify you when there's something new</div>
                                        </div>
                                    ) : (
                                        resolvedQueries.map((q, index) => (
                                            <div key={q._id} className={`p-4 pb-0 relative transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 ${index !== resolvedQueries.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                <button
                                                    className="absolute top-6 right-6 text-gray-400 hover:text-red-500 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-sm font-bold"
                                                    onClick={e => { e.stopPropagation(); handleMarkAsRead(q._id); }}
                                                    onTouchStart={e => { e.stopPropagation(); handleMarkAsRead(q._id); }}
                                                    title="Mark as read"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <div className="flex items-start gap-3 border border-gray-300 p-2 rounded-lg">
                                                    {/* <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div> */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-500 text-sm leading-tight">
                                                            Query for <span className="font-bold text-gray-700">{q.eventName}</span> resolved!
                                                        </div>
                                                        <div className="text-blue-600 text-sm leading-relaxed bg-gray-50 p-1">
                                                            {q.resolution}
                                                        </div>
                                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                                            {/* <div className="w-1 h-1 bg-gray-300 rounded-full"></div> */}
                                                            {new Date(q.updatedAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                    <button
                                        className="w-full text-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 py-2 px-4 rounded-lg transition-all duration-200 font-medium text-sm"
                                        onClick={handleNotifClick}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {role === "organizer" && (
                        <NavLink to="/admin/dashboard" onClick={() => setMenuOpen(false)} className='px-5 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex gap-2 items-center' target="_blank">
                            <LayoutDashboard size={18} />
                            Dashboard
                        </NavLink>
                    )}
                    {!isValid ? (
                        <div className='flex justify-start items-center gap-3'>
                            <Link to="/login" className='flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'><LogIn size={18} className='mr-2' />Log in</Link>
                            <Link to="/signup" className='px-5 py-2 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium'>Sign up</Link>
                            <Link
                                to="/signup"
                                className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-medium flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Host Event
                            </Link>
                        </div>
                    ) : (
                        role === "student" && (
                            <Link to='/studentprofile'>
                                <div className='flex items-center px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                                    Welcome, <span className='font-semibold ml-1'>{user ? user.slice(0, 10) + '...' : 'User'}</span>
                                    <div className='ml-2 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all duration-200'>
                                        <User size={20} />
                                    </div>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            </div>
            <Tooltip id="user-tooltip" />
        </>
    );
}

export default Navbar;
