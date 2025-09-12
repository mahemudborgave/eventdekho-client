import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { HashLoader, ScaleLoader } from 'react-spinners';
import Eventt from './Eventt';
import { Typewriter } from 'react-simple-typewriter'
import Search from './Search';
import { ArrowBigRightDash, ArrowUpRight, Building, Landmark, MoveUpRight, Quote } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';

function MainSearch() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [events, setEvents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const testimonials = [
    { name: "Amit S.", comment: "Found the coolest college fests here — registering took just seconds!" },
    { name: "Priya K.", comment: "Discovered hackathons, cultural fests & competitions I never knew existed!" },
    { name: "Rahul D.", comment: "The UI is super clean and the event wishlist is a lifesaver." },
    { name: "Sneha M.", comment: "EventApply made it so easy to find and register for events. Loved the experience!" },
  ];

  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % testimonials.length);
        setFade(true);
      }, 350); // fade out before switching
    }, 3500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  useEffect(() => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents`)
        setEvents(res.data);
        // Debug: Log all events fetched for MainSearch
        // console.log('Fetched events for MainSearch:', res.data);
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

      <div className='text-center px-2 lg:px-0'>
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
              Explore <ArrowBigRightDash className='ml-1 size-5' />
            </p>

            <NavLink to="/events" className='grow px-3 py-2 lg:py-3 bg-gray-50 ml-2 rounded-full flex justify-center items-center gap-2'>Events <ArrowUpRight className='size-5' /></NavLink>
            <NavLink to="/organizations" className='grow px-3 py-2 lg:py-3 bg-gray-50 ml-2 rounded-full flex justify-center items-center gap-2'>Organizations <ArrowUpRight className='size-5' /></NavLink>
          </div>
        </div>

        {/* Pure shadcn/ui style testimonial card, compact and minimal */}
        <div className="flex flex-col items-center my-2 lg:my-4">
          <Card className="w-full max-w-sm shadow border bg-background/90 dark:bg-background/80 gap-3 py-2">
            <CardHeader className="flex flex-col items-left">
              {/* <span className="flex items-center gap-1 dark:text-blue-300">
                <Quote className="w-4 h-4 opacity-80" />
                <CardTitle className="text-base tracking-tight">What students are saying</CardTitle>
              </span> */}
              {/* <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 via-amber-400 to-pink-400 rounded-full" /> */}
            </CardHeader>
            <CardContent className="flex flex-col items-center px-4 min-h-[70px] gap-0">
              <div
                className={`transition-all duration-400 ease-in-out w-full flex flex-col items-center ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}
                key={current}
              >
                <span className="text-sm text-center text-foreground select-none block mb-1">
                  “{testimonials[current].comment}”
                </span>
                <span className="text-xs text-left text-blue-600 dark:text-blue-300 font-semibold">— {testimonials[current].name}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* {loading && (
          <div className="flex justify-center items-center">
            <ScaleLoader />
          </div>
        )} */}
      </div>
    </>
  )
}

export default MainSearch
