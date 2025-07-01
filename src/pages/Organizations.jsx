import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScaleLoader } from 'react-spinners';
import Search from "../components/Search";
import UserContext from "../context/UserContext";
import SearchContext from "../context/SearchContext";
import { ArrowUpRight, GraduationCap, Calendar, Filter, X, MapPin, Building2, Eye, Users, TrendingUp } from 'lucide-react';

function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalOrganizations: 0,
    totalParticipations: 0
  });

  // Filter options
  const filterOptions = [
    { id: 'organization', label: 'Organizations', icon: Building2 },
    { id: 'college_club', label: 'College Clubs', icon: GraduationCap },
    { id: 'ngo', label: 'NGOs', icon: Building2 },
    { id: 'limited_company', label: 'Companies', icon: Building2 },
    { id: 'pune', label: 'Pune', icon: MapPin },
    { id: 'recent', label: 'Recently Added', icon: Calendar }
  ];

  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const baseURL = import.meta.env.VITE_BASE_URL;
        const port = import.meta.env.VITE_PORT;
        const res = await fetch(`${baseURL}:${port}/auth/organizations-with-events`);
        const data = await res.json();
        
        setOrganizations(data);
        setFilteredOrganizations(data);
        
        // Calculate statistics
        const totalEvents = data.reduce((sum, org) => sum + (org.eventsHosted || 0), 0);
        const totalOrganizations = data.length;
        
        // Fetch total participations
        try {
          const participationsRes = await fetch(`${baseURL}:${port}/eventt/getevents`);
          const eventsData = await participationsRes.json();
          const totalParticipations = eventsData.reduce((sum, event) => sum + (event.registrations || 0), 0);
          
          setStats({
            totalEvents,
            totalOrganizations,
            totalParticipations
          });
        } catch (err) {
          console.error('Error fetching participations:', err);
          setStats({
            totalEvents,
            totalOrganizations,
            totalParticipations: 0
          });
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    getOrganizations();
  }, []);

  const applyFilters = (organizations, filters, searchTerm) => {
    let filtered = organizations;

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(organization => {
        const match =
          (organization.parentOrganization && organization.parentOrganization.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (organization.organizationName && organization.organizationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (organization.shortName && organization.shortName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (organization.city && organization.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (organization.organizationType && organization.organizationType.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (organization.contactPerson && organization.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
        return match;
      });
    }

    // Apply category filters
    filters.forEach(filter => {
      switch (filter) {
        case 'organization':
          filtered = filtered.filter(org => org.organizationType === 'organization');
          break;
        case 'college_club':
          filtered = filtered.filter(org => org.organizationType === 'college_club');
          break;
        case 'ngo':
          filtered = filtered.filter(org => org.organizationType === 'ngo');
          break;
        case 'limited_company':
          filtered = filtered.filter(org => org.organizationType === 'limited_company');
          break;
        case 'pune':
          filtered = filtered.filter(org => (org.city || '').toLowerCase().includes('pune'));
          break;
        case 'recent':
          const now = new Date();
          filtered = filtered.filter(org => {
            const created = new Date(org.createdAt);
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
        const filtered = applyFilters(organizations, newFilters, searchValue);
        setFilteredOrganizations(filtered);
        return newFilters;
      } else {
        const newFilters = [...prev, filterId];
        const filtered = applyFilters(organizations, newFilters, searchValue);
        setFilteredOrganizations(filtered);
        return newFilters;
      }
    });
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilteredOrganizations(organizations);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    const filtered = applyFilters(organizations, activeFilters, value);
    setFilteredOrganizations(filtered);
  };

  const handleClick = () => {
    setSearchValue('');
    const filtered = applyFilters(organizations, activeFilters, '');
    setFilteredOrganizations(filtered);
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
      {/* Page Header */}
      <div className="mb-4 hidden sm:mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-3 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-3 sm:mb-6 lg:mb-0">
              <h1 className="text-lg sm:text-4xl font-bold mb-1 sm:mb-3 flex items-center gap-2 sm:gap-3">
                <Building2 className="text-yellow-300 sm:size-10" />
                Organizations
              </h1>
              <p className="text-blue-100 text-xs sm:text-lg">Discover amazing organizations that host events on EventDekho</p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-blue-100 font-medium text-xs sm:text-base">Live & Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid hidden grid-cols-3 md:grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-2 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm sm:text-sm font-medium">Events</p>
              <p className="text-lg sm:text-3xl font-bold">{stats.totalEvents.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-400/30 p-2 sm:p-3 rounded-full">
              <Calendar className="text-white size-4 sm:size-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm sm:text-sm font-medium">Org's</p>
              <p className="text-lg sm:text-3xl font-bold">{stats.totalOrganizations.toLocaleString()}</p>
            </div>
            <div className="bg-blue-400/30 p-2 sm:p-3 rounded-full">
              <Building2 size={13} className="text-white size-4 sm:size-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm sm:text-sm font-medium">Registers</p>
              <p className="text-lg sm:text-3xl font-bold">{stats.totalParticipations.toLocaleString()}</p>
            </div>
            <div className="bg-purple-400/30 p-2 sm:p-3 rounded-full">
              <Users size={13} className="text-white sm:size-8 size-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar and Filter Button */}
        <div className="flex flex-row gap-3 items-center lg:w-1/2">
          <div className="relative w-full">
            <Search handleChange={handleChange} handleClick={handleClick} page="organizations" />
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
                className="hidden lg:flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
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
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="lg:hidden flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
                <span className="inline">Clear</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {filteredOrganizations.length} Organization{filteredOrganizations.length !== 1 ? 's' : ''} Found
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

      {/* Organizations Table */}
      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white overflow-hidden mb-100">
          {/* Only show mobile card design for all devices */}
          <div>
            {filteredOrganizations.map((organization, index) => (
              <div key={organization._id} 
                   className="bg-gradient-to-r from-blue-200 to-blue-400 border border-blue-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-200">
                {/* Header with Organization Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-0 to-blue-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-base leading-tight mb-1">
                        {organization.parentOrganization || organization.organizationName}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {organization.shortName} - {organization.organizationName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {organization.city || 'Location N/A'}
                        </span>
                        <span>•</span>
                        <span>{organization.organizationType || 'Type N/A'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Events Badge */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500 font-medium">#{index + 1}</div>
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                      <Calendar size={16} />
                      <span className="font-bold text-sm">{organization.eventsHosted || 0}</span>
                      <span className="text-xs font-medium">Events</span>
                    </div>
                  </div>
                </div>
                {/* Action Button */}
                <Link
                  to={`/organizationDetails/${organization._id}`}
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
            {searchValue || activeFilters.length > 0 ? 'No Organizations Found' : 'No Organizations with Events'}
          </h3>
          <p className="text-gray-500 mb-4 text-sm">
            {searchValue || activeFilters.length > 0 
              ? 'Try adjusting your search or filters to find more organizations.'
              : 'Organizations will appear here once they host events.'
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

export default Organizations;
