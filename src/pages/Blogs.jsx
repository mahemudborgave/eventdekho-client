import React from 'react';

function Blogs() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Blogs</h1>
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold">Sample Blog Title</h2>
          <p>This is a sample blog post. You can fetch blogs from the backend and display them here.</p>
        </div>
      </div>
    </div>
  );
}

export default Blogs; 