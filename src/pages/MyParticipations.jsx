import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import { HashLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function MyParticipations() {
  const { user, email } = useContext(UserContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [textMsg, setTextMsg] = useState("You haven't registered for any events yet.");

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      const StoredToken = localStorage.getItem("token");
      let response;
      console.log("here");

      if (StoredToken) {
        try {
          response = await axios.post(`${baseURL}:${port}/userauth/verifytoken`,
            {},
            {
              headers: {
                Authorization: `Bearer ${StoredToken}`
              }
            })
        }
        catch (e) {
          console.log("Error ", e)
        }
      }

      if (StoredToken && response) {
        try {
          const res = await axios.post(`${baseURL}:${port}/eventt/geteventsfromemail`, { email });
          setRegistrations(res.data);
        } catch (err) {
          console.error('Error fetching user registrations:', err);
        } finally {
          setLoading(false);
        }
      }
      else {
        setTextMsg("Log in to see the participations")
        return false;
      }
    };

    if(email) {
      fetchUserRegistrations();
    }
    setLoading(false);
  }, [email]);

  const handleDelete = async (eventId) => {
    if (confirm("Are u sure, want to cancel registrations ?")) {
      try {
        const res = await axios.post(`${baseURL}:${port}/eventt/deleteRegistration`, {
          eventId,
          email
        });

        if (res)
          toast.success("Registration cancelled successfully")

        // Remove the deleted event from state
        setRegistrations(prev => prev.filter(reg => reg.eventId !== eventId));
      } catch (err) {
        console.error('Error deleting registration:', err);
        alert('Failed to delete registration. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <HashLoader />
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        {textMsg}
      </div>
    );
  }

  return (
    <div>
      <h2 className="lg:text-2xl text-lg font-semibold mb-6">My Registered Events</h2>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm lg:text-base'>
        {registrations.map((reg, index) => (
          <div key={index} className='border p-4 rounded shadow bg-white'>
            <div className='mb-2 font-bold'>
              <p>Event: {reg.eventName}</p>
              <p>Event College: {reg.eventCollegeName}</p>
            </div>
            <p><span className='font-medium'>Your College:</span> {reg.studentCollegeName}</p>
            <p><span className='font-medium'>Your branch:</span> {reg.branch}</p>
            <p><span className='font-medium'>Your course:</span> {reg.course}</p>
            <p><span className='font-medium'>Your year:</span> {reg.year}</p>
            <p><span className='font-medium'>Your mobile:</span> {reg.mobno}</p>

            <div className='flex justify-start gap-3 items-center mt-3'>
              <Link
                className='lg:px-5 px-2 py-1 rounded-md border border-green-500 bg-green-500 text-white hover:bg-green-400'
                to={`/eventdetail/${reg.eventId}`}
              >
                Get Detail
              </Link>
              <button
                onClick={() => handleDelete(reg.eventId)}
                className='lg:px-5 px-2 py-1 rounded-md border border-red-600 text-red-700 hover:bg-red-500 hover:text-white'
              >
                Cancel Registration
              </button>
            </div>

            <p className='text-sm text-gray-500 mt-2'>Registered on: {new Date(reg.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className='h-50'></div>
    </div>
  );
}

export default MyParticipations;
