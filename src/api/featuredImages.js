import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const PORT = import.meta.env.VITE_PORT;
const API_URL = `${BASE_URL}:${PORT}/api/featured-images`;

export const getFeaturedImages = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const uploadFeaturedImage = async (file, title, token, eventName, eventUrl) => {
  const formData = new FormData();
  formData.append('image', file);
  if (title) formData.append('title', title);
  if (eventName) formData.append('eventName', eventName);
  if (eventUrl) formData.append('eventUrl', eventUrl);
  const res = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const deleteFeaturedImage = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 