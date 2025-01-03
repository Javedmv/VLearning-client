import React, { useEffect, useState } from 'react';
import { CategoryForm } from '../../components/admin/Category/categoryForm';
import { CategoryList } from '../../components/admin/Category/categoryList';
import { commonRequest, URL } from '../../common/api';
import { config, configMultiPart } from '../../common/configurations';
import toast from 'react-hot-toast';

interface Category {
  name: string;
  description: string;
  imageUrl: File | null;
  status: boolean;
  count?: number;
}

export interface DisplayCategory {
  name: string;
  description: string;
  imageUrl: string;
  status: boolean;
  count: number;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<DisplayCategory[]>([]);

  const fetchCategory = async () => {
    try {
      const res = await commonRequest('GET', `${URL}/course/all-category`, {}, config);
      const fetchedCategories: DisplayCategory[] = res.data.map((cat: any) => ({
        ...cat,
        imageUrl: cat.imageUrl || '', // Ensure imageUrl is a string
        count: cat.count || 0,
      }));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories: in ADMIN/INSTRUCTOR', error);
    }
  };
  useEffect(() => {
    fetchCategory();
  }, []);

  const handleAddCategory = async (newCategory: Category) => {
    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('description', newCategory.description);
      formData.append('status', String(newCategory.status));
      if (newCategory.imageUrl instanceof File) {
        formData.append('category', newCategory.imageUrl);
      }

      const response = await commonRequest(
        'POST',
        `${URL}/course/multipart/add-category`,
        formData,
        configMultiPart
      );

      if (response?.success || response?.data?.success) {
        // const addedCategory: DisplayCategory = {
        //   ...response.data,
        //   imageUrl: response.data.imageUrl || '',
        //   count: 0,
        // };
        // setCategories([addedCategory,...categories]);
        fetchCategory();
        toast.success(response.message || 'Category added');
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Category Management</h1>
        <CategoryForm onSubmit={handleAddCategory} />
        <div className="mt-8 p-3 bg-gray-300">
          <h2 className="text-xl font-semibold underline mb-4">All Categories</h2>
          {categories.length > 0 ? (
            <CategoryList categories={categories} />
          ) : (
            'Category does not exist, please add one.'
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;