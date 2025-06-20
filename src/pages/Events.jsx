import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dotenv from "dotenv";
import { ScaleLoader } from 'react-spinners';
import Eventt from '../components/Eventt';
import Search from '../components/Search';
import UserContext from '../context/UserContext';
import SearchContext from '../context/SearchContext';


function Events() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [originalEvents, setOriginalEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents`)
        setEvents(res.data);
        setOriginalEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [])

  const handleChange = (e) => {
    const value = e.target.value;
    // console.log(value);
    setSearchValue(value);

    if (value.trim() === '') {
      setEvents(originalEvents);
      return;
    }

    const result = originalEvents.filter(event =>
      event.eventName.toLowerCase().includes(value.toLowerCase()) ||
      event.collegeName.toLowerCase().includes(value.toLowerCase()) ||
      event.collegeCode.toLowerCase().includes(value.toLowerCase())
    )
    setEvents(result);
  }

  const handleClick = () => {
    setSearchValue('')
    setEvents(originalEvents);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 mb-100">
        <ScaleLoader />
      </div>
    )
  }

  // Add 'Recently Added' events (last 7 days)
  const now = new Date();
  const recently = events.filter(e => {
    const created = new Date(e.createdAt || e.date);
    return !isNaN(created) && (now - created) / (1000 * 60 * 60 * 24) <= 7;
  });
  // Add 'Hot Right Now' events (top 8 by participations)
  const hot = [...events]
    .filter(e => typeof e.participations === 'number' && e.participations > 0)
    .sort((a, b) => b.participations - a.participations)
    .slice(0, 8);
  // Exclude events already shown in hot or recently
  const shownIds = new Set([...hot, ...recently].map(e => e._id || e.id));
  const rest = events.filter(e => !shownIds.has(e._id || e.id));

  return (
    <>
      <div className='lg:px-30'>
        <div className='lg:w-1/2 mb-10'>
          <Search handleChange={handleChange} handleClick={handleClick} page="event"/>
        </div>

        {hot.length > 0 && (
          <div className="mb-10 border-2 border-amber-300 bg-amber-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Hot Right Now</h2>
            <Eventt events={hot} />
          </div>
        )}

        {recently.length > 0 && (
          <div className="mb-10 border-2 border-blue-300 bg-blue-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Recently Added</h2>
            <Eventt events={recently} />
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center mt-20 text-gray-500 text-lg mb-100">
            No matching events found.
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#1a093f] mb-4">All Events</h2>
            <Eventt events={events} />
          </>
        )}
      </div>
    </>
  )
}

export default Events