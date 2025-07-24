import React, { useContext, useState, useEffect } from 'react';
import UserContext from '../context/UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function EventRegistration({ eventId, eventName, organizationName, parentOrganization, setHasRegistered, fee = 0, minParticipants = 1, maxParticipants = 1 }) {
  const { user, email, token, role } = useContext(UserContext);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  // Main registrant fields
  const [formData, setFormData] = useState({
    studentName: user || '',
    gender: '',
    studentCollegeName: '',
    branch: '',
    course: '',
    year: '',
    mobno: ''
  });
  // Extra participants (excluding main registrant)
  const [extraParticipants, setExtraParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Store original profile for comparison
  const [originalProfile, setOriginalProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState('fetching'); // 'fetching', 'fetched', 'error'
  const [studentId, setStudentId] = useState(email);
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
          console.log('[DEBUG] studentId from profile:', userData.email || email);
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
    if (1 + extraParticipants.length < maxParticipants) {
      setExtraParticipants(prev => [...prev, { name: '', gender: '', email: '', phone: '' }]);
    }
  };
  const removeExtraParticipant = (idx) => {
    setExtraParticipants(prev => prev.filter((_, i) => i !== idx));
  };

  // Validation
  const validateAll = () => {
    // Main registrant
    const { studentName, gender, studentCollegeName, branch, course, year, mobno } = formData;
    if (!studentName.trim() || !gender || !studentCollegeName.trim() || !branch || !course || !year || !mobno.trim()) {
      toast.error('Please fill all main participant details.');
      return false;
    }
    if (!/^\d{10}$/.test(mobno)) {
      toast.warn('Invalid phone number for main participant.');
      return false;
    }
    // Extra participants
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
      if (!/^\d{10}$/.test(p.phone)) {
        toast.warn(`Invalid phone number for extra participant #${i + 2}.`);
        return false;
      }
    }
    // Total count
    const total = 1 + extraParticipants.length;
    if (total < minParticipants) {
      toast.warn(`Please add at least ${minParticipants} participant${minParticipants > 1 ? 's' : ''}.`);
      return false;
    }
    if (total > maxParticipants) {
      toast.warn(`You can add up to ${maxParticipants} participant${maxParticipants > 1 ? 's' : ''}.`);
      return false;
    }
    return true;
  };

  // Helper to update profile if changed
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
    } catch (err) {
      // Optionally show error
    }
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
      // SweetAlert2 confirmation
      const total = 1 + extraParticipants.length;
      const canAddMore = total < maxParticipants;
      const result = await MySwal.fire({
        title: 'Confirm Registration',
        html: `<div style='text-align:left'>
          <b>Participants filled:</b> ${total} <br/>
          <b>Minimum required:</b> ${minParticipants} <br/>
          <b>Maximum allowed:</b> ${maxParticipants} <br/>
          ${canAddMore ? `<span style='color:#eab308'>You can add up to ${maxParticipants - total} more participant(s).</span>` : `<span style='color:#16a34a'>Maximum participants reached.</span>`}
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
        eventName,
        organizationName,
        parentOrganization,
        studentName: formData.studentName,
        gender: formData.gender,
        email,
        mobno: formData.mobno,
        studentCollegeName: formData.studentCollegeName,
        branch: formData.branch,
        course: formData.course,
        year: formData.year,
        extraParticipants,
        fee: fee,
      };
      console.log('[DEBUG] Registration payload:', registrationPayload);
      const res = await axios.post(`${baseURL}:${port}/eventt/registerevent`, registrationPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[DEBUG] Registration response:', res.data);
      await maybeUpdateProfile();
      await MySwal.fire({
        title: 'Registered!',
        text: 'You have successfully registered for the event.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      // setHasRegistered(true); // Do not close the registration modal
    } catch (err) {
      console.error('[DEBUG] Registration error:', err.response?.data || err);
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
    // SweetAlert2 confirmation before payment
    const total = 1 + extraParticipants.length;
    const canAddMore = total < maxParticipants;
    const result = await MySwal.fire({
      title: 'Confirm Registration',
      html: `<div style='text-align:left'>
        <b>Participants filled:</b> ${total} <br/>
        <b>Minimum required:</b> ${minParticipants} <br/>
        <b>Maximum allowed:</b> ${maxParticipants} <br/>
        ${canAddMore ? `<span style='color:#eab308'>You can add up to ${maxParticipants - total} more participant(s).</span>` : `<span style='color:#16a34a'>Maximum participants reached.</span>`}
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
      const orderPayload = {
        amount: fee,
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
      console.log('[DEBUG] Payment order payload:', orderPayload);
      // 1. Create order on backend
      const { data } = await axios.post(`${baseURL}:${port}/api/payment/create-order`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[DEBUG] Payment order response:', data);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        handler: async function (response) {
          console.log('[DEBUG] studentId before payment verify:', studentId);
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
          console.log('[DEBUG] Payment verify payload:', verifyPayload);
          try {
            const verifyRes = await axios.post(`${baseURL}:${port}/api/payment/verify`, verifyPayload, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[DEBUG] Payment verify response:', verifyRes.data);
            await maybeUpdateProfile();
            await MySwal.fire({
              title: 'Registered!',
              text: 'You have successfully registered for the event.',
              icon: 'success',
              confirmButtonText: 'OK',
            });
            // setHasRegistered(true); // Do not close the registration modal
          } catch (err) {
            console.error('[DEBUG] Payment verify error:', err.response?.data || err);
            toast.error('Payment verification failed.');
          }
        },
        prefill: {},
        theme: { color: "#3399cc" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('[DEBUG] Payment order error:', err.response?.data || err);
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <form onSubmit={fee > 0 ? handleRazorpayPayment : handleSubmit} className="space-y-6">
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
      {/* Payment Info */}
      {fee > 0 && (
        <Card className="mb-4 p-4 bg-yellow-50 border-yellow-300 gap-1">
          <div className="text-lg font-semibold text-yellow-800">Amount to Pay: <span className="font-bold">₹{fee}</span></div>
          <div className="text-sm text-yellow-700 mt-1">You will be redirected to Razorpay for payment.</div>
        </Card>
      )}
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
        <Label className="font-bold text-lg">Extra Participants ({extraParticipants.length} / {maxParticipants - 1})</Label>
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
        {1 + extraParticipants.length < maxParticipants && (
          <Button type="button" variant="outline" onClick={addExtraParticipant} className="mt-2">Add Extra Participant</Button>
        )}
      </div>
      <div className="flex justify-center mt-10">
        <Button type="submit" disabled={loading || paymentLoading} className="w-full max-w-xs">
          {fee > 0 ? (paymentLoading ? 'Processing Payment...' : 'Pay & Register') : (loading ? 'Registering...' : 'Register')}
        </Button>
      </div>
    </form>
  );
}

export default EventRegistration;
