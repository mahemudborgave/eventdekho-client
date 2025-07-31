import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const cardColors = [
  'from-blue-100 to-blue-300',
  'from-green-100 to-green-300',
  'from-yellow-100 to-yellow-300',
  'from-pink-100 to-pink-300',
  'from-purple-100 to-purple-300',
  'from-teal-100 to-teal-300',
];

function EventQueriesOrganizer() {
  const { eventId } = useParams();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/query/event/${eventId}`);
        setQueries(res.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, [eventId]);

  const handleRespond = (queryId) => {
    setRespondingId(queryId);
    setResolution('');
  };

  const handleResolutionSubmit = async (queryId, userEmail) => {
    if (!resolution.trim()) {
      toast.warn('Please enter a resolution.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${baseURL}:${port}/query/respond/${queryId}`, { resolution });
      toast.success('Response sent to the query raiser!');
      setRespondingId(null);
      setResolution('');
      // Refresh queries to show the new resolution
      const res = await axios.get(`${baseURL}:${port}/query/event/${eventId}`);
      setQueries(res.data);
    } catch (err) {
      toast.error('Failed to send response.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-10">
      <h2 className="text-2xl font-bold mb-8">Event Queries</h2>
      {loading ? (
        <div>Loading...</div>
      ) : queries.length === 0 ? (
        <div className="text-gray-500">No queries for this event.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {queries.map((q, idx) => (
            <div
              key={q._id}
              className={`rounded-xl shadow-lg p-6 bg-gradient-to-br ${cardColors[idx % cardColors.length]} flex flex-col min-h-[170px]`}
            >
              <div className="mb-2">
                <span className="font-semibold text-gray-700">{q.userName}</span>
                <span className="ml-2 text-sm text-gray-500">({q.userEmail})</span>
              </div>
              <div className="mb-4 text-gray-800">
                <span className="font-medium">Query:</span>
                <p className="mt-1 text-gray-700 break-words">{q.message}</p>
              </div>
              {q.resolution && (
                <div className="mb-3 p-2 bg-green-100 border border-green-300 rounded">
                  <div className="font-semibold text-green-800 mb-1">Admin Response:</div>
                  <div className="text-green-900">{q.resolution}</div>
                </div>
              )}
              <div className="mt-auto text-xs text-gray-500 text-right mb-2">
                {new Date(q.createdAt).toLocaleString()}
              </div>
              {q.resolution ? (
                <button
                  className="bg-gray-400 text-white px-3 py-1 rounded mt-2 cursor-not-allowed opacity-70"
                  disabled
                >
                  Responded
                </button>
              ) : respondingId === q._id ? (
                <div className="mt-2">
                  <textarea
                    className="w-full p-2 border rounded mb-2 border-2 border-gray-500 text-gray-700 outline-green-500 bg-green-50"
                    rows={2}
                    placeholder="Enter your resolution..."
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                    disabled={submitting}
                  />
                  <div className='flex gap-2'>

                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 flex items-center gap-2"
                    onClick={() => handleResolutionSubmit(q._id, q.userEmail)}
                    disabled={submitting}
                  >
                    {submitting ? (<div className='flex gap-2 justify-center items-center'><Loader2 className="animate-spin" size={18} /> Sending</div>): "Send Response"}
                    
                  </button>
                  <button
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    onClick={() => setRespondingId(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  </div>
                </div>
              ) : (
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mt-2"
                  onClick={() => handleRespond(q._id)}
                >
                  Respond
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventQueriesOrganizer;
