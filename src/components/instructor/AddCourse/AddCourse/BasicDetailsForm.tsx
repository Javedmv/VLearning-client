// BasicDetailsForm.tsx
import React, { useEffect, useState } from 'react';
import { Field } from 'formik';
import ISO6391 from 'iso-639-1';
import { commonRequest,URL } from '../../../../common/api';
import { config } from '../../../../common/configurations';

const languages = ISO6391.getAllNames();

interface Category {
  _id: string,
  name: string
}

const BasicDetailsForm: React.FC = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategory = async () => {
    try {
      const res = await commonRequest('GET', `${URL}/course/get-category-status-true`, {}, config);
      // const fetchedCategories = res.data.map((cat: any) => ({
      //   ...cat,
      //   imageUrl: cat.imageUrl || '', // Ensure imageUrl is a string
      // }));
      console.log(res.data , "fetched category")
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories: in ADMIN/INSTRUCTOR', error);
    }
  };

  useEffect(() => {
    fetchCategory();
  },[])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
          Course Title
        </label>
        <Field
          type="text"
          id="title"
          name="title"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
          placeholder="Enter course title"
        />
      </div>

      <div>
        <label htmlFor="language" className="block text-gray-700 font-medium mb-2">
          Language
        </label>
        <Field
          as="select"
          id="language"
          name="language"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
        >
          <option value="">Select language</option>
          {languages.map((language) => (
            <option key={language} value={ISO6391.getCode(language)}>
              {language}
            </option>
          ))}
        </Field>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
          Description
        </label>
        <Field
          as="textarea"
          id="description"
          name="description"
          rows={4}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
          placeholder="Describe your course (minimum 100 characters)"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
          Category
        </label>
        <Field
          as="select"
          id="category"
          name="category"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
        >
          <option value="">Select category</option>
          {categories.map((category: Category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Field>
      </div>
    </div>
  );
};

export default BasicDetailsForm;
