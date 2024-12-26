import React from 'react';

interface CategoryCardProps {
  category: {
    name: string;
    description: string;
    imageUrl: string;
    status: boolean;
    count: number;
  };
  onStatusChange?: (newStatus: boolean) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onStatusChange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <img
          src={category.imageUrl}
          alt={category.name}
          className="object-cover rounded-md w-full h-48"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{category.description}</p>
      <div className="flex justify-between items-center">
        <button
          onClick={() => onStatusChange?.(!category.status)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            category.status 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {category.status ? 'Active' : 'Blocked'}
        </button>
        <span className="text-sm text-gray-500">Items: {category.count}</span>
      </div>
    </div>
  );
};