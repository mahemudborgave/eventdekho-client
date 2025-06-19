import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLoader, ScaleLoader } from 'react-spinners';
import collegeList from "../college_list.json";
import Search from "../components/Search";
import UserContext from "../context/UserContext";
import SearchContext from "../context/SearchContext";
import { ArrowUpRight, GraduationCap } from 'lucide-react';

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const {searchValue, setSearchValue} = useContext(SearchContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getColleges = async () => {
      try {
        setColleges(collegeList);
        setFilteredColleges(collegeList);
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
    // console.log(value);
    
    setSearchValue(value);

    if (value.trim() === '') {
      setFilteredColleges(collegeList);
      return;
    }

    const filtered = collegeList.filter(college =>
      college.college_name.toLowerCase().includes(value.toLowerCase()) ||
      college.dte_code.toLowerCase().includes(value.toLowerCase()) ||
      college.short_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredColleges(filtered);
  };

  const handleClick = () => {
    setSearchValue('');
    setFilteredColleges(collegeList);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 mb-100">
        <ScaleLoader />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="lg:w-1/2 mb-10">
          <Search handleChange={handleChange} handleClick={handleClick} page="colleges"/>
        </div>
        <div className="bg-white w-full px-10 lg:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 h-full">
            {filteredColleges.length > 0 ? (
              filteredColleges.map((college, i) => (
                <div
                  key={college.dte_code}
                  className="flex flex-col items-center justify-between bg-gray-100 border border-gray-300 rounded-2xl p-6 h-full w-full"
                >
                  {/* Lucide GraduationCap Logo */}
                  <div className="w-40 h-32 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                    <GraduationCap size={56} className="text-[#1a093f]" />
                  </div>
                  {/* College Name */}
                  <span className="font-medium text-center text-base text-gray-700 mb-4 min-h-[48px] flex items-center justify-center w-full">{college.college_name}</span>
                  {/* Buttons */}
                  <div className="flex w-full gap-3 justify-center mt-auto">
                    <Link
                      to={`/collegeDetails/${college.dte_code}`}
                      className="flex items-center gap-2 bg-[#1a093f] text-white text-xs lg:text-sm px-5 py-2 rounded-full hover:bg-[#2d176b] transition"
                    >
                      View Events <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-6">No matching colleges found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Colleges;
