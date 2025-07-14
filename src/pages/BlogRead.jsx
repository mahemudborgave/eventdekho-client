import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

function BlogRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const baseURL = import.meta.env.VITE_BASE_URL;
        const port = import.meta.env.VITE_PORT;
        const res = await axios.get(`${baseURL}:${port}/blog/${id}`);
        setBlog(res.data);
      } catch (err) {
        setError('Failed to load blog.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
  if (!blog) return null;

  return (
    <div className="min-h-screen flex justify-center bg-background px-2 py-10">
      <div className="w-full max-w-2xl">
        <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">{blog.title}</CardTitle>
            <div className="text-xs text-muted-foreground mb-2">
              {blog.author} &middot; {blog.createdAt ? new Date(blog.createdAt).toLocaleString() : ''}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground whitespace-pre-line text-base leading-relaxed">
              {blog.content}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BlogRead; 