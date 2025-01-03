import React from 'react';
import { CategoryCard } from './categoryCard';
import { DisplayCategory } from "../../../pages/admin/Category";
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

  const handleEdit = async (category: DisplayCategory) => {
    // You can implement edit functionality here
    // For example, open a modal or navigate to edit page
    toast.success('Edit functionality coming soon!');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category) => (
        <CategoryCard 
          key={category._id}
          category={category}
          onStatusChange={(newStatus) => handleStatusChange(category._id, newStatus)}
          onEdit={() => handleEdit(category)}
        />
      ))}
    </div>
  );
};