import React, { useContext, useState, useEffect } from 'react'
import { Building2, Mail, User, Phone, MapPin, Globe, Edit, Save, X as Close } from 'lucide-react';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from 'react-toastify';
import UserContext from '../context/UserContext';
import { Link } from 'react-router-dom'
import userprofile from '../assets/images/userprofile.jpg'
import axios from 'axios';

function OrganizerProfile() {
    const { token, setToken } = useContext(UserContext);
    const { user, setUser } = useContext(UserContext);
    const { email, setEmail} = useContext(UserContext);
    
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;

    // Profile state - only essential fields
    const [profile, setProfile] = useState({
        organizationName: '',
        shortName: '',
        organizationType: '',
        website: '',
        description: '',
        contactPerson: '',
        phone: '',
        city: '',
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                        organizationName: userData.organizationName || '',
                        shortName: userData.shortName || '',
                        organizationType: userData.organizationType || '',
                        website: userData.website || '',
                        description: userData.description || '',
                        contactPerson: userData.contactPerson || '',
                        phone: userData.phone || '',
                        city: userData.city || '',
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

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("email");
            localStorage.removeItem("role");
            setToken(null)
            setUser(null)
            setEmail(null)

            setTimeout(() => {
                toast.success("Logged Out!", { autoClose: 2000 });
            }, 0);
        }
    };

    const handleChange = (e) => {
        const { id, name, value } = e.target;
        const fieldName = id || name;
        
        // Convert shortName to uppercase
        const processedValue = fieldName === 'shortName' ? value.toUpperCase() : value;
        
        setProfile(prev => ({
            ...prev,
            [fieldName]: processedValue
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
            // Prepare the data for the API - only essential fields
            const updateData = {
                organizationName: profile.organizationName,
                shortName: profile.shortName,
                website: profile.website,
                description: profile.description,
                contactPerson: profile.contactPerson,
                phone: profile.phone,
                city: profile.city,
            };
            const res = await axios.put(`${baseURL}:${port}/auth/profile`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.user) {
                const userData = res.data.user;
                setProfile({
                    organizationName: userData.organizationName || '',
                    shortName: userData.shortName || '',
                    organizationType: userData.organizationType || '',
                    website: userData.website || '',
                    description: userData.description || '',
                    contactPerson: userData.contactPerson || '',
                    phone: userData.phone || '',
                    city: userData.city || '',
                });
                toast.success('Profile updated successfully!');
            }
            setEditMode(false);
        } catch (err) {
            setError('Failed to update profile.');
            console.error('Profile update error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper for profile completion - only essential fields
    const profileFields = [
        { field: profile.organizationName, weight: 2 }, // Organization name is most important
        { field: profile.contactPerson, weight: 1.5 }, // Contact person is important
        { field: profile.phone, weight: 1.5 }, // Phone is important
        { field: profile.city, weight: 1 }, // City is useful
        { field: profile.description, weight: 1 }, // Description is useful
        { field: profile.shortName, weight: 0.5 }, // Short name is optional
        { field: profile.website, weight: 0.5 }, // Website is optional
    ];
    
    const totalWeight = profileFields.reduce((sum, item) => sum + item.weight, 0);
    const filledWeight = profileFields.reduce((sum, item) => {
        return sum + (item.field && item.field.trim() !== '' ? item.weight : 0);
    }, 0);
    
    const completion = Math.round((filledWeight / totalWeight) * 100);

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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 flex flex-col items-center py-10">
            {/* Welcome Banner for New Organizers */}
            {completion < 50 && (
                <div className="w-full max-w-5xl mb-6 bg-gradient-to-r from-amber-100 to-blue-100 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                        <h3 className="text-lg font-semibold text-amber-800">Welcome to EventDekho!</h3>
                    </div>
                    <p className="text-amber-700 mt-2">
                        Please complete your organization profile to start creating and managing events. 
                        This information will help students learn more about your organization.
                    </p>
                </div>
            )}
            
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
                {/* Sidebar Summary */}
                <aside className="md:w-1/3 w-full bg-gradient-to-br from-amber-100 to-blue-100 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-6 border border-amber-200">
                    <div className="relative w-32 h-32 mb-2">
                        <img src={userprofile} alt="Logo" className="w-32 h-32 rounded-full border-4 border-amber-400 shadow object-cover bg-white" />
                        {/* Placeholder for logo upload */}
                        <span className="absolute bottom-2 right-2 bg-amber-400 text-white rounded-full p-1 cursor-pointer shadow hover:bg-amber-500 transition" title="Upload Logo">
                            <Edit size={16} />
                        </span>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-amber-700 mb-1 flex items-center justify-center gap-2">
                            <Building2 size={22} /> {profile.organizationName || user || 'Organization'}
                        </h2>
                        {profile.shortName && (
                            <div className="text-sm text-amber-600 font-medium mb-1">({profile.shortName})</div>
                        )}
                        <div className="text-sm text-blue-700 font-semibold mb-1 uppercase tracking-wider">{profile.organizationType || 'Type'}</div>
                        <div className="text-gray-600 flex items-center justify-center gap-1 mb-1">
                            <MapPin size={16} /> {profile.city || <span className="text-gray-400">City</span>}
                        </div>
                        <div className="text-gray-600 flex items-center justify-center gap-1 mb-1">
                            <Globe size={16} /> {profile.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{profile.website}</a> : <span className="text-gray-400">Website</span>}
                        </div>
                        <div className="text-gray-600 flex items-center justify-center gap-1 mb-1">
                            <User size={16} /> {profile.contactPerson || <span className="text-gray-400">Contact Person</span>}
                        </div>
                    </div>
                    <div className="w-full flex flex-col items-center mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${completion}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">Profile Completion: {completion}%</span>
                        {completion < 100 && (
                            <div className="text-xs text-amber-600 mt-2 text-center">
                                Complete your profile to get the most out of EventDekho!
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg shadow hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                    >
                        <LogoutIcon className="mr-1" size={18}/> Log out
                    </button>
                </aside>

                {/* Main Card */}
                <main className="flex-1 w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-8 border border-blue-100 relative">
                    {/* Floating Action Buttons */}
                    {!editMode ? (
                        <button
                            onClick={handleEdit}
                            className="absolute top-6 right-6 bg-amber-400 hover:bg-amber-500 text-white rounded-full p-3 shadow-lg transition flex items-center gap-2 z-10"
                        >
                            <Edit size={20} /> Edit
                        </button>
                    ) : (
                        <div className="absolute top-6 right-6 flex gap-2 z-10">
                            <button
                                onClick={handleSave}
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition flex items-center gap-2"
                            >
                                <Save size={20} /> Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-gray-400 hover:bg-gray-500 text-white rounded-full p-3 shadow-lg transition flex items-center gap-2"
                            >
                                <Close size={20} /> Cancel
                            </button>
                        </div>
                    )}

                    {/* About Section */}
                    <section>
                        <h3 className="text-xl font-bold text-amber-600 mb-2 flex items-center gap-2"><Mail size={20}/> About Organization</h3>
                        {editMode ? (
                            <textarea
                                id="description"
                                rows={4}
                                className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200"
                                value={profile.description}
                                onChange={handleChange}
                                placeholder="Describe your organization, mission, and activities..."
                                maxLength={1000}
                            />
                        ) : (
                            <p className="font-medium text-gray-800 min-h-[60px]">{profile.description || <span className="text-gray-400">No description available</span>}</p>
                        )}
                    </section>

                    {/* Contact Section */}
                    <section>
                        <h3 className="text-xl font-bold text-blue-600 mb-2 flex items-center gap-2"><User size={20}/> Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-2">
                                <Building2 size={18} className="text-blue-400" />
                                {editMode ? (
                                    <input
                                        type="text"
                                        id="organizationName"
                                        className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200"
                                        value={profile.organizationName}
                                        onChange={handleChange}
                                        placeholder="Organization name"
                                    />
                                ) : (
                                    <span className="font-medium">{profile.organizationName || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 size={18} className="text-blue-400" />
                                {editMode ? (
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            id="shortName"
                                            className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200"
                                            value={profile.shortName}
                                            onChange={handleChange}
                                            placeholder="Short name (will be uppercase)"
                                            maxLength={50}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">Short names are automatically converted to uppercase</div>
                                    </div>
                                ) : (
                                    <span className="font-medium">{profile.shortName || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-blue-400" />
                                {editMode ? (
                                    <input
                                        type="text"
                                        id="contactPerson"
                                        className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200"
                                        value={profile.contactPerson}
                                        onChange={handleChange}
                                        placeholder="Contact person name"
                                    />
                                ) : (
                                    <span className="font-medium">{profile.contactPerson || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={18} className="text-blue-400" />
                                {editMode ? (
                                    <input
                                        type="tel"
                                        id="phone"
                                        className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        placeholder="Contact phone number"
                                    />
                                ) : (
                                    <span className="font-medium">{profile.phone || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={18} className="text-blue-400" />
                                <span className="font-medium">{email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-blue-400" />
                                {editMode ? (
                                    <input
                                        type="text"
                                        id="city"
                                        className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200"
                                        value={profile.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                    />
                                ) : (
                                    <span className="font-medium">{profile.city || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={18} className="text-blue-400" />
                                {editMode ? (
                                    <input
                                        type="url"
                                        id="website"
                                        className="text-gray-700 block outline-none border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-amber-200"
                                        value={profile.website}
                                        onChange={handleChange}
                                        placeholder="Website URL (optional)"
                                    />
                                ) : (
                                    <span className="font-medium">{profile.website || <span className="text-gray-400">Not set</span>}</span>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            <div className="max-w-5xl mx-auto mt-8 flex flex-col items-center">
                <Link to='/admin/dashboard' className='text-green-600 underline text-base font-medium'>Back to Dashboard</Link>
            </div>
        </div>
    )
}

export default OrganizerProfile 