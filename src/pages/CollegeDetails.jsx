import React, { useEffect, useState } from 'react'
import Events from './Events'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { HashLoader, ScaleLoader } from 'react-spinners';
import axios from 'axios';
import Eventt from '../components/Eventt';
import collegeList from "../college_list.json";
import { Calendar, Users, MapPin, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

function CollegeDetails() {
  const { collegeCode } = useParams();
  // console.log(collegeCode);

  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [collegeEvents, setCollegeEvents] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedClubs, setCollapsedClubs] = useState(new Set());
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  // console.log(code)

  useEffect(() => {

    const fetchCollege = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getcollege/${collegeCode}`);
        // console.log(res);
        

        // const matchedCollege = collegeList.find(college => college.collegeCode === collegeCode);
        // console.log(matchedCollege);

        setCollege({
          collegeCode: res.data.collegeCode,
          collegeName: res.data.collegeName,
          collegeEventCount: 0 // or fetch from backend if needed
        });
      }
      catch (err) {
        console.error('Error fetching college:', err);
        navigate('/colleges');
      }
    }

    fetchCollege();

    const fetchCollegeEvent = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents/${collegeCode}`);
        // console.log(res.data)
        setCollegeEvents(res.data);

        // Group events by club name for this college
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
        console.error('Error fetching college events:', err);
        navigate('/colleges');
      } finally {
        setLoading(false);
      }
    }

    fetchCollegeEvent();
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

  if (!college) {
    return <div>College not found</div>;
  }

  return (
    <>
      <div className='mb-8'>
        {/* College Header */}
        <div className='w-full text-[#1a093f]'>
          <div className="flex items-center gap-3 mb-10 rounded-lg p-6 bg-gradient-to-r from-amber-200 to-amber-300">
            <div>
              <h1 className='text-lg md:text-3xl font-bold mb-3'>{college.collegeName}</h1>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-1 rounded-lg border border-gray-200">
                  <span className="text-sm">Code</span>
                  <p className="font-semibold">{college.collegeCode}</p>
                </div>
                <div className="flex items-center gap-2 bg-green-400 backdrop-blur-sm px-4 py-1 rounded-lg">
                  <span className="text-sm">Total Events</span>
                  <p className="font-semibold">{collegeEvents.length}</p>
                </div>
                <div className="flex items-center gap-2 bg-green-400 backdrop-blur-sm px-4 py-1 rounded-lg">
                  <span className="text-sm">Active Clubs</span>
                  <p className="font-semibold">{clubEvents.length}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Club Events Sections */}
        <div className="lg:px-10 mt-8">
          <div className="space-y-8">
            {/* Clubs with Events */}
            {clubEvents.map((club, index) => (
              <div key={club.clubName} className="bg-white rounded-2xl shadow-xl shadow-blue-300 border border-gray-100 overflow-hidden">
                {/* Club Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 lg:px-6 py-3 lg:py-4 text-white relative">

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Users size={20} />
                      </div>
                      <div>
                        <h2 className="text-base lg:text-xl font-bold">{club.clubName}</h2>
                        <p className="text-blue-100 text-sm">Student Club</p>
                      </div>
                    </div>
                    <div className='flex justify-center items-center gap-4'>

                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} />
                        <span className="font-semibold">{club.eventCount} Events</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleClubCollapse(club.clubName)}
                      className="text-blue-600 hover:text-blue-600 w-6 h-6 flex items-center justify-center rounded-full bg-white transition-colors"
                      aria-label={collapsedClubs.has(club.clubName) ? `Expand ${club.clubName} club section` : `Collapse ${club.clubName} club section`}
                    >
                      {collapsedClubs.has(club.clubName) ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                    </div>
                  </div>
                </div>

                {/* Events List */}
                {!collapsedClubs.has(club.clubName) && (
                  <div className="p-6">
                    <Eventt events={club.events} />
                  </div>
                )}
              </div>
            ))}

            {/* Events without club (if any) */}
            {collegeEvents.filter(event => !event.clubName).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Other Events Header */}
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h2 className="text-base lg:text-xl font-bold">Other Events</h2>
                        <p className="text-gray-100 text-sm">Events without club</p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} />
                        <span className="font-semibold">{collegeEvents.filter(event => !event.clubName).length} Events</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Events List */}
                <div className="p-6">
                  <Eventt events={collegeEvents.filter(event => !event.clubName)} />
                </div>
              </div>
            )}

            {/* No events message */}
            {collegeEvents.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
                <p className="text-gray-500">This college hasn't hosted any events yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='h-81'></div>
    </>
  )
}

export default CollegeDetails