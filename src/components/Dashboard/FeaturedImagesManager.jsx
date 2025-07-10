import React, { useState, useEffect } from 'react';
import { getFeaturedImages, uploadFeaturedImage } from '../../api/featuredImages';
import { toast } from 'react-toastify';

function FeaturedImagesManager() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    try {
      const data = await getFeaturedImages();
      setImages(data);
    } catch (err) {
      toast.error('Failed to fetch featured images');
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an image');
    setLoading(true);
    try {
      const token = localStorage.getItem('rootToken');
      await uploadFeaturedImage(file, title, token);
      toast.success('Image uploaded!');
      setFile(null);
      setTitle('');
      fetchImages();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Manage Featured Images</h2>
      <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="border p-2 rounded" />
        <input type="text" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 rounded" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map(img => (
          <div key={img._id} className="border rounded p-2 flex flex-col items-center">
            <img src={img.url} alt={img.title || 'Featured'} className="w-full h-40 object-cover rounded mb-2" />
            <div className="text-sm text-gray-700">{img.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedImagesManager; 