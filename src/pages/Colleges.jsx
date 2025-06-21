import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScaleLoader } from 'react-spinners';
import Search from "../components/Search";
import UserContext from "../context/UserContext";
import SearchContext from "../context/SearchContext";
import { ArrowUpRight, GraduationCap, Calendar, Filter, X, MapPin, Building2, Eye } from 'lucide-react';

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const filterOptions = [
    { id: 'government', label: 'Government', icon: Building2 },
    { id: 'iit', label: 'IITs', icon: GraduationCap },
    { id: 'nit', label: 'NITs', icon: GraduationCap },
    { id: 'pune', label: 'Pune', icon: MapPin },
    { id: 'sangli', label: 'Sangli', icon: MapPin },
    { id: 'recent', label: 'Recently Added', icon: Calendar }
  ];

  useEffect(() => {
    const getColleges = async () => {
      try {
        const baseURL = import.meta.env.VITE_BASE_URL;
        const port = import.meta.env.VITE_PORT;
        const res = await fetch(`${baseURL}:${port}/college/getcolleges`);
        const data = await res.json();
        
        // Filter colleges that have hosted events
        const collegesWithEvents = data.filter(college => 
          (college.eventsHosted && college.eventsHosted > 0) || 
          (college.collegeName && data.some(c => c.collegeName === college.collegeName && c.eventsHosted > 0))
        );
        
        setColleges(collegesWithEvents);
        setFilteredColleges(collegesWithEvents);
      } catch (err) {
        console.error('Error fetching colleges:', err);
      } finally {
        setLoading(false);
      }
    };

    getColleges();
  }, []);

  const applyFilters = (colleges, filters, searchTerm) => {
    let filtered = colleges;

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(college => {
        const match =
          (college.college_name && college.college_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (college.collegeName && college.collegeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (college.dte_code && college.dte_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (college.collegeCode && college.collegeCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (college.short_name && college.short_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (college.shortName && college.shortName.toLowerCase().includes(searchTerm.toLowerCase()));
        return match;
      });
    }

    // Apply category filters
    filters.forEach(filter => {
      switch (filter) {
        case 'government':
          filtered = filtered.filter(c => c.type && c.type.toLowerCase().includes('government'));
          break;
        case 'iit':
          filtered = filtered.filter(c => (c.shortName || '').toLowerCase().startsWith('iit'));
          break;
        case 'nit':
          filtered = filtered.filter(c => /\bnit\b/i.test(c.collegeName || c.college_name || ''));
          break;
        case 'pune':
          filtered = filtered.filter(c => (c.city || '').toLowerCase().includes('pune'));
          break;
        case 'sangli':
          filtered = filtered.filter(c => (c.city || '').toLowerCase().includes('sangli'));
          break;
        case 'recent':
          const now = new Date();
          filtered = filtered.filter(c => {
            const created = new Date(c.createdAt || c.date);
            return !isNaN(created) && (now - created) / (1000 * 60 * 60 * 24) <= 7;
          });
          break;
        default:
          break;
      }
    });

    return filtered;
  };

  const handleFilterToggle = (filterId) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        const newFilters = prev.filter(f => f !== filterId);
        const filtered = applyFilters(colleges, newFilters, searchValue);
        setFilteredColleges(filtered);
        return newFilters;
      } else {
        const newFilters = [...prev, filterId];
        const filtered = applyFilters(colleges, newFilters, searchValue);
        setFilteredColleges(filtered);
        return newFilters;
      }
    });
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilteredColleges(colleges);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    const filtered = applyFilters(colleges, activeFilters, value);
    setFilteredColleges(filtered);
  };

  const handleClick = () => {
    setSearchValue('');
    const filtered = applyFilters(colleges, activeFilters, '');
    setFilteredColleges(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ScaleLoader />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar and Filter Button */}
        <div className="flex flex-row gap-3 items-center lg:w-1/2">
          <div className="relative w-full">
            <Search handleChange={handleChange} handleClick={handleClick} page="colleges" />
            {/* {searchValue && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
                {(() => {
                  const dropdownFiltered = applyFilters(colleges, activeFilters, searchValue);
                  return dropdownFiltered.length > 0 ? (
                    dropdownFiltered.map(college => (
                      <Link
                        key={college.collegeCode || college.dte_code || college.college_name}
                        to={`/collegeDetails/${college.collegeCode || college.dte_code}`}
                        className="block px-4 py-3 hover:bg-blue-50 text-gray-800 border-b last:border-b-0 border-gray-100 cursor-pointer transition-colors"
                        onClick={() => setSearchValue('')}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{college.collegeName || college.college_name}</span>
                          <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {college.eventsHosted || 0} Events
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No matching colleges found.</div>
                  );
                })()}
              </div>
            )} */}
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-300 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
            >
              <Filter size={18} className="text-[#1a093f]" />
              <span className="hidden sm:inline text-[#1a093f] font-medium">Filters</span>
              {activeFilters.length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </button>
            
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 bg-gradient-to-r from-blue-200 to-blue-500 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
            <h3 className="text-base font-semibold text-gray-800">Filter by Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = activeFilters.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFilterToggle(option.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${isActive
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {filteredColleges.length} College{filteredColleges.length !== 1 ? 's' : ''} Found
          </h2>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>Filtered by:</span>
              {activeFilters.map(filter => (
                <span key={filter} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {filterOptions.find(f => f.id === filter)?.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Colleges Table */}
      {filteredColleges.length > 0 ? (
        <div className="bg-white lg:shadow-sm lg:border lg:border-gray-200 overflow-hidden mb-100">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r bg-[#1a093f] text-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left font-medium text-base">#</th>     
                    <th className="px-4 py-4 text-left font-medium text-base">College Name</th>
                    <th className="px-4 py-4 text-center font-medium text-base">Events</th>
                    <th className="px-4 py-4 text-center font-medium text-base">Type</th>
                    <th className="px-4 py-4 text-center font-medium text-base">Location</th>
                    <th className="px-4 py-4 text-center font-medium text-base">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredColleges.map((college, index) => (
                    <tr key={college.collegeCode || college.dte_code || college.college_name} 
                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}`}>
                      <td className="px-4 py-3 text-center">
                        <div className="text-gray-900 text-base">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-gray-900 text-base">
                              {college.collegeName || college.college_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {college.collegeCode || college.dte_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit mx-auto">
                          <Calendar size={14} />
                          <span className="font-medium text-base">{college.eventsHosted || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-gray-600">
                          {college.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-gray-600">
                          {college.city || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/collegeDetails/${college.collegeCode || college.dte_code}`}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tablet Table */}
          <div className="hidden md:block lg:hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium text-sm">College</th>
                    <th className="px-3 py-2.5 text-center font-medium text-sm">Events</th>
                    <th className="px-3 py-2.5 text-center font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredColleges.map((college, index) => (
                    <tr key={college.collegeCode || college.dte_code || college.college_name} 
                        className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <GraduationCap size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {college.collegeName || college.college_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {college.collegeCode || college.dte_code} • {college.city || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit mx-auto">
                          <Calendar size={12} />
                          <span className="font-medium text-xs">{college.eventsHosted || 0}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Link
                          to={`/collegeDetails/${college.collegeCode || college.dte_code}`}
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-xs"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden ">
            {filteredColleges.map((college, index) => (
              <div key={college.collegeCode || college.dte_code || college.college_name} 
                   className="bg-gradient-to-r from-blue-200 to-blue-400 border border-blue-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-200">
                
                {/* Header with College Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-0 to-blue-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-base leading-tight mb-1">
                        {college.collegeName || college.college_name}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {college.collegeCode || college.dte_code}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {college.city || 'Location N/A'}
                        </span>
                        <span>•</span>
                        <span>{college.type || 'Type N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Events Badge */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500 font-medium">#{index + 1}</div>
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                      <Calendar size={16} />
                      <span className="font-bold text-sm">{college.eventsHosted || 0}</span>
                      <span className="text-xs font-medium">Events</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <Link
                  to={`/collegeDetails/${college.collegeCode || college.dte_code}`}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
                >
                  <Eye size={18} />
                  <span>View All Events</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchValue || activeFilters.length > 0 ? 'No Colleges Found' : 'No Colleges with Events'}
          </h3>
          <p className="text-gray-500 mb-4 text-sm">
            {searchValue || activeFilters.length > 0 
              ? 'Try adjusting your search or filters to find more colleges.'
              : 'Colleges will appear here once they host events.'
            }
          </p>
          {(searchValue || activeFilters.length > 0) && (
            <button
              onClick={() => {
                setSearchValue('');
                clearAllFilters();
              }}
              className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Colleges;
