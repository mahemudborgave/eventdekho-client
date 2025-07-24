import axios from 'axios';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import dotenv from "dotenv";
import { ScaleLoader } from 'react-spinners';
import Eventt from '../components/Eventt';
import Search from '../components/Search';
import UserContext from '../context/UserContext';
import SearchContext from '../context/SearchContext';
import Marquee from 'react-fast-marquee';
import { TrendingUp, ArrowRight, Calendar, ChevronDown } from 'lucide-react';
import FeaturedImagesCarousel from '../components/FeaturedImagesCarousel';


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
  const { email } = useContext(UserContext);
  const [originalEvents, setOriginalEvents] = useState([]);
  const [isRecentlyCollapsed, setIsRecentlyCollapsed] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalOrganizations: 0,
    totalParticipations: 0
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [searchDropdown, setSearchDropdown] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingRegistered, setLoadingRegistered] = useState(true);

  // Filter state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFee, setFilterFee] = useState('all');

  // Hide dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Hide dropdown on route change
  useEffect(() => {
    setDropdownVisible(false);
    // Optionally: setSearchValue('');
  }, [location.pathname]);
  // Hide dropdown on refresh
  useEffect(() => {
    const clearDropdown = () => setSearchDropdown([]);
    window.addEventListener('beforeunload', clearDropdown);
    return () => window.removeEventListener('beforeunload', clearDropdown);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents`)
        // Sort by eventDate + eventTime (if available), then postedOn or createdAt descending (newest first)
        const sorted = [...res.data].sort((a, b) => {
          // Prefer eventDate + eventTime if available
          const getDateTime = (event) => {
            let dateStr = event.eventDate || event.date || event.createdAt;
            let timeStr = event.eventTime || '23:59'; // Use end of day for missing time to push undated events lower
            if (dateStr) {
              if (dateStr instanceof Date) dateStr = dateStr.toISOString().slice(0, 10);
              return new Date(`${dateStr}T${timeStr}`);
            }
            return new Date(0); // fallback to epoch
          };
          const dateA = getDateTime(a);
          const dateB = getDateTime(b);
          // Descending order (latest first)
          if (dateB > dateA) return 1;
          if (dateB < dateA) return -1;
          // Fallback to createdAt only
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setEvents(sorted);
        setOriginalEvents(sorted);
        // Debug: Log all events after fetch and sort
        // console.log('Fetched and sorted events:', sorted);

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

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!email) {
        setRegisteredEvents([]);
        setLoadingRegistered(false);
        return;
      }
      setLoadingRegistered(true);
      try {
        const res = await axios.post(`${baseURL}:${port}/eventt/geteventsfromemail`, { email });
        setRegisteredEvents(res.data || []);
      } catch (err) {
        setRegisteredEvents([]);
      } finally {
        setLoadingRegistered(false);
      }
    };
    fetchRegisteredEvents();
  }, [email]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.trim() === '') {
      setSearchDropdown([]);
      setDropdownVisible(false);
      return;
    }
    const result = originalEvents.filter(event => {
      const v = value.toLowerCase();
      return (
        (event.eventName && event.eventName.toLowerCase().includes(v)) ||
        (event.organizationName && event.organizationName.toLowerCase().includes(v)) ||
        (event.parentOrganization && event.parentOrganization.toLowerCase().includes(v)) ||
        (event.organizationCode && event.organizationCode.toLowerCase().includes(v)) ||
        (event.clubShortName && event.clubShortName.toLowerCase().includes(v)) ||
        (event.clubName && event.clubName.toLowerCase().includes(v))
      );
    });
    setSearchDropdown(result);
    setDropdownVisible(true);
  }

  const handleClick = () => {
    setSearchValue('')
    setSearchDropdown([]);
    setDropdownVisible(false);
  }
  // Show dropdown on input focus or keystroke if searchValue is not empty
  const handleInputFocus = () => {
    if (searchValue && searchValue.trim() !== '') {
      setDropdownVisible(true);
    }
  };
  // Show dropdown on search icon click if searchValue is not empty
  const handleSearchIconClick = () => {
    if (searchValue && searchValue.trim() !== '') {
      setDropdownVisible(true);
    }
  };

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

  // Compute a set of registered event IDs for sorting
  const registeredEventIdsSet = new Set(registeredEvents.map(e => e.eventId || e._id));
  // Sort all events: unregistered first, then registered
  const sortedAllEvents = [...originalEvents].sort((a, b) => {
    const aRegistered = registeredEventIdsSet.has(a._id);
    const bRegistered = registeredEventIdsSet.has(b._id);
    if (aRegistered === bRegistered) return 0;
    return aRegistered ? 1 : -1;
  });

  // Filtering logic (must be after sortedAllEvents is defined)
  const filteredEvents = sortedAllEvents.filter(event => {
    // Mode
    if (filterMode !== 'all' && event.eventMode !== filterMode) return false;
    // Status
    const now = new Date();
    const regStart = event.registrationStartOn ? new Date(event.registrationStartOn) : null;
    const regClose = event.closeOn ? new Date(event.closeOn) : null;
    let status = 'upcoming';
    if (regStart && now < regStart) status = 'upcoming';
    else if (regStart && regClose && now >= regStart && now <= regClose) status = 'live';
    else if (regClose && now > regClose) status = 'closed';
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    // Fee
    if (filterFee === 'free' && Number(event.fee) > 0) return false;
    if (filterFee === 'paid' && Number(event.fee) === 0) return false;
    return true;
  });

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
          <div className="relative" ref={dropdownRef}>
            <div className='px-2 py-1 lg:px-4 lg:py-2 bg-gray-200 m-auto rounded-full flex items-center text-sm'>
              <input
                type="text"
                placeholder={`Search for event`}
                className='focus:outline-none outline-0 flex-grow ml-2 text-sm lg:text-base'
                onChange={e => { handleChange(e); if (e.target.value.trim() !== '') setDropdownVisible(true); }}
                value={searchValue}
                onFocus={handleInputFocus}
              />
              <i
                className="fa-solid fa-magnifying-glass p-3 lg:p-4 bg-amber-300 rounded-full cursor-pointer"
                onClick={handleSearchIconClick}
              ></i>
              <span
                className="material-symbols-outlined lg:ml-2 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
                onClick={handleClick}
              >
                close
              </span>
            </div>
            {dropdownVisible && searchValue && searchDropdown.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-72 overflow-y-auto">
                {searchDropdown.map(event => (
                  <div
                    key={event._id}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex flex-col border-b last:border-b-0"
                    onClick={() => { setDropdownVisible(false); navigate(`/eventdetail/${event._id}`); }}
                  >
                    <span className="font-medium text-gray-900 truncate">{event.eventName}</span>
                    <span className="text-xs text-gray-500">{event.clubName} -  <span className="text-xs text-gray-500">{event.parentOrganization}</span></span>
                   
                  </div>
                ))}
              </div>
            )}
            {dropdownVisible && searchValue && searchValue.trim() !== '' && searchDropdown.length === 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-4 text-gray-400 text-center">
                No matching events found.
              </div>
            )}
          </div>
        </div>

        <div className='mb-15'>
          <FeaturedImagesCarousel />
        </div>

        {/* {hot.length > 0 && (
          <div className="mb-10 border-2 border-amber-300 bg-amber-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Hot Right Now</h2>
            <Eventt events={hot} />
          </div>
        )} */}

        {/* {recently.length > 0 && (
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
        )} */}

        <div>
          <div className='flex justify-between mb-6 items-center gap-4'>
            <h2 className="text-xl lg:text-2xl font-bold text-left border-b border-amber-600"><span className='text-amber-600'>All </span>Events</h2>
            <div className="relative">
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50"
                onClick={() => setFilterDropdownOpen(v => !v)}
                type="button"
              >
                <span>Filter</span>
                <ChevronDown size={16} />
              </button>
              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-4 flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Event Mode</label>
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={filterMode}
                      onChange={e => setFilterMode(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Registration Status</label>
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="live">Live</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Fee</label>
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={filterFee}
                      onChange={e => setFilterFee(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <button
                    className="mt-2 w-full bg-amber-500 text-white rounded py-1.5 font-semibold text-sm hover:bg-amber-600"
                    onClick={() => setFilterDropdownOpen(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className='px-2'>
          <Eventt events={filteredEvents} />
          </div>
        </div>
        {/* Registered Events List at Bottom */}
        {/* <div className="mt-16">
          <h2 className="text-xl font-bold mb-4 text-green-700">Your Registered Events</h2>
          {loadingRegistered ? (
            <div className="flex justify-center items-center p-6"><ScaleLoader /></div>
          ) : registeredEvents.length === 0 ? (
            <div className="text-gray-400 italic">You have not registered for any events yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map(event => (
                <div key={event.eventId || event._id} className="bg-white border border-green-200 rounded-xl shadow p-4 flex flex-col gap-2">
                  <div className="font-semibold text-lg text-green-900">{event.eventName}</div>
                  <div className="text-gray-500 text-sm">{event.organizationName}</div>
                  <div className="text-gray-400 text-xs">{event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-GB') : ''}</div>
                  <Link to={`/eventdetail/${event.eventId || event._id}`} className="text-green-700 underline text-sm mt-2">View Details</Link>
                </div>
              ))} 
            </div>
          )}  
        </div> */}
      </div>
    </>
  )
}

export default Events