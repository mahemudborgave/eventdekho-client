import React, { useEffect, useState, useContext, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import Eventt from '../components/Eventt';
import EventRegistration from '../components/EventRegistration';
import { ToastContainer, toast } from 'react-toastify';
import UserContext from '../context/UserContext';
import QueryComp from '../components/QueryComp';
import { Loader2, Calendar, MapPin, Clock, Users, Trophy, Award, BookOpen, MessageCircle, Play, CheckCircle, AlertCircle, Star, Zap, Target, Users2, Gift, Shield, Info, X, Backpack, IndianRupee, Building2 } from 'lucide-react';
import defaultPoster from '../assets/images/university-academy-school-svgrepo-com.svg';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
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
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      window.location.reload(); // Reload to reset state
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
    const currentToken = localStorage.getItem('token');
    if (!token || !currentToken || !email) {
      toast.warn('Please Log in to continue');
      return;
    }
    setShowQuery((prev) => !prev);
  };

  const handleShowUserQueries = () => {
    const currentToken = localStorage.getItem('token');
    if (!token || !currentToken || !email) {
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="block">
              {event.posterUrl ? (
                <div className="relative flex justify-center">
                  <img src={event.posterUrl} alt="Event Poster" className="rounded-xl shadow-lg border border-white/20 w-full max-w-md object-cover aspect-[1200/627]" />
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={() => setShowPosterModal(true)}
                    className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-semibold opacity-80 hover:opacity-100 z-10"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    title="Enlarge Poster"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" /></svg>
                    Enlarge
                  </Button>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-4">Event Highlights</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span>Amazing Prizes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-5 h-5 text-blue-400" />
                      <span>Networking Opportunities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span>Skill Development</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <span>Real-world Experience</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              {/* Top-right badges: Status and Price/Free */}
              <div className="flex justify-end gap-3 mb-2">
                <div className={`flex items-center px-3 py-1 rounded-full font-semibold shadow border text-base ${status.live
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-400'
                  : status.label === 'Upcoming'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-400'
                    : 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-100 border-gray-400'} animate-fade-in`}
                  style={{ fontWeight: 600, letterSpacing: '0.01em', minWidth: 0 }}>
                  {status.live && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-300 mr-1 animate-pulse" style={{ boxShadow: '0 0 4px 1px #bef264' }}></span>
                  )}
                  {status.label}
                </div>
                {Number(event.fee) > 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full border-2 bg-[#DC3C22] text-white font-bold text-base">
                    <IndianRupee className="inline-block" size={20} />{Number(event.fee)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-400 text-green-800 font-semibold text-base">
                    FREE
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-center">
                {event.eventName}
              </h1>
              <div className="text-sm opacity-90 mb-4 text-center">{event.clubName} - {event.parentOrganization || event.organizationName}</div>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="text-center">
                  <Calendar className="h-5 mx-auto mb-1 opacity-80" />
                  <div className="text-sm opacity-75">Event Date</div>
                  <div className="text-base font-semibold">{new Date(event.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
                <div className="text-center">
                  <Users className="h-5 mx-auto mb-1 opacity-80" />
                  <div className="text-sm opacity-75">Participants</div>
                  <div className="text-base font-semibold">{event.minParticipants == event.maxParticipants ? event.minParticipants : `${event.minParticipants} to ${event.maxParticipants}`}</div>
                </div>
                <div className="text-center">
                  <Clock className="h-5 mx-auto mb-1 opacity-80" />
                  <div className="text-sm opacity-75">Mode</div>
                  <div className="text-base font-semibold">{event.eventMode}</div>
                </div>
                <div className="text-center">
                  <Building2 className="h-5 mx-auto mb-1 opacity-80" />
                  <div className="text-sm opacity-75">Organization</div>
                  <div className="text-base font-semibold">{event.clubName}</div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center items-center mb-2">
                {event.registrationPlatform === 'external' && event.registrationUrl ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center px-6 py-2 rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow hover:shadow-md hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    Register on organizer's website
                  </a>
                ) : (
                  <Button
                    asChild
                    disabled={hasRegistered || (event && new Date(event.closeOn) < new Date()) || (event && new Date(event.registrationStartOn) > new Date())}
                    size="default"
                    className={`px-1 py-6 rounded-sm font-semibold text-base flex items-center gap-2 ${hasRegistered
                      ? 'bg-gray-400 cursor-not-allowed'
                      : (event && new Date(event.closeOn) < new Date())
                        ? 'bg-gray-400 cursor-not-allowed'
                        : (event && new Date(event.registrationStartOn) > new Date())
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'border border-green-500 bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-900 text-white shadow hover:shadow-md hover:scale-105'
                      }`}
                  >
                    {hasRegistered ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Registered
                      </div>
                    ) : (event && new Date(event.closeOn) < new Date()) ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Registration Closed
                      </>
                    ) : (event && new Date(event.registrationStartOn) > new Date()) ? (
                      <div className='text-red-800 bg-red-300/30 px-2 py-3 rounded-md flex items-center gap-2'>
                        <Clock className="w-5 h-5" />
                        <span className="">Registration Not Started</span>
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          const currentToken = localStorage.getItem('token');
                          if (!token || !currentToken) {
                            toast.warn("Please Log in to continue");
                            return;
                          }
                          navigate(`/eventregister/${eventId}`, { state: { fromEventDetail: true } });
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-5 h-5" />
                        Participate
                      </div>
                    )}
                  </Button>
                )}
                <Button
                  onClick={handleQueryClick}
                  size="default"
                  variant="outline"
                  className="px-6 py-2 rounded-sm text-base flex items-center gap-2 text-gray-600 bg-white/60 border-none"
                >
                  <MessageCircle className="w-5 h-5" />
                  Ask Query
                </Button>
                <Button
                  onClick={handleShowUserQueries}
                  size="default"
                  variant="outline"
                  className="px-6 py-2 rounded-sm text-base flex items-center gap-2 text-gray-600 bg-white/60 border-none"
                >
                  <BookOpen className="w-5 h-5" />
                  My Queries
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto lg:px-4 px-0 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-400 via-purple-300 to-pink-300 rounded-lg shadow p-7 sticky top-30">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Event Sections</h3>
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
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left text-base transition-all duration-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900 ${currentSection === section.id ? 'bg-blue-100 text-blue-700  shadow border-l-4' : ''}`}
                  >
                    <section.icon className="w-3 h-3" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Overview Section */}
              <div id="overview" ref={sectionRefs.current['overview']} className="bg-white rounded-lg shadow p-4 sm:p-7 scroll-mt-64">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.eventDescription}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Important Dates
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration Start:</span>
                        <span className="font-semibold">{new Date(event.registrationStartOn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration Closes:</span>
                        <span className="font-semibold">{new Date(event.closeOn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posted On:</span>
                        <span className="font-semibold">{new Date(event.postedOn).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      Event Details
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-semibold">{event.eventLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mode:</span>
                        <span className="font-semibold">{event.eventMode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Organization:</span>
                        <span className="font-semibold">{event.clubName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Stages Section (only if data) */}
              {hasNonEmptyStage(event) && (
              <div id="stages" ref={sectionRefs.current['stages']} className="bg-white rounded-lg shadow p-4 sm:p-7 scroll-mt-32">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Event Stages</h2>
                <div className="space-y-3">
                    {event.stages.map((stage, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col md:flex-row items-start gap-3">
                        <div className="w-15 h-7 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg text-gray-700">{idx + 1}</div>
                        <div>
                          <h3 className="text-lg font-bold mb-0.5 text-gray-900">{stage.title}</h3>
                          <p className="opacity-90 text-sm text-gray-700">{stage.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Prizes Section (only if data) */}
              {hasNonEmptyPrize(event) && (
              <div id="prizes" ref={sectionRefs.current['prizes']} className="bg-white rounded-lg shadow p-4 sm:p-7 scroll-mt-32">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Prizes & Rewards</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {event.prizes.map((prize, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center flex flex-col items-center">
                        <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
                        <h3 className="text-lg font-bold mb-0.5 text-gray-900">{prize.title}</h3>
                        <p className="text-lg font-semibold mb-0.5 text-gray-800">{prize.amount}</p>
                        <p className="opacity-90 text-sm text-gray-700">{prize.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Additional Benefits (only if data) */}
              {hasNonEmptyBenefit(event) && (
                <div className="mt-4 bg-white rounded-lg shadow p-5">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <Gift className="w-5 h-5 text-green-500" />
                    Additional Benefits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {event.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{benefit}</span>
                        </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Rules Section (only if data) */}
              {(hasNonEmptyRule(event) || hasNonEmptyGuideline(event) || hasNonEmptyBring(event)) && (
              <div id="rules" ref={sectionRefs.current['rules']} className="bg-white rounded-lg shadow p-4 sm:p-7 scroll-mt-32">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Rules & Guidelines</h2>
                <div className="space-y-3">
                  {/* Important Rules */}
                    {hasNonEmptyRule(event) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Important Rules
                    </h3>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm">
                          {event.rules.map((rule, idx) => (
                          <li key={idx} className="text-red-900">{rule}</li>
                          ))}
                    </ul>
                  </div>
                    )}
                  {/* General Guidelines */}
                    {hasNonEmptyGuideline(event) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      General Guidelines
                    </h3>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm">
                          {event.guidelines.map((guide, idx) => (
                          <li key={idx} className="text-yellow-900">{guide}</li>
                          ))}
                    </ul>
                  </div>
                    )}
                  {/* What to Bring */}
                    {hasNonEmptyBring(event) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-lime-800 mb-2 flex items-center gap-2">
                      <Backpack className="w-4 h-4" />
                      What to Bring
                    </h3>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm">
                          {event.bring.map((item, idx) => (
                          <li key={idx} className="text-lime-900">{item}</li>
                          ))}
                    </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              <div id="timeline" ref={sectionRefs.current['timeline']} className="bg-white rounded-lg shadow p-4 sm:p-7 scroll-mt-32">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Event Timeline</h2>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    <div className="relative flex items-center">
                      <div className="absolute left-4 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="ml-10">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h3 className="text-base font-bold text-blue-900 mb-0.5">Registration Opens</h3>
                          <p className="text-blue-700 text-xs">{new Date(event.postedOn).toLocaleDateString()}</p>
                          <p className="text-xs text-blue-600 mt-0.5">Event registration begins</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-4 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="ml-10">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h3 className="text-base font-bold text-green-900 mb-0.5">Registration Closes</h3>
                          <p className="text-green-700 text-xs">{new Date(event.closeOn).toLocaleDateString()}</p>
                          <p className="text-xs text-green-600 mt-0.5">Last date to register</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-4 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="ml-10">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <h3 className="text-base font-bold text-orange-900 mb-0.5">Event Day</h3>
                          <p className="text-orange-700 text-xs">{new Date(event.eventDate).toLocaleDateString()}</p>
                          <p className="text-xs text-orange-600 mt-0.5">Main event takes place</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-4 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="ml-10">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <h3 className="text-base font-bold text-purple-900 mb-0.5">Results Announcement</h3>
                          <p className="text-purple-700 text-xs">TBD</p>
                          <p className="text-xs text-purple-600 mt-0.5">Winners will be announced</p>
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

      {/* Query Section */}
      <Dialog open={showQuery} onOpenChange={setShowQuery}>
        <DialogContent className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-3 sm:p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">Ask a Question</h2>
            </div>
            <QueryComp
              eventId={event?._id || eventId}
              eventName={event?.eventName || ''}
              userEmail={email || ''}
              userName={user || ''}
              onSuccess={() => setShowQuery(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Poster Modal */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPosterModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full h-full md:w-[90%] md:h-[80%] max-w-6xl max-h-4xl flex items-center justify-center bg-white/20 rounded-lg shadow-2xl overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPosterModal(false)}
              className="absolute top-2 right-2 z-10 bg-black/70 text-white hover:bg-white hover:text-black rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
            {event.posterUrl && (
              <img 
                src={event.posterUrl} 
                alt="Event Poster" 
                className="w-full h-full object-contain p-3"
              />
            )}
          </div>
        </div>
      )}

      {/* User Queries Modal */}
      <Dialog open={showUserQueries} onOpenChange={setShowUserQueries}>
        <DialogContent className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className='text-lg font-bold mb-3 text-blue-800'>Your Queries for this Event</h3>
          {loadingQueries ? (
            <div className='flex items-center gap-2 text-blue-600'><Loader2 className='animate-spin' /> Loading...</div>
          ) : userQueries.length === 0 ? (
            <div className='text-gray-600'>You have not raised any queries for this event.</div>
          ) : (
            <div className='space-y-3 max-h-[60vh] overflow-y-auto'>
              {userQueries.map((q) => (
                <div key={q._id} className='bg-blue-50 border border-blue-200 rounded p-3'>
                  <div className='font-semibold text-gray-800 mb-0.5'>Query:</div>
                  <div className='mb-1 text-gray-700'>{q.message}</div>
                  {q.resolution ? (
                    <div className='bg-green-100 border border-green-300 rounded p-1.5 mt-1.5'>
                      <div className='font-semibold text-green-800 mb-0.5'>Admin Response:</div>
                      <div className='text-green-900'>{q.resolution}</div>
                    </div>
                  ) : (
                    <div className='text-yellow-700 italic'>No response yet.</div>
                  )}
                  <div className='text-xs text-gray-400 mt-1'>Asked on: {new Date(q.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventDetail
