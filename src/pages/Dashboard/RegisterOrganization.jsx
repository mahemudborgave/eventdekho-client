import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

function RegisterOrganization() {
  const [form, setForm] = useState({
    organizationName: '',
    dteCode: '',
    city: '',
    type: [],
    tier: '',
  });
  const [loading, setLoading] = useState(false);
  const [organizationList, setOrganizationList] = useState([]);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_BASE_URL + ':' + import.meta.env.VITE_PORT + '/organization/organizationlist');
      setOrganizationList(res.data.organizations || []);
    } catch (err) {
      setOrganizationList([]);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, multiple, options, checked } = e.target;
    if (name === 'type' && e.target.type === 'checkbox') {
      setForm((prev) => {
        if (checked) {
          return { ...prev, type: [...prev.type, value] };
        } else {
          return { ...prev, type: prev.type.filter((t) => t !== value) };
        }
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.organizationName || !form.city || !form.type.length) {
      toast.warn('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(import.meta.env.VITE_BASE_URL + ':' + import.meta.env.VITE_PORT + '/organization/registerorganization', {
        organizationName: form.organizationName,
        organizationCode: form.dteCode,
        city: form.city,
        type: form.type,
        tier: form.tier,
      });
      toast.success('Organization registration submitted!');
      setForm({ organizationName: '', dteCode: '', city: '', type: [], tier: '' });
      fetchOrganizations();
    } catch (err) {
      toast.error('Failed to register organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-blue-50 to-amber-50 p-15">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-amber-500 mb-2">Register Your Organization</h2>
        <div>
          <label className="block mb-1 font-medium">Organization Name <span className="text-red-500">*</span></label>
          <input type="text" name="organizationName" value={form.organizationName} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" list="organization-suggestions" autoComplete="off" />
          <datalist id="organization-suggestions">
            {organizationList.map((c, idx) => (
              <option key={idx} value={c.organizationName} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block mb-1 font-medium">DTE Code (optional)</label>
          <input type="text" name="dteCode" value={form.dteCode} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" />
        </div>
        <div>
          <label className="block mb-1 font-medium">City <span className="text-red-500">*</span></label>
          <input type="text" name="city" value={form.city} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Type <span className="text-red-500">*</span></label>
          <div className="grid gap-2 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="type"
                value="Aided"
                checked={form.type.includes('Aided')}
                onChange={handleChange}
              />
              Government Aided
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="type"
                value="Unaided"
                checked={form.type.includes('Unaided')}
                onChange={handleChange}
              />
              Private Unaided
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="type"
                value="Autonomous"
                checked={form.type.includes('Autonomous')}
                onChange={handleChange}
              />
              Autonomous
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="type"
                value="Non-Autonomous"
                checked={form.type.includes('Non-Autonomous')}
                onChange={handleChange}
              />
              Non-Autonomous
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Tier (optional)</label>
          <input type="text" name="tier" value={form.tier} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200" />
        </div>
        <button type="submit" disabled={loading} className="bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded mt-2 transition disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default RegisterOrganization; 