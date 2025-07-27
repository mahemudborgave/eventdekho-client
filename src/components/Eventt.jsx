import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import collegeLogo from '../assets/images/college-high-school-svgrepo-com.svg';
import UserContext from '../context/UserContext';
import { Users, Heart, IndianRupee, BadgeCheck, CheckCircle2, TrendingUp } from 'lucide-react';
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
    const regStart = event.registrationStartOn ? new Date(event.registrationStartOn) : null;
    const regClose = event.closeOn ? new Date(event.closeOn) : null;
    if (regStart && now < regStart) {
      return { label: 'Upcoming', color: 'bg-yellow-500 text-white', live: false };
    }
    if (regStart && regClose && now >= regStart && now <= regClose) {
      return { label: 'Live', color: 'bg-green-600 text-white', live: true };
    }
    if (regClose && now > regClose) {
      return { label: 'Closed', color: 'bg-gray-500 text-white', live: false };
    }
    return { label: 'Upcoming', color: 'bg-yellow-500 text-white', live: false };
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
          // Debug: Log event data and fee
          // console.log('Rendering event:', eventt);
          // console.log('Event fee value:', eventt.fee, 'Type:', typeof eventt.fee);
          const status = getEventStatus(eventt);
          const isDetailPage = location.pathname.startsWith('/eventdetail') || location.pathname.startsWith('/admin/eventdetail');
          return (
            <div
              className="flex flex-col items-start p-4 bg-gradient-to-r from-white to-white-200 border border-gray-300 hover:outline outline-blue-500 rounded-xl text-sm lg:text-base relative transition-shadow hover:shadow-lg"
              key={idx}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                {/* Reach badge */}
                <span className="flex items-center gap-2 rounded-full text-gray-500 text-xs">
                  <TrendingUp size={13} />
                  Reach {eventt.participationsCount ?? 0}
                </span>
                <div className="flex items-center gap-1">
                  {/* Status Label or Registered */}
                  {registeredEventIds.includes(eventt._id) ? (
                    <div
                      className="flex items-center px-2 py-0.5 rounded-full font-semibold shadow bg-blue-700 text-white animate-fade-in"
                      style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.01em', minWidth: 0 }}
                    >
                      <CheckCircle2 size={13} className='mr-1' />
                      Registered
                    </div>
                  ) : (
                    <div
                      className={`flex items-center px-2 py-0.5 rounded-full font-semibold shadow ${status.color} animate-fade-in`}
                      style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.01em', minWidth: 0 }}
                    >
                      {status.live && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-300 mr-1 animate-pulse" style={{ boxShadow: '0 0 4px 1px #bef264' }}></span>
                      )}
                      {status.label}
                    </div>
                  )}
                  {/* Wishlist Button */}
                  <button
                    className="bg-white/80 hover:bg-pink-100 rounded-full p-1 shadow transition border border-gray-200 ml-1 z-20"
                    onClick={e => { e.stopPropagation(); toggleWishlist(eventt._id, eventt.eventName); }}
                    title={isWishlisted(eventt._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    style={{ lineHeight: 0, cursor: 'pointer' }}
                  >
                    {wishlistLoading[eventt._id] ? (
                      <Spinner />
                    ) : (
                      <Heart size={20} fill={isWishlisted(eventt._id) ? 'red' : 'none'} color={isWishlisted(eventt._id) ? 'red' : '#aaa'} />
                    )}
                  </button>
                </div>
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
                <p className="text-lg lg:text-xl text-[#0d0c22] font-medium capitalize">{eventt.eventName}</p>
                <p className="mt-2 text-gray-500">
                  {eventt.clubName}
                </p>
                {eventt.parentOrganization && (
                  <p className="text-gray-500 mb-1.5">
                    {eventt.parentOrganization}
                  </p>
                )}
                <div className="flex flex-col text-gray-500 lg:mt-2">
                  <span className="text-yellow-500"><i className="fa-solid fa-clock mr-1.5"></i> {eventt.eventMode}</span>
                  <span className="text-blue-500"><i className="fa-duotone fa-solid fa-calendar-days mr-1.5"></i> {formatEventDate(eventt.eventDate)}</span>
                  {/* <span className="text-green-600"><i className="fa-solid fa-calendar-check mr-1.5"></i> Registration Opens: {eventt.registrationStartOn ? formatEventDate(eventt.registrationStartOn) : 'N/A'}</span> */}
                  {/* <span className="text-red-500"><i className="fa-solid fa-location-dot mr-1.5"></i> {eventt.eventLocation}</span> */}
                  <span className="text-purple-800"><Users size={17} className='mr-1.5 text-purple-800 inline-block' /> Participants: {eventt.minParticipants == eventt.maxParticipants ? eventt.minParticipants : `${eventt.minParticipants} - ${eventt.maxParticipants}`}</span>
                </div>
              </div>
              <div className="flex flex-col text-sm w-full mt-4">
                {!location.pathname.startsWith('/eventdetail') &&
                  !location.pathname.startsWith('/admin/eventdetail') && (
                    <div className="flex items-center mb-2 gap-1">
                      <button
                        className="inline-block flex-1 px-7 py-2 bg-gradient-to-r from-[#0d0c22] to-[#0d0c22]/80 rounded-full text-white transition-all duration-200 cursor-pointer text-white shadow hover:shadow-md hover:scale-105 border border-[#0d0c22]"
                        onClick={e => { e.stopPropagation(); window.location.href = `/eventdetail/${eventt._id}`; }}
                        style={{ cursor: 'pointer' }}
                      >
                        Get Detail
                      </button>
                      {/* Price/Free Badge and Registered Badge */}
                      <div className="flex items-center gap-2">
                        {Number(eventt.fee) > 0 ? (
                          <span className="inline-flex items-center px-3 py-2 rounded-full bg-yellow-100 border border-yellow-400 text-yellow-800 font-semibold text-sm ml-2">
                            <IndianRupee size={15} />
                            {Number(eventt.fee)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-2 rounded-full bg-green-100 border border-green-400 text-green-800 font-semibold text-sm ml-2">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                <p className="italic text-gray-400">
                  Registration Opens: {eventt.registrationStartOn ? formatEventDate(eventt.registrationStartOn) : 'N/A'}
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
