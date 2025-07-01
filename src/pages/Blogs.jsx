import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../context/UserContext';
import axios from 'axios';
import { FaPenFancy, FaUserCircle, FaBookOpen, FaEdit, FaTrash } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseURL}:${port}/blog`);
        setAllBlogs(res.data || []);
        if (user) {
          setUserBlogs((res.data || []).filter(b => b.author === user));
        }
      } catch (err) {
        setError('Failed to fetch blogs.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [user]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => { setShowModal(false); setForm({ title: '', content: '' }); setError(''); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${baseURL}:${port}/blog`, { ...form, author: user || 'Anonymous' });
      setShowModal(false);
      setForm({ title: '', content: '' });
      // Refresh blogs
      const res = await axios.get(`${baseURL}:${port}/blog`);
      setAllBlogs(res.data || []);
      if (user) {
        setUserBlogs((res.data || []).filter(b => b.author === user));
      }
    } catch (err) {
      setError('Failed to create blog.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit handlers
  const handleEditClick = (blog) => {
    setEditBlogId(blog._id);
    setEditForm({ title: blog.title, content: blog.content });
    setShowModal(true);
  };
  const handleEditChange = e => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleEditSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await axios.put(`${baseURL}:${port}/blog/${editBlogId}`, editForm);
      setShowModal(false);
      setEditBlogId(null);
      setEditForm({ title: '', content: '' });
      // Refresh blogs
      const res = await axios.get(`${baseURL}:${port}/blog`);
      setAllBlogs(res.data || []);
      if (user) {
        setUserBlogs((res.data || []).filter(b => b.author === user));
      }
    } catch (err) {
      setError('Failed to update blog.');
    } finally {
      setSubmitting(false);
    }
  };
  // Delete handler
  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await axios.delete(`${baseURL}:${port}/blog/${blogId}`);
      // Refresh blogs
      const res = await axios.get(`${baseURL}:${port}/blog`);
      setAllBlogs(res.data || []);
      if (user) {
        setUserBlogs((res.data || []).filter(b => b.author === user));
      }
    } catch (err) {
      alert('Failed to delete blog.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-16">
      {/* Floating Create Blog Button for mobile */}
      {/* <button
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 sm:hidden"
        title="Create Blog"
      >
        <FaPenFancy size={28} />
      </button> */}

      <div className="px-2 sm:px-6 py-10">
        {/* Main Card Container */}
        <div className="bg-white/90 rounded-3xl shadow-2xl border border-blue-100 p-6 sm:p-10 relative">
          {/* Header and Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <FaBookOpen className="text-blue-500 text-3xl" />
              <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Blogs</h1>
            </div>
            <button
              onClick={handleOpenModal}
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <FaPenFancy className="inline-block mr-2 -mt-1" /> Create Blog
            </button>
          </div>

          {/* Blog Creation Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-40 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-blue-100 animate-scaleIn">
                <button onClick={handleCloseModal} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2"><FaPenFancy className="text-blue-400" /> {editBlogId ? 'Edit Blog' : 'Create Blog'}</h2>
                <form onSubmit={editBlogId ? handleEditSubmit : handleSubmit} className="space-y-5">
                  <input
                    type="text"
                    name="title"
                    placeholder="Blog Title"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 text-lg"
                    value={editBlogId ? editForm.title : form.title}
                    onChange={editBlogId ? handleEditChange : handleChange}
                    required
                  />
                  <textarea
                    name="content"
                    placeholder="Write your blog content here..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 min-h-[140px] text-base"
                    value={editBlogId ? editForm.content : form.content}
                    onChange={editBlogId ? handleEditChange : handleChange}
                    required
                  />
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2.5 rounded-full font-bold text-lg hover:bg-blue-700 transition"
                    disabled={submitting}
                  >
                    {submitting ? (editBlogId ? 'Saving...' : 'Posting...') : (editBlogId ? 'Save Changes' : 'Post Blog')}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Blog Read Modal */}
          {viewBlog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-blue-100 animate-scaleIn">
                <button onClick={() => setViewBlog(null)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold mb-2 text-blue-800">{viewBlog.title}</h2>
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <FaUserCircle className="text-blue-400 text-lg" />
                  <span>{viewBlog.author}</span>
                  <span className="mx-2">&middot;</span>
                  <span>{new Date(viewBlog.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-gray-800 whitespace-pre-line text-base leading-relaxed">
                  {viewBlog.content}
                </div>
              </div>
            </div>
          )}

          {/* User Blogs Section */}
          {user && (
            <section className="mb-14">
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-2 h-8 bg-purple-400 rounded-full"></span>
                <h2 className="text-2xl font-bold text-purple-700 flex items-center gap-2"><FaUserCircle className="text-purple-400" /> Your Blogs</h2>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
                {userBlogs.length === 0 ? (
                  <div className="text-gray-500">You haven't created any blogs yet.</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {userBlogs.map(blog => (
                      <div key={blog._id} className="bg-white border border-purple-200 rounded-xl p-5 shadow hover:shadow-lg transition-all duration-200 group relative">
                        <div className="absolute top-3 right-3 flex gap-2 z-10">
                          <button onClick={() => handleEditClick(blog)} className="p-1 rounded hover:bg-purple-100 text-purple-600" title="Edit"><FaEdit /></button>
                          <button onClick={() => handleDelete(blog._id)} className="p-1 rounded hover:bg-red-100 text-red-600" title="Delete"><FaTrash /></button>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <FaUserCircle className="text-purple-400 text-2xl" />
                          <span className="font-semibold text-purple-900">{blog.author}</span>
                          <span className="text-xs text-gray-400 ml-2">{new Date(blog.createdAt).toLocaleString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-purple-900 mb-1 group-hover:underline">{blog.title}</h3>
                        {/* <p className="text-gray-800 whitespace-pre-line line-clamp-3 mb-3">{blog.content}</p> */}
                        <button onClick={() => setViewBlog(blog)} className="mt-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm hover:bg-purple-200 transition">Read</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Divider */}
          <div className="my-10 border-t border-gray-200"></div>

          {/* All Blogs Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="block w-2 h-8 bg-blue-400 rounded-full"></span>
              <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2"><FaBookOpen className="text-blue-400" /> All Blogs</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
              {loading ? (
                <div className="flex justify-center items-center py-8"><span className="text-gray-400">Loading blogs...</span></div>
              ) : allBlogs.length === 0 ? (
                <div className="text-gray-500">No blogs available yet.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {allBlogs.map(blog => (
                    <div key={blog._id} className="bg-white border border-blue-200 rounded-xl p-5 shadow hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center gap-3 mb-2">
                        <FaUserCircle className="text-blue-400 text-2xl" />
                        <span className="font-semibold text-blue-900">{blog.author}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(blog.createdAt).toLocaleString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-blue-900 mb-1 group-hover:underline">{blog.title}</h3>
                      {/* <p className="text-gray-800 whitespace-pre-line line-clamp-3 mb-3">{blog.content}</p> */}
                      <button onClick={() => setViewBlog(blog)} className="mt-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm hover:bg-blue-200 transition">Read</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.2s; }
        .animate-scaleIn { animation: scaleIn 0.2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default Blogs; 