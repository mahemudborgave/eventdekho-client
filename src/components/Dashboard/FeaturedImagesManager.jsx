import React, { useState, useEffect } from 'react';
import { getFeaturedImages, uploadFeaturedImage, deleteFeaturedImage } from '../../api/featuredImages';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('rootToken');
      await deleteFeaturedImage(id, token);
      toast.success('Image deleted');
      fetchImages();
    } catch (err) {
      toast.error('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-background text-foreground rounded-lg shadow-md p-6 mb-8 border border-muted">
      {loading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
        </div>
      )}
      <h2 className="text-xl font-bold mb-4">Manage Featured Images</h2>
      <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="border border-muted bg-background text-foreground p-2 rounded" />
        <input type="text" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} className="border border-muted bg-background text-foreground p-2 rounded" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map(img => (
          <div key={img._id} className="border border-muted rounded p-2 flex flex-col items-center bg-background relative">
            <img src={img.url} alt={img.title || 'Featured'} className="w-full h-40 object-cover rounded mb-2" />
            <div className="text-sm text-foreground mb-2">{img.title}</div>
            <Button variant="destructive" size="icon" onClick={() => handleDelete(img._id)} className="absolute top-2 right-2" title="Delete image">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedImagesManager; 