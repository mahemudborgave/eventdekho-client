import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import collegeLogo from '../assets/images/college-high-school-svgrepo-com.svg';
import UserContext from '../context/UserContext';
import { Users } from 'lucide-react';

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
    // <div className="w-auto grid [lg:grid-template-columns:repeat(auto-fit,minmax(700px,1fr))] gap-7">
    <div className="w-auto grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-7">
      {events.map((eventt, idx) => (
        <div
          className="flex flex-col items-start p-4 bg-gradient-to-r from-white to-white-200 border border-gray-300 hover:outline outline-amber-300 gap-4 rounded-xl text-sm lg:text-base relative"
          key={idx}
        >
          {/* Club Badge */}
          {eventt.clubName && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
              <Users size={12} />
              {eventt.clubName}
            </div>
          )}
          
          {/* <div className="hidden lg:block lg:w-20 h-20 rounded-3xl p-2">
            <img
              src={collegeLogo}
              alt="college logo"
              className="h-full w-full overflow-hidden object-contain"
            />
          </div> */}
          <div className="lg:flex-grow">
            <p className="text-lg lg:text-xl mb-1 text-[#0d0c22] font-medium">{eventt.eventName}</p>
            <p className="my-2 lg:mb-1 text-gray-500">
              {eventt.collegeCode} - {eventt.collegeName}
            </p>
            <div className="flex flex-col text-gray-500">
              <span className="text-yellow-500"><i className="fa-solid fa-clock mr-1.5"></i> {eventt.eventMode}</span>
              <span className="text-blue-500"><i className="fa-duotone fa-solid fa-calendar-days mr-1.5"></i> {new Date(eventt.eventDate).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
              <span className="text-red-500"><i className="fa-solid fa-location-dot mr-1.5"></i> {eventt.eventLocation}</span>
            </div>
          </div>
          <div className="flex flex-col text-sm">
            {!location.pathname.startsWith('/eventdetail') &&
              !location.pathname.startsWith('/admin/eventdetail') && (
                <div className="flex items-center mb-2">
                  {registeredEventIds.includes(eventt._id) && (
                    <span className="hidden text-green-600 text-sm italic mr-2">Registered !</span>
                  )}
                  <Link
                    className="inline-block px-7 py-2 bg-[#0d0c22] rounded-full text-white hover:bg-[#0d0c22d2]"
                    to={`/eventdetail/${eventt._id}`}
                  >
                    Get Detail
                  </Link>
                  {registeredEventIds.includes(eventt._id) && (
                    <span className="inline-block lg:hidden text-green-600 text-sm italic ml-2">Registered !</span>
                  )}
                </div>
              )}
            <p className="italic text-gray-400">
              posted on : {new Date(eventt.postedOn).toLocaleDateString('en-GB').replace(/\//g, '-')}
            </p>
            <p className="italic text-red-500">
              closing on : {new Date(eventt.closeOn).toLocaleDateString('en-GB').replace(/\//g, '-')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Eventt;
