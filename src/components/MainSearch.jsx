import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import Eventt from './Eventt';
import { Typewriter } from 'react-simple-typewriter'
import Search from './Search';

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

  const handleClick = (e) => {
    navigate('/events')
  }

  const handleChange = (e) => {
    navigate('/events')
  }

  return (
    <>
      <div className='text-center'>
        <p
          className='my-10 lg:my-0 text-3xl md:text-5xl font-medium' style={{ fontFamily: "'Source Serif 4', sans-serif" }}
        >
          Discover India's&nbsp;
          <br></br>
          <span className='text-amber-400'> best&nbsp;
            <Typewriter
              words={['college', 'technical', 'social']}
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


        <div onClick={handleClick} className='my-5 md:my-10 lg:my-0'>
          <Search handleChange={handleChange} />
        </div>

        <div className='hidden lg:flex items-center lg:flex-row justify-center gap-2 my-3 text-sm text-[#535353]'>
          <p className='py-1 px-6 bg-[#e7e7e7ad] rounded-full border'>Technical</p>
          <p className='py-1 px-6 bg-[#e7e7e7ad] rounded-full'>Nontechnical</p>
          <p className='py-1 px-6 bg-[#e7e7e7ad] rounded-full'>social</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center">
            <HashLoader />
          </div>
        )}

      </div>
      <div className='absolute h-200 block z-99'>
        <Eventt events={searchResults} />
      </div>
    </>
  )
}

export default MainSearch