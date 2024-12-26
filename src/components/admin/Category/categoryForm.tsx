import React, { useState, useRef } from 'react';

interface CategoryFormProps {
  onSubmit: (category: any) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; description?: string; imageUrl?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle image upload and convert it to a Base64 string
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to remove the selected image
  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to validate the form fields
  const validate = () => {
    const newErrors: { name?: string; description?: string; imageUrl?: string } = {};
    if (!name) newErrors.name = 'Name is required';
    if (!description) newErrors.description = 'Description is required';
    if (!imageUrl) newErrors.imageUrl = 'Image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      name,
      description,
      imageUrl,
      status,
    });

    // Reset form fields after submission
    setName('');
    setDescription('');
    setImageUrl('');
    setStatus(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-2/3 px-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 block w-full p-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              rows={3}
            />
            {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className={`mt-1 block w-full p-2 border ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.imageUrl && <div className="text-red-500 text-sm">{errors.imageUrl}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status ? 'active' : 'inactive'}
              onChange={(e) => setStatus(e.target.value === 'active')}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add Category
            </button>
          </div>
        </div>
        <div className={`w-full md:w-1/3 px-3 flex items-center justify-center ${imageUrl ? 'border-black border-2' : ''}`}>
          {imageUrl && (
            <div className="mt-2 text-center">
              <img src={imageUrl} alt="Category" className="h-40 w-40 object-cover rounded-md mb-4" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};