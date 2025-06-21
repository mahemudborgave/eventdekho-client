import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import UserContext from "../../context/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { Autocomplete, TextField, MenuItem, CircularProgress } from '@mui/material';
import { Eclipse, Sparkles } from "lucide-react";

export default function AddEvent() {
  const { email } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isUpdate = location.state?.isUpdate;
  const eventData = location.state?.event;

  const initialState = {
    email,
    eventName: "",
    clubName: "",
    collegeName: "",
    collegeCode: "",
    collegeCity: "",
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
  const [colleges, setColleges] = useState([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [addCollegeForm, setAddCollegeForm] = useState({
    collegeName: '',
    collegeCode: '',
    shortName: '',
    city: '',
    type: '',
    tier: '',
  });
  const [addingCollege, setAddingCollege] = useState(false);
  const [isShow, setIsShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const [addCollegeDialogOpen, setAddCollegeDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const StoredToken = localStorage.getItem("token");
      let response;

      if (StoredToken) {
        try {
          response = await axios.post(`${baseURL}:${port}/userauth/verifytoken`, {}, {
            headers: { Authorization: `Bearer ${StoredToken}` }
          });
        } catch (e) {
          console.log("Error ", e);
        }
      }

      if (StoredToken && response) {
        setIsShow(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

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

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/college/getallcolleges`);
        setColleges(res.data);
      } catch (err) {
        setColleges([]);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "collegeName") {
      const [namePart, codePart] = value.split(" - ");
      setForm({
        ...form,
        collegeName: namePart || "",
        collegeCode: codePart || "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCollegeSearch = (event, value) => {
    setCollegeSearch(value);
    const found = colleges.find(
      c => c.collegeName && c.collegeName.toLowerCase() === value.toLowerCase()
    );
    setSelectedCollege(found || null);
    setShowAddCollege(!found && value.length > 2);
    if (found) {
      setForm({ ...form, collegeName: found.collegeName, collegeCode: found.collegeCode, collegeCity: found.city });
    } else {
      setForm({ ...form, collegeName: value, collegeCode: '', collegeCity: '' });
    }
  };

  const handleAddCollegeChange = (e) => {
    const { name, value } = e.target;
    setAddCollegeForm({ ...addCollegeForm, [name]: value });
  };

  const handleOpenAddCollegeDialog = () => setAddCollegeDialogOpen(true);
  const handleCloseAddCollegeDialog = () => setAddCollegeDialogOpen(false);

  const handleAddCollege = async (e) => {
    e.preventDefault();
    if (!addCollegeForm.collegeName || !addCollegeForm.city || !addCollegeForm.type) {
      toast.error('Please fill all required fields');
      return;
    }
    setAddingCollege(true);
    try {
      const payload = {
        collegeName: addCollegeForm.collegeName,
        collegeCode: addCollegeForm.collegeCode || `CC${Date.now()}`,
        shortName: addCollegeForm.shortName,
        city: addCollegeForm.city,
        type: addCollegeForm.type,
        tier: addCollegeForm.tier,
      };
      const res = await axios.post(`${baseURL}:${port}/college/registercollege`, payload);
      toast.success('College added!');
      const newCollege = {
        ...res.data.college,
        collegeName: res.data.college.collegeName,
        collegeCode: res.data.college.collegeCode,
      };
      setColleges([...colleges, newCollege]);
      setForm({ ...form, collegeName: newCollege.collegeName, collegeCode: newCollege.collegeCode, collegeCity: newCollege.city });
      setShowAddCollege(false);
      setAddCollegeForm({ collegeName: '', collegeCode: '', shortName: '', city: '', type: '', tier: '' });
      setAddCollegeDialogOpen(false);
    } catch (err) {
      toast.error('Failed to add college');
    } finally {
      setAddingCollege(false);  
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(form);
    

    if (!form.eventName || !form.collegeName || !form.collegeCode || !form.collegeCity ||
      !form.eventDate || !form.eventLocation || !form.closeOn || !form.eventDescription || !form.eventMode) {
      toast.error("All fields are required");
      return;
    }

    if (form.collegeCode.length < 4) {
      toast.error("College code must be at least 4 characters");
      return;
    }

    try {
      if (isUpdate && eventData?._id) {
        await axios.put(`${baseURL}:${port}/eventt/updateevent/${eventData._id}`, {
          ...form,
          eventTags: form.eventTags.split(',').map(tag => tag.trim()).filter(Boolean),
        });
        toast.success("Event updated successfully");
        navigate(-1);
      } else {
        const res = await axios.post(`${baseURL}:${port}/eventt/addevent`, {
          ...form,
          eventTags: form.eventTags.split(',').map(tag => tag.trim()).filter(Boolean),
        });
        
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

  return (
    <>
      {isShow ? (
        <div className="h-full bg-[#F5F6FA] w-full">
          <form className="bg-white lg:p-8 p-3 h-full" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold lg:mb-8 mb-5  flex items-center gap-2">
              <Sparkles color="#FFD600"/><span className="text-[#FFD600]">Host </span>Event
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField name="eventName" label="Event Name" value={form.eventName} onChange={handleChange} required />

              <InputField 
                name="clubName" 
                label="Club Name (Short Form)" 
                value={form.clubName} 
                onChange={handleChange}  
                placeholder="e.g., CSI, IEEE, ACM, etc."
              />

              <div>
                <label className="block font-medium mb-1">Event's College Name</label>
                <Autocomplete
                  freeSolo
                  options={colleges}
                  getOptionLabel={option => typeof option === 'string' ? option : (option.collegeName || '')}
                  value={selectedCollege || collegeSearch}
                  filterOptions={(options, params) => {
                    const input = params.inputValue.toLowerCase();
                    const filtered = options.filter(option =>
                      (option.collegeName && option.collegeName.toLowerCase().includes(input)) ||
                      (option.shortName && option.shortName.toLowerCase().includes(input)) ||
                      (option.city && option.city.toLowerCase().includes(input))
                    );
                    if (
                      params.inputValue.length > 2 &&
                      !options.some(option =>
                        (option.collegeName && option.collegeName.toLowerCase() === input) ||
                        (option.shortName && option.shortName.toLowerCase() === input) ||
                        (option.city && option.city.toLowerCase() === input)
                      )
                    ) {
                      filtered.push({ inputValue: params.inputValue, customAdd: true });
                    }
                    return filtered;
                  }}
                  onChange={(event, newValue) => {
                    if (newValue && newValue.customAdd) {
                      setAddCollegeForm(prev => ({ ...prev, collegeName: newValue.inputValue }));
                      setTimeout(() => setAddCollegeDialogOpen(true), 0);
                      setCollegeSearch(newValue.inputValue);
                      setSelectedCollege(null);
                      setShowAddCollege(false);
                      setForm({ ...form, collegeName: newValue.inputValue, collegeCode: '', collegeCity: '' });
                    } else if (typeof newValue === 'string') {
                      setCollegeSearch(newValue);
                      setSelectedCollege(null);
                      setShowAddCollege(newValue.length > 2 && !colleges.some(c => c.collegeName && c.collegeName.toLowerCase() === newValue.toLowerCase()));
                      setForm({ ...form, collegeName: newValue, collegeCode: '', collegeCity: '' });
                    } else if (newValue && newValue.collegeName) {
                      setSelectedCollege(newValue);
                      setCollegeSearch(newValue.collegeName);
                      setShowAddCollege(false);
                      setForm({ ...form, collegeName: newValue.collegeName, collegeCode: newValue.collegeCode, collegeCity: newValue.city });
                    } else {
                      setSelectedCollege(null);
                      setShowAddCollege(false);
                      setForm({ ...form, collegeName: '', collegeCode: '', collegeCity: '' });
                    }
                  }}
                  onInputChange={(event, value) => {
                    setCollegeSearch(value);
                    const found = colleges.find(c => c.collegeName && c.collegeName.toLowerCase() === value.toLowerCase());
                    setSelectedCollege(found || null);
                    setShowAddCollege(value.length > 2 && !found);
                    if (found) {
                      setForm({ ...form, collegeName: found.collegeName, collegeCode: found.collegeCode, collegeCity: found.city });
                    } else {
                      setForm({ ...form, collegeName: value, collegeCode: '', collegeCity: '' });
                    }
                  }}
                  renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    if (option.customAdd) {
                      return (
                        <li key={key} {...rest} style={{ color: '#1976d2', fontWeight: 500 }}>
                          Not found? <b>Add "{option.inputValue}" as a new college</b>
                        </li>
                      );
                    }
                    return (
                      <li key={key} {...rest}>{option.collegeName}</li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" fullWidth/>
                  )}
                />
              </div>
              <InputField name="collegeCity" label="College City" value={form.collegeCity} onChange={handleChange} required />
              <InputField name="eventLocation" label="Event Location in the college" value={form.eventLocation} onChange={handleChange} required />


              <InputField name="eventDate" type="date" label="Event Date" value={form.eventDate} onChange={handleChange} required />
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
              />
            </div>
            <div className="mt-6 lg:w-1/2">
              <InputField name="eventTags" label="Event Tags (comma separated)" value={form.eventTags} onChange={handleChange} required={false} />
            </div>

            <button
              type="submit"
              className="mt-8 px-5 bg-[#FFD600] text-[#232946] font-bold py-3 rounded-full hover:bg-[#ffe066] transition"
            >
              {isUpdate ? "Update Event" : "Create Event"}
            </button>
          </form>
        </div>
      ) : (
        <Link to='/login' className="block p-8 text-center text-red-700 underline">
          Log in to continue
        </Link>
      )}
      {addCollegeDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={handleCloseAddCollegeDialog}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">Add New College</h2>
            <form id="add-college-form" onSubmit={handleAddCollege} className="flex flex-col gap-3">
              <div>
                <label className="block mb-1 font-medium">College Name *</label>
                <input name="collegeName" value={addCollegeForm.collegeName} onChange={handleAddCollegeChange} required className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">DTE Code (optional)</label>
                <input name="collegeCode" value={addCollegeForm.collegeCode} onChange={handleAddCollegeChange} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Short Name</label>
                <input name="shortName" value={addCollegeForm.shortName} onChange={handleAddCollegeChange} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">City *</label>
                <input name="city" value={addCollegeForm.city} onChange={handleAddCollegeChange} required className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Type *</label>
                <select name="type" value={addCollegeForm.type} onChange={handleAddCollegeChange} required className="w-full border px-2 py-1 rounded">
                  <option value="">Select Type</option>
                  <option value="Government Aided">Government Aided</option>
                  <option value="Unaided">Private Unaided</option>
                  <option value="Autonomous">Autonomous</option>
                  <option value="Non-autonomous">Non-Autonomous</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Tier (optional)</label>
                <input name="tier" value={addCollegeForm.tier} onChange={handleAddCollegeChange} className="w-full border px-2 py-1 rounded" />
              </div>
              <button type="submit" disabled={addingCollege} className="bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded mt-2 transition disabled:opacity-60 w-full">
                {addingCollege ? 'Adding...' : 'Add College'}
              </button>
            </form>
          </div>
        </div>
      )}
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
        minLength={name === "collegeCode" ? 4 : undefined}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFD600] border-gray-300"
      />
    </div>
  );
}
