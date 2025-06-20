import React, { useContext, useState, useEffect } from 'react'
import UserContext from '../context/UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function EventRegistration({ eventId, eventName, collegeName, setHasRegistered }) { //here the collegeName is of event
  const { user, email } = useContext(UserContext);

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  const [formData, setFormData] = useState({
    eventId,
    eventName,
    eventCollegeName: collegeName,
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

  // Fetch user profile details on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!email) return;
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${baseURL}:${port}/login/user/${email}`);
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            studentName: res.data.studentName || res.data.name || '',
            gender: res.data.gender || '',
            studentCollegeName: res.data.studentCollegeName || '',
            branch: res.data.branch || '',
            course: res.data.course || '',
            year: res.data.year || '',
            mobno: res.data.mobno || '',
          }));
        }
      } catch (err) {
        setError('Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
    // eslint-disable-next-line
  }, [email]);

  const handleChange = e => {
    const { id, name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id || name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post(`${baseURL}:${port}/eventt/registerevent`, formData);
      toast.success('Registration successful!');
      console.log('Response:', res.data);
      setHasRegistered(true);

      // After registration, update user profile if any field is new or changed
      if (email) {
        // Fetch current user profile
        let currentProfile = {};
        try {
          const userRes = await axios.get(`${baseURL}:${port}/login/user/${email}`);
          currentProfile = userRes.data || {};
        } catch (err) {
          // If can't fetch, just proceed to update
        }
        // Prepare fields to update
        const profileFields = [
          'studentName', 'gender', 'studentCollegeName', 'branch', 'course', 'year', 'mobno'
        ];
        let shouldUpdate = false;
        const updateData = {};
        profileFields.forEach(field => {
          const formVal = formData[field] || '';
          const profileVal = currentProfile[field] || '';
          if (formVal && formVal !== profileVal) {
            updateData[field] = formVal;
            shouldUpdate = true;
          }
        });
        if (shouldUpdate) {
          try {
            await axios.put(`${baseURL}:${port}/login/user/${email}`, updateData);
            toast.info('Profile updated with new details.');
          } catch (err) {
            console.warn('Could not update profile with new details.');
          }
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Something went wrong.');
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
        <div className="mb-4 text-yellow-800 bg-yellow-100 rounded px-3 py-2 text-sm">Some details are missing. Please <a href="/studentprofile" className="underline text-yellow-900">update your profile</a> for autofill next time.</div>
      )}
      <form onSubmit={handleSubmit}>
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
                  id="gender"
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
                  id="gender"
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
              className='cursor-pointer bg-amber-300 py-2 px-4 rounded-md hover:outline-5 hover:outline-amber-100 hover:outline-offset-2'
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EventRegistration;
