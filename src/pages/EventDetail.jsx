import React, { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios';
import Eventt from '../components/Eventt';
import EventRegistration from '../components/EventRegistration';
import { ToastContainer, toast } from 'react-toastify';
import UserContext from '../context/UserContext'; // add this

function EventDetail() {
  const { eventId } = useParams();
  const { email } = useContext(UserContext); // fetch email from context

  const [event, setEvent] = useState(null);
  const [isShow, setIsShow] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false); // NEW
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
              } text-white py-2 px-5 rounded-md inline-block`}
              to=''
              onClick={!hasRegistered ? handleClick : (e) => e.preventDefault()}
            >
              {hasRegistered ? 'Registered' : isShow ? 'Close' : 'Participate'}
            </Link>
            {!hasRegistered && isShow && (
              <EventRegistration
                eventId={eventId}
                eventName={event.eventName}
                collegeName={event.collegeName}
                setHasRegistered={setHasRegistered}
              />
            )}
          </div>
        </>
      ) : (
        <div className='text-center mt-10 text-gray-500'>Loading event details...</div>
      )}
    </div>
  )
}

export default EventDetail
