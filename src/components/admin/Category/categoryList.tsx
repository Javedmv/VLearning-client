// CategoryList.tsx
import React, { useState } from 'react';
import { CategoryCard } from './categoryCard';
import { DisplayCategory } from "../../../pages/admin/Category";
import { EditCategoryModal } from './editCategoryModal'; // Add this import
import toast from 'react-hot-toast';
import { commonRequest, URL } from '../../../common/api';
import { config } from '../../../common/configurations';

interface CategoryListProps {
  categories: DisplayCategory[];
  onRefetch?: () => Promise<void>;
}

export const CategoryList: React.FC<CategoryListProps> = ({ 
  categories,
  onRefetch
}) => {
  // Add these state variables for the modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DisplayCategory | null>(null);

  const handleStatusChange = async (categoryId: string | undefined, newStatus: boolean) => {
    if (!categoryId) return;
    
    try {
      const response = await commonRequest(
        'PATCH',
        `${URL}/course/update-category-status/${categoryId}`,
        { status: newStatus },
        config
      );

      if (response?.success) {
        toast.success('Category status updated successfully');
        onRefetch?.();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update status');
      console.error('Error updating category status:', error);
    }
  };

  // Update the handleEdit function to open the modal
  const handleEdit = (category: DisplayCategory) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard 
            key={category._id}
            category={category}
            onStatusChange={(newStatus) => handleStatusChange(category._id, newStatus)}
            onEdit={() => handleEdit(category)} // Make sure this prop is passed
          />
        ))}
      </div>

      {/* Add the EditCategoryModal component here */}
      {selectedCategory && (
        <EditCategoryModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          onRefetch={onRefetch || (() => Promise.resolve())}
        />
      )}
    </>
  );
};