import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import UserContext from "../../context/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { Calendar, MapPin, Clock, Users, Building2, Info, Mail, Phone, Globe, Tag, User, Sparkles, ChevronRight, BookOpen, Plus, Trash2, Award, Star, Gift, CheckCircle, AlertCircle, Target, Briefcase, Shield, ClipboardList, Backpack, Flame } from "lucide-react";

export default function AddEvent() {
  const { email, token, role } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isUpdate = location.state?.isUpdate;
  const eventData = location.state?.event;

  // --- Initial State ---
  // Set initialState for dynamic lists to a single empty row each
  const initialState = {
    eventName: "",
    eventDate: "",
    closeOn: "",
    postedOn: new Date().toISOString().slice(0, 10),
    eventLocation: "",
    eventMode: "Onsite",
    eventDescription: "",
    eventTags: "",
    stages: [{ title: "", description: "" }],
    prizes: [{ title: "", amount: "", description: "" }],
    benefits: [""],
    rules: [""],
    guidelines: [""],
    bring: [""],
  };

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [form, setForm] = useState(initialState);
  const [organizerProfile, setOrganizerProfile] = useState({
    _id: '',
    organizationName: '',
    shortName: '',
    organizationType: '',
    website: '',
    description: '',
    contactPerson: '',
    phone: '',
    city: '',
    parentOrganization: '',
    email: '',
  });
  const [isShow, setIsShow] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch organizer profile data
  useEffect(() => {
    const fetchOrganizerProfile = async () => {
      if (!token || role !== 'organizer') return;

      try {
        const res = await axios.get(`${baseURL}:${port}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.user) {
          const userData = res.data.user;
          setOrganizerProfile({
            _id: userData._id || '',
            organizationName: userData.organizationName || '',
            shortName: userData.shortName || '',
            organizationType: userData.organizationType || '',
            website: userData.website || '',
            description: userData.description || '',
            contactPerson: userData.contactPerson || '',
            phone: userData.phone || '',
            city: userData.city || '',
            parentOrganization: userData.parentOrganization || '',
            email: userData.email || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch organizer profile:', err);
      }
    };

    fetchOrganizerProfile();
  }, [token, role, baseURL, port]);

  useEffect(() => {
    const checkAuth = async () => {
      const StoredToken = localStorage.getItem("token");
      let response;

      if (StoredToken) {
        try {
          response = await axios.post(`${baseURL}:${port}/auth/verify`, {}, {
            headers: { Authorization: `Bearer ${StoredToken}` }
          });
        } catch (e) {
          setIsShow(false);
          navigate('/login');
          return;
        }
      } else {
        setIsShow(false);
        navigate('/login');
        return;
      }

      if (StoredToken && response) {
        setIsShow(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate, baseURL, port]);

  useEffect(() => {
    if (isUpdate && eventData) {
      setForm({
        ...eventData,
        eventTags: Array.isArray(eventData.eventTags) ? eventData.eventTags.join(", ") : eventData.eventTags || "",
        eventDate: eventData.eventDate ? eventData.eventDate.slice(0, 10) : "",
        closeOn: eventData.closeOn ? eventData.closeOn.slice(0, 10) : "",
      });
    }
  }, [isUpdate, eventData]);

  // --- Dynamic List Handlers ---
  const handleListChange = (section, idx, field, value) => {
    setForm(prev => {
      const updated = [...prev[section]];
      if (typeof updated[idx] === 'string') {
        updated[idx] = value;
      } else {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return { ...prev, [section]: updated };
    });
  };
  const handleAddListItem = (section, template) => {
    setForm(prev => ({ ...prev, [section]: [...prev[section], template] }));
  };
  const handleRemoveListItem = (section, idx) => {
    setForm(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }));
  };

  // --- Form Submission ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventName || !form.eventDate || !form.eventLocation || !form.closeOn || !form.eventDescription || !form.eventMode) {
      toast.error("All event fields are required");
      return;
    }
    if (!organizerProfile.organizationName || !organizerProfile.shortName) {
      toast.error("Please complete your organization profile first. Go to Profile to add organization details.");
      return;
    }
    try {
      const eventData = {
        ...form,
        email: organizerProfile.email || email,
        clubName: organizerProfile.shortName,
        organizationName: organizerProfile.organizationName,
        organizationId: organizerProfile._id,
        organizationCity: organizerProfile.city,
        parentOrganization: organizerProfile.parentOrganization,
        contactPerson: organizerProfile.contactPerson,
        phone: organizerProfile.phone,
        website: organizerProfile.website,
        organizationType: organizerProfile.organizationType,
        eventTags: form.eventTags.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      if (isUpdate && eventData?._id) {
        await axios.put(`${baseURL}:${port}/eventt/updateevent/${eventData._id}`, eventData);
        toast.success("Event updated successfully");
        navigate(-1);
      } else {
        const res = await axios.post(`${baseURL}:${port}/eventt/addevent`, eventData);
        setForm(initialState);
        if (res.data.success) {
          toast.success(`${res.data.message}`);
        }
      }
    } catch (error) {
      toast.error("Error submitting event");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <ScaleLoader />
      </div>
    );
  }
  if (!isShow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
        <div className="text-xl font-semibold text-red-700 mb-2">You must be logged in to access this page.</div>
        <Link to="/login" className="text-blue-600 underline text-lg">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50">
      <div className="w-full">
        {/* Modern Page Header */}
        {/* <div className="mt-8 mb-10 rounded-3xl shadow-2xl p-8 bg-gradient-to-r from-blue-600 via-pink-500 to-amber-400 flex flex-col items-center justify-center relative">
          <span className="mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="12" width="36" height="28" rx="8" fill="url(#calGradient)"/>
              <rect x="6" y="12" width="36" height="28" rx="8" stroke="#fff" strokeWidth="2"/>
              <rect x="12" y="20" width="24" height="14" rx="4" fill="#fff"/>
              <circle cx="36" cy="16" r="2.5" fill="#F59E42"/>
              <circle cx="12" cy="16" r="2.5" fill="#F472B6"/>
              <path d="M24 28l2 2 4-4" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <g filter="url(#sparkle)"><circle cx="40" cy="10" r="2" fill="#fff"/></g>
              <defs>
                <linearGradient id="calGradient" x1="6" y1="12" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1"/>
                  <stop offset="0.5" stopColor="#F472B6"/>
                  <stop offset="1" stopColor="#F59E42"/>
                </linearGradient>
                <filter id="sparkle" x="36" y="6" width="8" height="8" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feGaussianBlur stdDeviation="1"/>
                </filter>
              </defs>
            </svg>
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-2 text-center drop-shadow-lg">Create or Update Event</h1>
          <p className="text-lg text-white/80 text-center max-w-xl font-medium">Easily add or update your event with all the details, stages, prizes, and more. Make your event stand out and attract participants!</p>
        </div> */}

        <form className="bg-white shadow px-5 py-10 lg:px-20 flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
          <div className="bg-gradient-to-r from-red-100 to-red-400 p-6 mb-5">
            <h1 className="text-2xl font-bold tracking-tight mb-2 flex-1">
              <span className="text-[#BB4D00]">Host</span> event
            </h1>
            <p className="text-gray-500 text-sm">Fill in all the details to host your event. Fields marked with * are required.</p>
          </div>


          <div className="bg-white/70 border border-red-500 border-l-8 border-l-red-500 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<Tag className="text-red-500" size={22} />} title={<span className="text-red-500">Event Name</span>} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                name="eventName"
                value={form.eventName}
                onChange={handleChange}
                required
                placeholder="Enter the event name (e.g. Hackathon 2024)"
              />
            </div>
          </div>



          {/* About This Event */}
          <div className="bg-white/70 backdrop-blur border border-blue-500 border-l-8 border-l-blue-500 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<Info className="text-blue-500" size={22} />} title={<span className="text-blue-500">About This Event</span>} />
            <textarea
              name="eventDescription"
              value={form.eventDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
              required
              placeholder="Describe your event, objectives, and what participants can expect..."
            />
          </div>

          {/* Important Dates */}
          <div className="bg-white/70 backdrop-blur border border-amber-400 border-l-8 border-l-amber-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<Calendar className="text-amber-500" size={22} />} title={<span className="text-amber-400">Important Dates</span>} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField name="eventDate" type="date" label="Event Date*" value={form.eventDate} onChange={handleChange} required icon={<Clock className="text-blue-400" size={18} />} />
              <InputField name="closeOn" type="date" label="Registration Closes*" value={form.closeOn} onChange={handleChange} required icon={<AlertCircle className="text-red-400" size={18} />} />
              <InputField name="postedOn" type="date" label="Posted On*" readOnly value={form.postedOn} onChange={handleChange} required icon={<Calendar className="text-amber-400" size={18} />} />
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white/70 backdrop-blur border border-green-400 border-l-8 border-l-green-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<MapPin className="text-green-500" size={22} />} title={<span className="text-green-400">Event Details</span>} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField name="eventLocation" label="Location*" value={form.eventLocation} onChange={handleChange} required icon={<MapPin className="text-green-400" size={18} />} />
              <InputField name="eventMode" type="select" label="Mode*" value={form.eventMode} onChange={handleChange} required options={["Onsite", "Online"]} icon={<Globe className="text-blue-400" size={18} />} />
              <InputField name="organizationName" label="Organization*" value={organizerProfile.organizationName} onChange={() => { }} required readOnly icon={<Building2 className="text-gray-400" size={18} />} />
            </div>
          </div>

          {/* Event Stages */}
          <div className="bg-white/70 backdrop-blur border border-purple-400 border-l-8 border-l-purple-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<ClipboardList className="text-purple-500" size={22} />} title={<span className="text-purple-400">Event Stages</span>} />
            <DynamicList
              items={form.stages}
              onChange={(idx, field, value) => handleListChange('stages', idx, field, value)}
              onAdd={() => handleAddListItem('stages', { title: '', description: '' })}
              onRemove={idx => handleRemoveListItem('stages', idx)}
              renderItem={(item, idx, onChange, onRemove) => (
                <div className="flex flex-col md:flex-row gap-2 items-start mb-2" key={idx}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => onChange(idx, 'title', e.target.value)}
                    placeholder="Stage Name (e.g. Screening Round)"
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => onChange(idx, 'description', e.target.value)}
                    placeholder="Stage Description (e.g. Submit your project for review)"
                    className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              )}
            />
          </div>

          {/* Prizes & Rewards */}
          <div className="bg-white/70 backdrop-blur border border-pink-400 border-l-8 border-l-pink-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<Gift className="text-pink-500" size={22} />} title={<span className="text-pink-400">Prizes & Rewards</span>} />
            <DynamicList
              items={form.prizes}
              onChange={(idx, field, value) => handleListChange('prizes', idx, field, value)}
              onAdd={() => handleAddListItem('prizes', { title: '', amount: '', description: '' })}
              onRemove={idx => handleRemoveListItem('prizes', idx)}
              renderItem={(item, idx, onChange, onRemove) => (
                <div className="flex flex-col md:flex-row gap-2 items-start mb-2" key={idx}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => onChange(idx, 'title', e.target.value)}
                    placeholder="Prize Title (e.g. 1st Prize)"
                    className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <input
                    type="text"
                    value={item.amount}
                    onChange={e => onChange(idx, 'amount', e.target.value)}
                    placeholder="Amount (e.g. ₹10,000)"
                    className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => onChange(idx, 'description', e.target.value)}
                    placeholder="Description (e.g. Cash + Certificate)"
                    className="w-full md:w-2/4 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              )}
            />
          </div>

          {/* Additional Benefits */}
          <div className="bg-white/70 backdrop-blur border border-sky-400 border-l-8 border-l-sky-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<Star className="text-sky-500" size={22} />} title={<span className="text-sky-400">Additional Benefits</span>} />
            <DynamicList
              items={form.benefits}
              onChange={(idx, _, value) => handleListChange('benefits', idx, null, value)}
              onAdd={() => handleAddListItem('benefits', "")}
              onRemove={idx => handleRemoveListItem('benefits', idx)}
              renderItem={(item, idx, onChange, onRemove) => (
                <div className="flex gap-2 items-center mb-2" key={idx}>
                  <input
                    type="text"
                    value={item}
                    onChange={e => onChange(idx, null, e.target.value)}
                    placeholder="e.g. Internship Opportunities"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              )}
            />
          </div>

          {/* Rules & Guidelines */}
          <div className="bg-white/70 backdrop-blur border border-orange-400 border-l-8 border-l-orange-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<Shield className="text-orange-500" size={22} />} title={<span className="text-orange-400">Important Rules</span>} />
            <DynamicList
              items={form.rules}
              onChange={(idx, _, value) => handleListChange('rules', idx, null, value)}
              onAdd={() => handleAddListItem('rules', "")}
              onRemove={idx => handleRemoveListItem('rules', idx)}
              renderItem={(item, idx, onChange, onRemove) => (
                <div className="flex gap-2 items-center mb-2" key={idx}>
                  <input
                    type="text"
                    value={item}
                    onChange={e => onChange(idx, null, e.target.value)}
                    placeholder="e.g. All participants must be currently enrolled students"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              )}
            />
          </div>

          <div className="bg-white/70 backdrop-blur border border-yellow-400 border-l-8 border-l-yellow-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<BookOpen className="text-yellow-500" size={22} />} title={<span className="text-yellow-400">General Guidelines</span>} />
            <DynamicList
              items={form.guidelines}
              onChange={(idx, _, value) => handleListChange('guidelines', idx, null, value)}
              onAdd={() => handleAddListItem('guidelines', "")}
              onRemove={idx => handleRemoveListItem('guidelines', idx)}
              renderItem={(item, idx, onChange, onRemove) => (
                <div className="flex gap-2 items-center mb-2" key={idx}>
                  <input
                    type="text"
                    value={item}
                    onChange={e => onChange(idx, null, e.target.value)}
                    placeholder="e.g. Participants should arrive 30 minutes before the event"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              )}
            />
          </div>

          <div className="bg-white/70 backdrop-blur border border-lime-400 border-l-8 border-l-lime-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<Backpack className="text-lime-500" size={22} />} title={<span className="text-lime-400">What to Bring</span>} />
            <DynamicList
              items={form.bring}
              onChange={(idx, _, value) => handleListChange('bring', idx, null, value)}
              onAdd={() => handleAddListItem('bring', "")}
              onRemove={idx => handleRemoveListItem('bring', idx)}
              renderItem={(item, idx, onChange, onRemove) => (
                <div className="flex gap-2 items-center mb-2" key={idx}>
                  <input
                    type="text"
                    value={item}
                    onChange={e => onChange(idx, null, e.target.value)}
                    placeholder="e.g. College ID card"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white text-base shadow-sm transition-all duration-200 focus:shadow-lg"
                    required
                  />
                  <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              )}
            />
          </div>

          {/* Organizer/Organization Details (read-only) */}
          <div className="bg-white/70 backdrop-blur border border-gray-400 border-l-8 border-l-gray-400 p-6 rounded-2xl mb-4">
            <SectionHeader icon={<Building2 className="text-gray-500" size={22} />} title={<span className="text-gray-400">Organization Details</span>} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ReadOnlyField label="Organization" value={organizerProfile.organizationName} />
              <ReadOnlyField label="Short Name (Club)" value={organizerProfile.shortName} />
              <ReadOnlyField label="Parent Organization" value={organizerProfile.parentOrganization} />
              <ReadOnlyField label="City" value={organizerProfile.city} />
              <ReadOnlyField label="Type" value={organizerProfile.organizationType} />
              <ReadOnlyField label="Contact Person" value={organizerProfile.contactPerson} />
              <ReadOnlyField label="Email" value={organizerProfile.email || email} />
              <ReadOnlyField label="Phone" value={organizerProfile.phone} />
              <ReadOnlyField label="Website" value={organizerProfile.website} />
            </div>
            {(!organizerProfile.organizationName || !organizerProfile.shortName) && (
              <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded text-amber-800 text-xs">
                <strong>Note:</strong> Please complete your organization profile first.
                <Link to="/admin/profile" className="ml-1 text-amber-600 underline font-medium">Go to Profile</Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-amber-500 text-white font-extrabold text-lg rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={!organizerProfile.organizationName || !organizerProfile.shortName}
          >
            {isUpdate ? "Update Event" : "Create Event"}
          </button>
        </form>

        {/* Live Preview Section (now at the bottom, full width) */}
        <div className="w-full mt-6 p-10">
          <h3 className="text-2xl font-bold text-blue-700 mb-5 flex items-center gap-2">Event Preview</h3>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl p-4 shadow-lg relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">{form.eventDate && new Date(form.eventDate) < new Date() ? 'Completed' : 'Upcoming'}</div>
              <div className="text-xs opacity-90">by {organizerProfile.organizationName}</div>
            </div>
            <h1 className="text-xl font-bold mb-2 leading-tight">{form.eventName || 'Event Name'}</h1>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center gap-2"><span className="text-xs">{form.eventDate || 'Date'}</span></div>
              <div className="flex items-center gap-2"><span className="text-xs">{form.eventLocation || 'Location'}</span></div>
              <div className="flex items-center gap-2"><span className="text-xs">{form.eventMode}</span></div>
              <div className="flex items-center gap-2"><span className="text-xs">{organizerProfile.organizationName || 'Organization'}</span></div>
            </div>
            <div className="mb-1 text-xs opacity-90 line-clamp-3">{form.eventDescription || 'Event description will appear here.'}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(form.eventTags ? form.eventTags.split(',').map(tag => tag.trim()).filter(Boolean) : []).map(tag => (
                <span key={tag} className="bg-white/20 border border-white/30 rounded-full px-2 py-0.5 text-xs font-semibold">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-200 my-2" />;
}

function InputField({ name, type = "text", label, value, onChange, required = false, placeholder = "", icon = null, options = null, readOnly = false }) {
  return (
    <div>
      <label className="block font-medium mb-1 flex items-center gap-4">{icon}{label}</label>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-base"
          disabled={readOnly}
        >
          {options && options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-base"
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

function ReadOnlyField({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2">
      {icon}
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="ml-1 text-gray-900 truncate">{value || <span className="text-gray-400">Not set</span>}</span>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
  );
}

function DynamicList({ items, onChange, onAdd, onRemove, renderItem }) {
  return (
    <div>
      {items.map((item, idx) => renderItem(item, idx, onChange, onRemove))}
      <button type="button" onClick={onAdd} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1 mb-2 text-sm font-medium">
        <Plus size={16} /> Add
      </button>
    </div>
  );
}
