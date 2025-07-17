import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import UserContext from "../../context/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Building2,
  Info,
  Mail,
  Phone,
  Globe,
  Tag,
  User,
  Sparkles,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  Award,
  Star,
  Gift,
  CheckCircle,
  AlertCircle,
  Target,
  Briefcase,
  Shield,
  ClipboardList,
  Backpack,
  Flame,
  IndianRupee,
} from "lucide-react";
import Cropper from 'react-easy-crop';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { v4 as uuidv4 } from 'uuid';
// shadcn/ui imports
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

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
    // Payment fields
    fee: 0,
    upiId: "",
    bankDetails: "",
    posterUrl: "", // Added posterUrl to initialState
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

  // Poster upload/crop state
  const [showPosterCropModal, setShowPosterCropModal] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [posterCrop, setPosterCrop] = useState({ x: 0, y: 0 });
  const [posterZoom, setPosterZoom] = useState(1);
  const [posterCroppedAreaPixels, setPosterCroppedAreaPixels] = useState(null);
  const [posterCropping, setPosterCropping] = useState(false);

  // Helper to get cropped image blob
  const createImage = (url) => new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

  async function getCroppedImg(imageSrc, cropPixels) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  }

  const handlePosterChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPoster(URL.createObjectURL(e.target.files[0]));
      setShowPosterCropModal(true);
    }
  };

  const onPosterCropComplete = (croppedArea, croppedAreaPixels) => {
    setPosterCroppedAreaPixels(croppedAreaPixels);
  };

  const handlePosterCropSave = async () => {
    setPosterCropping(true);
    try {
      const croppedBlob = await getCroppedImg(selectedPoster, posterCroppedAreaPixels);
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', croppedBlob, uuidv4() + '.jpg');
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'eventdekho/event_posters');
      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      const posterUrl = cloudinaryRes.data.secure_url;
      setForm((prev) => ({ ...prev, posterUrl }));
      toast.success('Poster uploaded!');
      setShowPosterCropModal(false);
      setSelectedPoster(null);
    } catch (err) {
      toast.error('Failed to upload poster');
    } finally {
      setPosterCropping(false);
    }
  };

  const handlePosterCropCancel = () => {
    setShowPosterCropModal(false);
    setSelectedPoster(null);
  };

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
        posterUrl: eventData.posterUrl || "", // Ensure posterUrl is set from eventData
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

        {/* Responsive flex container for form and preview */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 w-full max-w-7xl mx-auto px-2 md:px-6">
          {/* Form section */}
          <form
            className="flex flex-col gap-5 w-full md:w-2/3 lg:w-3/5 py-5 px-0"
            onSubmit={handleSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }}
          >
            <Card className="mb-5 dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <h1 className="text-2xl font-bold tracking-tight mb-2 flex-1">
                  <span className="text-[#BB4D00] dark:text-amber-400">Host</span> event
                </h1>
                <p className="text-gray-500 dark:text-gray-300 text-sm">Fill in all the details to host your event. Fields marked with * are required.</p>
              </CardHeader>
            </Card>

            <Card className="mb-4 dark:bg-gray-800 dark:text-gray-100">
              <CardContent className="grid gap-6">
                <div>
                  <Label htmlFor="eventName" className="dark:text-gray-200 mb-2">Event Name *</Label>
                  <Input id="eventName" name="eventName" value={form.eventName} onChange={handleChange} required placeholder="Enter event name" className="dark:bg-gray-900 dark:text-gray-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="eventDate" className="dark:text-gray-200 mb-2">Event Date *</Label>
                    <Input id="eventDate" name="eventDate" type="date" value={form.eventDate} onChange={handleChange} required className="dark:bg-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <Label htmlFor="closeOn" className="dark:text-gray-200 mb-2">Registration Close On *</Label>
                    <Input id="closeOn" name="closeOn" type="date" value={form.closeOn} onChange={handleChange} required className="dark:bg-gray-900 dark:text-gray-100" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="eventLocation" className="dark:text-gray-200 mb-2">Location *</Label>
                    <Input id="eventLocation" name="eventLocation" value={form.eventLocation} onChange={handleChange} required placeholder="Venue or online link" className="dark:bg-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <Label htmlFor="eventMode" className="dark:text-gray-200 mb-2">Mode *</Label>
                    <Select value={form.eventMode} onValueChange={val => setForm(f => ({ ...f, eventMode: val }))}>
                      <SelectTrigger id="eventMode" name="eventMode" className="dark:bg-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:text-gray-100">
                        <SelectItem value="Onsite">Onsite</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventDescription" className="dark:text-gray-200 mb-2">Description *</Label>
                  <Textarea id="eventDescription" name="eventDescription" value={form.eventDescription} onChange={handleChange} required placeholder="Describe your event" className="dark:bg-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <Label htmlFor="eventTags" className="dark:text-gray-200 mb-2">Tags (comma separated)</Label>
                  <Input id="eventTags" name="eventTags" value={form.eventTags} onChange={handleChange} placeholder="e.g. tech, fest, workshop" className="dark:bg-gray-900 dark:text-gray-100" />
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="mb-4 dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2">
                  <IndianRupee className="text-yellow-600 dark:text-yellow-400" size={18} /> Event Fee & Payment Details
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="paymentType">Event Type</Label>
                  <select
                    name="paymentType"
                    id="paymentType"
                    value={form.paymentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-base dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                  >
                    <option value="free">Free Event</option>
                    <option value="paid">Paid Event</option>
                  </select>
                </div>

                {/* Payment Details - Only show if paid */}
                {form.paymentType === 'paid' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fee">Event Fee (INR)</Label>
                      <Input
                        type="number"
                        name="fee"
                        id="fee"
                        min="1"
                        value={form.fee}
                        onChange={handleChange}
                        placeholder="Enter event fee"
                        className="dark:bg-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upiId">Organizer UPI ID</Label>
                      <Input
                        type="text"
                        name="upiId"
                        id="upiId"
                        value={form.upiId}
                        onChange={handleChange}
                        placeholder="e.g. organizer@upi"
                        className="dark:bg-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankDetails">Bank Account Details (optional)</Label>
                      <Textarea
                        name="bankDetails"
                        id="bankDetails"
                        value={form.bankDetails}
                        onChange={handleChange}
                        placeholder="Account No, IFSC, Bank Name, etc."
                        rows={2}
                        className="dark:bg-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dynamic Sections Example: Stages */}
            <Card className="mb-4 dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2"><Sparkles className="text-blue-500 dark:text-blue-300" size={18} /> Stages</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {form.stages.map((stage, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-2 items-center">
                    <Input
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Stage title"
                      value={stage.title}
                      onChange={e => handleListChange('stages', idx, 'title', e.target.value)}
                    />
                    <Textarea
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Stage description"
                      value={stage.description}
                      onChange={e => handleListChange('stages', idx, 'description', e.target.value)}
                    />
                    <Button type="button" variant="destructive" onClick={() => handleRemoveListItem('stages', idx)} size="icon" className="h-9 w-9"><Trash2 size={18} /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddListItem('stages', { title: '', description: '' })} className="w-fit dark:border-gray-600 dark:text-gray-200"><Plus size={16} className="mr-1" /> Add Stage</Button>
              </CardContent>
            </Card>

            {/* Repeat similar Card sections for Prizes, Benefits, Rules, Guidelines, Bring */}
            {/* ...Prizes... */}
            <Card className="mb-4 dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2"><Gift className="text-amber-500 dark:text-amber-300" size={18} /> Prizes</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {form.prizes.map((prize, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-2 items-center">
                    <Input
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Prize title"
                      value={prize.title}
                      onChange={e => handleListChange('prizes', idx, 'title', e.target.value)}
                    />
                    <Input
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Amount/Type"
                      value={prize.amount}
                      onChange={e => handleListChange('prizes', idx, 'amount', e.target.value)}
                    />
                    <Textarea
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Prize description"
                      value={prize.description}
                      onChange={e => handleListChange('prizes', idx, 'description', e.target.value)}
                    />
                    <Button type="button" variant="destructive" onClick={() => handleRemoveListItem('prizes', idx)} size="icon" className="h-9 w-9"><Trash2 size={18} /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddListItem('prizes', { title: '', amount: '', description: '' })} className="w-fit dark:border-gray-600 dark:text-gray-200"><Plus size={16} className="mr-1" /> Add Prize</Button>
              </CardContent>
            </Card>

            {/* ...Benefits... */}
            <Card className="mb-4 dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2"><Star className="text-green-500 dark:text-green-300" size={18} /> Benefits</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {form.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Benefit"
                      value={benefit}
                      onChange={e => handleListChange('benefits', idx, null, e.target.value)}
                    />
                    <Button type="button" variant="destructive" onClick={() => handleRemoveListItem('benefits', idx)} size="icon" className="h-9 w-9"><Trash2 size={18} /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddListItem('benefits', '')} className="w-fit dark:border-gray-600 dark:text-gray-200"><Plus size={16} className="mr-1" /> Add Benefit</Button>
              </CardContent>
            </Card>

            {/* ...Rules... */}
            <Card className="mb-4 dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2"><ClipboardList className="text-blue-700 dark:text-blue-300" size={18} /> Rules</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {form.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Rule"
                      value={rule}
                      onChange={e => handleListChange('rules', idx, null, e.target.value)}
                    />
                    <Button type="button" variant="destructive" onClick={() => handleRemoveListItem('rules', idx)} size="icon" className="h-9 w-9"><Trash2 size={18} /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddListItem('rules', '')} className="w-fit dark:border-gray-600 dark:text-gray-200"><Plus size={16} className="mr-1" /> Add Rule</Button>
              </CardContent>
            </Card>

            {/* ...Guidelines... */}
            <Card className="mb-4 dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2"><Shield className="text-purple-600 dark:text-purple-300" size={18} /> Guidelines</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {form.guidelines.map((guide, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Guideline"
                      value={guide}
                      onChange={e => handleListChange('guidelines', idx, null, e.target.value)}
                    />
                    <Button type="button" variant="destructive" onClick={() => handleRemoveListItem('guidelines', idx)} size="icon" className="h-9 w-9"><Trash2 size={18} /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddListItem('guidelines', '')} className="w-fit dark:border-gray-600 dark:text-gray-200"><Plus size={16} className="mr-1" /> Add Guideline</Button>
              </CardContent>
            </Card>

            {/* ...Bring... */}
            <Card className="mb-4 dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <span className="font-semibold flex items-center gap-2"><Backpack className="text-amber-700 dark:text-amber-400" size={18} /> Bring</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {form.bring.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      className="flex-1 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Item to bring"
                      value={item}
                      onChange={e => handleListChange('bring', idx, null, e.target.value)}
                    />
                    <Button type="button" variant="destructive" onClick={() => handleRemoveListItem('bring', idx)} size="icon" className="h-9 w-9"><Trash2 size={18} /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddListItem('bring', '')} className="w-fit dark:border-gray-600 dark:text-gray-200"><Plus size={16} className="mr-1" /> Add Item</Button>
              </CardContent>
            </Card>

            {/* Poster Upload */}
            <div className="mb-4">
              <Label>Event Poster (Recommended: 1200x627px)</Label>
              <Input type="file" accept="image/*" onChange={handlePosterChange} />
              {form.posterUrl && (
                <div className="mt-2">
                  <img src={form.posterUrl} alt="Event Poster" className="w-full max-w-lg rounded shadow" />
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">Upload a poster image for your event. Recommended size: 1200x627px.</div>
            </div>

            {/* Poster Crop Modal */}
            <Modal open={showPosterCropModal} onClose={handlePosterCropCancel} aria-labelledby="poster-crop-modal">
              <Box className="flex justify-center items-center h-screen">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
                  <h2 className="text-lg font-bold mb-4">Crop Poster</h2>
                  {selectedPoster && (
                    <>
                      <div className="relative w-full h-80 bg-gray-100">
                        <Cropper
                          image={selectedPoster}
                          crop={posterCrop}
                          zoom={posterZoom}
                          aspect={1200/627}
                          onCropChange={setPosterCrop}
                          onZoomChange={setPosterZoom}
                          onCropComplete={onPosterCropComplete}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-xs">Zoom</span>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.01}
                          value={posterZoom}
                          onChange={(e) => setPosterZoom(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button onClick={handlePosterCropCancel} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 rounded transition">Cancel</button>
                    <button onClick={handlePosterCropSave} disabled={posterCropping} className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded transition disabled:opacity-60">{posterCropping ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              </Box>
            </Modal>

            <Button type="submit" className="w-full mt-6 text-lg font-semibold dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800">{isUpdate ? "Update Event" : "Create Event"}</Button>
          </form>

          {/* Preview section */}
          <div className="w-full md:w-1/3 lg:w-2/5 md:sticky md:top-8">
            <div className="mt-6 md:mt-0 p-4 md:p-0">
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-5 flex items-center gap-2">Event Preview</h3>
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-white rounded-xl p-4 shadow-lg relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white dark:bg-green-700">{form.eventDate && new Date(form.eventDate) < new Date() ? 'Completed' : 'Upcoming'}</div>
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
                    <span key={tag} className="bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-full px-2 py-0.5 text-xs font-semibold">#{tag}</span>
                  ))}
                </div>
              </div>
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
