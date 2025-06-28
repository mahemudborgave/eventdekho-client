import React, { useState, useContext } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import PasswordIcon from '@mui/icons-material/Password';
import MailIcon from '@mui/icons-material/Mail';
import Face6Icon from '@mui/icons-material/Face6';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ScaleLoader } from 'react-spinners';  // Using same loader as Login
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import UserContext from '../context/UserContext';
import { getLastVisitedPage, clearLastVisitedPage, getSmartRedirectPath } from '../utils/navigationUtils';

function Register() {

    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const navigate = useNavigate();
    const { setUser, setToken, setRole, setEmail } = useContext(UserContext);

    const [name, setName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rpassword, setRPassword] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') setName(value);
        else if (name === 'email') setUserEmail(value);
        else if (name === 'password') setPassword(value);
        else if (name === 'rpassword') setRPassword(value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(userEmail)) {
            toast.warn("Please enter a valid email address.");
            return;
        }

        if (password !== rpassword) {
            toast.warn("Password does not match");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${baseURL}:${port}/auth/register`, { name, email: userEmail, password, role: userRole });
            if (res.data) {
                // Store user data and token for automatic login
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', res.data.user.name);
                localStorage.setItem('email', res.data.user.email);
                localStorage.setItem('role', res.data.user.role);
                
                // Update context
                setToken(res.data.token);
                setUser(res.data.user.name);
                setEmail(res.data.user.email);
                setRole(res.data.user.role);
                
                // Get last visited page and determine redirect path
                const lastPage = getLastVisitedPage();
                const redirectPath = getSmartRedirectPath(res.data.user.role, lastPage);
                
                toast.success("Sign Up successful and logged in!", { autoClose: 1000 });
                setTimeout(() => {
                    clearLastVisitedPage(); // Clear after successful redirect
                    navigate(redirectPath);
                }, 1000);
            }
        }
        catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    toast.warn(error.response.data.message || "Invalid data");
                } else {
                    toast.error("Error while signing up");
                }
            } else {
                toast.error("Network or server error");
            }
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className='flex lg:w-[900px] w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:shadow-[5px_5px_20px_rgba(0,0,0,0.3)]'>
                <div className='w-[50%] hidden lg:flex justify-center items-center text-white font-bold'
                    style={{
                        background: 'linear-gradient(90deg, hsla(34, 100%, 54%, 1) 2%, hsla(39, 100%, 58%, 1) 53%, hsla(43, 100%, 60%, 1) 87%)'
                    }}>
                    <p className='text-3xl'>Welcome !</p>
                </div>
                <div className='lg:p-20 lg:w-1/2 w-[300px] mx-auto border-3 border-amber-500 p-8'>
                    <p className='text-amber-300 font-bold text-3xl mb-4'>Sign Up</p>
                    <p className='mb-6'>Welcome ! Please create your account</p>
                    <form onSubmit={handleSubmit}>
                        <div className='flex items-center justify-start bg-gray-100 w-full mb-4 p-2 '>
                            <Face6Icon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                            <input type="text" name="name" placeholder='Enter your name' className='block focus:outline-0 text-sm' onChange={handleChange} required />
                        </div>
                        <div className='flex items-center justify-start bg-gray-100 w-full mb-4 p-2 '>
                            <MailIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                            <input type="email" name="email" placeholder='Enter your email' className='block focus:outline-0 text-sm' onChange={handleChange} required />
                        </div>
                        <div className='flex justify mb-4'>
                            <label
                                htmlFor="student"
                                className={`p-2 text-sm mr-2 flex items-center grow ${userRole === 'student' ? 'bg-gray-300 border border-gray-400' : 'bg-gray-100'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    id="student"
                                    value="student"
                                    required
                                    className='appearance-none'
                                    checked={userRole === "student"}
                                    onChange={(e) => setUserRole(e.target.value)}
                                />
                                {userRole === 'student' ? <CheckCircleIcon className='mr-2' sx={{ fontSize: 20 }} /> : null}
                                Student
                            </label>
                            <label
                                htmlFor="organizer"
                                className={`p-2 text-sm flex items-center grow ${userRole === "organizer" ? 'bg-gray-300 border border-gray-400' : 'bg-gray-100'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    id="organizer"
                                    value="organizer"
                                    className='appearance-none'
                                    checked={userRole === "organizer"}
                                    onChange={(e) => setUserRole(e.target.value)}
                                />
                                {userRole === 'organizer' ? <CheckCircleIcon className='mr-2' sx={{ fontSize: 20 }} /> : null}
                                Organizer
                            </label>
                        </div>
                        <div className='flex items-center justify-start bg-gray-100 w-full mb-4 p-2 '>
                            <PasswordIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                            <input type="password" name="password" placeholder='Enter password' className='block focus:outline-0 text-sm' onChange={handleChange} required />
                        </div>
                        <div className='flex items-center justify-start bg-gray-100 w-full mb-4 p-2 '>
                            <PasswordIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                            <input type="password" name="rpassword" placeholder='Reenter password' className='block focus:outline-0 text-sm' onChange={handleChange} required />
                        </div>

                        <Button type="submit"
                            variant="contained"
                            sx={{ backgroundColor: '#FF9C16', mb: 2, display: 'block', fontWeight: 'bold', color: '#fff', width: '100%' }}
                        >Register</Button>
                    </form>
                    <Link to='/login' className='text-[#8d8d8d] group text-sm'>Have account ? <span className='group-hover:text-amber-500'>Login Here</span></Link>
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

export default Register
