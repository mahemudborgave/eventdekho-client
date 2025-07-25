import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/card';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function EventRegistrationPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, email, token, role } = useContext(UserContext);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  const [event, setEvent] = useState(null);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Registration form state
  const [formData, setFormData] = useState({
    studentName: user || '',
    gender: '',
    studentCollegeName: '',
    branch: '',
    course: '',
    year: '',
    mobno: ''
  });
  const [extraParticipants, setExtraParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState('fetching');
  const [studentId, setStudentId] = useState(email);

  useEffect(() => {
    // Fetch event details
    const fetchEvent = async () => {
      setLoadingEvent(true);
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevent/${eventId}`);
        setEvent(res.data);
      } catch (err) {
        toast.error('Failed to fetch event details');
      } finally {
        setLoadingEvent(false);
      }
    };
    fetchEvent();
  }, [eventId, baseURL, port]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token || !email) return;
      setLoading(true);
      setProfileStatus('fetching');
      try {
        const res = await axios.get(`${baseURL}:${port}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.user) {
          const userData = res.data.user;
          const profileObj = {
            studentName: userData.name || '',
            gender: userData.gender || '',
            studentCollegeName: userData.collegeName || '',
            branch: userData.branch || '',
            course: userData.course || '',
            year: userData.year || '',
            mobno: userData.mobileNumber || '',
          };
          setFormData(profileObj);
          setOriginalProfile(profileObj);
          setStudentId(userData.email || email);
          setProfileStatus('fetched');
        } else {
          setProfileStatus('error');
        }
      } catch (err) {
        setProfileStatus('error');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
    // eslint-disable-next-line
  }, [token, email]);

  const handleMainChange = e => {
    const { id, name, value, type } = e.target;
    const fieldName = type === 'radio' ? name : (id || name);
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Extra participants handlers
  const handleExtraChange = (idx, field, value) => {
    setExtraParticipants(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const addExtraParticipant = () => {
    if (event && 1 + extraParticipants.length < (event.maxParticipants || 1)) {
      setExtraParticipants(prev => [...prev, { name: '', gender: '', email: '', phone: '' }]);
    }
  };
  const removeExtraParticipant = (idx) => {
    setExtraParticipants(prev => prev.filter((_, i) => i !== idx));
  };

  // Validation
  const validateAll = () => {
    const { studentName, gender, studentCollegeName, branch, course, year, mobno } = formData;
    if (!studentName.trim() || !gender || !studentCollegeName.trim() || !branch || !course || !year || !mobno.trim()) {
      toast.error('Please fill all main participant details.');
      return false;
    }
    if (!/^[0-9]{10}$/.test(mobno)) {
      toast.warn('Invalid phone number for main participant.');
      return false;
    }
    for (let i = 0; i < extraParticipants.length; i++) {
      const p = extraParticipants[i];
      if (!p.name.trim() || !p.gender || !p.email.trim() || !p.phone.trim()) {
        toast.warn(`Please fill all details for extra participant #${i + 2}.`);
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(p.email)) {
        toast.warn(`Invalid email for extra participant #${i + 2}.`);
        return false;
      }
      if (!/^[0-9]{10}$/.test(p.phone)) {
        toast.warn(`Invalid phone number for extra participant #${i + 2}.`);
        return false;
      }
    }
    const total = 1 + extraParticipants.length;
    if (event && total < (event.minParticipants || 1)) {
      toast.warn(`Please add at least ${event.minParticipants} participant${event.minParticipants > 1 ? 's' : ''}.`);
      return false;
    }
    if (event && total > (event.maxParticipants || 1)) {
      toast.warn(`You can add up to ${event.maxParticipants} participant${event.maxParticipants > 1 ? 's' : ''}.`);
      return false;
    }
    return true;
  };

  const maybeUpdateProfile = async () => {
    if (!originalProfile) return;
    const changed = Object.keys(originalProfile).some(
      key => formData[key] !== originalProfile[key]
    );
    if (!changed) return;
    try {
      await axios.put(`${baseURL}:${port}/auth/profile`, {
        name: formData.studentName,
        gender: formData.gender,
        collegeName: formData.studentCollegeName,
        course: formData.course,
        branch: formData.branch,
        year: formData.year,
        mobileNumber: formData.mobno,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.info('Profile updated with new details!');
    } catch (err) {}
  };

  const MySwal = withReactContent(Swal);

  // Submission
  const handleSubmit = async (e, skipConfirmation = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!token) {
      toast.error('Please log in to register for events.');
      return;
    }
    if (!validateAll()) return;
    if (!skipConfirmation) {
      const total = 1 + extraParticipants.length;
      const canAddMore = event && total < (event.maxParticipants || 1);
      const result = await MySwal.fire({
        title: 'Confirm Registration',
        html: `<div style='text-align:left'>
          <b>Participants filled:</b> ${total} <br/>
          <b>Minimum required:</b> ${event?.minParticipants || 1} <br/>
          <b>Maximum allowed:</b> ${event?.maxParticipants || 1} <br/>
          ${canAddMore ? `<span style='color:#eab308'>You can add up to ${(event?.maxParticipants || 1) - total} more participant(s).</span>` : `<span style='color:#16a34a'>Maximum participants reached.</span>`}
        </div>`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Proceed Registration',
        cancelButtonText: 'Go Back',
        reverseButtons: true
      });
      if (!result.isConfirmed) return;
    }
    setLoading(true);
    try {
      const registrationPayload = {
        eventId,
        eventName: event?.eventName,
        organizationName: event?.organizationName,
        parentOrganization: event?.parentOrganization,
        studentName: formData.studentName,
        gender: formData.gender,
        email,
        mobno: formData.mobno,
        studentCollegeName: formData.studentCollegeName,
        branch: formData.branch,
        course: formData.course,
        year: formData.year,
        extraParticipants,
        fee: event?.fee || 0,
      };
      await axios.post(`${baseURL}:${port}/eventt/registerevent`, registrationPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await maybeUpdateProfile();
      await MySwal.fire({
        title: 'Registered!',
        text: 'You have successfully registered for the event.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      setHasRegistered(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Payment handler (if needed)
  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    const total = 1 + extraParticipants.length;
    const canAddMore = event && total < (event.maxParticipants || 1);
    const result = await MySwal.fire({
      title: 'Confirm Registration',
      html: `<div style='text-align:left'>
        <b>Participants filled:</b> ${total} <br/>
        <b>Minimum required:</b> ${event?.minParticipants || 1} <br/>
        <b>Maximum allowed:</b> ${event?.maxParticipants || 1} <br/>
        ${canAddMore ? `<span style='color:#eab308'>You can add up to ${(event?.maxParticipants || 1) - total} more participant(s).</span>` : `<span style='color:#16a34a'>Maximum participants reached.</span>`}
      </div>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Proceed to Payment',
      cancelButtonText: 'Go Back',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;
    setPaymentLoading(true);
    try {
      // Close SweetAlert2 before opening Razorpay
      await MySwal.close();
      const orderPayload = {
        amount: event?.fee || 0,
        eventId,
        studentName: formData.studentName,
        gender: formData.gender,
        email,
        mobno: formData.mobno,
        studentCollegeName: formData.studentCollegeName,
        branch: formData.branch,
        course: formData.course,
        year: formData.year,
        extraParticipants,
      };
      const { data } = await axios.post(`${baseURL}:${port}/api/payment/create-order`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        handler: async function (response) {
          const verifyPayload = {
            ...response,
            eventId,
            studentId,
            studentName: formData.studentName,
            gender: formData.gender,
            email,
            mobno: formData.mobno,
            studentCollegeName: formData.studentCollegeName,
            branch: formData.branch,
            course: formData.course,
            year: formData.year,
            extraParticipants,
            amount: data.amount,
          };
          try {
            await axios.post(`${baseURL}:${port}/api/payment/verify`, verifyPayload, {
              headers: { Authorization: `Bearer ${token}` }
            });
            await maybeUpdateProfile();
            await MySwal.fire({
              title: 'Registered!',
              text: 'You have successfully registered for the event.',
              icon: 'success',
              confirmButtonText: 'OK',
            });
            setHasRegistered(true);
          } catch (err) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {},
        theme: { color: '#3399cc' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loadingEvent) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin w-8 h-8 text-orange-500" /></div>;
  }
  if (!event) {
    return <div className="text-center text-red-600 mt-10">Event not found.</div>;
  }
  if (hasRegistered) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mb-2" />
        <div className="text-xl font-bold text-green-700 mb-5">You have successfully registered for this event!</div>
        <Button asChild variant="outline"><Link to={`/eventdetail/${eventId}`}>Back to Event Details</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-10 bg-[#B8CFCC] pt-4 pb-2 px-5 shadow-sm flex flex-col lg:mx-[200px]">
        <Button variant="ghost" className="mb-1 w-fit" onClick={() => navigate(-1)}><ArrowLeft className="mr-1" /> Back to Event</Button>
        <h1 className="text-xl font-semibold text-left mb-2 ml-3">Register for {event.eventName}</h1>
        {event.fee > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-300 mx-auto w-full max-w-lg gap-0 mb-2">
            <div className="text-base lg:text-lg font-semibold text-yellow-800">Amount to Pay: <span className="font-bold">₹{event.fee}</span></div>
            <div className="text-sm text-yellow-700">You will be redirected to Razorpay for payment.</div>
          </Card>
        )}
      </div>
      {/* Scrollable Form Section */}
      <div className="flex-1 overflow-y-auto bg-gray-100 lg:mx-[200px]">
        <div className="max-w-3xl mx-auto bg-white px-8 lg:px-15 py-10 w-full min-h-screen">

        <form id="event-registration-form" onSubmit={event.fee > 0 ? handleRazorpayPayment : handleSubmit} className="space-y-6">
          {/* Profile Fetching Status */}
          <div className="mb-2">
            {profileStatus === 'fetching' && (
              <div className="flex items-center gap-2 text-blue-600 text-sm"><Loader2 className="animate-spin w-4 h-4" /> Fetching details from profile...</div>
            )}
            {profileStatus === 'fetched' && (
              <div className="flex items-center gap-2 text-green-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Fetched details from profile</div>
            )}
            {profileStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm">Could not fetch profile details. Please fill manually.</div>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm lg:text-base mt-8">
            <div>
              <Label htmlFor="studentName" className='mb-1'>Full Name</Label>
              <Input id="studentName" value={formData.studentName} onChange={handleMainChange} required placeholder="Full Name" />
            </div>
            <div>
              <Label htmlFor="gender" className='mb-1'>Gender</Label>
              <select className="w-full border rounded px-2 py-2" name="gender" value={formData.gender} onChange={handleMainChange} required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="studentCollegeName" className='mb-1'>College/University Name</Label>
              <Input id="studentCollegeName" value={formData.studentCollegeName} onChange={handleMainChange} required placeholder="College/University Name" />
            </div>
            <div>
              <Label htmlFor="course" className='mb-1'>Course</Label>
              <select id="course" name="course" className="w-full border rounded px-2 py-2" value={formData.course} onChange={handleMainChange} required>
                <option value="">-- Select --</option>
                <option value="B.Tech">B.Tech</option>
                <option value="B.E">B.E</option>
                <option value="M.E">M.E</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div>
              <Label htmlFor="branch" className='mb-1'>Branch</Label>
              <select id="branch" name="branch" className="w-full border rounded px-2 py-2" value={formData.branch} onChange={handleMainChange} required>
                <option value="">-- Select --</option>
                <option value="IT">IT</option>
                <option value="CS">CS</option>
                <option value="Mech">Mech</option>
                <option value="Trical">Trical</option>
                <option value="Tronics">Tronics</option>
                <option value="Civil">Civil</option>
              </select>
            </div>
            <div>
              <Label htmlFor="year" className='mb-1'>Year</Label>
              <select id="year" name="year" className="w-full border rounded px-2 py-2" value={formData.year} onChange={handleMainChange} required>
                <option value="">-- Select --</option>
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Fourth Year">Fourth Year</option>
              </select>
            </div>
            <div>
              <Label htmlFor="mobno" className='mb-1'>Mobile Number</Label>
              <Input id="mobno" value={formData.mobno} onChange={handleMainChange} required placeholder="10-digit Mobile Number" maxLength={10} />
            </div>
          </div>
          {/* Extra Participants Section */}
          <div>
            <Label className="font-bold text-lg">Extra Participants ({extraParticipants.length} / {(event.maxParticipants || 1) - 1})</Label>
            {extraParticipants.map((p, idx) => (
              <div key={idx} className="border rounded-lg p-4 my-3 bg-gray-50 relative">
                <div className='flex justify-end'>
                  <Button type="button" variant="destructive" size="sm" className="" onClick={() => removeExtraParticipant(idx)}>Remove</Button>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="name" className='mb-1'>Name</Label>
                    <Input value={p.name} onChange={e => handleExtraChange(idx, 'name', e.target.value)} required placeholder="Full Name" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="gender" className='mb-1'>Gender</Label>
                    <select className="w-full border rounded px-2 py-2" value={p.gender} onChange={e => handleExtraChange(idx, 'gender', e.target.value)} required>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-2">
                  <div className="flex-1">
                    <Label htmlFor="email" className='mb-1'>Email</Label>
                    <Input value={p.email} onChange={e => handleExtraChange(idx, 'email', e.target.value)} required placeholder="Email" type="email" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="phone" className='mb-1'>Phone</Label>
                    <Input value={p.phone} onChange={e => handleExtraChange(idx, 'phone', e.target.value)} required placeholder="10-digit Phone" type="tel" maxLength={10} />
                  </div>
                </div>
              </div>
            ))}
            {event && 1 + extraParticipants.length < (event.maxParticipants || 1) && (
              <Button type="button" variant="outline" onClick={addExtraParticipant} className="mt-2">Add Extra Participant</Button>
            )}
          </div>
        </form>
        </div>
      </div>
      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-[#B8CFCC] px-5 py-4 border-t flex justify-center lg:mx-[200px]">
        <Button type="submit" form="event-registration-form" disabled={loading || paymentLoading} className="w-full max-w-xs">
          {event.fee > 0 ? (paymentLoading ? 'Processing Payment...' : 'Pay & Register') : (loading ? 'Registering...' : 'Register')}
        </Button>
      </div>
    </div>
  );
}

export default EventRegistrationPage; 