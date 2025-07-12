import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function QueriesAdmin() {
    const [eventQueries, setEventQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isShow, setIsShow] = useState(true);
    const baseURL = import.meta.env.VITE_BASE_URL;
    const port = import.meta.env.VITE_PORT;
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsShow(false);
                navigate('/login');
                return;
            }
            try {
                await axios.post(`${baseURL}:${port}/auth/verify`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsShow(true);
            } catch (err) {
                setIsShow(false);
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate, baseURL, port]);

    useEffect(() => {
        if (!isShow) return;
        const fetchQueries = async () => {
            try {
                const res = await axios.get(`${baseURL}:${port}/query`);
                const queries = res.data || [];
                // Group queries by eventId
                const grouped = {};
                queries.forEach(q => {
                    if (!grouped[q.eventId]) {
                        grouped[q.eventId] = {
                            eventName: q.eventName,
                            eventId: q.eventId,
                            total: 0,
                            resolved: 0,
                            unresolved: 0
                        };
                    }
                    grouped[q.eventId].total += 1;
                    if (q.resolution && q.resolution.trim() !== '') {
                        grouped[q.eventId].resolved += 1;
                    } else {
                        grouped[q.eventId].unresolved += 1;
                    }
                });
                setEventQueries(Object.values(grouped));
            } catch (err) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchQueries();
    }, [isShow, baseURL, port]);

    if (!isShow) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
                <div className="text-xl font-semibold text-red-700 mb-2">You must be logged in to access this page.</div>
                <Link to="/login" className="text-blue-600 underline text-lg">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-10">
            <h2 className="text-2xl font-bold mb-6">Event Queries Overview</h2>
            {loading ? (
                <div>Loading...</div>
            ) : eventQueries.length === 0 ? (
                <div className="text-gray-500">No queries received yet.</div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 bg-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 z-10 bg-gray-200">#</th>
                                <th className="px-4 py-3 bg-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Event Name</th>
                                <th className="px-4 py-3 bg-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Total Queries</th>
                                <th className="px-4 py-3 bg-gray-200 text-left text-xs font-semibold text-green-700 uppercase tracking-wider whitespace-nowrap">Resolved</th>
                                <th className="px-4 py-3 bg-gray-200 text-left text-xs font-semibold text-red-700 uppercase tracking-wider whitespace-nowrap">Unresolved</th>
                                <th className="px-4 py-3 bg-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {eventQueries.map((event, idx) => (
                                <tr key={event.eventId}>
                                    <td className="px-4 py-2 font-bold sticky left-0 z-10 bg-white whitespace-nowrap">{idx + 1}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{event.eventName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{event.total}</td>
                                    <td className="px-4 py-2 text-green-700 font-semibold whitespace-nowrap">{event.resolved}</td>
                                    <td className="px-4 py-2 text-red-700 font-semibold whitespace-nowrap">{event.unresolved}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <Link
                                            to={`/admin/eventqueries/${event.eventId}`}
                                            className="bg-blue-600 text-white rounded hover:bg-blue-700 px-3 py-1"
                                        >
                                            View All Queries
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default QueriesAdmin; 