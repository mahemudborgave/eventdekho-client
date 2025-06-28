import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { HashLoader, ScaleLoader } from 'react-spinners';
import Eventt from './Eventt';
import { Typewriter } from 'react-simple-typewriter'
import Search from './Search';
import { ArrowBigRightDash, ArrowUpRight, Building, Landmark, MoveUpRight } from 'lucide-react';

function MainSearch() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [events, setEvents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents`)
        setEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [])

  return (
    <>
      <style>
        {`
          .shiny-button {
            position: relative;
            overflow: hidden;
          }
          .shiny-button::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.2) 100%);
            transform: rotate(25deg);
            animation: shine 3s infinite;
          }
          @keyframes shine {
            0% {
              transform: rotate(25deg) translateX(-100%);
            }
            100% {
              transform: rotate(25deg) translateX(100%);
            }
          }
        `}
      </style>

      <div className='text-center'>
        <p className='my-10 lg:my-0 text-3xl md:text-5xl font-medium' style={{ fontFamily: "'Source Serif 4', sans-serif" }}>
          Discover India's&nbsp;
          <br />
          <span className='text-amber-400'> best&nbsp;
            <Typewriter
              words={['technical', 'non-technical', 'social']}
              loop={true}
              cursor
              cursorStyle="|"
              typeSpeed={80}
              deleteSpeed={50}
              delaySpeed={500}
            />
            <br />
          </span>
          events, <span className='text-amber-400'>all</span> in one place
        </p>

        <p className='py-10 hidden lg:block'>Explore events from the most vibrant and creative colleges
          <br />ready to inspire and engage your next experience</p>

        <div className='my-5 md:my-10 lg:my-0'>
          <div className='px-2 py-2 lg:py-3 lg:px-4 bg-gradient-to-r from-amber-200 to-blue-300 m-auto rounded-full flex items-center justify-center text-sm text-center'>

            <p className='shiny-button grow px-3 py-2 lg:py-3 bg-[#0d0c22] ml-2 text-gray-100 rounded-full flex items-center justify-center'>
              Explore <ArrowBigRightDash className='ml-1' size={20} />
            </p>

            <NavLink to="/events" className='grow px-3 py-2 lg:py-3 bg-gray-50 ml-2 rounded-full flex justify-center items-center gap-2'>Events <ArrowUpRight className='size-5' /></NavLink>
            <NavLink to="/organizations" className='grow px-3 py-2 lg:py-3 bg-gray-50 ml-2 rounded-full flex justify-center items-center gap-2'>Organizations <ArrowUpRight className='size-5' /></NavLink>
          </div>
        </div>

        <div className='hidden lg:flex items-center lg:flex-row justify-center gap-2 my-3 text-sm text-gray-900'>
          <p className='py-1 px-6 border border-[#0d0c22] rounded-full border'>Technical</p>
          <p className='py-1 px-6 border border-[#0d0c22] rounded-full'>Nontechnical</p>
          <p className='py-1 px-6 border border-[#0d0c22] rounded-full'>social</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center">
            <ScaleLoader />
          </div>
        )}
      </div>
    </>
  )
}

export default MainSearch
