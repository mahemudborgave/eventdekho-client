import React, { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios';
import Eventt from '../components/Eventt';
import EventRegistration from '../components/EventRegistration';
import { ToastContainer, toast } from 'react-toastify';
import UserContext from '../context/UserContext'; // add this
import QueryComp from '../components/QueryComp';
import { Loader2 } from 'lucide-react';

// Simple Modal component
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

function EventDetail() {
  const { eventId } = useParams();
  const { email, user } = useContext(UserContext); // fetch email and user from context

  const [event, setEvent] = useState(null);
  const [isShow, setIsShow] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false); // NEW
  const [showQuery, setShowQuery] = useState(false);
  const [userQueries, setUserQueries] = useState([]);
  const [showUserQueries, setShowUserQueries] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  const handleClick = async () => {
    const StoredToken = localStorage.getItem("token");
    let response;

    if (StoredToken) {
      try {
        response = await axios.post(`${baseURL}:${port}/userauth/verifytoken`,
          {},
          {
            headers: {
              Authorization: `Bearer ${StoredToken}`
            }
          });
      } catch (e) {
        console.log("Error ", e);
      }
    }

    if (StoredToken && response) {
      setIsShow((prev) => !prev);
    } else {
      toast.warn("Please Log in to continue");
    }
  }

  const fetchUserQueries = async () => {
    setLoadingQueries(true);
    try {
      const res = await axios.get(`${baseURL}:${port}/query/event/${eventId}`);
      // Filter queries for this user
      const filtered = res.data.filter(q => q.userEmail === email);
      setUserQueries(filtered);
    } catch (err) {
      setUserQueries([]);
    } finally {
      setLoadingQueries(false);
    }
  };

  const handleQueryClick = () => {
    if (!email) {
      toast.warn('Please Log in to continue');
      return;
    }
    setShowQuery((prev) => !prev);
  };

  const handleShowUserQueries = () => {
    if (!email) {
      toast.warn('Please Log in to continue');
      return;
    }
    setShowUserQueries((prev) => !prev);
    if (!showUserQueries) fetchUserQueries();
  };

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevent/${eventId}`);
        setEvent(res.data);
      } catch (err) {
        console.error('Error fetching event:', err);
      }
    };

    const checkRegistration = async () => {
      if (!email) return;
      try {
        const res = await axios.post(`${baseURL}:${port}/eventt/checkregistered`, {
          eventId,
          email
        });
        if (res.data?.registered) {
          setHasRegistered(true);
        }
      } catch (err) {
        console.error('Error checking registration:', err);
      }
    };

    getEventDetails();
    checkRegistration();
  }, [email, eventId]);

  return (
    <div>
      {event ? (
        <>
          <Eventt events={[event]} />
          <div className='p-5 lg:p-10 pb-20 bg-green-200 my-8 rounded-xl'>
            <p className='text-xl text-green-700 mb-5'>Details -</p>
            <p className='text-sm lg:text-base mb-10 whitespace-pre-line'>{event.eventDescription}</p>
            <Link
              className={`${
                hasRegistered ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-700 hover:outline-5 hover:outline-green-300 hover:outline-offset-0'
              } text-white lg:py-2 text-sm lg:text-base lg:px-5 px-3 py-2 rounded-md inline-block`}
              to=''
              onClick={!hasRegistered ? handleClick : (e) => e.preventDefault()}
            > 
              {hasRegistered ? 'Registered' : isShow ? 'Close' : 'Participate'}
            </Link>
            {/* Query Button */}
            <button
              className="bg-red-600 text-white text-sm lg:text-base lg:py-2 lg:px-5 px-3 py-2 rounded-md inline-block ml-2 lg:ml-4 mt-4 lg:mt-0"
              onClick={handleQueryClick}
              type="button"
            >
              {showQuery ? 'Close Query Box' : 'Raise a Query'}
            </button>
            <button
              className="bg-blue-600 text-white text-sm lg:text-base lg:py-2 lg:px-5 px-3 py-2 rounded-md inline-block ml-0 lg:ml-4 mt-4 lg:mt-0"
              onClick={handleShowUserQueries}
              type="button"
            >
              {showUserQueries ? 'Hide Queries' : 'Show Queries'}
            </button>
            {!hasRegistered && isShow && (
              <EventRegistration
                eventId={eventId}
                eventName={event.eventName}
                collegeName={event.collegeName}
                setHasRegistered={setHasRegistered}
              />
            )}
            {/* Query Section */}
            {showQuery && (
              <div className='my-10'>
                <QueryComp
                  eventId={event?._id || eventId}
                  eventName={event?.eventName || ''}
                  userEmail={email || ''}
                  userName={user || ''}
                  onSuccess={() => setShowQuery(false)}
                />
              </div>
            )}
            {/* User Queries Modal */}
            <Modal open={showUserQueries} onClose={() => setShowUserQueries(false)}>
              <h3 className='text-lg font-bold mb-4 text-blue-800'>Your Queries for this Event</h3>
              {loadingQueries ? (
                <div className='flex items-center gap-2 text-blue-600'><Loader2 className='animate-spin' /> Loading...</div>
              ) : userQueries.length === 0 ? (
                <div className='text-gray-600'>You have not raised any queries for this event.</div>
              ) : (
                <div className='space-y-4 max-h-[60vh] overflow-y-auto'>
                  {userQueries.map((q) => (
                    <div key={q._id} className='bg-blue-50 border border-blue-200 rounded p-4'>
                      <div className='font-semibold text-gray-800 mb-1'>Query:</div>
                      <div className='mb-2 text-gray-700'>{q.message}</div>
                      {q.resolution ? (
                        <div className='bg-green-100 border border-green-300 rounded p-2 mt-2'>
                          <div className='font-semibold text-green-800 mb-1'>Admin Response:</div>
                          <div className='text-green-900'>{q.resolution}</div>
                        </div>
                      ) : (
                        <div className='text-yellow-700 italic'>No response yet.</div>
                      )}
                      <div className='text-xs text-gray-400 mt-2'>Asked on: {new Date(q.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </Modal>
          </div>
          <div className='h-20'></div>
        </>
      ) : (
        <div className='text-center mt-10 text-gray-500 mb-100'>Loading event details...</div>
      )}
    </div>
  )
}

export default EventDetail
