import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { commonRequest, URL } from "../../common/api";
import { config } from "../../common/configurations";
import { TOBE } from "../../common/constants";

interface CourseFilterProps {
  onFilterChange: (filters: TOBE) => void;
  search: string; // Controlled search term
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Search change handler
}

interface Category {
  _id: string;
  name: string;
}

export function CourseFilter({
  onFilterChange,
  search,
  onSearchChange,
}: CourseFilterProps) {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchCategory = async () => {
    try {
      const res = await commonRequest(
        "GET",
        `${URL}/course/get-category-status-true`,
        {},
        config
      );
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories: in ADMIN/INSTRUCTOR", error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    let newSelectedCategories: string[];

    if (checked) {
      newSelectedCategories = [...selectedCategories, categoryId];
    } else {
      newSelectedCategories = selectedCategories.filter(
        (id) => id !== categoryId
      );
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
            value={search} // Controlled value
            onChange={onSearchChange} // Controlled change handler
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Category</h3>
        {categories.map((category: Category) => (
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
        <h3 className="font-semibold mb-3">Sort By</h3>
        <select
          className="w-full p-2 border rounded-lg"
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
        >
          <option value="relevance">Relevance</option>
          <option value="popularity">Popularity</option>
          <option value="priceLowToHigh">Price: Low to High</option>
          <option value="priceHighToLow">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );
}
