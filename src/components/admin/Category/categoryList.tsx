import React, { useState } from 'react';
import { CategoryCard } from './categoryCard';
import { DisplayCategory } from "../../../pages/admin/Category";
import { EditCategoryModal } from './editCategoryModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

      if (response?.status) {
        toast.success(response?.message || 'Category status updated successfully');
        onRefetch?.();
      }
    } catch (error: any) {
      toast.error(error?.message || error?.response?.data?.message || 'Failed to update status');
      console.error('Error updating category status:', error);
    }
  };

  const handleEdit = (category: DisplayCategory) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: DisplayCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory?._id) return;

    try {
      const response = await commonRequest(
        'DELETE',
        `${URL}/course/delete-category/${selectedCategory._id}`,
        {},
        config
      );

      if (response?.success) {
        toast.success(`${response?.data?.name + " " + response?.message}`);
        onRefetch?.();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard 
            key={category._id}
            category={category}
            onStatusChange={(newStatus) => handleStatusChange(category._id, newStatus)}
            onEdit={() => handleEdit(category)}
            onDelete={() => handleDelete(category)}
          />
        ))}
      </div>

      {/* Edit Modal */}
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

      {/* Delete Modal */}
      {selectedCategory && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
          }}
          onConfirm={handleConfirmDelete}
          categoryName={selectedCategory.name}
        />
      )}
    </>
  );
};