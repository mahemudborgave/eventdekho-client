import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import UserContext from "../../context/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { Sparkles, Building2 } from "lucide-react";

export default function AddEvent() {
  const { email, token, role } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isUpdate = location.state?.isUpdate;
  const eventData = location.state?.event;

  const initialState = {
    email,
    eventName: "",
    eventDate: "",
    eventLocation: "",
    closeOn: "",
    eventDescription: "",
    eventMode: "Onsite",
    eventTags: "",
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

    // Check if organizer profile is complete
    if (!organizerProfile.organizationName || !organizerProfile.shortName) {
      toast.error("Please complete your organization profile first. Go to Profile to add organization details.");
      return;
    }

    try {
      // Prepare event data with organizer profile information
      const eventData = {
        ...form,
        email: email,
        clubName: organizerProfile.shortName, // Use shortName from profile
        organizationName: organizerProfile.organizationName, // Use organization name from profile
        organizationId: organizerProfile._id, // Use _id as organizationId
        organizationCity: organizerProfile.city, // Use city from profile
        parentOrganization: organizerProfile.parentOrganization, // Use parent organization name from profile
        eventTags: form.eventTags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      console.log(eventData);

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
    <>
      <div className="h-full bg-[#F5F6FA] w-full">
        <form className="bg-white lg:p-8 p-4 h-full" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold lg:mb-8 mb-5  flex items-center gap-2 bg-gradient-to-r from-red-100 to-red-400 p-4">
            <Sparkles color="#BB4D00"/><span className="text-[#BB4D00]">Host </span>Event
          </h2>

          {/* Organizer Profile Information Display */}
          {role === 'organizer' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200 rounded-lg">
              <h3 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <Building2 size={20} /> Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Organization:</span>
                  <span className="ml-2 text-gray-900">{organizerProfile.organizationName || 'Not set'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Short Name:</span>
                  <span className="ml-2 text-gray-900 font-semibold">{organizerProfile.shortName || 'Not set'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-900">{organizerProfile.organizationType || 'Not set'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">City:</span>
                  <span className="ml-2 text-gray-900">{organizerProfile.city || 'Not set'}</span>
                </div>
              </div>
              {(!organizerProfile.organizationName || !organizerProfile.shortName) && (
                <div className="mt-3 p-3 bg-amber-100 border border-amber-300 rounded text-amber-800 text-sm">
                  <strong>Note:</strong> Please complete your organization profile first. 
                  <Link to="/admin/profile" className="ml-1 text-amber-600 underline font-medium">Go to Profile</Link>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField name="eventName" label="Event Name" value={form.eventName} onChange={handleChange} required />

            <InputField name="eventDate" type="date" label="Event Date" value={form.eventDate} onChange={handleChange} required />
            
            <InputField name="eventLocation" label="Event Location" value={form.eventLocation} onChange={handleChange} required placeholder="e.g., Main Auditorium, Room 101, etc." />
            
            <InputField name="closeOn" type="date" label="Registrations Closing On" value={form.closeOn} onChange={handleChange} required />
            
            <div>
              <label className="block font-medium mb-1">Event Mode</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="eventMode"
                    value="Onsite"
                    checked={form.eventMode === "Onsite"}
                    onChange={handleChange}
                    required
                  />
                  Onsite
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="eventMode"
                    value="Online"
                    checked={form.eventMode === "Online"}
                    onChange={handleChange}
                    required
                  />
                  Online
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-medium mb-1">Event Description</label>
            <textarea
              name="eventDescription"
              value={form.eventDescription}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFD600] border-gray-300"
              required
              placeholder="Describe your event, objectives, and what participants can expect..."
            />
          </div>
          <div className="mt-6 lg:w-1/2">
            <InputField name="eventTags" label="Event Tags (comma separated)" value={form.eventTags} onChange={handleChange} required={false} placeholder="e.g., technical, workshop, competition, hackathon" />
          </div>

          <button
            type="submit"
            className="mt-8 px-5 bg-[#BB4D00] text-white font-bold py-3 rounded-full hover:bg-[#ffe066] transition"
            disabled={!organizerProfile.organizationName || !organizerProfile.shortName}
          >
            {isUpdate ? "Update Event" : "Create Event"}
          </button>
        </form>
      </div>
    </>
  );
}

function InputField({ name, type = "text", label, value, onChange, required = false, placeholder = "" }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFD600] border-gray-300"
      />
    </div>
  );
}
