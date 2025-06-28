import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import PasswordIcon from '@mui/icons-material/Password';
import MailIcon from '@mui/icons-material/Mail';
import UserContext from '../context/UserContext';
import { ScaleLoader } from 'react-spinners';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { getLastVisitedPage, clearLastVisitedPage, getSmartRedirectPath } from '../utils/navigationUtils';

function Login() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const navigate = useNavigate();
    const location = useLocation();

    const { user, setUser } = useContext(UserContext);
    const { email, setEmail } = useContext(UserContext);
    const { token, setToken } = useContext(UserContext);
    const { role, setRole } = useContext(UserContext);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // loader state

    // Track page visits for smart redirects
    useEffect(() => {
        // Don't track login page itself
        if (location.pathname !== '/login') {
            // This will be handled by the main App component
        }
    }, [location.pathname]);

    const handleChange = (e) => {
        if (e.target.name === 'email') {
            setEmail(e.target.value);
        }
        else if (e.target.name === 'password') {
            setPassword(e.target.value);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);  // Show loader
        try {
            const res = await axios.post(`${baseURL}:${port}/auth/login`, { email, password });

            if (res.data.token) {
                // Get the correct user name based on role
                const userName = res.data.user.role === 'student' ? res.data.user.name : res.data.user.organizationName;
                
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', userName);
                localStorage.setItem('email', res.data.user.email);
                localStorage.setItem('role', res.data.user.role);
                
                setUser(userName);
                setToken(res.data.token);
                setRole(res.data.user.role);
                
                toast.success("Logged In!", { autoClose: 1000 });
                setTimeout(() => {
                    // Redirect based on role
                    if (res.data.user.role === 'organizer') {
                        navigate('/adminprofile');
                    } else {
                        navigate('/studentprofile');
                    }
                }, 1000);
            } else {
                toast.error("Login failed: No token received", { autoClose: 1000 });
            }
        }
        catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    toast.warn(error.response.data.message || "Invalid credentials");
                } else {
                    toast.error("Error while logging in");
                }
            } else {
                toast.error("Network or server error");
            }
        }
        finally {
            setLoading(false); // Hide loader
        }
    }

    // useEffect(() => {
    //     toast.info("Test toast from App.jsx");
    //   }, []);

    return (
        <>
            <div className='flex lg:w-[1000px] w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:shadow-[5px_5px_20px_rgba(0,0,0,0.3)]'>
                <div className='w-[50%] hidden lg:flex justify-center items-center text-white font-bold'
                    style={{
                        background: 'linear-gradient(90deg, hsla(34, 100%, 54%, 1) 2%, hsla(39, 100%, 58%, 1) 53%, hsla(43, 100%, 60%, 1) 87%)'
                    }}>
                    <p className='text-3xl'>Welcome Back!</p>
                </div>
                <div className='lg:p-20 lg:w-1/2 w-[300px] mx-auto border-3 border-amber-500 p-8'>
                    <p className='text-amber-300 font-bold text-3xl mb-4'>Login</p>
                    <p className='mb-6'>Sign in to your account</p>
                    <form onSubmit={handleSubmit}>
                        <div className='flex items-center justify-start bg-gray-100 w-full mb-4 p-2 '>
                            <MailIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                            <input type="email" name="email" placeholder='Enter your email' className='focus:outline-0 text-sm grow' onChange={handleChange} required />
                        </div>
                        <div className='flex items-center justify-start bg-gray-100 w-full mb-7 p-2 '>
                            <PasswordIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                            <input type="password" name="password" placeholder='Enter password' className='block focus:outline-0 text-sm grow' onChange={handleChange} required />
                        </div>

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ backgroundColor: '#FF9C16', mb: 2, display: 'block', fontWeight: 'bold', color: '#fff', width: '100%' }}
                        >Login</Button>
                    </form>
                    <Link to='/signup' className='text-[#8d8d8d] group text-sm'>New User ? <span className='group-hover:text-amber-500'>Sign Up</span></Link>
                </div>
            </div>

            <Modal open={loading} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box className="flex justify-center items-center h-screen">
                    <ScaleLoader color="#FF9C16" />
                </Box>
            </Modal>
        </>
    )
}

export default Login
