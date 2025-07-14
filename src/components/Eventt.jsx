import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import collegeLogo from '../assets/images/college-high-school-svgrepo-com.svg';
import UserContext from '../context/UserContext';
import { Users, Heart } from 'lucide-react';
import { toast } from 'react-toastify';

// Minimal inline spinner for wishlist loading
function Spinner() {
  return (
    <span className="inline-block w-5 h-5 align-middle">
      <svg className="animate-spin" viewBox="0 0 24 24" width="20" height="20">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </span>
  );
}

function formatEventDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Eventt({ events }) {
  const location = useLocation();
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const { email } = useContext(UserContext)
  // Wishlist state - fetch from backend
  const [wishlist, setWishlist] = useState([]);
  // Track loading state per event for wishlist
  const [wishlistLoading, setWishlistLoading] = useState({});

  // Fetch wishlist from backend
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!email) {
        setWishlist([]);
        return;
      }
      setWishlistLoading({});
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}:${import.meta.env.VITE_PORT}/wishlist/${email}`);
        const wishlistEventIds = res.data.map(event => event._id);
        setWishlist(wishlistEventIds);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setWishlist([]);
      } finally {
        setWishlistLoading({});
      }
    };

    fetchWishlist();
  }, [email]);

  // Refresh wishlist when component mounts or location changes
  useEffect(() => {
    const refreshWishlist = async () => {
      if (!email) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}:${import.meta.env.VITE_PORT}/wishlist/${email}`);
        const wishlistEventIds = res.data.map(event => event._id);
        setWishlist(wishlistEventIds);
      } catch (err) {
        console.error('Error refreshing wishlist:', err);
      }
    };

    // Refresh when location changes (user navigates back to event pages)
    refreshWishlist();
  }, [email, location.pathname]);

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

  // Helper to get event status (Live or Closed based only on closing date)
  const getEventStatus = (event) => {
    const now = new Date();
    const close = new Date(event.closeOn);
    if (now <= close) {
      return { label: 'Live', color: 'bg-green-600 text-white', live: true };
    }
    return { label: 'Closed', color: 'bg-gray-500 text-white', live: false };
  };

  // Wishlist handlers
  const isWishlisted = (eventId) => wishlist.includes(eventId);
  const toggleWishlist = async (eventId, eventName) => {
    if (!email) {
      toast.warn('Please log in to add to wishlist');
      return;
    }
    setWishlistLoading(prev => ({ ...prev, [eventId]: true }));
    const isAlreadyWishlisted = wishlist.includes(eventId);
    try {
      if (isAlreadyWishlisted) {
        // Remove from backend
        await axios.post(`${import.meta.env.VITE_BASE_URL}:${import.meta.env.VITE_PORT}/wishlist/remove`, {
          eventId,
          userEmail: email,
        });
        setWishlist(prev => prev.filter(id => id !== eventId));
        toast.success('Removed from wishlist');
      } else {
        // Add to backend
        await axios.post(`${import.meta.env.VITE_BASE_URL}:${import.meta.env.VITE_PORT}/wishlist/add`, {
          eventId,
          eventName,
          userEmail: email,
        });
        setWishlist(prev => [...prev, eventId]);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <div className="w-auto grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-7">
      {[...events]
        .sort((a, b) => {
          const aLive = getEventStatus(a).label === 'Live';
          const bLive = getEventStatus(b).label === 'Live';
          if (aLive === bLive) return 0;
          return aLive ? -1 : 1;
        })
        .map((eventt, idx) => {
        const status = getEventStatus(eventt);
        const isDetailPage = location.pathname.startsWith('/eventdetail') || location.pathname.startsWith('/admin/eventdetail');
        return (
          <div
            className={`flex flex-col items-start p-4 bg-gradient-to-r from-white to-white-200 border border-gray-300 hover:outline outline-blue-500 gap-4 rounded-xl text-sm lg:text-base relative transition-shadow hover:shadow-lg ${!isDetailPage ? 'cursor-pointer' : ''}`}
            key={idx}
            onClick={!isDetailPage ? () => window.location.href = `/eventdetail/${eventt._id}` : undefined}
            style={isDetailPage ? {} : { cursor: 'pointer' }}
          >
            {/* Top right: Heart and Status */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
              {/* Status Label */}
              <div
                className={`flex items-center px-2 py-0.5 rounded-full font-semibold shadow border ${status.live
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-400'
                  : 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-100 border-gray-400'} animate-fade-in`}
                style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.01em', minWidth: 0 }}
              >
                {status.live && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-300 mr-1 animate-pulse" style={{ boxShadow: '0 0 4px 1px #bef264' }}></span>
                )}
                {status.label}
              </div>
              {/* Wishlist Button */}
              <button
                className="bg-white/80 hover:bg-pink-100 rounded-full p-1 shadow transition border border-gray-200 ml-1 z-30"
                onClick={e => { e.stopPropagation(); toggleWishlist(eventt._id, eventt.eventName); }}
                title={isWishlisted(eventt._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                style={{ lineHeight: 0, cursor: 'pointer' }}
              >
                {wishlistLoading[eventt._id] ? (
                  <Spinner />
                ) : (
                  <Heart size={18} fill={isWishlisted(eventt._id) ? 'red' : 'none'} color={isWishlisted(eventt._id) ? 'red' : '#aaa'} />
                )}
              </button>
            </div>
            {/* Club Badge (now relative, inline at top of card content) */}
            {/* {eventt.clubName && (
              <div className="mb-2 flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                {eventt.clubShortName && (
                  <span className="font-bold uppercase bg-white/20 px-2 py-0.5 rounded mr-1 tracking-wide">{eventt.clubShortName}</span>
                )}
                <Users size={12} />
                {eventt.clubName}
              </div>
            )} */}
            <div className="lg:flex-grow">
              <p className="text-lg lg:text-xl mb-1 text-[#0d0c22] font-medium">{eventt.eventName}</p>
              <p className="mt-2 text-gray-500">
                {eventt.clubName}
              </p>
              {eventt.parentOrganization && (
                <p className="text-gray-500">
                  {eventt.parentOrganization}
                </p>
              )}
              <div className="flex flex-col text-gray-500 lg:mt-2">
                <span className="text-yellow-500"><i className="fa-solid fa-clock mr-1.5"></i> {eventt.eventMode}</span>
                <span className="text-blue-500"><i className="fa-duotone fa-solid fa-calendar-days mr-1.5"></i> {formatEventDate(eventt.eventDate)}</span>
                <span className="text-red-500"><i className="fa-solid fa-location-dot mr-1.5"></i> {eventt.eventLocation}</span>
              </div>
            </div>
            <div className="flex flex-col text-sm w-full">
              {!location.pathname.startsWith('/eventdetail') &&
                !location.pathname.startsWith('/admin/eventdetail') && (
                  <div className="flex items-center mb-2 gap-2">
                    <button
                      className="inline-block px-7 py-2 bg-[#0d0c22] rounded-full text-white hover:bg-[#0d0c22d2] transition-colors duration-200 cursor-pointer"
                      onClick={e => { e.stopPropagation(); window.location.href = `/eventdetail/${eventt._id}`; }}
                      style={{ cursor: 'pointer' }}
                    >
                      Get Detail
                    </button>
                    {/* Register Button */}
                    {registeredEventIds.includes(eventt._id) ? (
                      <button
                        className="inline-block px-5 py-2 bg-green-500 text-white rounded-full font-semibold shadow cursor-not-allowed opacity-70"
                        disabled
                        style={{ cursor: 'not-allowed' }}
                      >
                        Registered
                      </button>
                    ) : (() => {
                      const closeDate = new Date(eventt.closeOn);
                      const now = new Date();
                      // Debug log
                      // console.log('closeOn:', eventt.closeOn, 'closeDate:', closeDate, 'now:', now);
                      if (isNaN(closeDate.getTime())) {
                        return null; // Invalid date, don't show button
                      }
                      if (closeDate < now) {
                        return (
                          <button
                            className="inline-block px-5 py-2 bg-gray-400 text-white rounded-full font-semibold shadow cursor-not-allowed opacity-70"
                            disabled
                            style={{ cursor: 'not-allowed' }}
                          >
                            Registration Closed
                          </button>
                        );
                      }
                      return (
                        <button
                          className="inline-block px-5 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold shadow hover:from-orange-400 hover:to-pink-500 transition-colors duration-200 cursor-pointer"
                          onClick={e => { e.stopPropagation(); window.location.href = `/eventdetail/${eventt._id}`; }}
                          style={{ cursor: 'pointer' }}
                        >
                          Register
                        </button>
                      );
                    })()}
                    {registeredEventIds.includes(eventt._id) && (
                      null
                    )}
                  </div>
                )}
              <p className="italic text-gray-400">
                posted on : {formatEventDate(eventt.postedOn)}
              </p>
              <p className="italic text-red-500">
                closing on : {formatEventDate(eventt.closeOn)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Eventt;
