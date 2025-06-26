import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function QueryComp({ eventId, eventName, userEmail, userName, onSuccess }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [latestQuery, setLatestQuery] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warn('Please enter your query.');
      return;
    }
    setSubmitting(true);
    try {
      const baseURL = import.meta.env.VITE_BASE_URL;
      const port = import.meta.env.VITE_PORT;
      await axios.post(`${baseURL}:${port}/query`, {
        eventId,
        eventName,
        userEmail,
        userName,
        message,
      });
      toast.success('Your query has been submitted!');
      setMessage('');
      if (onSuccess) onSuccess();
      // Fetch the latest query for this user/event
      const res = await axios.get(`${baseURL}:${port}/query/event/${eventId}`);
      const userQuery = res.data.find(q => q.userEmail === userEmail && q.userName === userName && q.message === message);
      setLatestQuery(userQuery);
    } catch (err) {
      toast.error('Failed to submit your query. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Have a question about this event?</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Type your query here..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          disabled={submitting}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Query'}
        </button>
      </form>
      {latestQuery && latestQuery.resolution && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <div className="font-semibold text-green-800 mb-1">Admin Response:</div>
          <div className="text-green-900">{latestQuery.resolution}</div>
        </div>
      )}
    </div>
  );
}

export default QueryComp; 