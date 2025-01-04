// CategoryCard.tsx
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react'; // Import necessary icons
import { DisplayCategory } from "../../../pages/admin/Category";
import toast from 'react-hot-toast';

interface CategoryCardProps {
  category: DisplayCategory;
  onStatusChange?: (newStatus: boolean) => void;
  onEdit?: (category: DisplayCategory) => void;
  onDelete?: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      onDelete?.(category._id || '');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image Container with Overlay Actions */}
      <div className="relative group">
        <img
          src={category?.imageUrl}
          alt={category?.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/default-category-image.png'; // Add a default image path
          }}
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit?.(category)}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-105 transition-transform"
            title="Edit Category"
          >
            <Edit className="w-5 h-5 text-blue-600" />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-105 transition-transform"
            title="Delete Category"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
          
          <button
            onClick={() => toast.success('View details coming soon!')}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-105 transition-transform"
            title="View Details"
          >
            <Eye className="w-5 h-5 text-green-600" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {category?.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            category.status 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {category.status ? 'Active' : 'Inactive'}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {category?.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="font-medium">{category.count}</span>
            {category.count === 1 ? 'Course' : 'Courses'}
          </span>

          {/* Status Toggle */}
          <button
            onClick={() => onStatusChange?.(!category?.status)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${category.status 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
          >
            Toggle Status
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex justify-between items-center">
        <span>ID: {category._id?.slice(-6)}</span>
        <span>Last Updated: {formatDate(category?.updatedAt || new Date().toISOString())}</span>
      </div>
    </div>
  );
};