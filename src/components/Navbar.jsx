import React, { useEffect, useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { User, AlignRight, X } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import eventdekhoLogo from '../assets/images/eventdekho-logo.png';
import UserContext from '../context/UserContext';
import axios from 'axios';

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { user, token, role, setRole } = useContext(UserContext);
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const [isValid, setIsValid] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

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

    return (
        <>
            <div className={`2xl:px-[200px] px-4 z-50 flex justify-between py-3 lg:py-6 text-md items-center fixed top-0 left-0 w-full lg:h-25 ${scrolled ? "bg-white border-gray-400 shadow-md" : "bg-transparent"}`}>
                <Link to='/' className='font-bold text-xl'>
                    <img src={eventdekhoLogo} alt="logo" className='h-12 lg:h-16' />
                </Link>

                <button className="lg:hidden cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
                    {!menuOpen ? <AlignRight size={28} /> : <X size={28} />}
                </button>

                {/* Shared Menu */}
                <div className={`absolute text-start lg:static top-[70px] left-0 w-full lg:w-auto bg-white lg:bg-transparent px-6 lg:px-0 transition-all duration-300 ease-in-out overflow-hidden ${menuOpen ? 'max-h-[500px] py-4 shadow-md' : 'max-h-0 py-0'} lg:max-h-none lg:flex lg:items-center`}>
                    <ul className='flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-0'>
                        <li>
                            <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'text-amber-500 px-5 py-1 border-b' : 'black px-5 py-2'}>Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/events" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'text-amber-500 px-5 py-1 border-b' : 'black px-5 py-2'}>Events</NavLink>
                        </li>
                        <li>
                            <NavLink to="/colleges" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'text-amber-500 px-5 py-1 border-b' : 'black px-5 py-2'}>Colleges</NavLink>
                        </li>
                        <li>
                            <NavLink to="/myParticipations" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'text-amber-500 px-5 py-1 border-b' : 'black px-5 py-2'}>My Participations</NavLink>
                        </li>
                        {role === "organizer" && (
                            <li>
                                <NavLink to="/admin/dashboard" onClick={() => setMenuOpen(false)} className='px-5 py-2 text-black'>
                                    Dashboard
                                </NavLink>
                            </li>
                        )}
                    </ul>
                    <div className='mt-8 flex justify-start my-5 lg:hidden'>
                        {!isValid ? (
                            <div className='flex justify-center items-center'>
                                <Link to="/login" onClick={() => setMenuOpen(false)} className='inline-block mr-1` px-5 py-1 lg:px-5 lg:py-2 bg-[#0d0c22] rounded-full border text-white'>Log in</Link>

                                <Link to="/register" onClick={() => setMenuOpen(false)} className='px-5 py-1 lg:px-5 lg:py-2 rounded-full hover:bg-[#bebdbd4f] lg:hover:none'>Sign up</Link>

                            </div>
                        ) : (
                            <div className='flex items-center px-5 py-2'>
                                Welcome, <span className='text-amber-400 ml-1'>{user}</span>
                                <Link to='/studentprofile' onClick={() => setMenuOpen(false)}>
                                    <User size={28} className='ml-2 bg-amber-300 p-1 rounded-full hover:outline-amber-100 hover:outline-offset-2' />
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
                <div className='hidden lg:block'>
                    {!isValid ? (
                        <div className='flex justify-start items-center ml-10'>
                            <Link to="/login" onClick={() => setMenuOpen(false)} className='inline-block mr-3 px-5 py-1 lg:px-5 lg:py-2 bg-[#0d0c22] rounded-full border text-white'>Log in</Link>

                            <Link to="/register" onClick={() => setMenuOpen(false)} className='px-5 py-1 lg:px-5 lg:py-2 rounded-full hover:bg-[#bebdbd4f] lg:hover:none'>Sign up</Link>

                        </div>
                    ) : (
                        <div className='flex items-center px-5 py-2'>
                            Welcome, <span className='text-amber-400 ml-1'>{user}</span>
                            <Link to='/studentprofile' onClick={() => setMenuOpen(false)}>
                                <User size={28} className='ml-2 bg-amber-300 p-1 rounded-full hover:outline-amber-100 hover:outline-offset-2' />
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
