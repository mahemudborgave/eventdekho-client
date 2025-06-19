import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dotenv from "dotenv";
import { ScaleLoader } from 'react-spinners';
import Eventt from '../components/Eventt';
import Search from '../components/Search';
import UserContext from '../context/UserContext';
import SearchContext from '../context/SearchContext';


function Events() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [originalEvents, setOriginalEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents`)
        setEvents(res.data);
        setOriginalEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [])

  const handleChange = (e) => {
    const value = e.target.value;
    // console.log(value);
    setSearchValue(value);

    if (value.trim() === '') {
      setEvents(originalEvents);
      return;
    }

    const result = originalEvents.filter(event =>
      event.eventName.toLowerCase().includes(value.toLowerCase()) ||
      event.collegeName.toLowerCase().includes(value.toLowerCase()) ||
      event.collegeCode.toLowerCase().includes(value.toLowerCase())
    )
    setEvents(result);
  }

  const handleClick = () => {
    setSearchValue('')
    setEvents(originalEvents);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 mb-100">
        <ScaleLoader />
      </div>
    )
  }



  return (
    <>
        <div className= 'lg:px-30'>
          
          <div className='lg:w-1/2 mb-10'>
            <Search handleChange={handleChange} handleClick={handleClick} page="event"/>
          </div>

          {(events.length === 0 ? (
            <div className="text-center mt-20 text-gray-500 text-lg mb-100">
              No matching events found.
            </div>
          )
            : <Eventt events={events} />)
          }

        </div>
    </>
  )
}

export default Events