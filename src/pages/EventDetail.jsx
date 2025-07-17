import React, { useEffect, useState, useContext, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios';
import Eventt from '../components/Eventt';
import EventRegistration from '../components/EventRegistration';
import { ToastContainer, toast } from 'react-toastify';
import UserContext from '../context/UserContext';
import QueryComp from '../components/QueryComp';
import { Loader2, Calendar, MapPin, Clock, Users, Trophy, Award, BookOpen, MessageCircle, Play, CheckCircle, AlertCircle, Star, Zap, Target, Users2, Gift, Shield, Info, X, Backpack, IndianRupee } from 'lucide-react';
import defaultPoster from '../assets/images/university-academy-school-svgrepo-com.svg';

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
  const { email, user, token, role } = useContext(UserContext);

  const [event, setEvent] = useState(null);
  const [isShow, setIsShow] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [showQuery, setShowQuery] = useState(false);
  const [userQueries, setUserQueries] = useState([]);
  const [showUserQueries, setShowUserQueries] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [showPosterModal, setShowPosterModal] = useState(false);

  const sectionIds = ['overview', 'stages', 'prizes', 'rules', 'timeline'];
  const [currentSection, setCurrentSection] = useState('overview');
  const sectionRefs = useRef({});

  // Assign refs to each section
  sectionIds.forEach(id => {
    if (!sectionRefs.current[id]) {
      sectionRefs.current[id] = React.createRef();
    }
  });

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px 0px 0px', // Offset for navbar height
      threshold: 0.1,
    };
    const observer = new window.IntersectionObserver((entries) => {
      const visibleSections = entries.filter(entry => entry.isIntersecting);
      if (visibleSections.length > 0) {
        // Pick the first visible section (closest to top)
        setCurrentSection(visibleSections[0].target.id);
      }
    }, observerOptions);
    sectionIds.forEach(id => {
      const ref = sectionRefs.current[id];
      if (ref && ref.current) {
        observer.observe(ref.current);
      }
    });
    return () => {
      sectionIds.forEach(id => {
        const ref = sectionRefs.current[id];
        if (ref && ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  const handleClick = async () => {
    if (!token) {
      toast.warn("Please Log in to continue");
      return;
    }

    try {
      const response = await axios.post(`${baseURL}:${port}/auth/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response?.data?.valid) {
        setIsShow((prev) => !prev);
      } else {
        toast.warn("Please Log in to continue");
      }
    } catch (e) {
      console.log("Token verification error:", e);
      toast.warn("Please Log in to continue");
    }
  }

  const fetchUserQueries = async () => {
    if (!token || !email) return;

    setLoadingQueries(true);
    try {
      const res = await axios.get(`${baseURL}:${port}/query/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filtered = res.data.filter(q => q.userEmail === email);
      setUserQueries(filtered);
    } catch (err) {
      console.error('Error fetching queries:', err);
      setUserQueries([]);
    } finally {
      setLoadingQueries(false);
    }
  };

  const handleQueryClick = () => {
    if (!token || !email) {
      toast.warn('Please Log in to continue');
      return;
    }
    setShowQuery((prev) => !prev);
  };

  const handleShowUserQueries = () => {
    if (!token || !email) {
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
      if (!token || !email) return;
      try {
        const res = await axios.post(`${baseURL}:${port}/eventt/checkregistered`, {
          eventId,
          email
        }, {
          headers: { Authorization: `Bearer ${token}` }
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
  }, [token, email, eventId]);

  const getEventStatus = (event) => {
    if (!event) return { label: 'Loading', color: 'bg-gray-500', live: false };
    const now = new Date();
    const close = new Date(event.closeOn);
    const start = new Date(event.eventDate);
    if (now > close) return { label: 'Closed', color: 'bg-red-500', live: false };
    if (now >= start && now <= close) return { label: 'Live', color: 'bg-green-500', live: true };
    return { label: 'Upcoming', color: 'bg-blue-500', live: false };
  };

  const status = event ? getEventStatus(event) : { label: 'Loading', color: 'bg-gray-500', live: false };

  // Helper functions to check for non-empty data
  const hasNonEmptyStage = event => Array.isArray(event.stages) && event.stages.some(s => s && (s.title?.trim() || s.description?.trim()));
  const hasNonEmptyPrize = event => Array.isArray(event.prizes) && event.prizes.some(p => p && (p.title?.trim() || p.amount?.trim() || p.description?.trim()));
  const hasNonEmptyBenefit = event => Array.isArray(event.benefits) && event.benefits.some(b => b && b.trim());
  const hasNonEmptyRule = event => Array.isArray(event.rules) && event.rules.some(r => r && r.trim());
  const hasNonEmptyGuideline = event => Array.isArray(event.guidelines) && event.guidelines.some(g => g && g.trim());
  const hasNonEmptyBring = event => Array.isArray(event.bring) && event.bring.some(b => b && b.trim());

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="block">
              {event.posterUrl ? (
                <div className="relative flex justify-center">
                  <img src={event.posterUrl} alt="Event Poster" className="rounded-xl shadow-lg border border-white/20 w-full max-w-md object-cover aspect-[1200/627]" />
                  <button
                    onClick={() => setShowPosterModal(true)}
                    className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity z-10"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    title="Enlarge Poster"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" /></svg>
                    Enlarge
                  </button>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-4">Event Highlights</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm">Amazing Prizes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-5 h-5 text-blue-400" />
                      <span className="text-sm">Networking Opportunities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-sm">Skill Development</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <span className="text-sm">Real-world Experience</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              {/* Top-right badges: Status and Price/Free */}
              <div className="flex justify-end gap-2 mb-2">
                <div className={`flex items-center px-3 py-1 rounded-full font-semibold shadow border ${status.live
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-400'
                  : status.label === 'Upcoming'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400'
                    : 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-100 border-gray-400'} animate-fade-in`}
                  style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.01em', minWidth: 0 }}>
                  {status.live && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-300 mr-1 animate-pulse" style={{ boxShadow: '0 0 4px 1px #bef264' }}></span>
                  )}
                  {status.label}
                </div>
                {Number(event.fee) > 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full border-2 bg-[#DC3C22] text-white font-bold text-sm">
                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l10 10M7 17L17 7" /></svg> */}
                    <IndianRupee className="inline-block" size={20} />{Number(event.fee)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-400 text-green-800 font-semibold text-sm">
                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l10 10M7 17L17 7" /></svg> */}
                    FREE
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 gap-4 text-center">
                {event.eventName}
              </h1>
              <div className="text-xs opacity-90 mb-5 text-center">{event.clubName} - {event.parentOrganization || event.organizationName}</div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="text-center">
                  <Calendar className="h-5 mx-auto mb-1 opacity-80" />
                  <div className="text-xs opacity-75">Event Date</div>
                  <div className="text-sm font-semibold">{new Date(event.eventDate).toLocaleDateString()}</div>
                </div>
                <div className="text-center">
                  <MapPin className="h-5 mx-auto mb-1 opacity-80" />
                  <div className="text-xs opacity-75">Location</div>
                  <div className="text-sm font-semibold">{event.eventLocation}</div>
                </div>
                <div className="text-center">
                  <Clock className="h-5 mx-auto mb-1 opacity-80" />
                  <div className="text-xs opacity-75">Mode</div>
                  <div className="text-sm font-semibold">{event.eventMode}</div>
                </div>
                <div className="text-center">
                  <Users className="h-5 mx-auto mb-1 opacity-80" />
                  <div className="text-xs opacity-75">Organization</div>
                  <div className="text-sm font-semibold">{event.clubName}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClick}
                  disabled={hasRegistered || (event && new Date(event.closeOn) < new Date())}
                  className={`px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${hasRegistered
                    ? 'bg-gray-400 cursor-not-allowed'
                    : (event && new Date(event.closeOn) < new Date())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                >
                  {hasRegistered ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Already Registered
                    </>
                  ) : (event && new Date(event.closeOn) < new Date()) ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Registration Closed
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {isShow ? 'Close Registration' : 'Participate Now'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleQueryClick}
                  className="px-6 py-3 rounded-lg font-semibold text-base bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Query
                </button>

                <button
                  onClick={handleShowUserQueries}
                  className="px-6 py-3 rounded-lg font-semibold text-base bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  My Queries
                </button>
              </div>
            </div>



            {/* Poster Expand Modal */}
            <Modal open={showPosterModal} onClose={() => setShowPosterModal(false)}>
              <div className="flex flex-col items-center justify-center">
                <img
                  src={event.posterUrl || defaultPoster}
                  alt="Event Poster Expanded"
                  className="max-w-3xl w-full h-auto rounded-xl shadow-lg border"
                />
                {/* <button onClick={() => setShowPosterModal(false)} className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg font-semibold">Close</button> */}
              </div>
            </Modal>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-30">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Event Sections</h3>
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Info, show: true },
                  { id: 'stages', label: 'Event Stages', icon: Target, show: hasNonEmptyStage(event) },
                  { id: 'prizes', label: 'Prizes & Rewards', icon: Trophy, show: hasNonEmptyPrize(event) },
                  { id: 'rules', label: 'Rules & Guidelines', icon: Shield, show: hasNonEmptyRule(event) || hasNonEmptyGuideline(event) || hasNonEmptyBring(event) },
                  { id: 'timeline', label: 'Timeline', icon: Calendar, show: true }
                ].filter(section => section.show).map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      sectionRefs.current[section.id]?.current?.scrollIntoView({ behavior: 'smooth' });
                      setCurrentSection(section.id); // Set immediately on click for instant feedback
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium transition-all duration-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentSection === section.id ? 'bg-blue-100 text-blue-700 font-bold shadow border-l-4' : ''}`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="space-y-8">
              {/* Overview Section */}
              <div id="overview" ref={sectionRefs.current['overview']} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 scroll-mt-64">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <div className="prose prose-sm max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.eventDescription}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Important Dates
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Event Start:</span>
                        <span className="font-semibold">{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Registration Closes:</span>
                        <span className="font-semibold">{new Date(event.closeOn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Posted On:</span>
                        <span className="font-semibold">{new Date(event.postedOn).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Event Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-semibold">{event.eventLocation}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mode:</span>
                        <span className="font-semibold">{event.eventMode}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Organization:</span>
                        <span className="font-semibold">{event.clubName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Stages Section (only if data) */}
              {hasNonEmptyStage(event) && (
                <div id="stages" ref={sectionRefs.current['stages']} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 scroll-mt-32">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Stages</h2>
                  <div className="space-y-4">
                    {event.stages.map((stage, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 flex flex-col md:flex-row items-start gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">{idx + 1}</div>
                        <div>
                          <h3 className="text-lg font-bold mb-1">{stage.title}</h3>
                          <p className="opacity-90 text-sm">{stage.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Prizes Section (only if data) */}
              {hasNonEmptyPrize(event) && (
                <div id="prizes" ref={sectionRefs.current['prizes']} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 scroll-mt-32">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Prizes & Rewards</h2>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {event.prizes.map((prize, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg p-4 text-center flex flex-col items-center">
                        <Trophy className="w-12 h-12 mx-auto mb-3" />
                        <h3 className="text-lg font-bold mb-1">{prize.title}</h3>
                        <p className="text-lg font-semibold mb-1">{prize.amount}</p>
                        <p className="opacity-90 text-sm">{prize.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Additional Benefits (only if data) */}
              {hasNonEmptyBenefit(event) && (
                <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Additional Benefits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Rules Section (only if data) */}
              {(hasNonEmptyRule(event) || hasNonEmptyGuideline(event) || hasNonEmptyBring(event)) && (
                <div id="rules" ref={sectionRefs.current['rules']} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 scroll-mt-32">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Rules & Guidelines</h2>
                  <div className="space-y-4">
                    {/* Important Rules */}
                    {hasNonEmptyRule(event) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Important Rules
                        </h3>
                        <ul className="list-disc pl-6 space-y-1">
                          {event.rules.map((rule, idx) => (
                            <li key={idx} className="text-sm text-red-900">{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* General Guidelines */}
                    {hasNonEmptyGuideline(event) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          General Guidelines
                        </h3>
                        <ul className="list-disc pl-6 space-y-1">
                          {event.guidelines.map((guide, idx) => (
                            <li key={idx} className="text-sm text-yellow-900">{guide}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* What to Bring */}
                    {hasNonEmptyBring(event) && (
                      <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-lime-800 mb-3 flex items-center gap-2">
                          <Backpack className="w-4 h-4" />
                          What to Bring
                        </h3>
                        <ul className="list-disc pl-6 space-y-1">
                          {event.bring.map((item, idx) => (
                            <li key={idx} className="text-sm text-lime-900">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              <div id="timeline" ref={sectionRefs.current['timeline']} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 scroll-mt-32">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Timeline</h2>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    <div className="relative flex items-center">
                      <div className="absolute left-4 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="ml-12">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-base font-bold text-blue-900 mb-1">Registration Opens</h3>
                          <p className="text-blue-700 text-sm">{new Date(event.postedOn).toLocaleDateString()}</p>
                          <p className="text-xs text-blue-600 mt-1">Event registration begins</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="ml-12">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="text-base font-bold text-green-900 mb-1">Registration Closes</h3>
                          <p className="text-green-700 text-sm">{new Date(event.closeOn).toLocaleDateString()}</p>
                          <p className="text-xs text-green-600 mt-1">Last date to register</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-4 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="ml-12">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h3 className="text-base font-bold text-orange-900 mb-1">Event Day</h3>
                          <p className="text-orange-700 text-sm">{new Date(event.eventDate).toLocaleDateString()}</p>
                          <p className="text-xs text-orange-600 mt-1">Main event takes place</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-4 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="ml-12">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h3 className="text-base font-bold text-purple-900 mb-1">Results Announcement</h3>
                          <p className="text-purple-700 text-sm">TBD</p>
                          <p className="text-xs text-purple-600 mt-1">Winners will be announced</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {!hasRegistered && isShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Event Registration</h2>
                <button
                  onClick={() => setIsShow(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  <X />
                </button>
              </div>
              <EventRegistration
                eventId={eventId}
                eventName={event.eventName}
                organizationName={event.organizationName}
                parentOrganization={event.parentOrganization}
                setHasRegistered={setHasRegistered}
                eventFee={event.fee || 0}
              />
            </div>
          </div>
        </div>
      )}

      {/* Query Section */}
      {showQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Ask a Question</h2>
                <button
                  onClick={() => setShowQuery(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <QueryComp
                eventId={event?._id || eventId}
                eventName={event?.eventName || ''}
                userEmail={email || ''}
                userName={user || ''}
                onSuccess={() => setShowQuery(false)}
              />
            </div>
          </div>
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
  )
}

export default EventDetail
