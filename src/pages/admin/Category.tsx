import React, { useEffect, useState } from 'react';
import { CategoryForm } from '../../components/admin/Category/categoryForm';
import { CategoryList } from '../../components/admin/Category/categoryList';
import { commonRequest, URL } from '../../common/api';
import { config, configMultiPart } from '../../common/configurations';
import toast from 'react-hot-toast';
import { stringifyMeta } from '../../common/constants';
import { Meta } from '../../types/Iothers';
import Pagination from '../../components/common/Pagination';

interface Category {
  _id?: string;
  name: string;
  description: string;
  imageUrl: File | null;
  status: boolean;
  count?: number;
}

export interface DisplayCategory {
  _id?: string;
  name: string;
  description: string;
  imageUrl: string;
  status: boolean;
  count: number;
  updatedAt?: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [meta,setMeta] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
  });

  const fetchCategory = async (currentMeta:Meta) => {
    try {
      const queryParams = new URLSearchParams(stringifyMeta(currentMeta)).toString();
      const res = await commonRequest('GET', `${URL}/course/all-category?${queryParams}`, {}, config);
      const fetchedCategories: DisplayCategory[] = res.data.categorys.map((cat: DisplayCategory) => ({
        ...cat,
        imageUrl: cat.imageUrl || '',
        count: cat.count || 0,
      }));
      setCategories(fetchedCategories);
      setMeta(res.data.meta);
    } catch (error) {
      console.error('Failed to fetch categories: in ADMIN/INSTRUCTOR', error);
    }
  };

  useEffect(() => {
    fetchCategory(meta);
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
        fetchCategory(meta);
        toast.success(response.message || 'Category added');
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handlePageChange = (page: number) => {
    const newMeta = {
      ...meta,
      page
    };
    setMeta(newMeta);
    fetchCategory(newMeta); // Pass the new meta directly
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Category Management</h1>
        <CategoryForm onSubmit={handleAddCategory} />
        <div className="mt-8 p-3 bg-gray-300 rounded-lg">
          <h2 className="text-xl font-semibold underline mb-4">All Categories</h2>
          {categories.length > 0 ? (
            <CategoryList 
            categories={categories} 
            onRefetch={() => fetchCategory(meta)}
          />
          ) : (
            'Category does not exist, please add one.'
          )}
        </div>
      </div>
      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CategoriesPage;