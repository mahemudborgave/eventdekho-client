import React, { useEffect, useState } from 'react'
import Events from './Events'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { HashLoader } from 'react-spinners';
import axios from 'axios';
import Eventt from '../components/Eventt';
import collegeList from "../college_list.json";

function CollegeDetails() {
  const { dte_code } = useParams();
  console.log(dte_code);
  
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [collegeEvents, setCollegeEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  // console.log(code)

  useEffect(() => {

    const fetchCollege = async () => {
      try {
        // const res = await axios.get(`${baseURL}:${port}/eventt/getcollege/${dte_code}`);

        const matchedCollege = collegeList.find(college => college.dte_code === dte_code);
        console.log(matchedCollege);
        
        setCollege({
          collegeCode: matchedCollege?.dte_code,
          collegeName: matchedCollege?.college_name,
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
        const res = await axios.get(`${baseURL}:${port}/eventt/getevents/${dte_code}`);
        // console.log(res.data)
        setCollegeEvents(res.data);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <HashLoader />
      </div>
    );
  }

  if (!college) {
    return <div>College not found</div>;
  }

  return (
    <>
      <div className='mb-8'>
        {/* <div className='bg-gray-600 w-20 h-20 rounded-3xl mr-3'><img src="" alt="" /></div> */}
        <div className='w-full bg-gray-200 p-10'>
          <p className='text-amber-600 text-4xl mb-4'>{college.collegeName}</p>
          <span className='border px-4 text-violet-500 mr-2'>Code - {college.collegeCode}</span>
          <span className='border px-4 text-green-500'> Total events - {collegeEvents.length}</span>
        </div>
        <p className='my-7'>Event list ...</p>
        <Eventt events={collegeEvents} />
        <div className='mx-30'>
        </div>
      </div>
      <div className='h-81'></div>
    </>
  )
}

export default CollegeDetails