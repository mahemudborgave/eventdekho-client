import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLoader, ScaleLoader } from 'react-spinners';
import Search from "../components/Search";
import UserContext from "../context/UserContext";
import SearchContext from "../context/SearchContext";
import { ArrowUpRight, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

function CollegeRowSection({ title, colleges, infoStyle }) {
  const rowRef = React.useRef();
  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({  left: dir * 250,behavior: 'smooth' });
    }
  };
  if (!colleges.length) return null;
  return (
    <div className={`mb-4 rounded-2xl p-4 ${infoStyle ? 'border-2 bg-blue-50 border-blue-300' : ''}`}>
      <h2 className={`text-xl font-bold ${infoStyle ? 'text-blue-900' : 'text-[#1a093f]'}`}>{title}</h2>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute -left-5 lg:left-0 top-1/2 -translate-y-1/2 z-10 bg-amber-300 shadow rounded-full p-3"><ChevronLeft /></button>
        <div className="flex gap-5 overflow-x-auto lg:px-20 py-5">
          <div ref={rowRef} className="flex gap-5 overflow-x-auto scrollbar-hide py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {colleges.map(college => (
              <div key={college.collegeCode || college.dte_code || college.college_name} className="border lg:min-w-[260px] max-w-[260px] flex-shrink-0 bg-gray-100 border border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center">
                {/* <div className="w-32 h-24 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <GraduationCap size={48} className="text-[#1a093f]" />
                </div> */}
                <span className="font-medium text-center lg:text-base text-sm text-gray-700 mb-4 min-h-[48px] flex items-center justify-center w-full">{college.collegeName || college.college_name}</span>
                <div className="flex w-full gap-3 justify-center">
                  <Link
                    to={`/collegeDetails/${college.collegeCode || college.dte_code}`}
                    className="flex items-center gap-2 bg-[#1a093f] text-white text-xs lg:text-sm px-5 py-2 rounded-full hover:bg-[#2d176b] transition"
                  >
                    View Events <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => scroll(1)} className="absolute -right-5 lg:right-0 top-1/2 -translate-y-1/2 z-10 bg-amber-300 shadow rounded-full p-3"><ChevronRight /></button>
      </div>
    </div>
  );
}

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const {searchValue, setSearchValue} = useContext(SearchContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getColleges = async () => {
      try {
        const baseURL = import.meta.env.VITE_BASE_URL;
        const port = import.meta.env.VITE_PORT;
        const res = await fetch(`${baseURL}:${port}/college/getcolleges`);
        const data = await res.json();
        setColleges(data);
        setFilteredColleges(data);
      } catch (err) {
        console.error('Error fetching colleges:', err);
      } finally {
        setLoading(false);
      }
    };
    getColleges();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    // console.log('Search input:', value);

    if (value.trim() === '') {
      setFilteredColleges(colleges);
      return;
    }

    const filtered = colleges.filter(college => {
      const match =
        (college.college_name && college.college_name.toLowerCase().includes(value.toLowerCase())) ||
        (college.collegeName && college.collegeName.toLowerCase().includes(value.toLowerCase())) ||
        (college.dte_code && college.dte_code.toLowerCase().includes(value.toLowerCase())) ||
        (college.collegeCode && college.collegeCode.toLowerCase().includes(value.toLowerCase())) ||
        (college.short_name && college.short_name.toLowerCase().includes(value.toLowerCase())) ||
        (college.shortName && college.shortName.toLowerCase().includes(value.toLowerCase()));
      // if (match) {
      //   console.log('Matched college:', college);
      // }
      return match;
    });
    // console.log('Filtered colleges:', filtered);
    setFilteredColleges(filtered);
  };

  const handleClick = () => {
    setSearchValue('');
    setFilteredColleges(colleges);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 mb-100">
        <ScaleLoader />
      </div>
    );
  }

  // Categorize colleges
  const government = colleges.filter(c => c.type && c.type.toLowerCase().includes('government'));
  const iits = colleges.filter(c => (c.shortName || '').toLowerCase().startsWith('iit'));
  const nits = colleges.filter(c =>
    /\bnit\b/i.test(c.collegeName || c.college_name || '')
  );
  const pune = colleges.filter(c => (c.city || '').toLowerCase().includes('pune'));
  const sangli = colleges.filter(c => (c.city || '').toLowerCase().includes('sangli'));
  const others = colleges.filter(
    c => !government.includes(c) && !iits.includes(c) && !nits.includes(c) && !pune.includes(c) && !sangli.includes(c)
  );

  const now = new Date();
  const recently = colleges.filter(c => {
    const created = new Date(c.createdAt || c.date);
    return !isNaN(created) && (now - created) / (1000 * 60 * 60 * 24) <= 7;
  });

  return (
    <>
      <div>
        <div className="lg:w-1/2 mb-6 relative">
          <Search handleChange={handleChange} handleClick={handleClick} page="colleges"/>
          {searchValue && loading && (
            <div className="flex justify-center items-center py-4">
              <ScaleLoader />
            </div>
          )}
          {searchValue && !loading && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
              {(() => {
                const dropdownFiltered = colleges.filter(college => {
                  const match =
                    (college.college_name && college.college_name.toLowerCase().includes(searchValue.toLowerCase())) ||
                    (college.collegeName && college.collegeName.toLowerCase().includes(searchValue.toLowerCase())) ||
                    (college.dte_code && college.dte_code.toLowerCase().includes(searchValue.toLowerCase())) ||
                    (college.collegeCode && college.collegeCode.toLowerCase().includes(searchValue.toLowerCase())) ||
                    (college.short_name && college.short_name.toLowerCase().includes(searchValue.toLowerCase())) ||
                    (college.shortName && college.shortName.toLowerCase().includes(searchValue.toLowerCase()));
                  return match;
                });
                return dropdownFiltered.length > 0 ? (
                  dropdownFiltered.map(college => (
                    <Link
                      key={college.collegeCode || college.dte_code || college.college_name}
                      to={`/collegeDetails/${college.collegeCode || college.dte_code}`}
                      className="block px-4 py-2 hover:bg-amber-100 text-[#1a093f] border-b last:border-b-0 border-gray-100 cursor-pointer"
                      onClick={() => setSearchValue('')}
                    >
                      {college.collegeName || college.college_name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No matching colleges found.</div>
                );
              })()}
            </div>
          )}
        </div>
        <div className="bg-white w-full px-2 lg:px-10">
          {/* {recently.length > 0 && <CollegeRowSection title="Recently Added" colleges={recently} infoStyle />} */}
          <CollegeRowSection title="Government Colleges" colleges={government} />
          <CollegeRowSection title="IITs" colleges={iits} />
          <CollegeRowSection title="NITs" colleges={nits} />
          <CollegeRowSection title="Pune Colleges" colleges={pune} />
          <CollegeRowSection title="Sangli Colleges" colleges={sangli} />
          <CollegeRowSection title="Other Colleges" colleges={others} />
        </div>
      </div>
    </>
  );
}

export default Colleges;
