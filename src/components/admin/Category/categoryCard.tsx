import React from 'react';
import { Edit } from 'lucide-react'; // Import the Edit icon
import { DisplayCategory } from "../../../pages/admin/Category"

interface CategoryCardProps {
  category: DisplayCategory;
  onStatusChange?: (newStatus: boolean) => void;
  onEdit?: (category: DisplayCategory) => void; // Add edit handler prop
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onStatusChange,
  onEdit 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow border-2 border-opacity-40 border-black">
      <div>{category?._id}</div>
      <div className="relative aspect-w-16 aspect-h-9 mb-4 border-2 border-opacity-40 border-black rounded-lg group">
        <img
          src={category?.imageUrl}
          alt={category?.name}
          className="object-cover rounded-md w-full h-48"
        />
        {/* Edit button - hidden by default, shown on group hover */}
        <button
          onClick={() => onEdit?.(category)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
        >
          <Edit className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      <h3 className="text-lg font-semibold mb-2">{category?.name}</h3>
      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{category?.description}</p>
      <div className="flex justify-between items-center">
        <button
          onClick={() => onStatusChange?.(!category?.status)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            category.status
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {category.status ? 'Active' : 'Blocked'}
        </button>
        <span className="text-sm text-gray-500">Items: {category?.count}</span>
      </div>
    </div>
  );
};