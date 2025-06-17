import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import PasswordIcon from '@mui/icons-material/Password';
import MailIcon from '@mui/icons-material/Mail';
import UserContext from '../context/UserContext';

function Login() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);
    const { email, setEmail } = useContext(UserContext);
    const { token, setToken } = useContext(UserContext);
    const [password, setPassword] = useState('');

    const handleChange = (e) => {
        if (e.target.name == 'email') {
            const value = e.target.value;
            setEmail(value);
            console.log(email);
        }
        else if (e.target.name == 'password') {
            setPassword(e.target.value);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${baseURL}:${port}/login/login`, { email, password })

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('username', res.data.user.name);
                localStorage.setItem('email', res.data.user.email);
                setUser(res.data.user.name);
                setToken(res.data.token);
                console.log((user));
                toast.success("Logged In!", {
                    autoClose: 1000
                });

                setTimeout(() => {
                    navigate(-1);
                }, 0);
                console.log('some');

            } else {
                toast.error("Login failed: No username received", { autoClose: 1000 });
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
    }

    return (
        <>
            <div className='flex lg:w-[900px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:shadow-[5px_5px_20px_rgba(0,0,0,0.3)] w-full'>
                <div className='hidden w-[50%] lg:flex justify-center items-center text-white font-bold'
                    style={{
                        background: 'linear-gradient(90deg, hsla(34, 100%, 54%, 1) 2%, hsla(39, 100%, 58%, 1) 53%, hsla(43, 100%, 60%, 1) 87%)'
                    }}>
                    <p className='text-3xl'>Welcome back!</p>
                </div>
                <div className='lg:p-20 lg:w-1/2 w-[300px] border-3 border-amber-500 p-8 mx-auto'>
                    <p className='text-amber-300 font-bold text-3xl mb-4'>Log In</p>
                    <p className='mb-6'>Welcome ! Please enter your detail</p>
                    <form onSubmit={handleSubmit}>
                        <div className='flex items-center justify-start bg-gray-100 w-full mb-4 p-2 '>
                            <MailIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                            <input type="email" name="email" id="" placeholder='Enter your email' className='focus:outline-0 text-sm grow' onChange={handleChange} required />
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
                    <Link to='/register' className='text-[#8d8d8d] group text-sm'>New User ? <span className='group-hover:text-amber-500'>Register</span></Link>
                </div>
            </div>
            {/* <ToastContainer /> */}
        </>
    )
}

export default Login