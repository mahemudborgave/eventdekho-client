import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import collegeLogo from '../assets/images/college-high-school-svgrepo-com.svg';
import UserContext from '../context/UserContext';

function Eventt({ events }) {
  const location = useLocation();
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const { email } = useContext(UserContext)

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (
        !email ||
        location.pathname.startsWith('/eventdetail') ||
        location.pathname.startsWith('/admin/eventdetail')
      )
        return;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}:${import.meta.env.VITE_PORT}/eventt/geteventsfromemail`,
          { email }
        );
        const ids = res.data.map((reg) => reg.eventId);
        setRegisteredEventIds(ids);
      } catch (err) {
        console.error('Error fetching registered events:', err);
      }
    };

    fetchRegisteredEvents();
  }, [email, location.pathname]);

  return (
    <div className="w-auto grid [lg:grid-template-columns:repeat(auto-fit,minmax(700px,1fr))] gap-7">
      {events.map((eventt, idx) => (
        <div
          className="flex flex-col items-start lg:flex-row p-4 lg:p-6 border border-gray-300 hover:outline-2 outline-amber-300 gap-4 rounded-xl text-sm lg:text-base"
          key={idx}
        >
          <div className="hidden lg:block lg:w-20 h-20 rounded-3xl p-2">
            <img
              src={collegeLogo}
              alt="college logo"
              className="h-full w-full overflow-hidden object-contain"
            />
          </div>
          <div className="lg:flex-grow">
            <p className="text-lg lg:text-xl mb-1 lg:mb-0 text-[#0d0c22]">{eventt.eventName}</p>
            <p className="my-2 lg:mb-1 text-gray-500">
              {eventt.collegeCode} - {eventt.collegeName}
            </p>
            <div className="flex flex-col lg:flex-row lg:gap-3 lg:items-center text-gray-500">
              <span><i className="fa-duotone fa-solid fa-calendar-days mr-1.5"></i> {new Date(eventt.eventDate).toLocaleDateString('en-CA')}</span>
              <span><i className="fa-solid fa-location-dot mr-1.5"></i> {eventt.eventLocation}</span>
            </div>
          </div>
          <div className="flex flex-col lg:items-end text-sm">
            {!location.pathname.startsWith('/eventdetail') &&
              !location.pathname.startsWith('/admin/eventdetail') && (
                <div className="flex items-center mb-2">
                  {registeredEventIds.includes(eventt._id) && (
                    <span className="text-green-600 text-sm italic mr-2 lg:mr-0">Registered !</span>
                  )}
                  <Link
                    className="inline-block px-7 py-2 bg-[#0d0c22] rounded-full text-white hover:bg-[#0d0c22d2]"
                    to={`/eventdetail/${eventt._id}`}
                  >
                    Get Detail
                  </Link>
                </div>
              )}
            <p className="italic text-gray-400">
              posted on : {new Date(eventt.postedOn).toLocaleDateString('en-CA')}
            </p>
            <p className="italic text-red-500">
              closing on : {new Date(eventt.closeOn).toLocaleDateString('en-CA')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Eventt;
