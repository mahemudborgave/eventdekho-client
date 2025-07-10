import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const PORT = import.meta.env.VITE_PORT;
const API_URL = `${BASE_URL}:${PORT}/api/featured-images`;

export const getFeaturedImages = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const uploadFeaturedImage = async (file, title, token) => {
  const formData = new FormData();
  formData.append('image', file);
  if (title) formData.append('title', title);
  const res = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}; 