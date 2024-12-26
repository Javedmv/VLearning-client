import React from 'react';
import { Field } from 'formik';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  as?: string;
  rows?: number;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  name, 
  type = 'text', 
  as, 
  rows,
  className = "mt-1 block w-full rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Field
        name={name}
        type={type}
        as={as}
        rows={rows}
        className={className}
      />
    </div>
  );
};

export default FormField;