import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import { ScaleLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookmarkCheck, ShowerHead } from 'lucide-react';

function MyParticipations() {
  const { user, email } = useContext(UserContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [textMsg, setTextMsg] = useState("You haven't registered for any events yet.");

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      try {
        setLoading(true);  // Start loading before async calls

        const StoredToken = localStorage.getItem("token");
        if (!StoredToken) {
          setTextMsg("Log in to see the participations");
          setRegistrations([]);
          return;
        }

        const verifyResponse = await axios.post(
          `${baseURL}:${port}/userauth/verifytoken`,
          {},
          { headers: { Authorization: `Bearer ${StoredToken}` } }
        );

        if (verifyResponse) {
          const res = await axios.post(`${baseURL}:${port}/eventt/geteventsfromemail`, { email });
          setRegistrations(res.data);
        } else {
          setTextMsg("Invalid token, please login again.");
          setRegistrations([]);
        }
      } catch (err) {
        console.error('Error:', err);
        setTextMsg("Something went wrong. Try again later.");
        setRegistrations([]);
      } finally {
        setLoading(false);  // Always stop loading after all async calls
      }
    };

    if (email) {
      fetchUserRegistrations();
    } else {
      setLoading(false);
    }
  }, [email]);

  const handleDelete = async (eventId) => {
    if (confirm("Are you sure you want to cancel registration?")) {
      try {
        const res = await axios.post(`${baseURL}:${port}/eventt/deleteRegistration`, { eventId, email });
        if (res) {
          toast.success("Registration cancelled successfully");
          setRegistrations(prev => prev.filter(reg => reg.eventId !== eventId));
        }
      } catch (err) {
        console.error('Error deleting registration:', err);
        toast.error('Failed to delete registration. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 mb-100">
        <ScaleLoader />
      </div>
    );
  }

  return (
    <div>
      <h2 className="lg:text-2xl text-lg font-semibold mb-6">My Registered Events</h2>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm lg:text-base'>
        {(registrations.length === 0) ? (
          <div className="text-center text-gray-500 mt-10 mb-120">
            {textMsg}
          </div>
        ) : registrations.map((reg, index) => (
          <div key={index} className='border p-4 rounded bg-white'>
            <div className='mb-2'>
              <p className='flex items-center gap-2 font-medium mb-1'><BookmarkCheck /> {reg.eventName}</p>
              <p>{reg.eventCollegeName}</p>
            </div>
            {/* <p><span className='font-medium'>Your College:</span> {reg.studentCollegeName}</p>
            <p><span className='font-medium'>Your branch:</span> {reg.branch}</p>
            <p><span className='font-medium'>Your course:</span> {reg.course}</p>
            <p><span className='font-medium'>Your year:</span> {reg.year}</p>
            <p><span className='font-medium'>Your mobile:</span> {reg.mobno}</p> */}

            <div className='flex justify-start gap-3 items-center mt-3'>
              <Link className='lg:px-5 px-2 py-1 rounded-md border border-green-500 bg-green-500 text-white hover:bg-green-400'
                to={`/eventdetail/${reg.eventId}`}>
                Get Detail
              </Link>
              <button onClick={() => handleDelete(reg.eventId)}
                className='lg:px-5 px-2 py-1 rounded-md border border-red-600 text-red-700 hover:bg-red-500 hover:text-white'>
                Cancel Registration
              </button>
            </div>

            <p className='text-sm text-gray-500 mt-2'>
              Registered on: {new Date(reg.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className='h-100'></div>
    </div>
  );
}

export default MyParticipations;
