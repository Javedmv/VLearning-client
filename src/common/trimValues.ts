type NestedValues = { [key: string]: any };

// List of keys to be omitted from the parent object (e.g., profile should only have avatar, dob, gender)
const omitParentKeys = ['profile', 'otherParentKey']; // Add any other parent keys that you want to omit from the final `FormData`

const trimValuesToFormData = (values: NestedValues, parentKey: string = ''): FormData => {
  const formData: FormData = new FormData();

  for (const key in values) {
    const fullKey = parentKey ? `${parentKey}[${key}]` : key;

    // Special handling for files (avatar and cv)
    if ((key === 'avatar' || key === 'cv') && values[key] instanceof File) {
      formData.append('files.' + key, values[key]);
      continue;
    }

    // Check if the current key is a parent key that should be omitted
    if (omitParentKeys.includes(key)) {
      // If it's a parent key, recurse into the nested fields
      if (typeof values[key] === 'object' && values[key] !== null) {
        const nestedFormData = trimValuesToFormData(values[key], fullKey);
        for (const [nestedKey, value] of nestedFormData.entries()) {
          formData.append(nestedKey, value);
        }
      }
    } else if (typeof values[key] === 'string') {
      // Trim and append non-empty strings
      const trimmedValue = values[key].trim();
      if (trimmedValue !== '') {
        formData.append(fullKey, trimmedValue);
      }
    } else if (typeof values[key] === 'object' && values[key] !== null) {
      // Handle other nested objects (not omitted)
      const nestedFormData = trimValuesToFormData(values[key], fullKey);
      for (const [nestedKey, value] of nestedFormData.entries()) {
        formData.append(nestedKey, value);
      }
    } else if (values[key] !== undefined) {
      // Append other types
      // console.log(fullKey)
      formData.append(fullKey, values[key]);
    }
  }

  // Log all entries in formData
  // for (const [key, value] of formData.entries()) {
  //   console.log(`FormData Entry - Key: ${key}, Value:`, value);
  // }

  return formData;
};

export default trimValuesToFormData;
