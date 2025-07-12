import React, { useContext, useState, useEffect } from 'react'
import { University, Mail, User, Phone, GraduationCap, BookOpen, Layers, Calendar, AtSign } from 'lucide-react';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from 'react-toastify';
import UserContext from '../context/UserContext';
import { Link, useParams } from 'react-router-dom'
import userprofile from '../assets/images/userprofile.jpg'
import axios from 'axios';
import { Autocomplete, TextField } from '@mui/material';

function StudentProfile() {
    const { token, setToken } = useContext(UserContext);
    const { user, setUser } = useContext(UserContext);
    const { email, setEmail} = useContext(UserContext);
    // console.log(email);
    

    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;

    // Profile state
    const [profile, setProfile] = useState({
        studentName: '',
        gender: '',
        collegeName: '',
        course: '',
        branch: '',
        year: '',
        mobno: '',
        role: '',
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [organizations, setOrganizations] = useState([]);
    const [organizationSearch, setOrganizationSearch] = useState('');
    const [selectedOrganization, setSelectedOrganization] = useState(null);

    // Fetch user details on mount or when email changes
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`${baseURL}:${port}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.user) {
                    const userData = res.data.user;
                    setProfile({
                        studentName: userData.name || '',
                        gender: userData.gender || '',
                        collegeName: userData.collegeName || '',
                        course: userData.course || '',
                        branch: userData.branch || '',
                        year: userData.year || '',
                        mobno: userData.mobileNumber || '',
                        role: userData.role || '',
                    });
                }
            } catch (err) {
                setError('Failed to fetch profile.');
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        // eslint-disable-next-line
    }, [token]);

    // Fetch organizations
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await axios.get(`${baseURL}:${port}/organization/getallorganizations`);
                setOrganizations(res.data);
            } catch (err) {
                console.error('Failed to fetch organizations:', err);
                setOrganizations([]);
            }
        };
        fetchOrganizations();
    }, []);

    // Sync organization search state when organizations are loaded and profile has organization name
    useEffect(() => {
        if (organizations.length > 0 && profile.collegeName) {
            const foundOrganization = organizations.find(c => c.collegeName && c.collegeName.toLowerCase() === profile.collegeName.toLowerCase());
            if (foundOrganization) {
                setSelectedOrganization(foundOrganization);
                setOrganizationSearch(foundOrganization.collegeName);
            } else {
                setOrganizationSearch(profile.collegeName);
            }
        }
    }, [organizations, profile.collegeName]);

    const handleLogout = () => {
        if (confirm("Are u sure, want to logout ?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("email");
            localStorage.removeItem("role");
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
        const { id, name, value, type } = e.target;
        
        // For radio buttons, use the name attribute
        const fieldName = type === 'radio' ? name : (id || name);
        
        console.log('handleChange called:', { id, name, value, type, fieldName });
        
        // Don't handle organization name here as it's managed by Autocomplete
        setProfile(prev => {
            const newProfile = {
                ...prev,
                [fieldName]: value
            };
            console.log('Updated profile:', newProfile);
            return newProfile;
        });
    };

    const handleGenderChange = (e) => {
        const { value } = e.target;
        console.log('Gender changed to:', value);
        setProfile(prev => ({
            ...prev,
            gender: value
        }));
    };

    const handleEdit = () => setEditMode(true);
    const handleCancel = () => setEditMode(false);
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!token) {
                setError('Please log in to update your profile.');
                return;
            }

            // Prepare the data for the new API
            const updateData = {
                name: profile.studentName,
                gender: profile.gender,
                collegeName: profile.collegeName,
                course: profile.course,
                branch: profile.branch,
                year: profile.year,
                mobileNumber: profile.mobno,
            };

            console.log('Sending update data:', updateData);
            console.log('Token:', token);

            const res = await axios.put(`${baseURL}:${port}/auth/profile`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Response:', res.data);
            
            if (res.data && res.data.user) {
                const userData = res.data.user;
                setProfile({
                    studentName: userData.name || '',
                    gender: userData.gender || '',
                    collegeName: userData.collegeName || '',
                    course: userData.course || '',
                    branch: userData.branch || '',
                    year: userData.year || '',
                    mobno: userData.mobileNumber || '',
                    role: userData.role || '',
                });
                localStorage.setItem("user", userData.name)
                toast.success('Profile updated successfully!');
            }
            setEditMode(false);
        } catch (err) {
            console.error('Profile update error details:', err.response?.data || err.message);
            setError('Failed to update profile.');
            console.error('Profile update error:', err);
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
    const profileFields = [profile.studentName || user, profile.gender, profile.collegeName, profile.course, profile.branch, profile.year, profile.mobno];
    const filledFields = profileFields.filter(val => val && val.trim() !== '').length;
    const completion = Math.round((filledFields / profileFields.length) * 100);

    // Show login prompt if not logged in
    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50">
                <div className="bg-white shadow-lg rounded-xl px-8 py-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile.</h2>
                    <Link to="/login" className="text-blue-600 underline font-medium">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 pb-10">
            {/* Banner */}
            <div className="w-full h-40 bg-gradient-to-r from-amber-400 to-blue-400" />

            {/* Card Container */}
            <div className="max-w-2xl lg:mx-auto relative px-4">
                {/* Profile Photo */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-15 z-20">
                    <img
                        src={userprofile}
                        alt="Profile"
                        className="w-36 h-36 rounded-full border-8 border-white shadow-lg object-cover bg-gray-200"
                    />
                </div>

                {/* Profile Card */}
                <div className="relative bg-white shadow-2xl rounded-2xl pt-24 pb-10 px-6 lg:px-12 mt-[-5rem] flex flex-col gap-4">
                    {/* Logout Button (now right) */}
                    
                    {/* Name, Email, Role */}
                    <div className="flex flex-col items-center gap-1 mt-2">
                        <span className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <User size={22} />
                            {profile.studentName || user || <span className="text-gray-400">Not set</span>}
                        </span>
                        <span className="text-gray-600 flex items-center gap-2"><AtSign size={16} />{email || <span className="text-gray-400">Not set</span>}</span>
                        <span className="text-blue-700 font-semibold text-xs uppercase tracking-wider mt-1">{profile.role}</span>
                        {token && (
                        <button
                            onClick={handleLogout}
                            className=" bg-red-600 text-white px-5 py-2 rounded-full shadow hover:bg-red-700 z-30 mt-2"
                        >
                            <LogoutIcon className="mr-1" size={5}/> Log out
                        </button>
                    )}
                    </div>
                    {/* Profile Completion Bar */}
                    <div className="w-full flex flex-col items-center mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${completion}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">Profile Completion: {completion}%</span>
                    </div>
                    
                    {/* Error Display */}
                    {error && (
                        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                    
                    {/* Loading Display */}
                    {loading && (
                        <div className="w-full bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                            Updating profile...
                        </div>
                    )}
                    
                    {/* Details */}
                    <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="col-span-1 flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-amber-500 mb-2">Personal Info</h3>
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-amber-400" />
                                {editMode ? (
                                    <input 
                                        type="text" 
                                        id="studentName" 
                                        className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200" 
                                        value={profile.studentName} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                ) : (
                                    <span className="font-medium">{profile.studentName || user || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-400"><BookOpen size={18} /></span>
                                {editMode ? (
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-1">
                                            <input type="radio" name="gender" id="gender-male" value="Male" checked={profile.gender === 'Male'} onChange={handleGenderChange} required /> Male
                                        </label>
                                        <label className="flex items-center gap-1">
                                            <input type="radio" name="gender" id="gender-female" value="Female" checked={profile.gender === 'Female'} onChange={handleGenderChange} /> Female
                                        </label>
                                        {/* Debug display */}
                                        {/* <span className="text-xs text-gray-500">Current: {profile.gender || 'None'}</span> */}
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
                                    <input
                                        type="text"
                                        id="collegeName"
                                        className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200"
                                        value={profile.collegeName}
                                        onChange={handleChange}
                                        required
                                    />
                                ) : (
                                    <span className="font-medium">{profile.collegeName || <span className="text-gray-400">Not set</span>}</span>
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
                                <button 
                                    type='button' 
                                    onClick={handleCancel} 
                                    className='bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600'
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                    
                    {/* Edit Button (moved to bottom) */}
                    {!editMode && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleEdit}
                                className="bg-amber-400 text-white px-6 py-3 rounded-full shadow hover:bg-amber-500 transition-colors duration-200"
                            >
                                Edit Profile
                            </button>
                        </div>
                    )}
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