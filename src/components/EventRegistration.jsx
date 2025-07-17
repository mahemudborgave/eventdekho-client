import React, { useContext, useState, useEffect } from 'react'
import UserContext from '../context/UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function EventRegistration({ eventId, eventName, organizationName, parentOrganization, setHasRegistered, eventFee = 0 }) {
  const { user, email, token, role } = useContext(UserContext);

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  const [formData, setFormData] = useState({
    eventId,
    eventName,
    organizationName: organizationName,
    parentOrganization: parentOrganization,
    email,
    studentName: user || '',
    gender: '',
    studentCollegeName: '',
    branch: '',
    course: '',
    year: '',
    mobno: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch user profile details on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token || !email) return;
      setLoading(true);
      setError('');
      try {
        // Use the new auth profile endpoint
        const res = await axios.get(`${baseURL}:${port}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.user) {
          const userData = res.data.user;
          setFormData(prev => ({
            ...prev,
            studentName: userData.name || '',
            gender: userData.gender || '',
            studentCollegeName: userData.collegeName || '',
            branch: userData.branch || '',
            course: userData.course || '',
            year: userData.year || '',
            mobno: userData.mobileNumber || '',
          }));
        }
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setError('Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
    // eslint-disable-next-line
  }, [token, email]);

  const handleChange = e => {
    const { id, name, value, type } = e.target;
    // For radio buttons, use the name attribute
    const fieldName = type === 'radio' ? name : (id || name);
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!token) {
      toast.error('Please log in to register for events.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}:${port}/eventt/registerevent`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Registration successful!');
      console.log('Response:', res.data);
      setHasRegistered(true);

      // After registration, update user profile if any field is new or changed
      if (token && email && role === 'student') {
        try {
          // Get current profile
          const profileRes = await axios.get(`${baseURL}:${port}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (profileRes.data && profileRes.data.user) {
            const currentProfile = profileRes.data.user;
            
            // Prepare fields to update
            const profileFields = [
              { formField: 'studentName', profileField: 'name' },
              { formField: 'gender', profileField: 'gender' },
              { formField: 'studentCollegeName', profileField: 'collegeName' },
              { formField: 'branch', profileField: 'branch' },
              { formField: 'course', profileField: 'course' },
              { formField: 'year', profileField: 'year' },
              { formField: 'mobno', profileField: 'mobileNumber' }
            ];
            
            let shouldUpdate = false;
            const updateData = {};
            
            profileFields.forEach(({ formField, profileField }) => {
              const formVal = formData[formField] || '';
              const profileVal = currentProfile[profileField] || '';
              if (formVal && formVal !== profileVal) {
                updateData[profileField] = formVal;
                shouldUpdate = true;
              }
            });
            
            if (shouldUpdate) {
              await axios.put(`${baseURL}:${port}/auth/profile`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
              });
              toast.info('Profile updated with new details.');
            }
          }
        } catch (err) {
          console.warn('Could not update profile with new details:', err);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Razorpay handler
  const handleRazorpayPayment = async () => {
    setPaymentLoading(true);
    try {
      // 1. Create order on backend
      const { data } = await axios.post(`${baseURL}:${port}/api/payment/create-order`, {
        amount: eventFee,
        eventId,
        studentId: email,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        handler: async function (response) {
          // 2. Verify payment on backend
          await axios.post(`${baseURL}:${port}/api/payment/verify`, {
            ...response,
            eventId,
            studentId: email,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPaymentSuccess(true);
          toast.success('Payment successful! Completing registration...');
          // 3. Complete registration
          await handleSubmit();
        },
        prefill: {
          name: user,
          email: email,
        },
        theme: { color: "#3399cc" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Helper to check if all profile fields are filled
  const allProfileFieldsFilled = [
    formData.studentName,
    formData.gender,
    formData.studentCollegeName,
    formData.branch,
    formData.course,
    formData.year,
    formData.mobno
  ].every(val => val && val.trim() !== '');

  return (
    <div className='my-10 bg-white lg:p-10 p-4 border-1 border-gray-400 text-gray-700'>
      {loading && <div className="mb-4 text-blue-600">Loading user details...</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {allProfileFieldsFilled ? (
        <div className="mb-4 text-green-700 bg-green-100 rounded px-3 py-2 text-sm">Details are taken from your profile. You can edit if needed.</div>
      ) : (
        <div className="mb-4 text-yellow-800 bg-yellow-100 rounded px-3 py-2 text-sm">Some details are missing. Please <a href={role === "organizer" ? "/adminprofile" : "/studentprofile"} className="underline text-yellow-900">update your profile</a> for autofill next time.</div>
      )}
      {/* Show payment method if event has a fee */}
      {eventFee > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
          <div className="font-semibold text-yellow-800">Event Fee: ₹{eventFee}</div>
          <div className="text-yellow-700 text-sm">Pay securely with UPI, Netbanking, or Card via Razorpay</div>
        </div>
      )}
      <form onSubmit={eventFee > 0 ? (e) => { e.preventDefault(); handleRazorpayPayment(); } : handleSubmit}>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm lg:text-base'>
          <p className='lg:text-2xl text-lg text-center mb-5 lg:[grid-column:span_2]'>Registration Form</p>
          <div>
            <label htmlFor="studentName" className='block mb-1'>Student Full Name</label>
            <input
              type="text"
              id="studentName"
              className='text-gray-500 block outline-none border border-gray-300 rounded w-full px-2 py-1'
              value={formData.studentName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className='block mb-1'>Select Gender</label>
            <div className="flex items-center gap-6 mt-1">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  id="gender-male"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="gender-male" className="cursor-pointer">
                  Male
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  id="gender-female"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleChange}
                />
                <label htmlFor="gender-female" className="cursor-pointer">
                  Female
                </label>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="studentCollegeName" className='block mb-1'>College/University Name</label>
            <input
              type="text"
              id="studentCollegeName"
              className='text-gray-500 block outline-none border border-gray-300 rounded w-full px-2 py-1'
              value={formData.studentCollegeName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="course" className='block mb-1'>Your Course</label>
            <select
              id="course"
              className='text-gray-500 block w-full border border-gray-300 rounded px-2 py-1 outline-none'
              value={formData.course}
              onChange={handleChange}
              required
            >
              <option value="">-- Select --</option>
              <option value="B.Tech">B.Tech</option>
              <option value="B.E">B.E</option>
              <option value="M.E">M.E</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>

          <div>
            <label htmlFor="branch" className='block mb-1'>Your branch</label>
            <select
              id="branch"
              className='text-gray-500 block w-full border border-gray-300 rounded px-2 py-1 outline-none'
              value={formData.branch}
              onChange={handleChange}
              required
            >
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
            <label htmlFor="year" className='block mb-1'>Course Current Year</label>
            <select
              id="year"
              className='text-gray-500 block w-full border border-gray-300 rounded px-2 py-1 outline-none'
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">-- Select --</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
            </select>
          </div>

          <div>
            <label htmlFor="mobno" className='block mb-1'>Mobile Number</label>
            <input
              className='text-gray-500 block outline-none border border-gray-300 rounded w-full px-2 py-1'
              required
              type="tel"
              id="mobno"
              pattern="[6-9]{1}[0-9]{9}"
              maxLength={10}
              value={formData.mobno}
              onChange={handleChange}
            />
          </div>

          <div className='lg:[grid-column:span_2] flex justify-center'>
            <button
              type='submit'
              disabled={loading || paymentLoading}
              className='cursor-pointer bg-amber-300 py-2 px-4 rounded-md hover:outline-5 hover:outline-amber-100 hover:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {eventFee > 0 ? (paymentLoading ? 'Processing Payment...' : 'Pay & Register') : (loading ? 'Registering...' : 'Register')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EventRegistration;
