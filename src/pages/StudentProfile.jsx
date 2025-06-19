import React, { useContext, useState, useEffect } from 'react'
import { University, Mail, User, Phone, GraduationCap, BookOpen, Layers, Calendar, AtSign } from 'lucide-react';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from 'react-toastify';
import UserContext from '../context/UserContext';
import { Link, useParams } from 'react-router-dom'
import userprofile from '../assets/images/userprofile.jpg'
import axios from 'axios';

function StudentProfile() {
    const { token, setToken } = useContext(UserContext);
    const { user, setUser } = useContext(UserContext);
    const { email, setEmail} = useContext(UserContext);
    // console.log(email);
    

    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;

    // Profile state
    const [profile, setProfile] = useState({
        studentName: user || '',
        gender: '',
        studentCollegeName: '',
        course: '',
        branch: '',
        year: '',
        mobno: '',
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch user details on mount or when email changes
    useEffect(() => {
        const fetchProfile = async () => {
            if (!email) return;
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`${baseURL}:${port}/login/user/${email}`);
                if (res.data) {
                    setProfile({
                        studentName: res.data.studentName || res.data.name || '',
                        gender: res.data.gender || '',
                        studentCollegeName: res.data.studentCollegeName || '',
                        course: res.data.course || '',
                        branch: res.data.branch || '',
                        year: res.data.year || '',
                        mobno: res.data.mobno || '',
                    });
                    setUser(res.data.name || '');
                }
            } catch (err) {
                setError('Failed to fetch profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        // eslint-disable-next-line
    }, [email]);

    const handleLogout = () => {
        if (confirm("Are u sure, want to logout ?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("email");
            setToken(null)
            setUser(null)
            setEmail(null)
            console.log(user);

            setTimeout(() => {
                toast.success("Logged Out!", { autoClose: 2000 });
            }, 0);
        }
    };

    const handleChange = (e) => {
        const { id, name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [id || name]: value
        }));
    };

    const handleEdit = () => setEditMode(true);
    const handleCancel = () => setEditMode(false);
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (email == "") {
                return <div>Please log in to view your profile.</div>;
            }
            const res = await axios.put(`${baseURL}:${port}/login/user/${email}`, profile);
            if (res.data) {
                setProfile({
                    studentName: res.data.studentName || res.data.name || '',
                    gender: res.data.gender || '',
                    studentCollegeName: res.data.studentCollegeName || '',
                    course: res.data.course || '',
                    branch: res.data.branch || '',
                    year: res.data.year || '',
                    mobno: res.data.mobno || '',
                });
                setUser(res.data.name || '');
                toast.success('Profile updated!');
            }
            setEditMode(false);
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    // console.log(token);

    // useEffect(() => {
    //     const storedToken = localStorage.getItem('token');
    //     // const storedUser = localStorage.getItem('username');
    //     setToken(storedToken); 
    //     // setUser(storedUser);   
    // }, [token, user])

    // Helper for profile completion (optional, simple version)
    const profileFields = [profile.studentName, profile.gender, profile.studentCollegeName, profile.course, profile.branch, profile.year, profile.mobno];
    const filledFields = profileFields.filter(val => val && val.trim() !== '').length;
    const completion = Math.round((filledFields / profileFields.length) * 100);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 pb-10">
            {/* Banner */}
            <div className="w-full h-40 bg-gradient-to-r from-amber-400 to-blue-400" />

            {/* Card Container */}
            <div className="max-w-2xl mx-auto relative">
                {/* Profile Photo */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-20 z-20">
                    <img
                        src={userprofile}
                        alt="Profile"
                        className="w-36 h-36 rounded-full border-8 border-white shadow-lg object-cover bg-gray-200"
                    />
                </div>

                {/* Profile Card */}
                <div className="relative bg-white shadow-2xl rounded-2xl pt-24 pb-10 px-6 lg:px-12 mt-[-5rem] flex flex-col gap-4">
                    {/* Edit Button (now left) */}
                    <button
                        onClick={editMode ? handleCancel : handleEdit}
                        className="absolute top-6 left-6 bg-amber-400 text-white px-4 py-2 rounded-full shadow hover:bg-amber-500 z-30"
                    >
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                    {/* Logout Button (now right) */}
                    {token && (
                        <button
                            onClick={handleLogout}
                            className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full shadow hover:bg-red-700 z-30"
                        >
                            <LogoutIcon className="inline mr-2" /> Log out
                        </button>
                    )}
                    {/* Name, Email, Role */}
                    <div className="flex flex-col items-center gap-1 mt-2">
                        <span className="text-2xl font-bold text-gray-900 flex items-center gap-2"><User size={22} />{profile.studentName || <span className="text-gray-400">Not set</span>}</span>
                        <span className="text-gray-600 flex items-center gap-2"><AtSign size={16} />{email || <span className="text-gray-400">Not set</span>}</span>
                        <span className="text-blue-700 font-semibold text-xs uppercase tracking-wider mt-1">Student</span>
                    </div>
                    {/* Profile Completion Bar */}
                    <div className="w-full flex flex-col items-center mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${completion}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">Profile Completion: {completion}%</span>
                    </div>
                    {/* Details */}
                    <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="col-span-1 flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-amber-500 mb-2">Personal Info</h3>
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-amber-400" />
                                {editMode ? (
                                    <input type="text" id="studentName" className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200" value={profile.studentName} onChange={handleChange} required />
                                ) : (
                                    <span className="font-medium">{profile.studentName || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-400"><BookOpen size={18} /></span>
                                {editMode ? (
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-1">
                                            <input type="radio" name="gender" id="gender" value="Male" checked={profile.gender === 'Male'} onChange={handleChange} required /> Male
                                        </label>
                                        <label className="flex items-center gap-1">
                                            <input type="radio" name="gender" id="gender" value="Female" checked={profile.gender === 'Female'} onChange={handleChange} /> Female
                                        </label>
                                    </div>
                                ) : (
                                    <span className="font-medium">{profile.gender || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={18} className="text-amber-400" />
                                {editMode ? (
                                    <input type="tel" id="mobno" pattern="[6-9]{1}[0-9]{9}" maxLength={10} className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200" value={profile.mobno} onChange={handleChange} required />
                                ) : (
                                    <span className="font-medium">{profile.mobno || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                        </div>
                        {/* Academic Info */}
                        <div className="col-span-1 flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-blue-500 mb-2">Academic Info</h3>
                            <div className="flex items-center gap-2">
                                <University size={18} className="text-blue-400" />
                                {editMode ? (
                                    <input type="text" id="studentCollegeName" className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200" value={profile.studentCollegeName} onChange={handleChange} required />
                                ) : (
                                    <span className="font-medium">{profile.studentCollegeName || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <GraduationCap size={18} className="text-blue-400" />
                                {editMode ? (
                                    <select id="course" className="text-gray-700 block w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" value={profile.course} onChange={handleChange} required>
                                        <option value="">-- Select --</option>
                                        <option value="B.Tech">B.Tech</option>
                                        <option value="B.E">B.E</option>
                                        <option value="M.E">M.E</option>
                                        <option value="Diploma">Diploma</option>
                                    </select>
                                ) : (
                                    <span className="font-medium">{profile.course || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Layers size={18} className="text-blue-400" />
                                {editMode ? (
                                    <select id="branch" className="text-gray-700 block w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" value={profile.branch} onChange={handleChange} required>
                                        <option value="">-- Select --</option>
                                        <option value="IT">IT</option>
                                        <option value="CS">CS</option>
                                        <option value="Mech">Mech</option>
                                        <option value="Trical">Trical</option>
                                        <option value="Tronics">Tronics</option>
                                        <option value="Civil">Civil</option>
                                    </select>
                                ) : (
                                    <span className="font-medium">{profile.branch || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-blue-400" />
                                {editMode ? (
                                    <select id="year" className="text-gray-700 block w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" value={profile.year} onChange={handleChange} required>
                                        <option value="">-- Select --</option>
                                        <option value="First Year">First Year</option>
                                        <option value="Second Year">Second Year</option>
                                        <option value="Third Year">Third Year</option>
                                        <option value="Fourth Year">Fourth Year</option>
                                    </select>
                                ) : (
                                    <span className="font-medium">{profile.year || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                        </div>
                        {/* Save Button */}
                        {editMode && (
                            <div className="md:col-span-2 flex gap-2 mt-4 justify-center">
                                <button type='submit' className='bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600'>Save</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
            <div className="max-w-2xl mx-auto mt-8 flex flex-col items-center">
                <Link to='/myparticipations' className='text-green-600 underline text-base font-medium'>View your registrations</Link>
            </div>
            <div className='h-20'></div>
        </div>
    )
}

export default StudentProfile