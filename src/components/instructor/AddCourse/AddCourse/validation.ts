import * as Yup from 'yup';

export const AddCourseSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(100, 'Description must be at least 100 characters'),
  category: Yup.string()
    .required('Category is required'),
  thumbnail: Yup.mixed()
    .required('Thumbnail is required'),
  language: Yup.string()
    .required('Language is required'),
  whatWillLearn: Yup.array()
    .of(
      Yup.string()
        .trim()
        .required('Learning point cannot be empty')
        .min(10, 'Learning point must be at least 10 characters')
    )
    .min(1, 'Add at least one learning point')
    .max(10, 'Maximum 10 learning points allowed'),
});