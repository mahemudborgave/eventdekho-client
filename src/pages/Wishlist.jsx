import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../context/UserContext';
import axios from 'axios';
import { ScaleLoader } from 'react-spinners';
import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';

function formatEventDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Wishlist() {
    const { email } = useContext(UserContext);
    const [wishlistEvents, setWishlistEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!email) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`${baseURL}:${port}/wishlist/${email}`);
                setWishlistEvents(res.data || []);
            } catch (err) {
                setError('Failed to fetch wishlist.');
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, [email]);

    const handleRemove = async (eventId, eventName) => {
        try {
            await axios.post(`${baseURL}:${port}/wishlist/remove`, {
                eventId,
                userEmail: email,
            });
            setWishlistEvents(prev => prev.filter(e => e._id !== eventId));
            toast.success(`Removed '${eventName}' from wishlist`);
        } catch (err) {
            toast.error('Failed to remove from wishlist');
        }
    };

    if (!email) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
                <Heart size={48} className="text-pink-400 mb-4 animate-pulse" />
                <div className="text-xl font-semibold text-gray-700 mb-2">Log in to see your wishlist</div>
            </div>
        );
    }

    return (
        <div className="">
            <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#0d0c22]">My Wishlist</h2>
            </div>
            {loading ? (
                <div className="flex justify-center items-center min-h-[30vh]">
                    <ScaleLoader color="#f472b6" />
                </div>
            ) : error ? (
                <div className="text-center text-red-500 text-lg">{error}</div>
            ) : wishlistEvents.length === 0 ? (
                <div className="text-center text-gray-500 text-lg mt-20">
                    <Heart size={40} className="mx-auto text-pink-200 mb-4 animate-pulse" />
                    No events in your wishlist yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {wishlistEvents.map(event => (
                        <div
                            key={event._id}
                            className="relative flex flex-col bg-white border border-pink-200 rounded-2xl shadow-md hover:shadow-lg p-6 transition-all duration-200 group"
                        >
                            <button
                                className="absolute top-3 right-3 bg-white/80 hover:bg-pink-100 rounded-full p-2 shadow border border-pink-200 transition z-10"
                                onClick={() => handleRemove(event._id, event.eventName)}
                                title="Remove from Wishlist"
                                style={{ lineHeight: 0 }}
                            >
                                <Heart size={22} fill="red" color="red" />
                            </button>
                            <h3 className="text-xl font-bold text-pink-700 mb-2 group-hover:text-pink-900 transition-colors cursor-pointer truncate" title={event.eventName}>{event.eventName}</h3>
                            <div className="text-gray-500 mb-1 text-sm">{event.organizationName}</div>
                            <div className="flex flex-wrap gap-2 text-xs mb-2">
                                <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                                    {event.eventMode}
                                </span>
                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                    {event.eventLocation}
                                </span>
                            </div>
                            <div className="text-gray-400 text-xs mb-2">
                                <span className="mr-2">{formatEventDate(event.eventDate)}</span>
                                <span>to {formatEventDate(event.closeOn)}</span>
                            </div>
                            {/* <div className="text-gray-600 text-xs mt-auto italic mb-4">
                                {event.eventDescription?.slice(0, 80)}{event.eventDescription?.length > 80 ? '...' : ''}
                            </div> */}
                            
                            {/* Bottom buttons spanning complete card width */}
                            <div className="mt-auto pt-4 border-t border-pink-100">
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 px-4 py-2 bg-[#0d0c22] rounded-lg text-white hover:bg-[#0d0c22d2] transition-colors duration-200 cursor-pointer text-sm font-semibold"
                                        onClick={e => { e.stopPropagation(); window.location.href = `/eventdetail/${event._id}`; }}
                                    >
                                        Get Detail
                                    </button>
                                    <button
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg font-semibold shadow hover:from-orange-400 hover:to-pink-500 transition-colors duration-200 cursor-pointer text-sm"
                                        onClick={e => { e.stopPropagation(); window.location.href = `/eventdetail/${event._id}`; }}
                                    >
                                        Register
                                    </button>
                                    <button
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 transition-colors duration-200 cursor-pointer text-sm"
                                        onClick={() => handleRemove(event._id, event.eventName)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className='h-50'></div>
        </div>
    );
}

export default Wishlist; 