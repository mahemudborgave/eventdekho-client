import React, { useEffect, useState } from 'react'
import Events from './Events'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { HashLoader, ScaleLoader } from 'react-spinners';
import axios from 'axios';
import Eventt from '../components/Eventt';
import collegeList from "../college_list.json";
import { Calendar, Users, MapPin, GraduationCap, ChevronDown, ChevronUp, SquareChartGantt, ChartSpline, MapPinned, LocateFixed, BookMarked, Building } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import defaultOrgLogo from '../assets/images/university-academy-school-svgrepo-com.svg';

function OrganizationDetails() {
  const { organizationId } = useParams();
  console.log(organizationId);

  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [organizationEvents, setOrganizationEvents] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedClubs, setCollapsedClubs] = useState(new Set());
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterYear, setFilterYear] = useState('all');
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  // console.log(code)

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await fetch(`${baseURL}:${port}/eventt/getorganization/${organizationId}`);
        console.log(res);

        const data = await res.json();
        setOrganization(data);
      } catch (err) {
        setOrganization(null);
        console.error('Error fetching organization:', err);
      }
    };

    fetchOrganization();

    const fetchOrganizationEvent = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents/${organizationId}`);
        // console.log(res.data)
        setOrganizationEvents(res.data);

        // Group events by club name for this organization
        const clubGroups = {};
        if (res.data && Array.isArray(res.data)) {
          res.data.forEach(event => {
            if (event && event.clubName) {
              if (!clubGroups[event.clubName]) {
                clubGroups[event.clubName] = {
                  clubName: event.clubName,
                  eventCount: 0,
                  events: []
                };
              }
              clubGroups[event.clubName].eventCount++;
              clubGroups[event.clubName].events.push(event);
            }
          });
        }

        // Convert to array and sort by event count
        const clubEventsArray = Object.values(clubGroups).sort((a, b) => b.eventCount - a.eventCount);
        setClubEvents(clubEventsArray);
      }
      catch (err) {
        console.error('Error fetching organization events:', err);
        navigate('/colleges');
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizationEvent();
  }, []);

  // Collapse all clubs by default when clubEvents is set
  useEffect(() => {
    if (clubEvents.length > 0) {
      setCollapsedClubs(new Set(clubEvents.map(club => club.clubName)));
    }
  }, [clubEvents]);

  // Compute year options (current and last 2 years)
  const yearOptions = useMemo(() => {
    const now = new Date();
    const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
    return years;
  }, []);

  // Filtered events by year
  const filteredEvents = useMemo(() => {
    if (filterYear === 'all') return organizationEvents;
    return organizationEvents.filter(ev => {
      if (!ev.eventDate) return false;
      const eventYear = new Date(ev.eventDate).getFullYear();
      return String(eventYear) === String(filterYear);
    });
  }, [organizationEvents, filterYear]);

  const toggleClubCollapse = (clubName) => {
    setCollapsedClubs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clubName)) {
        newSet.delete(clubName);
      } else {
        newSet.add(clubName);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <ScaleLoader />
      </div>
    );
  }

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <>
      <div className='mb-8'>
        {/* Organization Header */}
        <div className='w-full text-[#1a093f]'>
          <div className="mb-10 rounded-lg p-6 bg-gradient-to-r from-amber-200 to-amber-300">

            <div className='flex items-center gap-3 mb-5'>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-0 to-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden mr-4">
                {organization.logo ? (
                  <img src={organization.logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <img src={defaultOrgLogo} alt="Logo" className="w-16 h-16 object-cover rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className='text-lg md:text-3xl font-bold'>{organization.organizationName}</h1>
                {organization.parentOrganization && <h2 className='text-sm md:text-xl capitalize'>{organization.parentOrganization}</h2>}
              </div>
            </div>



            <div className="flex flex-wrap gap-4">
              {/* <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-1 rounded-lg border border-gray-200">
                  <span className="text-sm">Code</span>
                  <p className="font-semibold">{organization._id}</p>
                </div> */}
              <div className="flex items-center gap-2 bg-green-400 backdrop-blur-sm px-4 py-1 rounded-lg">
                <ChartSpline className='w-4 h-4' />
                <span className="text-sm">Total Events</span>
                <p className="font-semibold">{organizationEvents.length}</p>
              </div>
              <div className="flex items-center gap-2 bg-blue-400 backdrop-blur-sm px-4 py-1 rounded-lg">
                <Building className='w-4 h-4' />
                <span className="text-sm">Type</span>
                <p className="font-semibold">{organization.organizationType}</p>
              </div>
              <div className="flex items-center gap-2 bg-purple-400 backdrop-blur-sm px-4 py-1 rounded-lg">
                <LocateFixed className='w-4 h-4' />
                <span className="text-sm">City</span>
                <p className="font-semibold">{organization.city}</p>
              </div>
            </div>
          </div>

        </div>
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
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-4 flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Year</label>
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={filterYear}
                      onChange={e => setFilterYear(e.target.value)}
                    >
                      <option value="all">All Years</option>
                      {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="mt-2 w-full bg-amber-500 text-white rounded py-1.5 font-semibold text-sm hover:bg-amber-600"
                    onClick={() => setFilterDropdownOpen(false)}
                  >
                    Apply Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {filteredEvents.length > 0 ? (
          <div className='px-2 lg:px-4'>
            <Eventt events={filteredEvents} />
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">No events found for this organization.</div>
        )}
        <div className="mt-8 text-center">
          <Link to="/organizations" className="text-blue-600 underline">Back to Organizations</Link>
        </div>
      </div>
    </>
  )
}

export default OrganizationDetails