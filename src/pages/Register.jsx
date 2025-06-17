import React, { useState } from 'react'
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css'
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import PasswordIcon from '@mui/icons-material/Password';
import MailIcon from '@mui/icons-material/Mail';
import Face6Icon from '@mui/icons-material/Face6';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Register() {

    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rpassword, setRPassword] = useState('');
    const [role, setRole] = useState(null);

    const handleChange = (e) => {
        if (e.target.name == 'name') {
            setName(e.target.value);
        }
        else if (e.target.name == 'email') {
            setEmail(e.target.value);
        }
        else if (e.target.name == 'password') {
            setPassword(e.target.value);
        }
        else if (e.target.name == 'rpassword') {
            setRPassword(e.target.value);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            toast.warn("Please enter a valid email address.");
            return;
        }

        try {
            if (password != rpassword) {
                toast.warn("Password does not match");
            }
            else {
                const res = await axios.post(`${baseURL}:${port}/login/register`, { name, email, password, role })
                // console.log(res);
                toast.success("Sign Up successful");
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
            <div className='flex lg:w-[900px] w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:shadow-[5px_5px_20px_rgba(0,0,0,0.3)]'>
                <div
                    className='w-[50%] hidden lg:flex justify-center items-center text-white font-bold'
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
                            <input type="email" name="email" id="" placeholder='Enter your email' className='block focus:outline-0 text-sm' onChange={handleChange} required />
                        </div>
                        <div className='flex justify mb-4'>
                            <label
                                htmlFor="student"
                                className={`p-2 text-sm mr-2 flex items-center grow ${role === 'student' ? 'bg-gray-300 border border-gray-400' : 'bg-gray-100'}`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    id="student"
                                    value="student"
                                    required
                                    className='appearance-none'
                                    checked={role === "student"}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                {role === 'student' ? <CheckCircleIcon className='mr-2' sx={{ fontSize: 20 }} /> : null}
                                Student
                            </label>
                            <label
                                htmlFor="organizer"
                                className={`p-2 text-sm flex items-center grow ${role === "organizer" ? 'bg-gray-300 border border-gray-400' : 'bg-gray-100'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    id="organizer"
                                    value="organizer"
                                    className='appearance-none'
                                    checked={role === "organizer"}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                {role === 'organizer' ? <CheckCircleIcon className='mr-2' sx={{ fontSize: 20 }} /> : null}
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

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ backgroundColor: '#FF9C16', mb: 2, display: 'block', fontWeight: 'bold', color: '#fff', width: '100%' }}
                        >Register</Button>
                    </form>
                    <Link to='/login' className='text-[#8d8d8d] group text-sm'>Have account ? <span className='group-hover:text-amber-500'>Login Here</span></Link>

                </div>
            </div>
            <ToastContainer />
        </>

    )
}

export default Register