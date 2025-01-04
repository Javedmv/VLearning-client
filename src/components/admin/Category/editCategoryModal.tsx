// EditCategoryModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { DisplayCategory } from "../../../pages/admin/Category";
import { commonRequest, URL } from '../../../common/api';
import { configMultiPart } from '../../../common/configurations';
import toast from 'react-hot-toast';

interface EditCategoryModalProps {
  category: DisplayCategory;
  isOpen: boolean;
  onClose: () => void;
  onRefetch: () => Promise<void>;
}

interface FormErrors {
    name?: string;
    description?: string;
    image?: string;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  category,
  isOpen,
  onClose,
  onRefetch
}) => {
  // Form state management
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: true
  });

  // Image state management
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});


  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status
      });
      setImagePreview(category.imageUrl);
    }
  }, [category]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? value === 'active' : value
    }));
  
    // Clear error for the field when it becomes valid
    if (name === 'name' && value.trim().length >= 3) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
    if (name === 'description' && value.trim().length >= 10) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageFile(file);
        setImagePreview(base64String);
        // Clear image error when an image is uploaded
        setErrors(prev => ({ ...prev, image: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
      isValid = false;
    }

  if (!formData.description.trim()) {
    newErrors.description = 'Description is required';
    isValid = false;
  } else if (formData.description.trim().length < 10) {
    newErrors.description = 'Description must be at least 10 characters long';
    isValid = false;
  }

  // Validate image
  if (!imagePreview && !imageFile) {
    newErrors.image = 'Image is required';
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', String(formData.status));
      console.log(formDataToSend.get("name"))
      console.log(formDataToSend.get("description"))
      console.log(formDataToSend.get("status"))

      if (imageFile instanceof File) {
        formDataToSend.append('category', imageFile);
      }

      const response = await commonRequest(
        'POST',
        `${URL}/course/multipart/update-category/${category._id}`,
        formDataToSend,
        configMultiPart
      );

      if (response?.success) {
        toast.success(response.message);
        onClose();
        onRefetch?.();
      }
    } catch (error: any) {
      toast.error(error?.message || error?.response?.data?.message || 'Failed to update category');
      console.error('Error updating category:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Category</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
            {/* Name Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-2 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                required
                />
                {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            {/* Description Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-2 border ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                rows={3}
                required
                />
                {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
            </div>

            {/* Status Select */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                name="status"
                value={formData.status ? 'active' : 'inactive'}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                </select>
            </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Category Image</label>
            <div className={`m-3 p-3 flex justify-center border-2 ${
                errors.image ? 'border-red-500' : 'border-gray-400'
            }`}>
                {!imagePreview ? (
                <div className={`w-40 h-40 rounded-lg border-2 border-dashed ${
                    errors.image ? 'border-red-500' : 'border-gray-300'
                } flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors`}>
                    <label className="cursor-pointer text-center">
                    <Upload className={`mx-auto h-12 w-12 ${
                        errors.image ? 'text-red-400' : 'text-gray-400'
                    }`} />
                    <span className={`mt-2 block text-sm font-medium ${
                        errors.image ? 'text-red-600' : 'text-black'
                    }`}>
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
                    className="w-40 h-40 object-cover rounded-lg"
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
            {errors.image && (
                <p className="text-sm text-red-600 text-center">{errors.image}</p>
            )}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
            <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
            Cancel
            </button>
            <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            Save Changes
            </button>
        </div>
        </form>
      </div>
    </div>
  );
};