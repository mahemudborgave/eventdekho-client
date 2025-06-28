import React, { useEffect, useState } from 'react'
import Events from './Events'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { HashLoader, ScaleLoader } from 'react-spinners';
import axios from 'axios';
import Eventt from '../components/Eventt';
import collegeList from "../college_list.json";
import { Calendar, Users, MapPin, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

function OrganizationDetails() {
  const { organizationId } = useParams();
  console.log(organizationId);

  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [organizationEvents, setOrganizationEvents] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedClubs, setCollapsedClubs] = useState(new Set());
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
          <div className="flex items-center gap-3 mb-10 rounded-lg p-6 bg-gradient-to-r from-amber-200 to-amber-300">
            <div>
              <h1 className='text-lg md:text-3xl font-bold mb-3'>{organization.organizationName}</h1>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-1 rounded-lg border border-gray-200">
                  <span className="text-sm">Code</span>
                  <p className="font-semibold">{organization._id}</p>
                </div>
                <div className="flex items-center gap-2 bg-green-400 backdrop-blur-sm px-4 py-1 rounded-lg">
                  <span className="text-sm">Total Events</span>
                  <p className="font-semibold">{organizationEvents.length}</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-400 backdrop-blur-sm px-4 py-1 rounded-lg">
                  <span className="text-sm">Type</span>
                  <p className="font-semibold">{organization.organizationType}</p>
                </div>
                <div className="flex items-center gap-2 bg-purple-400 backdrop-blur-sm px-4 py-1 rounded-lg">
                  <span className="text-sm">City</span>
                  <p className="font-semibold">{organization.city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Events Hosted</h2>
        {organizationEvents.length > 0 ? (
          <Eventt events={organizationEvents} />
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