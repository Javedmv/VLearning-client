import React from 'react';
import { CategoryCard } from './categoryCard';

interface CategoryListProps {
  categories: Array<{
    name: string;
    description: string;
    imageUrl: string;
    status: boolean;
    count: number;
  }>;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category, index) => (
        <CategoryCard key={index} category={category} />
      ))}
    </div>
  );
};