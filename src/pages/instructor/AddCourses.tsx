import React from 'react';

const AddCoursePage:React.FC = () => {
  return (
    <div className="p-6 text-fuchsia-900 bg-pink-300 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Add New Course</h1>
      <form className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">Course Title</label>
          <input type="text" id="title" name="title" className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea id="description" name="description" rows={4} className="w-full p-2 border rounded"></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium mb-1">Duration (hours)</label>
          <input type="number" id="duration" name="duration" className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="bg-fuchsia-900 text-pink-200 px-4 py-2 rounded hover:bg-fuchsia-800">
          Add Course
        </button>
      </form>
    </div>
  );
};

export default AddCoursePage;

