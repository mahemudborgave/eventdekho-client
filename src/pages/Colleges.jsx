import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLoader } from 'react-spinners';
import collegeList from "../college_list.json";
import Search from "../components/Search";
import UserContext from "../context/UserContext";
import SearchContext from "../context/SearchContext";

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
    console.log(value);
    
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
      <div className="flex justify-center items-center p-10">
        <HashLoader />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="lg:w-1/2 mb-10">
          <Search handleChange={handleChange} handleClick={handleClick} />
        </div>
        <div className="bg-white overflow-hidden w-full">
          <table className="w-full text-center text-xs lg:text-base">
            <colgroup>
              <col className="hidden lg:table-column lg:w-[15%]" />
              <col className="w-[65%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-gray-300 text-gray-700">
              <tr>
                <th className="lg:p-4 p-1 hidden lg:block">Code</th>
                <th className="p-4">College Name</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredColleges.length > 0 ? (
                filteredColleges.map((college, i) => (
                  <tr key={college.dte_code} className={`border-b border-gray-300 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                    <td className="lg:p-4 p-1 hidden lg:block">{college.dte_code}</td>
                    <td className="lg:p-4 p-2">{college.college_name}</td>
                    <td className="lg:p-4 p-1">
                      <Link to={`/collegeDetails/${college.dte_code}`} className="inline-block px-5 py-2 bg-[#0d0c22] rounded-full text-white text-xs lg:text-sm">View Events</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 py-6">No matching colleges found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Colleges;
