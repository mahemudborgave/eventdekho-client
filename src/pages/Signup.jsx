import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import PasswordIcon from '@mui/icons-material/Password';
import MailIcon from '@mui/icons-material/Mail';
import Face6Icon from '@mui/icons-material/Face6';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import { ScaleLoader } from 'react-spinners';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import UserContext from '../context/UserContext';
import { getLastVisitedPage, clearLastVisitedPage, getSmartRedirectPath } from '../utils/navigationUtils';
import { Phone, Smartphone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Signup() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const navigate = useNavigate();
    const { setUser, setToken, setRole, setEmail } = useContext(UserContext);

    // Tab state
    const [activeTab, setActiveTab] = useState('student');

    // Student form state
    const [studentData, setStudentData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNumber: '',
    });

    // Organization form state
    const [orgData, setOrgData] = useState({
        organizationName: '',
        email: '',
        organizationType: '',
        parentOrganization: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const [showOrganizationPopup, setShowOrganizationPopup] = useState(false);
    const [organizationForm, setOrganizationForm] = useState({
        organizationName: '',
        dteCode: '',
        city: '',
        type: [],
        tier: ''
    });
    const [organizationLoading, setOrganizationLoading] = useState(false);
    const [showOrganizationSuggestions, setShowOrganizationSuggestions] = useState(false);

    // Password visibility states
    const [showStudentPasswords, setShowStudentPasswords] = useState(false);
    const [showOrgPasswords, setShowOrgPasswords] = useState(false);

    // Fetch organizations on component mount
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

    // Handle student form changes
    const handleStudentChange = (e) => {
        const { name, value } = e.target;
        setStudentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle organization form changes
    const handleOrgChange = (e) => {
        const { name, value } = e.target;
        setOrgData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle organization form changes
    const handleOrganizationFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'type' && type === 'checkbox') {
            setOrganizationForm(prev => {
                if (checked) {
                    return { ...prev, type: [...prev.type, value] };
                } else {
                    return { ...prev, type: prev.type.filter(t => t !== value) };
                }
            });
        } else {
            setOrganizationForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // Validate student form
    const validateStudentForm = () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(studentData.email)) {
            toast.warn("Please enter a valid email address.");
            return false;
        }

        if (studentData.password !== studentData.confirmPassword) {
            toast.warn("Passwords do not match. Please try again.");
            return false;
        }

        if (studentData.password.length < 6) {
            toast.warn("Password must be at least 6 characters long for security.");
            return false;
        }

        // Check required fields
        if (!studentData.name.trim()) {
            toast.warn("Please enter your full name.");
            return false;
        }

        if (!studentData.mobileNumber.trim()) {
            toast.warn("Please enter your mobile number.");
            return false;
        }

        return true;
    };

    // Validate organization form
    const validateOrgForm = () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!orgData.organizationName.trim()) {
            toast.warn("Please enter your organization name.");
            return false;
        }

        if (!emailRegex.test(orgData.email)) {
            toast.warn("Please enter a valid email address for your organization.");
            return false;
        }

        if (!orgData.organizationType.trim()) {
            toast.warn("Please select your organization type.");
            return false;
        }

        if (orgData.password !== orgData.confirmPassword) {
            toast.warn("Passwords do not match. Please try again.");
            return false;
        }

        if (orgData.password.length < 6) {
            toast.warn("Password must be at least 6 characters long for security.");
            return false;
        }

        return true;
    };

    // Handle student registration
    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        if (!validateStudentForm()) return;

        try {
            setLoading(true);
            const res = await axios.post(`${baseURL}:${port}/auth/register`, {
                ...studentData,
                role: 'student'
            });

            if (res.data) {
                // Store user data and token for automatic login
                const userName = res.data.user.name;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', userName);
                localStorage.setItem('email', res.data.user.email);
                localStorage.setItem('role', res.data.user.role);
                
                // Update context
                setToken(res.data.token);
                setUser(userName);
                setEmail(res.data.user.email);
                setRole(res.data.user.role);
                
                // Redirect to last visited page or smart path
                const lastPage = getLastVisitedPage();
                const redirectPath = getSmartRedirectPath(res.data.user.role, lastPage);
                toast.success("Student account created successfully! Redirecting...", { autoClose: 2000 });
                setTimeout(() => {
                    clearLastVisitedPage();
                    navigate(redirectPath);
                }, 2000);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    toast.warn(error.response.data.message || "Invalid data");
                } else {
                    toast.error("Error while registering");
                }
            } else {
                toast.error("Network or server error");
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle organization registration
    const handleOrgSubmit = async (e) => {
        e.preventDefault();
        if (!validateOrgForm()) return;

        try {
            setLoading(true);
            const res = await axios.post(`${baseURL}:${port}/auth/register`, {
                ...orgData,
                role: 'organizer'
            });

            if (res.data) {
                // Store user data and token for automatic login
                const userName = res.data.user.name;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', userName);
                localStorage.setItem('email', res.data.user.email);
                localStorage.setItem('role', res.data.user.role);
                
                // Update context
                setToken(res.data.token);
                setUser(userName);
                setEmail(res.data.user.email);
                setRole(res.data.user.role);
                
                toast.success("Organization registration successful! Redirecting to your profile page...", { autoClose: 2000 });
                setTimeout(() => {
                    navigate('/admin/profile');
                }, 2000);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    toast.warn(error.response.data.message || "Invalid data");
                } else {
                    toast.error("Error while registering");
                }
            } else {
                toast.error("Network or server error");
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle organization registration
    const handleOrganizationSubmit = async (e) => {
        e.preventDefault();
        if (!organizationForm.organizationName || !organizationForm.city || !organizationForm.type.length) {
            toast.warn('Please fill all required fields.');
            return;
        }
        
        setOrganizationLoading(true);
        try {
            const res = await axios.post(`${baseURL}:${port}/organization/registerorganization`, {
                organizationName: organizationForm.organizationName,
                organizationCode: organizationForm.dteCode,
                shortName: organizationForm.organizationName.split(' ')[0], // Use first word as short name
                city: organizationForm.city,
                type: organizationForm.type[0], // Take first type
                tier: organizationForm.tier,
            });
            
            toast.success('Organization registered successfully!');
            
            // Update parent organization field with new organization name
            setOrgData(prev => ({ ...prev, parentOrganization: organizationForm.organizationName }));
            
            // Reset form and close popup
            setOrganizationForm({ organizationName: '', dteCode: '', city: '', type: [], tier: '' });
            setShowOrganizationPopup(false);
            
            // Refresh organizations list
            const organizationsRes = await axios.get(`${baseURL}:${port}/organization/getallorganizations`);
            setOrganizations(organizationsRes.data);
            
        } catch (err) {
            toast.error('Failed to register organization.');
        } finally {
            setOrganizationLoading(false);
        }
    };

    return (
        <>
            
            <div className='w-screen min-h-screen flex items-center justify-center lg:px-12 sm:px-6 px-2 py-10 bg-white'>
                <div className='flex lg:max-w-5xl w-full lg:shadow-[5px_5px_20px_rgba(0,0,0,0.3)]'>
                    <div className='w-[50%] hidden lg:flex justify-center items-center text-white font-bold'
                        style={{
                            background: 'linear-gradient(90deg, hsla(34, 100%, 54%, 1) 2%, hsla(39, 100%, 58%, 1) 53%, hsla(43, 100%, 60%, 1) 87%)'
                        }}>
                        <p className='text-3xl'>Join EventDekho!</p>
                    </div>
                    <div className='lg:p-20 lg:w-1/2 w-full mx-auto border-3 border-amber-500 p-8'>
                        <p className='text-amber-300 font-bold text-3xl mb-4'>Sign Up</p>
                        <p className='mb-6'>Choose your account type and create your profile</p>
                        
                        {/* Tab Navigation */}
                        <div className='flex mb-3 bg-gray-100 rounded-lg p-0.5 w-full'>
                            <button
                                className={`flex-1 min-w-0 py-1.5 px-1 sm:px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                                    activeTab === 'student' 
                                        ? 'bg-white shadow-md text-amber-600' 
                                        : 'text-gray-600 hover:text-amber-600'
                                }`}
                                onClick={() => setActiveTab('student')}
                            >
                                <SchoolIcon size={20} />
                                <span>Student</span>
                            </button>
                            <button
                                className={`flex-1 min-w-0 py-1.5 px-1 sm:px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                                    activeTab === 'organization' 
                                        ? 'bg-white shadow-md text-amber-600' 
                                        : 'text-gray-600 hover:text-amber-600'
                                }`}
                                onClick={() => setActiveTab('organization')}
                            >
                                <BusinessIcon size={20} />
                                <span>Organization</span>
                            </button>
                        </div>

                        {/* Student Form */}
                        {activeTab === 'student' && (
                            <>
                                <div className="flex flex-col items-center my-4 gap-2">
                                    <GoogleLogin
                                        onSuccess={async credentialResponse => {
                                            try {
                                                const res = await axios.post(
                                                    `${baseURL}:${port}/auth/google`,
                                                    { token: credentialResponse.credential }
                                                );
                                                // Store user data and token for automatic login
                                                localStorage.setItem('token', res.data.token);
                                                localStorage.setItem('user', res.data.user.name);
                                                localStorage.setItem('email', res.data.user.email);
                                                localStorage.setItem('role', res.data.user.role);
                                                setToken(res.data.token);
                                                setUser(res.data.user.name);
                                                setEmail(res.data.user.email);
                                                setRole(res.data.user.role);
                                                toast.success('Logged in with Google!');
                                                navigate('/studentprofile');
                                            } catch (err) {
                                                toast.error('Google login failed');
                                            }
                                        }}
                                        onError={() => {
                                            toast.error('Google Login Failed');
                                        }}
                                    />
                                    <span className="text-xs text-gray-400">or</span>
                                </div>
                                <form onSubmit={handleStudentSubmit}>
                                    <div className='text-xs text-gray-600 bg-blue-50 p-2 rounded-lg mb-4'>
                                        <strong>Quick Registration:</strong> Get started with just your basic details. You can complete your academic profile later from your dashboard.
                                    </div>
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                            <Face6Icon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                                            <input 
                                                type="text" 
                                                name="name" 
                                                placeholder='Enter your full name' 
                                                className='block focus:outline-0 text-sm flex-1' 
                                                value={studentData.name}
                                                onChange={handleStudentChange}
                                                required 
                                            />
                                        </div>
                                        
                                        <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                            <MailIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                                            <input 
                                                type="email" 
                                                name="email" 
                                                placeholder='Enter your email address' 
                                                className='block focus:outline-0 text-sm flex-1' 
                                                value={studentData.email}
                                                onChange={handleStudentChange}
                                                required 
                                            />
                                        </div>

                                        <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                        <Smartphone sx={{ fontSize: 10 }} className='mr-2 text-[#7c7c7c]' />
                                            <input 
                                                type="tel" 
                                                name="mobileNumber" 
                                                placeholder='Enter your mobile number' 
                                                className='block focus:outline-0 text-sm flex-1' 
                                                value={studentData.mobileNumber}
                                                onChange={handleStudentChange}
                                                required 
                                            />
                                        </div>

                                        <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                            <PasswordIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                                            <input 
                                                type={showStudentPasswords ? 'text' : 'password'} 
                                                name="password" 
                                                placeholder='Create a strong password (min 6 characters)' 
                                                className='block focus:outline-0 text-sm flex-1' 
                                                value={studentData.password}
                                                onChange={handleStudentChange}
                                                required 
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowStudentPasswords((prev) => !prev)}
                                                className="ml-2 focus:outline-none"
                                                aria-label={showStudentPasswords ? 'Hide password' : 'Show password'}
                                            >
                                                {showStudentPasswords ? (
                                                    <VisibilityOff sx={{ fontSize: 20, color: '#7c7c7c' }} />
                                                ) : (
                                                    <Visibility sx={{ fontSize: 20, color: '#7c7c7c' }} />
                                                )}
                                            </button>
                                        </div>

                                        <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                            <PasswordIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                                            <input 
                                                type={showStudentPasswords ? 'text' : 'password'} 
                                                name="confirmPassword" 
                                                placeholder='Confirm your password' 
                                                className='block focus:outline-0 text-sm flex-1' 
                                                value={studentData.confirmPassword}
                                                onChange={handleStudentChange}
                                                required 
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowStudentPasswords((prev) => !prev)}
                                                className="ml-2 focus:outline-none"
                                                aria-label={showStudentPasswords ? 'Hide password' : 'Show password'}
                                            >
                                                {showStudentPasswords ? (
                                                    <VisibilityOff sx={{ fontSize: 20, color: '#7c7c7c' }} />
                                                ) : (
                                                    <Visibility sx={{ fontSize: 20, color: '#7c7c7c' }} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit"
                                        variant="contained"
                                        sx={{ backgroundColor: '#FF9C16', mt: 4, display: 'block', fontWeight: 'bold', color: '#fff', width: '100%' }}
                                    >
                                        Create Student Account
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* Organization Form */}
                        {activeTab === 'organization' && (
                            <form onSubmit={handleOrgSubmit}>
                                <div className='text-xs text-gray-600 bg-blue-50 p-2 rounded-lg mb-4'>
                                    <strong>Organization Registration:</strong> Create your organization account to start hosting events and managing registrations.
                                </div>
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                        <BusinessIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                                        <input 
                                            type="text" 
                                            name="organizationName" 
                                            placeholder='Enter organization name' 
                                            className='block focus:outline-0 text-sm flex-1' 
                                            value={orgData.organizationName}
                                            onChange={handleOrgChange}
                                            required 
                                        />
                                    </div>

                                    <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                        <MailIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                                        <input 
                                            type="email" 
                                            name="email" 
                                            placeholder='Enter organization email address' 
                                            className='block focus:outline-0 text-sm flex-1' 
                                            value={orgData.email}
                                            onChange={handleOrgChange}
                                            required 
                                        />
                                    </div>

                                    <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                        <select 
                                            name="organizationType" 
                                            className='block focus:outline-0 text-sm flex-1 bg-transparent' 
                                            value={orgData.organizationType}
                                            onChange={handleOrgChange}
                                            required
                                        >
                                            <option value="">Select organization type</option>
                                            <option value="college">College</option>
                                            <option value="college_club">College Club</option>
                                            <option value="ngo">NGO</option>
                                            <option value="limited_company">Limited Company</option>
                                        </select>
                                    </div>

                                    <div className='relative'>
                                        <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                            <input 
                                                type="text" 
                                                name="parentOrganization" 
                                                placeholder='Search for parent organization (optional)' 
                                                className='block focus:outline-0 text-sm flex-1' 
                                                value={orgData.parentOrganization}
                                                onChange={(e) => {
                                                    setOrgData(prev => ({ ...prev, parentOrganization: e.target.value }));
                                                }}
                                                onFocus={() => setShowOrganizationSuggestions(true)}
                                                onBlur={() => {
                                                    // Delay hiding suggestions to allow clicking on them
                                                    setTimeout(() => setShowOrganizationSuggestions(false), 200);
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Organization Suggestions Dropdown */}
                                        {showOrganizationSuggestions && orgData.parentOrganization && (
                                            <div className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto'>
                                                {organizations
                                                    .filter(organization => 
                                                        organization.organizationName.toLowerCase().includes(orgData.parentOrganization.toLowerCase()) ||
                                                        organization.city.toLowerCase().includes(orgData.parentOrganization.toLowerCase())
                                                    )
                                                    .slice(0, 10) // Limit to 10 suggestions
                                                    .map((organization, index) => (
                                                        <div
                                                            key={index}
                                                            className='px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0'
                                                            onClick={() => {
                                                                setOrgData(prev => ({ 
                                                                    ...prev, 
                                                                    parentOrganization: organization.organizationName 
                                                                }));
                                                                setShowOrganizationSuggestions(false);
                                                            }}
                                                        >
                                                            <div className='font-medium text-sm'>{organization.organizationName}</div>
                                                            <div className='text-xs text-gray-500'>{organization.city}</div>
                                                        </div>
                                                    ))
                                                }
                                                
                                                {/* "Not found" option */}
                                                <div
                                                    className='px-4 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200 bg-blue-50'
                                                    onClick={() => {
                                                        setShowOrganizationPopup(true);
                                                        setShowOrganizationSuggestions(false);
                                                    }}
                                                >
                                                    <div className='font-medium text-sm text-blue-600'>
                                                        Not found? Register your organization
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                        <PasswordIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                                        <input 
                                            type={showOrgPasswords ? 'text' : 'password'} 
                                            name="password" 
                                            placeholder='Create a strong password (min 6 characters)' 
                                            className='block focus:outline-0 text-sm flex-1' 
                                            value={orgData.password}
                                            onChange={handleOrgChange}
                                            required 
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowOrgPasswords((prev) => !prev)}
                                            className="ml-2 focus:outline-none"
                                            aria-label={showOrgPasswords ? 'Hide password' : 'Show password'}
                                        >
                                            {showOrgPasswords ? (
                                                <VisibilityOff sx={{ fontSize: 20, color: '#7c7c7c' }} />
                                            ) : (
                                                <Visibility sx={{ fontSize: 20, color: '#7c7c7c' }} />
                                            )}
                                        </button>
                                    </div>

                                    <div className='flex items-center justify-start bg-gray-100 w-full p-2'>
                                        <PasswordIcon sx={{ fontSize: 20 }} className='mr-2 text-[#7c7c7c]' />
                                        <input 
                                            type={showOrgPasswords ? 'text' : 'password'} 
                                            name="confirmPassword" 
                                            placeholder='Confirm your password' 
                                            className='block focus:outline-0 text-sm flex-1' 
                                            value={orgData.confirmPassword}
                                            onChange={handleOrgChange}
                                            required 
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowOrgPasswords((prev) => !prev)}
                                            className="ml-2 focus:outline-none"
                                            aria-label={showOrgPasswords ? 'Hide password' : 'Show password'}
                                        >
                                            {showOrgPasswords ? (
                                                <VisibilityOff sx={{ fontSize: 20, color: '#7c7c7c' }} />
                                            ) : (
                                                <Visibility sx={{ fontSize: 20, color: '#7c7c7c' }} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button 
                                    type="submit"
                                    variant="contained"
                                    sx={{ backgroundColor: '#FF9C16', mt: 4, display: 'block', fontWeight: 'bold', color: '#fff', width: '100%' }}
                                >
                                    Register Organization
                                </Button>
                            </form>
                        )}

                        <Link to='/login' className='text-[#8d8d8d] group text-sm mt-4 block text-center'>
                            Have account ? <span className='group-hover:text-amber-500'>Login Here</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Modal open={loading} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box className="flex justify-center items-center h-screen">
                    <ScaleLoader color="#FF9C16" />
                </Box>
            </Modal>

            {/* Register Your Organization Popup */}
            <Modal 
                open={showOrganizationPopup} 
                onClose={() => setShowOrganizationPopup(false)}
                aria-labelledby="organization-modal-title" 
                aria-describedby="organization-modal-description"
            >
                <Box className="flex justify-center items-center h-screen p-4">
                    <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-center text-amber-500 mb-6">Register Your Organization</h2>
                        
                        <form onSubmit={handleOrganizationSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 font-medium">Organization Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="organizationName" 
                                    value={organizationForm.organizationName} 
                                    onChange={handleOrganizationFormChange} 
                                    required 
                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" 
                                    list="organization-suggestions" 
                                    autoComplete="off" 
                                />
                                <datalist id="organization-suggestions">
                                    {organizations.map((c, idx) => (
                                        <option key={idx} value={c.organizationName} />
                                    ))}
                                </datalist>
                            </div>
                            
                            <div>
                                <label className="block mb-1 font-medium">DTE Code (optional)</label>
                                <input 
                                    type="text" 
                                    name="dteCode" 
                                    value={organizationForm.dteCode} 
                                    onChange={handleOrganizationFormChange} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" 
                                />
                            </div>
                            
                            <div>
                                <label className="block mb-1 font-medium">City <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="city" 
                                    value={organizationForm.city} 
                                    onChange={handleOrganizationFormChange} 
                                    required 
                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" 
                                />
                            </div>
                            
                            <div>
                                <label className="block mb-1 font-medium">Type <span className="text-red-500">*</span></label>
                                <div className="grid gap-2 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="type"
                                            value="Government Aided"
                                            checked={organizationForm.type.includes('Government Aided')}
                                            onChange={handleOrganizationFormChange}
                                        />
                                        Government Aided
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="type"
                                            value="Unaided"
                                            checked={organizationForm.type.includes('Unaided')}
                                            onChange={handleOrganizationFormChange}
                                        />
                                        Private Unaided
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="type"
                                            value="Autonomous"
                                            checked={organizationForm.type.includes('Autonomous')}
                                            onChange={handleOrganizationFormChange}
                                        />
                                        Autonomous
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="type"
                                            value="Non-autonomous"
                                            checked={organizationForm.type.includes('Non-autonomous')}
                                            onChange={handleOrganizationFormChange}
                                        />
                                        Non-Autonomous
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block mb-1 font-medium">Tier (optional)</label>
                                <input 
                                    type="text" 
                                    name="tier" 
                                    value={organizationForm.tier} 
                                    onChange={handleOrganizationFormChange} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" 
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowOrganizationPopup(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 rounded transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={organizationLoading} 
                                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded transition disabled:opacity-60"
                                >
                                    {organizationLoading ? 'Submitting...' : 'Register Organization'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Box>
            </Modal>
        </>
    );
}

export default Signup; 