import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { ArrowUpRight, Building, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScaleLoader } from 'react-spinners';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function HomeRecent() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const [events, setEvents] = useState([]);
    const { token } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${baseURL}:${port}/eventt/getevents`);
                // Filter events from the last 7 days
                const now = new Date();
                const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                const recentEvents = res.data
                    .filter(event => {
                        const createdAt = event.createdAt ? new Date(event.createdAt) : new Date(event.eventDate);
                        return createdAt >= oneWeekAgo;
                    })
                    .sort((a, b) => new Date(b.createdAt || b.eventDate) - new Date(a.createdAt || a.eventDate));
                setEvents(recentEvents);
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false, // Remove custom arrows
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                {/* <div className="flex items-center gap-2"> */}
                <h2 className="text-xl lg:text-2xl font-bold text-left border-b border-amber-600"><span className='text-amber-600'>Recently </span>Added</h2>
                <div className='flex gap-2'>
                    <button
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        onClick={() => sliderRef.current?.slickPrev()}
                        aria-label="Previous"
                        type="button"
                    >
                        <ChevronLeft size={22} className="text-gray-900" />
                    </button>
                    <button
                        className="p-2 rounded-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
                        onClick={() => sliderRef.current?.slickNext()}
                        aria-label="Next"
                        type="button"
                    >
                        <ChevronRight size={22} className="text-gray-1000" />
                    </button>
                </div>
                {/* </div> */}
                {/* <Link to="/events" className="px-5 py-2 bg-[#0d0c22] text-white rounded-full hover:bg-[#242238]">
                    View All
                </Link> */}
            </div>

            <div className="relative">
                {loading ? (
                    <div className="w-full flex justify-center">
                        <ScaleLoader />
                    </div>
                ) : (
                    <Slider ref={sliderRef} {...sliderSettings}>
                        {events.map(event => (
                            <div key={event._id} className="px-2">
                                <div className="bg-gray-100 p-4 hover:shadow-lg transition-all border border-gray-300 w-full max-w-md mx-auto min-h-[210px] flex flex-col justify-between">
                                    <div className='flex flex-col gap-1'>
                                        <h3 className="text-xl font-semibold text-[#0d0c22]">{event.eventName}</h3>
                                        <p className="text-gray-600">{event.clubName} - <span className="text-gray-600">{event.parentOrganization}</span></p>
                                        
                                        <p className="text-gray-600 flex gap-2 items-center">
                                            <CalendarDays size={18} /> {new Date(event.eventDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                        </p>
                                    </div>
                                    <Link to={`/eventdetail/${event._id}`} className="mt-3 text-amber-600 px-5 py-1 bg-white rounded-full border border-amber-600 hover:bg-amber-50 flex justify-center items-center gap-2 w-40 self-left">
                                        View Details <ArrowUpRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </Slider>
                )}
            </div>
        </div>
    );
}

export default HomeRecent;
