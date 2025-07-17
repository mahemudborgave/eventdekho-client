import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../context/UserContext';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Blogs() {
  const { user, email } = useContext(UserContext);
  const [allBlogs, setAllBlogs] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editBlogId, setEditBlogId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [viewBlog, setViewBlog] = useState(null);

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseURL}:${port}/blog`);
        setAllBlogs(res.data || []);
        if (email) {
          setUserBlogs((res.data || []).filter(b => b.email === email));
        }
      } catch (err) {
        setError('Failed to fetch blogs.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [email]);

  const handleOpenModal = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn('Please log in to create a blog.');
      return;
    }
    setShowModal(true);
  };
  const handleCloseModal = () => { setShowModal(false); setForm({ title: '', content: '' }); setEditBlogId(null); setEditForm({ title: '', content: '' }); setError(''); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn('Please log in to create a blog.');
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      toast.warn('Title and content are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(
        `${baseURL}:${port}/blog`,
        { ...form, author: user || 'Anonymous', email: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setForm({ title: '', content: '' });
      toast.success('Blog created successfully!');
      // Refresh blogs
      const res = await axios.get(`${baseURL}:${port}/blog`);
      setAllBlogs(res.data || []);
      if (email) {
        setUserBlogs((res.data || []).filter(b => b.email === email));
      }
    } catch (err) {
      setError('Failed to create blog.');
      toast.error('Failed to create blog.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit handlers
  const handleEditClick = (blog) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn('Please log in to edit a blog.');
      return;
    }
    setEditBlogId(blog._id);
    setEditForm({ title: blog.title, content: blog.content });
    setShowModal(true);
  };
  const handleEditChange = e => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleEditSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn('Please log in to edit a blog.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.put(
        `${baseURL}:${port}/blog/${editBlogId}`,
        { ...editForm, email: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setEditBlogId(null);
      setEditForm({ title: '', content: '' });
      toast.success('Blog updated successfully!');
      // Refresh blogs
      const res = await axios.get(`${baseURL}:${port}/blog`);
      setAllBlogs(res.data || []);
      if (email) {
        setUserBlogs((res.data || []).filter(b => b.email === email));
      }
    } catch (err) {
      setError('Failed to update blog.');
      toast.error('Failed to update blog.');
    } finally {
      setSubmitting(false);
    }
  };
  // Delete handler
  const handleDelete = async (blogId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn('Please log in to delete a blog.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await axios.delete(`${baseURL}:${port}/blog/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh blogs
      const res = await axios.get(`${baseURL}:${port}/blog`);
      setAllBlogs(res.data || []);
      if (email) {
        setUserBlogs((res.data || []).filter(b => b.email === email));
      }
      toast.success('Blog deleted successfully!');
    } catch (err) {
      alert('Failed to delete blog.');
      toast.error('Failed to delete blog.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="px-2 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <h1 className="text-3xl font-bold text-foreground">Blogs</h1>
          <Button onClick={handleOpenModal} variant="default">Create Blog</Button>
          </div>

        {/* Blog Creation/Edit Dialog */}
        <Dialog open={showModal} onOpenChange={open => { if (!open) handleCloseModal(); }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editBlogId ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
              <DialogDescription>
                {editBlogId ? 'Edit your blog post.' : 'Write a new blog post.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editBlogId ? handleEditSubmit : handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className='mb-2'>Title</Label>
                <Input
                  id="title"
                    name="title"
                    placeholder="Blog Title"
                    value={editBlogId ? editForm.title : form.title}
                    onChange={editBlogId ? handleEditChange : handleChange}
                    required
                  />
              </div>
              <div>
                <Label htmlFor="content" className='mb-2'>Content</Label>
                <Textarea
                  id="content"
                    name="content"
                    placeholder="Write your blog content here..."
                    value={editBlogId ? editForm.content : form.content}
                    onChange={editBlogId ? handleEditChange : handleChange}
                    required
                  rows={6}
                  className="max-h-60 overflow-y-auto"
                />
              </div>
              {error && <div className="text-destructive text-sm">{error}</div>}
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (editBlogId ? 'Saving...' : 'Posting...') : (editBlogId ? 'Save Changes' : 'Post Blog')}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Blog Read Dialog */}
        {/* Removed: Dialog for reading blog content */}

          {/* User Blogs Section */}
          {user && (
            <section className="mb-14">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Blogs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBlogs.length === 0 ? (
                <div className="text-muted-foreground col-span-full">You haven't created any blogs yet.</div>
                ) : (
                userBlogs.map(blog => (
                  <Card key={blog._id} className="flex flex-col h-full gap-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="truncate text-base font-semibold">{blog.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(blog)}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(blog._id)}>Delete</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground mb-5">
                      {blog.author} &middot; {blog.createdAt ? new Date(blog.createdAt).toLocaleString() : ''}
                    </CardContent>
                    <CardContent className="text-foreground text-base whitespace-pre-line pt-0 flex-1">
                      {blog.content.length > 200 ? blog.content.slice(0, 50) + '...' : blog.content}
                      {/* Removed: Read More button */}
                    </CardContent>
                    <CardContent className="pt-5">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/blog/${blog._id}`)}>Read</Button>
                    </CardContent>
                  </Card>
                ))
                )}
              </div>
            </section>
          )}

          {/* All Blogs Section */}
          <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">All Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
              <div className="text-muted-foreground py-8 col-span-full">Loading blogs...</div>
              ) : allBlogs.length === 0 ? (
              <div className="text-muted-foreground col-span-full">No blogs available yet.</div>
              ) : (
              allBlogs.map(blog => (
                <Card key={blog._id} className="flex flex-col h-full gap-0">
                  <CardHeader className="flex flex-row items-center justify-between mb-1">
                    <CardTitle className="truncate text-base font-semibold">{blog.title}</CardTitle>
                    <div className="flex gap-2">
                      {user && blog.author === user && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(blog)}>Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(blog._id)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {blog.author} &middot; {blog.createdAt ? new Date(blog.createdAt).toLocaleString() : ''}
                  </CardContent>
                  <CardContent className="text-foreground text-base whitespace-pre-line pt-5 flex-1">
                    {blog.content.length > 200 ? blog.content.slice(0, 200) + '...' : blog.content}
                    {/* Removed: Read More button */}
                  </CardContent>
                  <CardContent className="pt-5">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/blog/${blog._id}`)}>Read</Button>
                  </CardContent>
                </Card>
              ))
              )}
            </div>
          </section>
        </div>
    </div>
  );
}

export default Blogs; 