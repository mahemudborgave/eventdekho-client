import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { ScaleLoader } from 'react-spinners';

function HomeRecent() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const [events, setEvents] = useState([]);
    const { token } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${baseURL}:${port}/eventt/getevents`);
                const recentEvents = res.data.slice(-4).reverse();
                setEvents(recentEvents);
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    return (
        <div className="py-10 lg:py-20">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#0d0c22]">Recently Added</h2>
                <Link to="/events" className="px-5 py-2 bg-[#0d0c22] text-white rounded-full hover:bg-[#242238]">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {loading ? (
                    <div className="flex justify-center">
                        <ScaleLoader />
                    </div>
                ) : events.map(event => (
                    <div key={event._id} className="bg-gray-100 p-7 hover:shadow-lg transition-all border border-gray-300">
                        <h3 className="text-xl font-semibold text-[#0d0c22] mb-2">{event.eventName}</h3>
                        <p className="text-gray-600 mb-2">College: {event.collegeName}</p>
                        <p className="text-gray-600 mb-1 flex gap-2 items-center">
                            <CalendarDays size={18} /> {new Date(event.eventDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                        </p>
                        <Link to={`/eventdetail/${event._id}`} className="mt-3 text-amber-600 px-5 py-1 bg-white rounded-full border border-amber-600 hover:bg-amber-50 flex justify-center items-center gap-2 w-40">
                            View Details <ArrowUpRight size={18} />
                        </Link>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default HomeRecent;
