import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const baseURL = import.meta.env.VITE_BASE_URL;
      const port = import.meta.env.VITE_PORT;
      await axios.post(`${baseURL}:${port}/contactus`, form);
      toast.success('Thank you for contacting us!');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error('Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded" required disabled={submitting} />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" className="w-full p-2 border rounded" required disabled={submitting} />
        <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message" className="w-full p-2 border rounded" required disabled={submitting} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ContactUs; 