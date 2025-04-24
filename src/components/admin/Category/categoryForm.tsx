import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react'; // Make sure to import these icons from lucide-react
import { TOBE } from '../../../common/constants';

interface CategoryFormProps {
  onSubmit: (category: TOBE) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [status, setStatus] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; description?: string; imageFile?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = window.URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(previewUrl);
    }
  };

  // Function to remove the selected image
  const handleRemoveImage = () => {
    if (imagePreview) {
      window.URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to validate the form fields
  const validate = () => {
    const newErrors: { name?: string; description?: string; imageFile?: string } = {};
    if (!name) newErrors.name = 'Name is required';
    if (!description) newErrors.description = 'Description is required';
    if (!imageFile) newErrors.imageFile = 'Image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      if (!validate()) return;
      // Convert image to base64 before submitting
      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onSubmit({
            name,
            description,
            imageUrl: imageFile,
            status,
          });
        };
        reader.readAsDataURL(imageFile);
      }
      
      // Reset form fields after submission
      setName('');
      setDescription('');
      handleRemoveImage();
      setStatus(true);
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-2/3 px-3 space-y-4">
          {/* Name Input */}
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

          {/* Description Input */}
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

          {/* Status Select */}
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add Category
            </button>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="w-full md:w-1/3 px-3">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Category Image</label>
            <div className="m-3 p-3 flex justify-center border-gray-400 border-2">
              {!imagePreview ? (
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
                  <label className="cursor-pointer text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-black">
                      Upload Photo
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Category"
                    className="w-40 h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.imageFile && <div className="text-red-500 text-sm text-center">{errors.imageFile}</div>}
          </div>
        </div>
      </div>
    </form>
  );
};