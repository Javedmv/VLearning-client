import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { commonRequest,URL } from '../../common/api';
import { config } from '../../common/configurations';

interface CourseFilterProps {
  onFilterChange: (filters: any) => void;
}

interface Category {
    _id: string,
    name: string
  }

export function CourseFilter({ onFilterChange }: CourseFilterProps) {
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);


    const fetchCategory = async () => {
        try {
          const res = await commonRequest('GET', `${URL}/course/get-category-status-true`, {}, config);
          // const fetchedCategories = res.data.map((cat: any) => ({
          //   ...cat,
          //   imageUrl: cat.imageUrl || '', // Ensure imageUrl is a string
          // }));
          console.log(res.data,"cat")
          setCategories(res.data);
        } catch (error) {
          console.error('Failed to fetch categories: in ADMIN/INSTRUCTOR', error);
        }
      };
    
      useEffect(() => {
        fetchCategory();
    },[])

    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        let newSelectedCategories: string[];
        
        if (checked) {
          newSelectedCategories = [...selectedCategories, categoryId];
        } else {
          newSelectedCategories = selectedCategories.filter(id => id !== categoryId);
        }
        
        setSelectedCategories(newSelectedCategories);
        onFilterChange({ categories: newSelectedCategories });
      };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Category</h3>
        {categories.map((category:Category) => (
          <label key={category._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              className="mr-2"
              checked={selectedCategories.includes(category._id)}
              onChange={(e) => handleCategoryChange(category._id, e.target.checked)}
            />
            <span>{category.name}</span>
          </label>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Price Range</h3>
        <select 
          className="w-full p-2 border rounded-lg"
          onChange={(e) => onFilterChange({ priceRange: e.target.value })}
        >
          <option value="all">All Prices</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
          <option value="under50">Under ₹50</option>
          <option value="50to100">₹50 - ₹100</option>
          <option value="over100">Over ₹100</option>
        </select>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Duration</h3>
        {['0-2 hours', '3-6 hours', '7-16 hours', '17+ hours'].map((duration) => (
          <label key={duration} className="flex items-center mb-2">
            <input type="checkbox" className="mr-2" onChange={(e) => onFilterChange({ duration })} />
            <span>{duration}</span>
          </label>
        ))}
      </div>

      {/* <div>
        <h3 className="font-semibold mb-3">Rating</h3>
        {[4, 3, 2, 1].map((rating) => (
          <label key={rating} className="flex items-center mb-2">
            <input type="checkbox" className="mr-2" onChange={(e) => onFilterChange({ rating })} />
            <span>{rating}+ Stars</span>
          </label>
        ))}
      </div> */}
    </div>
  );
}