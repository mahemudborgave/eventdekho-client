import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dotenv from "dotenv";
import { ScaleLoader } from 'react-spinners';
import Eventt from '../components/Eventt';
import Search from '../components/Search';
import UserContext from '../context/UserContext';
import SearchContext from '../context/SearchContext';
import Marquee from 'react-fast-marquee';
import { TrendingUp, ArrowRight, Calendar } from 'lucide-react';


function formatEventDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Events() {
  // Always call the hook at the top
  // Simple auto-slide effect
  // useEffect(() => {
  //   if (!slider) return;
  //   const interval = setInterval(() => {
  //     slider.next();
  //   }, 2500);
  //   return () => clearInterval(interval);
  // }, [slider]);

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [originalEvents, setOriginalEvents] = useState([]);
  const [isRecentlyCollapsed, setIsRecentlyCollapsed] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalOrganizations: 0,
    totalParticipations: 0
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents`)
        // Sort by postedOn or createdAt descending (newest first)
        const sorted = [...res.data].sort((a, b) => new Date(b.postedOn || b.createdAt) - new Date(a.postedOn || a.createdAt));
        setEvents(sorted);
        setOriginalEvents(sorted);
        
        // Calculate statistics
        const totalEvents = sorted.length;
        const totalParticipations = sorted.reduce((sum, event) => sum + (event.participations || 0), 0);
        
        // Fetch organizations count
        try {
          const orgsRes = await axios.get(`${baseURL}:${port}/auth/organizations-with-events`);
          const totalOrganizations = orgsRes.data.length;
          
          setStats({
            totalEvents,
            totalOrganizations,
            totalParticipations
          });
        } catch (err) {
          console.error('Error fetching organizations:', err);
          setStats({
            totalEvents,
            totalOrganizations: 0,
            totalParticipations
          });
        }
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
      event.organizationName.toLowerCase().includes(value.toLowerCase()) ||
      event.organizationCode.toLowerCase().includes(value.toLowerCase())
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

  // Add 'Recently Added' events (last 5 days, newest first)
  const now = new Date();
  const recently = [...events]
    .filter(e => {
      const created = new Date(e.createdAt || e.postedOn || e.date);
      return !isNaN(created) && (now - created) / (1000 * 60 * 60 * 24) <= 5;
    })
    .sort((a, b) => new Date(b.postedOn || b.createdAt) - new Date(a.postedOn || a.createdAt));
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
      {/* Page Header */}
      <div className="mb-4 hidden sm:mb-8">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl p-3 sm:p-6 lg:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-3 sm:mb-6 lg:mb-0">
              <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold mb-1 sm:mb-3 flex items-center gap-2 sm:gap-3">
                {/* <Sparkles size={22} className="text-yellow-300 sm:size-10" /> */}
                Events
              </h1>   
              <p className="text-orange-100 text-xs sm:text-base lg:text-lg">Discover exciting events happening around</p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-orange-100 font-medium text-xs sm:text-base">Live Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* state card */}
      <div className="grid hidden grid-cols-3 md:grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-2 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm sm:text-sm font-medium">Events</p>
              <p className="text-lg sm:text-3xl font-bold">{stats.totalEvents.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-400/30 p-2 sm:p-3 rounded-full">
              {/* <Building2 size={13} className="text-white size-4 sm:size-8" /> */}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm sm:text-sm font-medium">Org's</p>
              <p className="text-lg sm:text-3xl font-bold">{stats.totalOrganizations.toLocaleString()}</p>
            </div>
            <div className="bg-blue-400/30 p-2 sm:p-3 rounded-full">
              {/* <Building2 size={13} className="text-white size-4 sm:size-8" /> */}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm sm:text-sm font-medium">Registers</p>
              <p className="text-lg sm:text-3xl font-bold">{stats.totalParticipations.toLocaleString()}</p>
            </div>
            <div className="bg-purple-400/30 p-2 sm:p-3 rounded-full">
              {/* <Users size={13} className="text-white sm:size-8 size-4" /> */}
            </div>
          </div>
        </div>
      </div>

      <div className='lg:px-30'>
        <div className='lg:w-1/2 mb-10'>
          <Search handleChange={handleChange} handleClick={handleClick} page="event" />
        </div>

        {hot.length > 0 && (
          <div className="mb-10 border-2 border-amber-300 bg-amber-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Hot Right Now</h2>
            <Eventt events={hot} />
          </div>
        )}

        {recently.length > 0 && (
          <div className="mb-10 border-0 rounded-2xl overflow-hidden bg-transparent">
            <div className="p-4 lg:p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1C64F2]">Recently Added</h2>
            </div>
            <Marquee pauseOnHover={true} speed={40} gradient={false} className="py-4 bg-transparent">
              {recently.map(event => (
                <div
                  key={event._id}
                  className="flex items-center gap-4 bg-white rounded-xl shadow-md border-l-4 border-[#1C64F2] px-6 py-5 mx-2 min-w-[240px] cursor-pointer hover:shadow-lg transition-all duration-200 group"
                  style={{ width: 280 }}
                  onClick={() => window.location.href = `/eventdetail/${event._id}`}
                >
                  <div className="flex items-center justify-center rounded-full p-2 bg-gradient-to-br from-[#1C64F2] to-blue-400">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-gray-900 text-base truncate">{event.eventName}</span>
                    <span className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar size={14} className="mr-1" />
                      {formatEventDate(event.date || event.createdAt || event.postedOn)}
                    </span>
                  </div>
                  <span className="ml-2 transition-transform flex items-center justify-center group-hover:scale-110 text-[#1C64F2]">
                    <ArrowRight size={28} />
                  </span>
                </div>
              ))}
            </Marquee>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center mt-20 text-gray-500 text-lg mb-100">
            No matching events found.
          </div>
        ) : (
          <div className='p-4 lg:p-6'>
            <h2 className="text-xl font-bold text-[#1a093f] mb-4">All Events</h2>
            <Eventt events={events} />
          </div>
        )}
      </div>
    </>
  )
}

export default Events