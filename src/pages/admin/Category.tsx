import React, { useState } from 'react';
import { CategoryForm } from '../../components/admin/Category/categoryForm';
import { CategoryList } from '../../components/admin/Category/categoryList';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState([
    // Sample data - replace with actual API calls
    {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      imageUrl: 'https://example.com/electronics.jpg',
      status: true,
      count: 150
    },
  ]);

  const handleAddCategory = (newCategory: any) => {
    setCategories([...categories, { ...newCategory, count: 0 }]);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Category Management</h1>
        
        <CategoryForm onSubmit={handleAddCategory} />
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">All Categories</h2>
          <CategoryList categories={categories} />
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;